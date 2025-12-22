// ============================================================================
// 🌾 AGRONARE — Hooks para ERP
// ============================================================================

import { useState, useEffect, useCallback } from 'react';
import erpService, { 
  ProductDB, 
  ProviderDB, 
  SucursalDB, 
  InventarioDB,
  ActivoDB 
} from '../services/erpService';

// ─────────────────────────────────────────────────────────────────────────
// Hook para Productos
// ─────────────────────────────────────────────────────────────────────────
export function useProducts() {
  const [products, setProducts] = useState<ProductDB[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const response = await erpService.products.getAll();
      if (response.success) {
        setProducts(response.data || []);
        setError(null);
      } else {
        setError(response.error || 'Error cargando productos');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const createProduct = async (data: Omit<ProductDB, 'id' | 'codigo' | 'createdAt' | 'updatedAt'>) => {
    const response = await erpService.products.create(data);
    if (response.success) {
      await fetchProducts();
    }
    return response;
  };

  const updateProduct = async (id: number, data: Partial<ProductDB>) => {
    const response = await erpService.products.update(id, data);
    if (response.success) {
      await fetchProducts();
    }
    return response;
  };

  const deleteProduct = async (id: number) => {
    const response = await erpService.products.delete(id);
    if (response.success) {
      await fetchProducts();
    }
    return response;
  };

  return {
    products,
    loading,
    error,
    refetch: fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
  };
}

// ─────────────────────────────────────────────────────────────────────────
// Hook para Proveedores
// ─────────────────────────────────────────────────────────────────────────
export function useProviders() {
  const [providers, setProviders] = useState<ProviderDB[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProviders = useCallback(async () => {
    setLoading(true);
    try {
      const response = await erpService.providers.getAll();
      if (response.success) {
        setProviders(response.data || []);
        setError(null);
      } else {
        setError(response.error || 'Error cargando proveedores');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProviders();
  }, [fetchProviders]);

  const createProvider = async (data: Omit<ProviderDB, 'id' | 'fechaAlta' | 'actualizadoEn'>) => {
    const response = await erpService.providers.create(data);
    if (response.success) {
      await fetchProviders();
    }
    return response;
  };

  const updateProvider = async (id: number, data: Partial<ProviderDB>) => {
    const response = await erpService.providers.update(id, data);
    if (response.success) {
      await fetchProviders();
    }
    return response;
  };

  const deleteProvider = async (id: number) => {
    const response = await erpService.providers.delete(id);
    if (response.success) {
      await fetchProviders();
    }
    return response;
  };

  return {
    providers,
    loading,
    error,
    refetch: fetchProviders,
    createProvider,
    updateProvider,
    deleteProvider,
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
      const response = await erpService.sucursales.getAll();
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
    const response = await erpService.sucursales.create(data);
    if (response.success) {
      await fetchSucursales();
    }
    return response;
  };

  const updateSucursal = async (id: number, data: Partial<SucursalDB>) => {
    const response = await erpService.sucursales.update(id, data);
    if (response.success) {
      await fetchSucursales();
    }
    return response;
  };

  const deleteSucursal = async (id: number) => {
    const response = await erpService.sucursales.delete(id);
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
// Hook para Inventario
// ─────────────────────────────────────────────────────────────────────────
export function useInventario(sucursalId?: number) {
  const [inventario, setInventario] = useState<InventarioDB[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInventario = useCallback(async () => {
    setLoading(true);
    try {
      const response = sucursalId 
        ? await erpService.inventario.getBySucursal(sucursalId)
        : await erpService.inventario.getAll();
      
      if (response.success) {
        setInventario(response.data || []);
        setError(null);
      } else {
        setError(response.error || 'Error cargando inventario');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [sucursalId]);

  useEffect(() => {
    fetchInventario();
  }, [fetchInventario]);

  const createInventario = async (data: Omit<InventarioDB, 'id' | 'fechaIngreso' | 'ultimaActualizacion'>) => {
    const response = await erpService.inventario.create(data);
    if (response.success) {
      await fetchInventario();
    }
    return response;
  };

  const updateInventario = async (id: number, data: Partial<InventarioDB>) => {
    const response = await erpService.inventario.update(id, data);
    if (response.success) {
      await fetchInventario();
    }
    return response;
  };

  const createMovimiento = async (data: { productoId: number; sucursalId: number; tipo: string; cantidad: number; costoUnit?: number; referencia?: string }) => {
    const response = await erpService.inventario.createMovimiento(data);
    if (response.success) {
      await fetchInventario();
    }
    return response;
  };

  return {
    inventario,
    loading,
    error,
    refetch: fetchInventario,
    createInventario,
    updateInventario,
    createMovimiento,
  };
}

// ─────────────────────────────────────────────────────────────────────────
// Hook para Activos Fijos
// ─────────────────────────────────────────────────────────────────────────
export function useActivos() {
  const [activos, setActivos] = useState<ActivoDB[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchActivos = useCallback(async () => {
    setLoading(true);
    try {
      const response = await erpService.activos.getAll();
      if (response.success) {
        setActivos(response.data || []);
        setError(null);
      } else {
        setError(response.error || 'Error cargando activos');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchActivos();
  }, [fetchActivos]);

  const createActivo = async (data: Omit<ActivoDB, 'id' | 'codigo' | 'createdAt' | 'updatedAt'>) => {
    const response = await erpService.activos.create(data);
    if (response.success) {
      await fetchActivos();
    }
    return response;
  };

  const updateActivo = async (id: number, data: Partial<ActivoDB>) => {
    const response = await erpService.activos.update(id, data);
    if (response.success) {
      await fetchActivos();
    }
    return response;
  };

  const deleteActivo = async (id: number) => {
    const response = await erpService.activos.delete(id);
    if (response.success) {
      await fetchActivos();
    }
    return response;
  };

  return {
    activos,
    loading,
    error,
    refetch: fetchActivos,
    createActivo,
    updateActivo,
    deleteActivo,
  };
}

// ─────────────────────────────────────────────────────────────────────────
// Hook para Dashboard ERP Stats
// ─────────────────────────────────────────────────────────────────────────
export function useERPStats() {
  const [stats, setStats] = useState({
    productos: 0,
    proveedores: 0,
    activos: 0,
    sucursales: 0,
  });
  const [byCategory, setByCategory] = useState<{ name: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const [overview, categoryData] = await Promise.all([
          erpService.stats.getOverview(),
          erpService.stats.getByCategory(),
        ]);
        setStats(overview);
        setByCategory(categoryData);
      } catch (err) {
        console.error('Error fetching ERP stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return { stats, byCategory, loading };
}
