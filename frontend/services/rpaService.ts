// ============================================================================
// 🌾 AGRONARE — RPA Service
// Conexión con API backend para módulo RPA (Bots, Schedules, Logs)
// ============================================================================

import api from './api';

// ============================================================================
// TIPOS DE PRISMA (sincronizados con backend)
// ============================================================================

export interface BotDB {
  id: number;
  nombre: string;
  tipo?: string | null;
  descripcion?: string | null;
  activo: boolean;
  schedule?: string | null;
  lastRun?: string | null;
  creadoEn: string;
  actualizadoEn: string;
}

export interface BotLogDB {
  id: number;
  botId: number;
  mensaje: string;
  exito: boolean;
  ejecutado: string;
}

export interface RpaScheduleDB {
  id: number;
  botId: number;
  cron: string;
  activo: boolean;
  ejecutado: string;
}

// ============================================================================
// SERVICIO RPA
// ============================================================================

export const rpaService = {
  // ─────────────────────────────────────────────────────────────────────────
  // BOTS
  // ─────────────────────────────────────────────────────────────────────────
  bots: {
    getAll: (options?: { skip?: number; take?: number; where?: any }) =>
      api.get<BotDB[]>('/bots', options),
    
    getById: (id: number) =>
      api.getById<BotDB>('/bots', id),
    
    create: (data: Omit<BotDB, 'id' | 'creadoEn' | 'actualizadoEn'>) =>
      api.post<BotDB>('/bots', data),
    
    update: (id: number, data: Partial<BotDB>) =>
      api.put<BotDB>('/bots', id, data),
    
    delete: (id: number) =>
      api.delete<void>('/bots', id),
    
    count: (where?: any) =>
      api.count('/bots', where),
    
    getActive: () =>
      api.get<BotDB[]>('/bots', { where: { activo: true } }),
    
    getInactive: () =>
      api.get<BotDB[]>('/bots', { where: { activo: false } }),
    
    toggle: (id: number, activo: boolean) =>
      api.put<BotDB>('/bots', id, { activo }),
    
    run: async (id: number) => {
      // Simular ejecución de bot y crear log
      const logData = {
        botId: id,
        mensaje: `Bot ejecutado manualmente a las ${new Date().toLocaleTimeString()}`,
        exito: true,
      };
      
      await api.post('/bot-logs', logData);
      await api.put('/bots', id, { lastRun: new Date().toISOString() });
      
      return { success: true, message: 'Bot ejecutado correctamente' };
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  // LOGS
  // ─────────────────────────────────────────────────────────────────────────
  logs: {
    getAll: (options?: { skip?: number; take?: number; where?: any }) =>
      api.get<BotLogDB[]>('/bot-logs', options),
    
    getByBot: (botId: number) =>
      api.get<BotLogDB[]>('/bot-logs', { where: { botId } }),
    
    create: (data: Omit<BotLogDB, 'id' | 'ejecutado'>) =>
      api.post<BotLogDB>('/bot-logs', data),
    
    getRecent: (limit: number = 50) =>
      api.get<BotLogDB[]>('/bot-logs', { 
        take: limit, 
        orderBy: { ejecutado: 'desc' } 
      }),
    
    getErrors: () =>
      api.get<BotLogDB[]>('/bot-logs', { where: { exito: false } }),
  },

  // ─────────────────────────────────────────────────────────────────────────
  // SCHEDULES
  // ─────────────────────────────────────────────────────────────────────────
  schedules: {
    getAll: (options?: { skip?: number; take?: number; where?: any }) =>
      api.get<RpaScheduleDB[]>('/rpa-schedules', options),
    
    create: (data: Omit<RpaScheduleDB, 'id' | 'ejecutado'>) =>
      api.post<RpaScheduleDB>('/rpa-schedules', data),
    
    update: (id: number, data: Partial<RpaScheduleDB>) =>
      api.put<RpaScheduleDB>('/rpa-schedules', id, data),
    
    delete: (id: number) =>
      api.delete<void>('/rpa-schedules', id),
    
    getByBot: (botId: number) =>
      api.get<RpaScheduleDB[]>('/rpa-schedules', { where: { botId } }),
    
    getActive: () =>
      api.get<RpaScheduleDB[]>('/rpa-schedules', { where: { activo: true } }),
  },

  // ─────────────────────────────────────────────────────────────────────────
  // DASHBOARD STATS
  // ─────────────────────────────────────────────────────────────────────────
  stats: {
    getOverview: async () => {
      const [
        totalBots, 
        botsActivos, 
        logsRecientes,
        erroresRecientes,
      ] = await Promise.all([
        api.count('/bots'),
        api.count('/bots', { activo: true }),
        api.get<BotLogDB[]>('/bot-logs', { take: 100 }),
        api.get<BotLogDB[]>('/bot-logs', { where: { exito: false }, take: 100 }),
      ]);

      return {
        totalBots: totalBots.data?.count || 0,
        botsActivos: botsActivos.data?.count || 0,
        ejecucionesRecientes: logsRecientes.data?.length || 0,
        erroresRecientes: erroresRecientes.data?.length || 0,
        tasaExito: logsRecientes.data?.length 
          ? Math.round(((logsRecientes.data.length - (erroresRecientes.data?.length || 0)) / logsRecientes.data.length) * 100)
          : 100,
      };
    },
    
    getByType: async () => {
      const bots = await api.get<BotDB[]>('/bots');
      if (!bots.success || !bots.data) return [];
      
      const typeCount: Record<string, number> = {};
      bots.data.forEach(b => {
        const type = b.tipo || 'General';
        typeCount[type] = (typeCount[type] || 0) + 1;
      });
      
      return Object.entries(typeCount).map(([name, count]) => ({ name, count }));
    },
  },
};

export default rpaService;
