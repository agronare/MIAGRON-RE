// ============================================================================
// 🌾 AGRONARE — Hook para CRM
// ============================================================================

import { useState, useEffect, useCallback } from 'react';
import crmService, { ClienteDB, OportunidadDB, CreditoDB, AbonoClienteDB } from '../services/crmService';

// ─────────────────────────────────────────────────────────────────────────
// Hook para Clientes
// ─────────────────────────────────────────────────────────────────────────
export function useClientes() {
  const [clientes, setClientes] = useState<ClienteDB[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClientes = useCallback(async () => {
    setLoading(true);
    try {
      const response = await crmService.clientes.getAll();
      if (response.success) {
        setClientes(response.data || []);
        setError(null);
      } else {
        setError(response.error || 'Error cargando clientes');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClientes();
  }, [fetchClientes]);

  const createCliente = async (data: Omit<ClienteDB, 'id' | 'createdAt' | 'updatedAt'>) => {
    const response = await crmService.clientes.create(data);
    if (response.success) {
      await fetchClientes();
    }
    return response;
  };

  const updateCliente = async (id: number, data: Partial<ClienteDB>) => {
    const response = await crmService.clientes.update(id, data);
    if (response.success) {
      await fetchClientes();
    }
    return response;
  };

  const deleteCliente = async (id: number) => {
    const response = await crmService.clientes.delete(id);
    if (response.success) {
      await fetchClientes();
    }
    return response;
  };

  return {
    clientes,
    loading,
    error,
    refetch: fetchClientes,
    createCliente,
    updateCliente,
    deleteCliente,
  };
}

// ─────────────────────────────────────────────────────────────────────────
// Hook para Oportunidades (Pipeline)
// ─────────────────────────────────────────────────────────────────────────
export function useOportunidades() {
  const [oportunidades, setOportunidades] = useState<OportunidadDB[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOportunidades = useCallback(async () => {
    setLoading(true);
    try {
      const response = await crmService.oportunidades.getAll();
      if (response.success) {
        setOportunidades(response.data || []);
        setError(null);
      } else {
        setError(response.error || 'Error cargando oportunidades');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOportunidades();
  }, [fetchOportunidades]);

  const createOportunidad = async (data: Omit<OportunidadDB, 'id' | 'createdAt'>) => {
    const response = await crmService.oportunidades.create(data);
    if (response.success) {
      await fetchOportunidades();
    }
    return response;
  };

  const updateOportunidad = async (id: number, data: Partial<OportunidadDB>) => {
    const response = await crmService.oportunidades.update(id, data);
    if (response.success) {
      await fetchOportunidades();
    }
    return response;
  };

  const deleteOportunidad = async (id: number) => {
    const response = await crmService.oportunidades.delete(id);
    if (response.success) {
      await fetchOportunidades();
    }
    return response;
  };

  // Agrupar por estado para Pipeline Board
  const pipelineStages = {
    ABIERTO: oportunidades.filter(o => o.estado === 'ABIERTO'),
    CALIFICADO: oportunidades.filter(o => o.estado === 'CALIFICADO'),
    NEGOCIACION: oportunidades.filter(o => o.estado === 'NEGOCIACION'),
    GANADA: oportunidades.filter(o => o.estado === 'GANADA'),
    PERDIDA: oportunidades.filter(o => o.estado === 'PERDIDA'),
  };

  return {
    oportunidades,
    pipelineStages,
    loading,
    error,
    refetch: fetchOportunidades,
    createOportunidad,
    updateOportunidad,
    deleteOportunidad,
  };
}

// ─────────────────────────────────────────────────────────────────────────
// Hook para Créditos
// ─────────────────────────────────────────────────────────────────────────
export function useCreditos(clienteId?: number) {
  const [creditos, setCreditos] = useState<CreditoDB[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCreditos = useCallback(async () => {
    setLoading(true);
    try {
      const response = clienteId 
        ? await crmService.creditos.getByCliente(clienteId)
        : await crmService.creditos.getAll();
      
      if (response.success) {
        setCreditos(response.data || []);
        setError(null);
      } else {
        setError(response.error || 'Error cargando créditos');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [clienteId]);

  useEffect(() => {
    fetchCreditos();
  }, [fetchCreditos]);

  const createCredito = async (data: Omit<CreditoDB, 'id' | 'createdAt' | 'updatedAt'>) => {
    const response = await crmService.creditos.create(data);
    if (response.success) {
      await fetchCreditos();
    }
    return response;
  };

  return {
    creditos,
    loading,
    error,
    refetch: fetchCreditos,
    createCredito,
  };
}

// ─────────────────────────────────────────────────────────────────────────
// Hook para Dashboard CRM Stats
// ─────────────────────────────────────────────────────────────────────────
export function useCRMStats() {
  const [stats, setStats] = useState({
    totalClientes: 0,
    oportunidadesAbiertas: 0,
    pipelineValue: 0,
    creditosActivos: 0,
    saldoPendiente: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const data = await crmService.stats.getOverview();
        setStats(data);
      } catch (err) {
        console.error('Error fetching CRM stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return { stats, loading };
}
