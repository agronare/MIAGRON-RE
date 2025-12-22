// ============================================================================
// 🌾 AGRONARE — CRM Service
// Conexión con API backend para módulo CRM
// ============================================================================

import api from './api';

// ============================================================================
// TIPOS DE PRISMA (sincronizados con backend)
// ============================================================================

export interface ClienteDB {
  id: number;
  nombre: string;
  telefono?: string | null;
  email?: string | null;
  rfc?: string | null;
  direccion?: string | null;
  verificado: boolean;
  creditLimit?: number | null;
  creditUsed?: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreditoDB {
  id: number;
  clienteId: number;
  monto: number;
  montoAbonado: number;
  fechaEmision: string;
  fechaVencimiento?: string | null;
  estado: string;
  descripcion?: string | null;
  interes?: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface AbonoClienteDB {
  id: number;
  clienteId: number;
  oportunidadId?: number | null;
  monto: number;
  fecha: string;
  metodoPago?: string | null;
  referencia?: string | null;
  notas?: string | null;
}

export interface OportunidadDB {
  id: number;
  clienteId: number;
  descripcion: string;
  monto?: number | null;
  estado: string;
  createdAt: string;
}

export interface ClienteVerificacionDB {
  id: number;
  clienteId: number;
  razonSocial?: string | null;
  direccion?: string | null;
  status?: string | null;
  resultado?: string | null;
  metodo?: string | null;
  mensaje?: string | null;
  ineFrenteUrl?: string | null;
  ineReversoUrl?: string | null;
  selfieUrl?: string | null;
  fecha: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// SERVICIO CRM
// ============================================================================

export const crmService = {
  // ─────────────────────────────────────────────────────────────────────────
  // CLIENTES
  // ─────────────────────────────────────────────────────────────────────────
  clientes: {
    getAll: (options?: { skip?: number; take?: number; where?: any }) =>
      api.get<ClienteDB[]>('/clientes', options),
    
    getById: (id: number) =>
      api.getById<ClienteDB>('/clientes', id),
    
    create: (data: Omit<ClienteDB, 'id' | 'createdAt' | 'updatedAt'>) =>
      api.post<ClienteDB>('/clientes', data),
    
    update: (id: number, data: Partial<ClienteDB>) =>
      api.put<ClienteDB>('/clientes', id, data),
    
    delete: (id: number) =>
      api.delete<void>('/clientes', id),
    
    count: (where?: any) =>
      api.count('/clientes', where),
    
    // Búsqueda por nombre
    search: (term: string) =>
      api.get<ClienteDB[]>('/clientes', {
        where: {
          nombre: { contains: term }
        }
      }),
  },

  // ─────────────────────────────────────────────────────────────────────────
  // CRÉDITOS
  // ─────────────────────────────────────────────────────────────────────────
  creditos: {
    getAll: (options?: { skip?: number; take?: number; where?: any }) =>
      api.get<CreditoDB[]>('/creditos', options),
    
    getByCliente: (clienteId: number) =>
      api.get<CreditoDB[]>('/creditos', { where: { clienteId } }),
    
    create: (data: Omit<CreditoDB, 'id' | 'createdAt' | 'updatedAt'>) =>
      api.post<CreditoDB>('/creditos', data),
    
    update: (id: number, data: Partial<CreditoDB>) =>
      api.put<CreditoDB>('/creditos', id, data),
    
    delete: (id: number) =>
      api.delete<void>('/creditos', id),
  },

  // ─────────────────────────────────────────────────────────────────────────
  // ABONOS CLIENTE
  // ─────────────────────────────────────────────────────────────────────────
  abonos: {
    getAll: (options?: { skip?: number; take?: number; where?: any }) =>
      api.get<AbonoClienteDB[]>('/abonos-cliente', options),
    
    getByCliente: (clienteId: number) =>
      api.get<AbonoClienteDB[]>('/abonos-cliente', { where: { clienteId } }),
    
    create: (data: Omit<AbonoClienteDB, 'id'>) =>
      api.post<AbonoClienteDB>('/abonos-cliente', data),
    
    delete: (id: number) =>
      api.delete<void>('/abonos-cliente', id),
  },

  // ─────────────────────────────────────────────────────────────────────────
  // OPORTUNIDADES (Pipeline)
  // ─────────────────────────────────────────────────────────────────────────
  oportunidades: {
    getAll: (options?: { skip?: number; take?: number; where?: any }) =>
      api.get<OportunidadDB[]>('/oportunidades', options),
    
    getByCliente: (clienteId: number) =>
      api.get<OportunidadDB[]>('/oportunidades', { where: { clienteId } }),
    
    create: (data: Omit<OportunidadDB, 'id' | 'createdAt'>) =>
      api.post<OportunidadDB>('/oportunidades', data),
    
    update: (id: number, data: Partial<OportunidadDB>) =>
      api.put<OportunidadDB>('/oportunidades', id, data),
    
    delete: (id: number) =>
      api.delete<void>('/oportunidades', id),
    
    // Por estado
    getByEstado: (estado: string) =>
      api.get<OportunidadDB[]>('/oportunidades', { where: { estado } }),
  },

  // ─────────────────────────────────────────────────────────────────────────
  // VERIFICACIONES
  // ─────────────────────────────────────────────────────────────────────────
  verificaciones: {
    getAll: () =>
      api.get<ClienteVerificacionDB[]>('/cliente-verificaciones'),
    
    getByCliente: (clienteId: number) =>
      api.get<ClienteVerificacionDB[]>('/cliente-verificaciones', { where: { clienteId } }),
    
    create: (data: Omit<ClienteVerificacionDB, 'id' | 'createdAt' | 'updatedAt'>) =>
      api.post<ClienteVerificacionDB>('/cliente-verificaciones', data),
    
    update: (id: number, data: Partial<ClienteVerificacionDB>) =>
      api.put<ClienteVerificacionDB>('/cliente-verificaciones', id, data),
  },

  // ─────────────────────────────────────────────────────────────────────────
  // DASHBOARD STATS
  // ─────────────────────────────────────────────────────────────────────────
  stats: {
    getOverview: async () => {
      const [clientes, oportunidades, creditos] = await Promise.all([
        api.count('/clientes'),
        api.get<OportunidadDB[]>('/oportunidades'),
        api.get<CreditoDB[]>('/creditos', { where: { estado: 'ACTIVO' } }),
      ]);

      const totalClientes = clientes.data?.count || 0;
      const ops = oportunidades.data || [];
      const creds = creditos.data || [];

      const pipelineValue = ops.reduce((sum, o) => sum + (o.monto || 0), 0);
      const activeCredits = creds.reduce((sum, c) => sum + c.monto - c.montoAbonado, 0);

      return {
        totalClientes,
        oportunidadesAbiertas: ops.filter(o => o.estado === 'ABIERTO').length,
        pipelineValue,
        creditosActivos: creds.length,
        saldoPendiente: activeCredits,
      };
    },
  },
};

export default crmService;
