// ============================================================================
// 🌾 AGRONARE — Finance Service
// Conexión con API backend para módulo Finanzas (Movimientos, Asesorías)
// ============================================================================

import api from './api';

// ============================================================================
// TIPOS DE PRISMA (sincronizados con backend)
// ============================================================================

export interface MovimientoFinancieroDB {
  id: number;
  tipo: string; // INGRESO, EGRESO
  monto: number;
  categoria?: string | null;
  descripcion?: string | null;
  fecha: string;
  sucursal?: string | null;
  oportunidadId?: number | null;
  clienteId?: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface AsesoriaDB {
  id: number;
  clienteId?: number | null;
  asesor?: string | null;
  tema?: string | null;
  descripcion?: string | null;
  fecha?: string | null;
  notas?: string | null;
  estado?: string | null;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// SERVICIO FINANZAS
// ============================================================================

export const financeService = {
  // ─────────────────────────────────────────────────────────────────────────
  // MOVIMIENTOS FINANCIEROS
  // ─────────────────────────────────────────────────────────────────────────
  movimientos: {
    getAll: (options?: { skip?: number; take?: number; where?: any }) =>
      api.get<MovimientoFinancieroDB[]>('/movimientos-financieros', options),
    
    getById: (id: number) =>
      api.getById<MovimientoFinancieroDB>('/movimientos-financieros', id),
    
    create: (data: Omit<MovimientoFinancieroDB, 'id' | 'fecha' | 'createdAt' | 'updatedAt'>) =>
      api.post<MovimientoFinancieroDB>('/movimientos-financieros', data),
    
    update: (id: number, data: Partial<MovimientoFinancieroDB>) =>
      api.put<MovimientoFinancieroDB>('/movimientos-financieros', id, data),
    
    delete: (id: number) =>
      api.delete<void>('/movimientos-financieros', id),
    
    count: (where?: any) =>
      api.count('/movimientos-financieros', where),
    
    getIngresos: () =>
      api.get<MovimientoFinancieroDB[]>('/movimientos-financieros', { where: { tipo: 'INGRESO' } }),
    
    getEgresos: () =>
      api.get<MovimientoFinancieroDB[]>('/movimientos-financieros', { where: { tipo: 'EGRESO' } }),
    
    getByClient: (clienteId: number) =>
      api.get<MovimientoFinancieroDB[]>('/movimientos-financieros', { where: { clienteId } }),
    
    getBySucursal: (sucursal: string) =>
      api.get<MovimientoFinancieroDB[]>('/movimientos-financieros', { where: { sucursal } }),
    
    getByDateRange: (startDate: string, endDate: string) =>
      api.get<MovimientoFinancieroDB[]>('/movimientos-financieros', { 
        where: { 
          fecha: { gte: startDate, lte: endDate } 
        } 
      }),
  },

  // ─────────────────────────────────────────────────────────────────────────
  // ASESORÍAS
  // ─────────────────────────────────────────────────────────────────────────
  asesorias: {
    getAll: (options?: { skip?: number; take?: number; where?: any }) =>
      api.get<AsesoriaDB[]>('/asesorias', options),
    
    getById: (id: number) =>
      api.getById<AsesoriaDB>('/asesorias', id),
    
    create: (data: Omit<AsesoriaDB, 'id' | 'createdAt' | 'updatedAt'>) =>
      api.post<AsesoriaDB>('/asesorias', data),
    
    update: (id: number, data: Partial<AsesoriaDB>) =>
      api.put<AsesoriaDB>('/asesorias', id, data),
    
    delete: (id: number) =>
      api.delete<void>('/asesorias', id),
    
    getPending: () =>
      api.get<AsesoriaDB[]>('/asesorias', { where: { estado: 'Pendiente' } }),
    
    getByClient: (clienteId: number) =>
      api.get<AsesoriaDB[]>('/asesorias', { where: { clienteId } }),
  },

  // ─────────────────────────────────────────────────────────────────────────
  // DASHBOARD STATS
  // ─────────────────────────────────────────────────────────────────────────
  stats: {
    getOverview: async () => {
      const movimientos = await api.get<MovimientoFinancieroDB[]>('/movimientos-financieros');
      
      if (!movimientos.success || !movimientos.data) {
        return {
          totalIngresos: 0,
          totalEgresos: 0,
          balance: 0,
          movimientosCount: 0,
        };
      }
      
      const ingresos = movimientos.data
        .filter(m => m.tipo === 'INGRESO')
        .reduce((sum, m) => sum + m.monto, 0);
      
      const egresos = movimientos.data
        .filter(m => m.tipo === 'EGRESO')
        .reduce((sum, m) => sum + m.monto, 0);

      return {
        totalIngresos: ingresos,
        totalEgresos: egresos,
        balance: ingresos - egresos,
        movimientosCount: movimientos.data.length,
      };
    },
    
    getByCategory: async () => {
      const movimientos = await api.get<MovimientoFinancieroDB[]>('/movimientos-financieros');
      if (!movimientos.success || !movimientos.data) return [];
      
      const catSum: Record<string, { ingresos: number; egresos: number }> = {};
      
      movimientos.data.forEach(m => {
        const cat = m.categoria || 'Sin categoría';
        if (!catSum[cat]) {
          catSum[cat] = { ingresos: 0, egresos: 0 };
        }
        if (m.tipo === 'INGRESO') {
          catSum[cat].ingresos += m.monto;
        } else {
          catSum[cat].egresos += m.monto;
        }
      });
      
      return Object.entries(catSum).map(([name, values]) => ({
        name,
        ingresos: values.ingresos,
        egresos: values.egresos,
        balance: values.ingresos - values.egresos,
      }));
    },
    
    getBySucursal: async () => {
      const movimientos = await api.get<MovimientoFinancieroDB[]>('/movimientos-financieros');
      if (!movimientos.success || !movimientos.data) return [];
      
      const branchSum: Record<string, number> = {};
      
      movimientos.data.forEach(m => {
        const branch = m.sucursal || 'Principal';
        const amount = m.tipo === 'INGRESO' ? m.monto : -m.monto;
        branchSum[branch] = (branchSum[branch] || 0) + amount;
      });
      
      return Object.entries(branchSum).map(([name, balance]) => ({ name, balance }));
    },
    
    getMonthlyTrend: async () => {
      const movimientos = await api.get<MovimientoFinancieroDB[]>('/movimientos-financieros');
      if (!movimientos.success || !movimientos.data) return [];
      
      const monthlyData: Record<string, { ingresos: number; egresos: number }> = {};
      
      movimientos.data.forEach(m => {
        const date = new Date(m.fecha);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = { ingresos: 0, egresos: 0 };
        }
        
        if (m.tipo === 'INGRESO') {
          monthlyData[monthKey].ingresos += m.monto;
        } else {
          monthlyData[monthKey].egresos += m.monto;
        }
      });
      
      return Object.entries(monthlyData)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([month, data]) => ({
          month,
          ...data,
          balance: data.ingresos - data.egresos,
        }));
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  // CORTE DE CAJA
  // ─────────────────────────────────────────────────────────────────────────
  corteCaja: {
    getAll: (options?: {
      sucursal?: string;
      fechaInicio?: string;
      fechaFin?: string;
      realizadoPor?: string;
      estatusAprobacion?: string;
      skip?: number;
      take?: number;
    }) => {
      const params: any = {};
      if (options) {
        if (options.sucursal) params.sucursal = options.sucursal;
        if (options.fechaInicio) params.fechaInicio = options.fechaInicio;
        if (options.fechaFin) params.fechaFin = options.fechaFin;
        if (options.realizadoPor) params.realizadoPor = options.realizadoPor;
        if (options.estatusAprobacion) params.estatusAprobacion = options.estatusAprobacion;
        if (options.skip !== undefined) params.skip = options.skip;
        if (options.take !== undefined) params.take = options.take;
      }
      return api.get<any[]>('/corte-caja', params);
    },

    getById: (id: number) =>
      api.getById<any>('/corte-caja', id),

    create: (data: {
      sucursal: string;
      realizadoPor: string;
      fondoInicial: number;
      ventasEfectivo: number;
      salidasEfectivo: number;
      totalContado: number;
      desgloseDenominaciones: Record<string, number>;
      ventasFolios?: string[];
      observaciones?: string;
      ipAddress?: string;
    }) =>
      api.post<any>('/corte-caja', data),

    aprobar: (id: number, data: {
      aprobadoPor: string;
      accion: 'APROBAR' | 'RECHAZAR';
      justificacion?: string;
    }) =>
      api.patch<any>(`/corte-caja/${id}/aprobar`, data),

    cerrar: (id: number, ticketPdfBase64?: string) =>
      api.patch<any>(`/corte-caja/${id}/cerrar`, { ticketPdfBase64 }),

    marcarWhatsappEnviado: (id: number) =>
      api.patch<any>(`/corte-caja/${id}/whatsapp-enviado`, {}),

    getStats: (options?: {
      sucursal?: string;
      fechaInicio?: string;
      fechaFin?: string;
    }) => {
      const params: any = {};
      if (options) {
        if (options.sucursal) params.sucursal = options.sucursal;
        if (options.fechaInicio) params.fechaInicio = options.fechaInicio;
        if (options.fechaFin) params.fechaFin = options.fechaFin;
      }
      return api.get<any>('/corte-caja/stats/general', params);
    },
  },
};

export default financeService;
