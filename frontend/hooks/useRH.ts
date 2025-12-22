// ============================================================================
// 🌾 AGRONARE — Hook para RH
// ============================================================================

import { useState, useEffect, useCallback } from 'react';
import rhService, { EmpleadoDB, SucursalDB } from '../services/rhService';

// Tipo para crear empleado desde UI
interface CreateEmpleadoInput {
  userId: number;
  primerNombre: string;
  segundoNombre?: string;
  apellidoPaterno: string;
  apellidoMaterno?: string;
  departamento?: string;
  puesto?: string;
  fechaIngreso: string;
  estatus?: string;
  salario?: number;
}

// ─────────────────────────────────────────────────────────────────────────
// Hook para Empleados
// ─────────────────────────────────────────────────────────────────────────
export function useEmpleados() {
  const [empleados, setEmpleados] = useState<EmpleadoDB[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEmpleados = useCallback(async () => {
    setLoading(true);
    try {
      const response = await rhService.empleados.getAll();
      if (response.success) {
        setEmpleados(response.data || []);
        setError(null);
      } else {
        setError(response.error || 'Error cargando empleados');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEmpleados();
  }, [fetchEmpleados]);

  const createEmpleado = async (data: CreateEmpleadoInput) => {
    const empleadoData = {
      userId: data.userId,
      primerNombre: data.primerNombre,
      segundoNombre: data.segundoNombre || null,
      apellidoPaterno: data.apellidoPaterno,
      apellidoMaterno: data.apellidoMaterno || null,
      departamento: data.departamento || null,
      puesto: data.puesto || null,
      fechaIngreso: data.fechaIngreso,
      estatus: data.estatus || 'Activo',
      salario: data.salario || null,
    };
    const response = await rhService.empleados.create(empleadoData as any);
    if (response.success) {
      await fetchEmpleados();
    }
    return response;
  };

  const updateEmpleado = async (id: number, data: Partial<EmpleadoDB>) => {
    const response = await rhService.empleados.update(id, data);
    if (response.success) {
      await fetchEmpleados();
    }
    return response;
  };

  const deleteEmpleado = async (id: number) => {
    const response = await rhService.empleados.delete(id);
    if (response.success) {
      await fetchEmpleados();
    }
    return response;
  };

  const toggleActive = async (id: number, isActive: boolean) => {
    const response = await rhService.empleados.update(id, { estatus: isActive ? 'Activo' : 'Inactivo' });
    if (response.success) {
      await fetchEmpleados();
    }
    return response;
  };

  return {
    empleados,
    loading,
    error,
    refetch: fetchEmpleados,
    createEmpleado,
    updateEmpleado,
    deleteEmpleado,
    toggleActive,
  };
}

// ─────────────────────────────────────────────────────────────────────────
// Hook para Sucursales
// ─────────────────────────────────────────────────────────────────────────
export function useSucursales() {
  const [sucursales, setSucursales] = useState<SucursalDB[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSucursales = useCallback(async () => {
    setLoading(true);
    try {
      const response = await rhService.sucursales.getAll();
      if (response.success) {
        setSucursales(response.data || []);
        setError(null);
      } else {
        setError(response.error || 'Error cargando sucursales');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSucursales();
  }, [fetchSucursales]);

  const createSucursal = async (data: Omit<SucursalDB, 'id'>) => {
    const response = await rhService.sucursales.create(data);
    if (response.success) {
      await fetchSucursales();
    }
    return response;
  };

  const updateSucursal = async (id: number, data: Partial<SucursalDB>) => {
    const response = await rhService.sucursales.update(id, data);
    if (response.success) {
      await fetchSucursales();
    }
    return response;
  };

  const deleteSucursal = async (id: number) => {
    const response = await rhService.sucursales.delete(id);
    if (response.success) {
      await fetchSucursales();
    }
    return response;
  };

  return {
    sucursales,
    loading,
    error,
    refetch: fetchSucursales,
    createSucursal,
    updateSucursal,
    deleteSucursal,
  };
}

// ─────────────────────────────────────────────────────────────────────────
// Hook para Dashboard RH Stats
// ─────────────────────────────────────────────────────────────────────────
export function useRHStats() {
  const [stats, setStats] = useState({
    totalEmpleados: 0,
    empleadosActivos: 0,
    sucursales: 0,
    ultimoPeriodo: null as any,
  });
  const [byDepartment, setByDepartment] = useState<{ name: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const [overview, deptData] = await Promise.all([
          rhService.stats.getOverview(),
          rhService.stats.getByDepartamento(),
        ]);
        setStats(overview);
        setByDepartment(deptData);
      } catch (err) {
        console.error('Error fetching RH stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return { stats, byDepartment, loading };
}

// ─────────────────────────────────────────────────────────────────────────
// Hook para Autenticación
// ─────────────────────────────────────────────────────────────────────────
export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Cargar usuario de localStorage al iniciar
    const savedUser = localStorage.getItem('agronare_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const response = await rhService.auth.login(email, password);
    if (response.success && response.data) {
      setUser(response.data);
      localStorage.setItem('agronare_user', JSON.stringify(response.data));
    }
    return response;
  };

  const logout = async () => {
    if (user?.id) {
      await rhService.auth.logout(user.id);
    }
    setUser(null);
    localStorage.removeItem('agronare_user');
  };

  return {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    logout,
  };
}
