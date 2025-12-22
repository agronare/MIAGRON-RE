// ============================================================================
// 🌾 AGRONARE — RH Service
// Conexión con API backend para módulo Recursos Humanos
// ============================================================================

import api from './api';

// ============================================================================
// TIPOS DE PRISMA (sincronizados con backend)
// ============================================================================

export interface UserDB {
  id: number;
  name: string;
  email: string;
  passwordHash: string;
  role: string;
  telefono?: string | null;
  sucursal?: string | null;
  isActive: boolean;
  verified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EmpleadoDB {
  id: number;
  userId: number;
  primerNombre: string;
  segundoNombre?: string | null;
  apellidoPaterno: string;
  apellidoMaterno?: string | null;
  fechaNacimiento?: string | null;
  rfc?: string | null;
  curp?: string | null;
  nss?: string | null;
  direccion?: string | null;
  contactoEmergenciaNombre?: string | null;
  contactoEmergenciaTelefono?: string | null;
  departamento?: string | null;
  puesto?: string | null;
  fechaIngreso: string;
  tipoContrato?: string | null;
  salario?: number | null;
  frecuenciaPago?: string | null;
  estatus: string;
  avatarUrl?: string | null;
  portadaUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SucursalDB {
  id: number;
  nombre: string;
  ubicacion?: string | null;
  codigoInterno?: string | null;
  estatus?: string | null;
  horarioAtencion?: string | null;
  calleNumero?: string | null;
  colonia?: string | null;
  municipio?: string | null;
  estado?: string | null;
  codigoPostal?: string | null;
  responsable?: string | null;
  telefono?: string | null;
  email?: string | null;
}

export interface PeriodoNominaDB {
  id: number;
  nombre: string;
  frecuencia: string;
  fechaInicio: string;
  fechaFin: string;
  fechaPago: string;
  estatus: string;
  montoTotal?: number | null;
  empleadosCount?: number | null;
  incidenciasCount?: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface IncidenciaNominaDB {
  id: number;
  empleadoId: number;
  tipo: string;
  fecha: string;
  valor: number;
  estatus: string;
  notas?: string | null;
}

export interface PrestamoDB {
  id: number;
  empleadoId: number;
  monto: number;
  plazoMeses: number;
  deduccionMensual: number;
  motivo?: string | null;
  estatus: string;
  fechaSolicitud: string;
}

export interface SolicitudPermisoDB {
  id: number;
  empleadoId: number;
  tipo: string;
  fechaInicio: string;
  fechaFin: string;
  dias: number;
  motivo?: string | null;
  estatus: string;
  aprobadoPor?: string | null;
}

// ============================================================================
// SERVICIO RH
// ============================================================================

export const rhService = {
  // ─────────────────────────────────────────────────────────────────────────
  // USUARIOS (Auth base)
  // ─────────────────────────────────────────────────────────────────────────
  users: {
    getAll: (options?: { skip?: number; take?: number; where?: any }) =>
      api.get<UserDB[]>('/users', options),
    
    getById: (id: number) =>
      api.getById<UserDB>('/users', id),
    
    create: (data: { name: string; email: string; passwordHash: string; role?: string; telefono?: string; sucursal?: string }) =>
      api.post<UserDB>('/users', data),
    
    update: (id: number, data: Partial<UserDB>) =>
      api.put<UserDB>('/users', id, data),
    
    delete: (id: number) =>
      api.delete<void>('/users', id),
  },

  // ─────────────────────────────────────────────────────────────────────────
  // EMPLEADOS (Datos completos RH)
  // ─────────────────────────────────────────────────────────────────────────
  empleados: {
    getAll: (options?: { skip?: number; take?: number; where?: any }) =>
      api.get<EmpleadoDB[]>('/empleados', options),
    
    getById: (id: number) =>
      api.getById<EmpleadoDB>('/empleados', id),
    
    create: (data: Omit<EmpleadoDB, 'id' | 'createdAt' | 'updatedAt'>) =>
      api.post<EmpleadoDB>('/empleados', data),
    
    update: (id: number, data: Partial<EmpleadoDB>) =>
      api.put<EmpleadoDB>('/empleados', id, data),
    
    delete: (id: number) =>
      api.delete<void>('/empleados', id),
    
    count: (where?: any) =>
      api.count('/empleados', where),
    
    getByDepartamento: (departamento: string) =>
      api.get<EmpleadoDB[]>('/empleados', { where: { departamento } }),
    
    getActivos: () =>
      api.get<EmpleadoDB[]>('/empleados', { where: { estatus: 'Activo' } }),
  },

  // ─────────────────────────────────────────────────────────────────────────
  // SUCURSALES
  // ─────────────────────────────────────────────────────────────────────────
  sucursales: {
    getAll: (options?: { skip?: number; take?: number }) =>
      api.get<SucursalDB[]>('/sucursales', options),
    
    getById: (id: number) =>
      api.getById<SucursalDB>('/sucursales', id),
    
    create: (data: Omit<SucursalDB, 'id'>) =>
      api.post<SucursalDB>('/sucursales', data),
    
    update: (id: number, data: Partial<SucursalDB>) =>
      api.put<SucursalDB>('/sucursales', id, data),
    
    delete: (id: number) =>
      api.delete<void>('/sucursales', id),
  },

  // ─────────────────────────────────────────────────────────────────────────
  // NÓMINA
  // ─────────────────────────────────────────────────────────────────────────
  nomina: {
    // Periodos
    getPeriodos: (options?: { skip?: number; take?: number }) =>
      api.get<PeriodoNominaDB[]>('/periodos-nomina', options),
    
    createPeriodo: (data: Omit<PeriodoNominaDB, 'id' | 'createdAt' | 'updatedAt'>) =>
      api.post<PeriodoNominaDB>('/periodos-nomina', data),
    
    updatePeriodo: (id: number, data: Partial<PeriodoNominaDB>) =>
      api.put<PeriodoNominaDB>('/periodos-nomina', id, data),
    
    // Incidencias
    getIncidencias: (options?: { skip?: number; take?: number; where?: any }) =>
      api.get<IncidenciaNominaDB[]>('/incidencias-nomina', options),
    
    createIncidencia: (data: Omit<IncidenciaNominaDB, 'id'>) =>
      api.post<IncidenciaNominaDB>('/incidencias-nomina', data),
    
    updateIncidencia: (id: number, data: Partial<IncidenciaNominaDB>) =>
      api.put<IncidenciaNominaDB>('/incidencias-nomina', id, data),
    
    getIncidenciasByEmpleado: (empleadoId: number) =>
      api.get<IncidenciaNominaDB[]>('/incidencias-nomina', { where: { empleadoId } }),
  },

  // ─────────────────────────────────────────────────────────────────────────
  // PRÉSTAMOS
  // ─────────────────────────────────────────────────────────────────────────
  prestamos: {
    getAll: (options?: { skip?: number; take?: number; where?: any }) =>
      api.get<PrestamoDB[]>('/prestamos', options),
    
    create: (data: Omit<PrestamoDB, 'id'>) =>
      api.post<PrestamoDB>('/prestamos', data),
    
    update: (id: number, data: Partial<PrestamoDB>) =>
      api.put<PrestamoDB>('/prestamos', id, data),
    
    getByEmpleado: (empleadoId: number) =>
      api.get<PrestamoDB[]>('/prestamos', { where: { empleadoId } }),
  },

  // ─────────────────────────────────────────────────────────────────────────
  // SOLICITUDES DE PERMISO / VACACIONES
  // ─────────────────────────────────────────────────────────────────────────
  permisos: {
    getAll: (options?: { skip?: number; take?: number; where?: any }) =>
      api.get<SolicitudPermisoDB[]>('/solicitudes-permiso', options),
    
    create: (data: Omit<SolicitudPermisoDB, 'id'>) =>
      api.post<SolicitudPermisoDB>('/solicitudes-permiso', data),
    
    update: (id: number, data: Partial<SolicitudPermisoDB>) =>
      api.put<SolicitudPermisoDB>('/solicitudes-permiso', id, data),
    
    getByEmpleado: (empleadoId: number) =>
      api.get<SolicitudPermisoDB[]>('/solicitudes-permiso', { where: { empleadoId } }),
    
    getPendientes: () =>
      api.get<SolicitudPermisoDB[]>('/solicitudes-permiso', { where: { estatus: 'Pendiente' } }),
  },

  // ─────────────────────────────────────────────────────────────────────────
  // SESSION LOGS (Auditoría)
  // ─────────────────────────────────────────────────────────────────────────
  sessionLogs: {
    getAll: (options?: { skip?: number; take?: number; where?: any }) =>
      api.get<any[]>('/session-logs', options),
    
    getByUser: (userId: number) =>
      api.get<any[]>('/session-logs', { where: { userId } }),
    
    create: (data: { userId: number; sessionId: string; type: string; ip?: string; userAgent?: string }) =>
      api.post<any>('/session-logs', data),
  },

  // ─────────────────────────────────────────────────────────────────────────
  // DASHBOARD STATS
  // ─────────────────────────────────────────────────────────────────────────
  stats: {
    getOverview: async () => {
      const [totalEmpleados, empleadosActivos, sucursales, periodos] = await Promise.all([
        api.count('/empleados'),
        api.count('/empleados', { estatus: 'Activo' }),
        api.get<SucursalDB[]>('/sucursales'),
        api.get<PeriodoNominaDB[]>('/periodos-nomina', { take: 1, orderBy: { fechaInicio: 'desc' } }),
      ]);

      return {
        totalEmpleados: totalEmpleados.data?.count || 0,
        empleadosActivos: empleadosActivos.data?.count || 0,
        sucursales: sucursales.data?.length || 0,
        ultimoPeriodo: periodos.data?.[0] || null,
      };
    },
    
    getByDepartamento: async () => {
      const empleados = await api.get<EmpleadoDB[]>('/empleados');
      if (!empleados.success || !empleados.data) return [];
      
      const deptCount: Record<string, number> = {};
      empleados.data.forEach(e => {
        const dept = e.departamento || 'Sin asignar';
        deptCount[dept] = (deptCount[dept] || 0) + 1;
      });
      
      return Object.entries(deptCount).map(([name, count]) => ({ name, count }));
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  // AUTENTICACIÓN
  // ─────────────────────────────────────────────────────────────────────────
  auth: {
    login: async (email: string, _password: string) => {
      // Buscar usuario por email
      const response = await api.get<UserDB[]>('/users', { where: { email } });
      
      if (!response.success || !response.data?.length) {
        return { success: false, error: 'Usuario no encontrado' };
      }
      
      const user = response.data[0];
      
      if (!user.isActive) {
        return { success: false, error: 'Usuario inactivo' };
      }
      
      // Registrar sesión
      await rhService.sessionLogs.create({
        userId: user.id,
        sessionId: crypto.randomUUID(),
        type: 'LOGIN',
      });
      
      return { 
        success: true, 
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          sucursal: user.sucursal,
        }
      };
    },
    
    logout: async (userId: number) => {
      await rhService.sessionLogs.create({
        userId,
        sessionId: crypto.randomUUID(),
        type: 'LOGOUT',
      });
      return { success: true };
    },
  },
};

export default rhService;
