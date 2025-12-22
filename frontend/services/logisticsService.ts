// ============================================================================
// 🌾 AGRONARE — Logistics Service
// Conexión con API backend para módulo Logística (Vehículos, Viajes, Entregas)
// ============================================================================

import api from './api';

// ============================================================================
// TIPOS DE PRISMA (sincronizados con backend)
// ============================================================================

export interface VehiculoDB {
  id: number;
  nombre: string;
  tipo?: string | null;
  capacidad?: number | null;
  placas?: string | null;
  marca?: string | null;
  modelo?: string | null;
  kilometraje?: number | null;
  kilometrajeActual?: number | null;
  estado: string;
  activo: boolean;
  conductorId?: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface ViajeDB {
  id: number;
  nombre?: string | null;
  estado?: string | null;
  fechaInicio?: string | null;
  fechaFin?: string | null;
  vehiculoId?: number | null;
  conductorId?: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface EntregaDB {
  id: number;
  viajeId: number;
  clienteId: number;
  fechaEntrega: string;
  direccion?: string | null;
  estado?: string | null;
  notas?: string | null;
  recibio?: string | null;
  evidenciaUrl?: string | null;
  createdAt: string;
}

export interface RecoleccionDB {
  id: number;
  providerId: number;
  viajeId?: number | null;
  descripcion?: string | null;
  direccion?: string | null;
  fecha: string;
  estado?: string | null;
}

export interface MantenimientoDB {
  id: number;
  vehiculoId: number;
  tipo?: string | null;
  descripcion?: string | null;
  costo?: number | null;
  fecha: string;
  estado?: string | null;
}

export interface MantenimientoProgramadoDB {
  id: number;
  vehiculoId: number;
  tipo?: string | null;
  descripcion?: string | null;
  notas?: string | null;
  fecha?: string | null;
  costo?: number | null;
  estado?: string | null;
}

export interface VehiculoReporteDiarioDB {
  id: number;
  vehiculoId: number;
  fecha: string;
  distanciaTotalKm?: number | null;
  consumoLitros?: number | null;
  costoCombustible?: number | null;
  tiempoActivoHr?: number | null;
  velocidadPromKmH?: number | null;
  observaciones?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ItinerarioDB {
  id: number;
  vehiculoId: number;
  distanciaEstimadaKm?: number | null;
  costoEstimado?: number | null;
  notas?: string | null;
  createdAt: string;
}

export interface ParadaDB {
  id: number;
  itinerarioId: number;
  nombre: string;
  orden: number;
  tipo?: string | null;
  lat?: number | null;
  lng?: number | null;
  createdAt: string;
}

export interface PlanRutaDB {
  id: number;
  nombre?: string | null;
  fecha: string;
  notas?: string | null;
  createdAt: string;
}

export interface VisitaDB {
  id: number;
  planRutaId: number;
  clienteId?: number | null;
  nombre?: string | null;
  direccion?: string | null;
  lat?: number | null;
  lng?: number | null;
  estado?: string | null;
  firmaUrl?: string | null;
  nota?: string | null;
  fecha?: string | null;
}

// ============================================================================
// SERVICIO LOGÍSTICA
// ============================================================================

export const logisticsService = {
  // ─────────────────────────────────────────────────────────────────────────
  // VEHÍCULOS
  // ─────────────────────────────────────────────────────────────────────────
  vehiculos: {
    getAll: (options?: { skip?: number; take?: number; where?: any }) =>
      api.get<VehiculoDB[]>('/vehiculos', options),
    
    getById: (id: number) =>
      api.getById<VehiculoDB>('/vehiculos', id),
    
    create: (data: Omit<VehiculoDB, 'id' | 'createdAt' | 'updatedAt'>) =>
      api.post<VehiculoDB>('/vehiculos', data),
    
    update: (id: number, data: Partial<VehiculoDB>) =>
      api.put<VehiculoDB>('/vehiculos', id, data),
    
    delete: (id: number) =>
      api.delete<void>('/vehiculos', id),
    
    count: (where?: any) =>
      api.count('/vehiculos', where),
    
    getAvailable: () =>
      api.get<VehiculoDB[]>('/vehiculos', { where: { estado: 'Disponible', activo: true } }),
    
    getInMaintenance: () =>
      api.get<VehiculoDB[]>('/vehiculos', { where: { estado: 'Mantenimiento' } }),
  },

  // ─────────────────────────────────────────────────────────────────────────
  // VIAJES
  // ─────────────────────────────────────────────────────────────────────────
  viajes: {
    getAll: (options?: { skip?: number; take?: number; where?: any }) =>
      api.get<ViajeDB[]>('/viajes', options),
    
    getById: (id: number) =>
      api.getById<ViajeDB>('/viajes', id),
    
    create: (data: Omit<ViajeDB, 'id' | 'createdAt' | 'updatedAt'>) =>
      api.post<ViajeDB>('/viajes', data),
    
    update: (id: number, data: Partial<ViajeDB>) =>
      api.put<ViajeDB>('/viajes', id, data),
    
    delete: (id: number) =>
      api.delete<void>('/viajes', id),
    
    getActive: () =>
      api.get<ViajeDB[]>('/viajes', { where: { estado: 'En Progreso' } }),
    
    getPending: () =>
      api.get<ViajeDB[]>('/viajes', { where: { estado: 'Pendiente' } }),
    
    getByVehicle: (vehiculoId: number) =>
      api.get<ViajeDB[]>('/viajes', { where: { vehiculoId } }),
  },

  // ─────────────────────────────────────────────────────────────────────────
  // ENTREGAS
  // ─────────────────────────────────────────────────────────────────────────
  entregas: {
    getAll: (options?: { skip?: number; take?: number; where?: any }) =>
      api.get<EntregaDB[]>('/entregas', options),
    
    getById: (id: number) =>
      api.getById<EntregaDB>('/entregas', id),
    
    create: (data: Omit<EntregaDB, 'id' | 'fechaEntrega' | 'createdAt'>) =>
      api.post<EntregaDB>('/entregas', data),
    
    update: (id: number, data: Partial<EntregaDB>) =>
      api.put<EntregaDB>('/entregas', id, data),
    
    delete: (id: number) =>
      api.delete<void>('/entregas', id),
    
    getByViaje: (viajeId: number) =>
      api.get<EntregaDB[]>('/entregas', { where: { viajeId } }),
    
    getPending: () =>
      api.get<EntregaDB[]>('/entregas', { where: { estado: 'Pendiente' } }),
    
    getCompleted: () =>
      api.get<EntregaDB[]>('/entregas', { where: { estado: 'Completada' } }),
  },

  // ─────────────────────────────────────────────────────────────────────────
  // RECOLECCIONES
  // ─────────────────────────────────────────────────────────────────────────
  recolecciones: {
    getAll: (options?: { skip?: number; take?: number; where?: any }) =>
      api.get<RecoleccionDB[]>('/recolecciones', options),
    
    create: (data: Omit<RecoleccionDB, 'id' | 'fecha'>) =>
      api.post<RecoleccionDB>('/recolecciones', data),
    
    update: (id: number, data: Partial<RecoleccionDB>) =>
      api.put<RecoleccionDB>('/recolecciones', id, data),
    
    getByViaje: (viajeId: number) =>
      api.get<RecoleccionDB[]>('/recolecciones', { where: { viajeId } }),
  },

  // ─────────────────────────────────────────────────────────────────────────
  // MANTENIMIENTOS
  // ─────────────────────────────────────────────────────────────────────────
  mantenimientos: {
    getAll: (options?: { skip?: number; take?: number; where?: any }) =>
      api.get<MantenimientoDB[]>('/mantenimientos', options),
    
    create: (data: Omit<MantenimientoDB, 'id' | 'fecha'>) =>
      api.post<MantenimientoDB>('/mantenimientos', data),
    
    update: (id: number, data: Partial<MantenimientoDB>) =>
      api.put<MantenimientoDB>('/mantenimientos', id, data),
    
    getByVehicle: (vehiculoId: number) =>
      api.get<MantenimientoDB[]>('/mantenimientos', { where: { vehiculoId } }),
    
    getPending: () =>
      api.get<MantenimientoDB[]>('/mantenimientos', { where: { estado: 'pendiente' } }),
    
    // Programados
    getProgramados: (options?: { skip?: number; take?: number; where?: any }) =>
      api.get<MantenimientoProgramadoDB[]>('/mantenimientos-programados', options),
    
    createProgramado: (data: Omit<MantenimientoProgramadoDB, 'id'>) =>
      api.post<MantenimientoProgramadoDB>('/mantenimientos-programados', data),
  },

  // ─────────────────────────────────────────────────────────────────────────
  // REPORTES DIARIOS
  // ─────────────────────────────────────────────────────────────────────────
  reportes: {
    getAll: (options?: { skip?: number; take?: number; where?: any }) =>
      api.get<VehiculoReporteDiarioDB[]>('/vehiculo-reportes', options),
    
    create: (data: Omit<VehiculoReporteDiarioDB, 'id' | 'fecha' | 'createdAt' | 'updatedAt'>) =>
      api.post<VehiculoReporteDiarioDB>('/vehiculo-reportes', data),
    
    getByVehicle: (vehiculoId: number) =>
      api.get<VehiculoReporteDiarioDB[]>('/vehiculo-reportes', { where: { vehiculoId } }),
  },

  // ─────────────────────────────────────────────────────────────────────────
  // POSICIONES GPS
  // ─────────────────────────────────────────────────────────────────────────
  posiciones: {
    getAll: (options?: { skip?: number; take?: number; where?: any }) =>
      api.get<any[]>('/vehiculo-posiciones', options),
    
    create: (data: { vehiculoId: number; latitud: number; longitud: number }) =>
      api.post<any>('/vehiculo-posiciones', data),
    
    getByVehicle: (vehiculoId: number) =>
      api.get<any[]>('/vehiculo-posiciones', { where: { vehiculoId } }),
    
    getLatest: async (vehiculoId: number) => {
      const response = await api.get<any[]>('/vehiculo-posiciones', { 
        where: { vehiculoId },
        take: 1,
        orderBy: { timestamp: 'desc' }
      });
      return response.data?.[0] || null;
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  // ITINERARIOS & PARADAS
  // ─────────────────────────────────────────────────────────────────────────
  itinerarios: {
    getAll: (options?: { skip?: number; take?: number; where?: any }) =>
      api.get<ItinerarioDB[]>('/itinerarios', options),
    
    create: (data: Omit<ItinerarioDB, 'id' | 'createdAt'>) =>
      api.post<ItinerarioDB>('/itinerarios', data),
    
    update: (id: number, data: Partial<ItinerarioDB>) =>
      api.put<ItinerarioDB>('/itinerarios', id, data),
    
    delete: (id: number) =>
      api.delete<void>('/itinerarios', id),
    
    getByVehicle: (vehiculoId: number) =>
      api.get<ItinerarioDB[]>('/itinerarios', { where: { vehiculoId } }),
  },

  paradas: {
    getAll: (options?: { skip?: number; take?: number; where?: any }) =>
      api.get<ParadaDB[]>('/paradas', options),
    
    create: (data: Omit<ParadaDB, 'id' | 'createdAt'>) =>
      api.post<ParadaDB>('/paradas', data),
    
    getByItinerario: (itinerarioId: number) =>
      api.get<ParadaDB[]>('/paradas', { where: { itinerarioId } }),
  },

  // ─────────────────────────────────────────────────────────────────────────
  // PLAN DE RUTAS & VISITAS
  // ─────────────────────────────────────────────────────────────────────────
  planRutas: {
    getAll: (options?: { skip?: number; take?: number; where?: any }) =>
      api.get<PlanRutaDB[]>('/plan-rutas', options),
    
    create: (data: Omit<PlanRutaDB, 'id' | 'fecha' | 'createdAt'>) =>
      api.post<PlanRutaDB>('/plan-rutas', data),
    
    update: (id: number, data: Partial<PlanRutaDB>) =>
      api.put<PlanRutaDB>('/plan-rutas', id, data),
  },

  visitas: {
    getAll: (options?: { skip?: number; take?: number; where?: any }) =>
      api.get<VisitaDB[]>('/visitas', options),
    
    create: (data: Omit<VisitaDB, 'id'>) =>
      api.post<VisitaDB>('/visitas', data),
    
    update: (id: number, data: Partial<VisitaDB>) =>
      api.put<VisitaDB>('/visitas', id, data),
    
    getByPlanRuta: (planRutaId: number) =>
      api.get<VisitaDB[]>('/visitas', { where: { planRutaId } }),
    
    getPending: () =>
      api.get<VisitaDB[]>('/visitas', { where: { estado: 'Pendiente' } }),
  },

  // ─────────────────────────────────────────────────────────────────────────
  // DASHBOARD STATS
  // ─────────────────────────────────────────────────────────────────────────
  stats: {
    getOverview: async () => {
      const [
        totalVehiculos, 
        vehiculosActivos, 
        vehiculosMantenimiento,
        viajesActivos,
        entregasPendientes,
      ] = await Promise.all([
        api.count('/vehiculos'),
        api.count('/vehiculos', { activo: true, estado: 'Disponible' }),
        api.count('/vehiculos', { estado: 'Mantenimiento' }),
        api.count('/viajes', { estado: 'En Progreso' }),
        api.count('/entregas', { estado: 'Pendiente' }),
      ]);

      return {
        totalVehiculos: totalVehiculos.data?.count || 0,
        vehiculosActivos: vehiculosActivos.data?.count || 0,
        vehiculosMantenimiento: vehiculosMantenimiento.data?.count || 0,
        viajesActivos: viajesActivos.data?.count || 0,
        entregasPendientes: entregasPendientes.data?.count || 0,
      };
    },
    
    getFleetStatus: async () => {
      const vehiculos = await api.get<VehiculoDB[]>('/vehiculos');
      if (!vehiculos.success || !vehiculos.data) return [];
      
      const statusCount: Record<string, number> = {};
      vehiculos.data.forEach(v => {
        const status = v.estado || 'Desconocido';
        statusCount[status] = (statusCount[status] || 0) + 1;
      });
      
      return Object.entries(statusCount).map(([name, count]) => ({ name, count }));
    },
  },
};

export default logisticsService;
