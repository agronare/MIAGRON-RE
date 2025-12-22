// ============================================================================
// 🌾 AGRONARE — Hooks para Logística
// ============================================================================

import { useState, useEffect, useCallback } from 'react';
import logisticsService, { 
  VehiculoDB, 
  ViajeDB, 
  EntregaDB,
  MantenimientoDB 
} from '../services/logisticsService';

// ─────────────────────────────────────────────────────────────────────────
// Hook para Vehículos
// ─────────────────────────────────────────────────────────────────────────
export function useVehiculos() {
  const [vehiculos, setVehiculos] = useState<VehiculoDB[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVehiculos = useCallback(async () => {
    setLoading(true);
    try {
      const response = await logisticsService.vehiculos.getAll();
      if (response.success) {
        setVehiculos(response.data || []);
        setError(null);
      } else {
        setError(response.error || 'Error cargando vehículos');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVehiculos();
  }, [fetchVehiculos]);

  const createVehiculo = async (data: Omit<VehiculoDB, 'id' | 'createdAt' | 'updatedAt'>) => {
    const response = await logisticsService.vehiculos.create(data);
    if (response.success) {
      await fetchVehiculos();
    }
    return response;
  };

  const updateVehiculo = async (id: number, data: Partial<VehiculoDB>) => {
    const response = await logisticsService.vehiculos.update(id, data);
    if (response.success) {
      await fetchVehiculos();
    }
    return response;
  };

  const deleteVehiculo = async (id: number) => {
    const response = await logisticsService.vehiculos.delete(id);
    if (response.success) {
      await fetchVehiculos();
    }
    return response;
  };

  return {
    vehiculos,
    loading,
    error,
    refetch: fetchVehiculos,
    createVehiculo,
    updateVehiculo,
    deleteVehiculo,
  };
}

// ─────────────────────────────────────────────────────────────────────────
// Hook para Viajes
// ─────────────────────────────────────────────────────────────────────────
export function useViajes() {
  const [viajes, setViajes] = useState<ViajeDB[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchViajes = useCallback(async () => {
    setLoading(true);
    try {
      const response = await logisticsService.viajes.getAll();
      if (response.success) {
        setViajes(response.data || []);
        setError(null);
      } else {
        setError(response.error || 'Error cargando viajes');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchViajes();
  }, [fetchViajes]);

  const createViaje = async (data: Omit<ViajeDB, 'id' | 'createdAt' | 'updatedAt'>) => {
    const response = await logisticsService.viajes.create(data);
    if (response.success) {
      await fetchViajes();
    }
    return response;
  };

  const updateViaje = async (id: number, data: Partial<ViajeDB>) => {
    const response = await logisticsService.viajes.update(id, data);
    if (response.success) {
      await fetchViajes();
    }
    return response;
  };

  const deleteViaje = async (id: number) => {
    const response = await logisticsService.viajes.delete(id);
    if (response.success) {
      await fetchViajes();
    }
    return response;
  };

  return {
    viajes,
    loading,
    error,
    refetch: fetchViajes,
    createViaje,
    updateViaje,
    deleteViaje,
  };
}

// ─────────────────────────────────────────────────────────────────────────
// Hook para Entregas
// ─────────────────────────────────────────────────────────────────────────
export function useEntregas(viajeId?: number) {
  const [entregas, setEntregas] = useState<EntregaDB[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEntregas = useCallback(async () => {
    setLoading(true);
    try {
      const response = viajeId 
        ? await logisticsService.entregas.getByViaje(viajeId)
        : await logisticsService.entregas.getAll();
      
      if (response.success) {
        setEntregas(response.data || []);
        setError(null);
      } else {
        setError(response.error || 'Error cargando entregas');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [viajeId]);

  useEffect(() => {
    fetchEntregas();
  }, [fetchEntregas]);

  const createEntrega = async (data: Omit<EntregaDB, 'id' | 'fechaEntrega' | 'createdAt'>) => {
    const response = await logisticsService.entregas.create(data);
    if (response.success) {
      await fetchEntregas();
    }
    return response;
  };

  const updateEntrega = async (id: number, data: Partial<EntregaDB>) => {
    const response = await logisticsService.entregas.update(id, data);
    if (response.success) {
      await fetchEntregas();
    }
    return response;
  };

  return {
    entregas,
    loading,
    error,
    refetch: fetchEntregas,
    createEntrega,
    updateEntrega,
  };
}

// ─────────────────────────────────────────────────────────────────────────
// Hook para Mantenimientos
// ─────────────────────────────────────────────────────────────────────────
export function useMantenimientos(vehiculoId?: number) {
  const [mantenimientos, setMantenimientos] = useState<MantenimientoDB[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMantenimientos = useCallback(async () => {
    setLoading(true);
    try {
      const response = vehiculoId 
        ? await logisticsService.mantenimientos.getByVehicle(vehiculoId)
        : await logisticsService.mantenimientos.getAll();
      
      if (response.success) {
        setMantenimientos(response.data || []);
        setError(null);
      } else {
        setError(response.error || 'Error cargando mantenimientos');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [vehiculoId]);

  useEffect(() => {
    fetchMantenimientos();
  }, [fetchMantenimientos]);

  const createMantenimiento = async (data: Omit<MantenimientoDB, 'id' | 'fecha'>) => {
    const response = await logisticsService.mantenimientos.create(data);
    if (response.success) {
      await fetchMantenimientos();
    }
    return response;
  };

  const updateMantenimiento = async (id: number, data: Partial<MantenimientoDB>) => {
    const response = await logisticsService.mantenimientos.update(id, data);
    if (response.success) {
      await fetchMantenimientos();
    }
    return response;
  };

  return {
    mantenimientos,
    loading,
    error,
    refetch: fetchMantenimientos,
    createMantenimiento,
    updateMantenimiento,
  };
}

// ─────────────────────────────────────────────────────────────────────────
// Hook para Dashboard Logística Stats
// ─────────────────────────────────────────────────────────────────────────
export function useLogisticsStats() {
  const [stats, setStats] = useState({
    totalVehiculos: 0,
    vehiculosActivos: 0,
    vehiculosMantenimiento: 0,
    viajesActivos: 0,
    entregasPendientes: 0,
  });
  const [fleetStatus, setFleetStatus] = useState<{ name: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const [overview, statusData] = await Promise.all([
          logisticsService.stats.getOverview(),
          logisticsService.stats.getFleetStatus(),
        ]);
        setStats(overview);
        setFleetStatus(statusData);
      } catch (err) {
        console.error('Error fetching logistics stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return { stats, fleetStatus, loading };
}
