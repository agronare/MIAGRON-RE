// ============================================================================
// 🌾 AGRONARE — Hook de Sincronización con Backend
// Carga datos del backend Prisma y los mantiene sincronizados
// ============================================================================

import { useState, useEffect, useCallback } from 'react';
import { syncService, SupplierFrontend, ProductFrontend } from '../services/erpService';

// ============================================================================
// HOOK: useBackendSuppliers
// Carga proveedores del backend y los mantiene sincronizados
// ============================================================================

export interface UseBackendSuppliersReturn {
  suppliers: SupplierFrontend[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  addSupplier: (supplier: Omit<SupplierFrontend, 'id'>) => Promise<SupplierFrontend | null>;
  updateSupplier: (id: string, data: Partial<SupplierFrontend>) => Promise<SupplierFrontend | null>;
  deleteSupplier: (id: string) => Promise<boolean>;
}

export const useBackendSuppliers = (
  fallbackSuppliers: SupplierFrontend[] = []
): UseBackendSuppliersReturn => {
  const [suppliers, setSuppliers] = useState<SupplierFrontend[]>(fallbackSuppliers);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await syncService.fetchSuppliers();
      if (data.length > 0) {
        setSuppliers(data);
      } else {
        // Si no hay datos en backend, usar fallback
        setSuppliers(fallbackSuppliers);
      }
    } catch (err) {
      setError('Error al cargar proveedores del backend');
      console.error(err);
      setSuppliers(fallbackSuppliers);
    } finally {
      setLoading(false);
    }
  }, [fallbackSuppliers]);

  // Cargar datos al montar
  useEffect(() => {
    refresh();
  }, []);

  const addSupplier = async (supplier: Omit<SupplierFrontend, 'id'>) => {
    const newSupplier = await syncService.createSupplier(supplier);
    if (newSupplier) {
      setSuppliers(prev => [...prev, newSupplier]);
    }
    return newSupplier;
  };

  const updateSupplier = async (id: string, data: Partial<SupplierFrontend>) => {
    const updated = await syncService.updateSupplier(id, data);
    if (updated) {
      setSuppliers(prev => prev.map(s => s.id === id ? updated : s));
    }
    return updated;
  };

  const deleteSupplier = async (id: string) => {
    const success = await syncService.deleteSupplier(id);
    if (success) {
      setSuppliers(prev => prev.filter(s => s.id !== id));
    }
    return success;
  };

  return {
    suppliers,
    loading,
    error,
    refresh,
    addSupplier,
    updateSupplier,
    deleteSupplier,
  };
};

// ============================================================================
// HOOK: useBackendProducts
// Carga productos del backend y los mantiene sincronizados
// ============================================================================

export interface UseBackendProductsReturn {
  products: ProductFrontend[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export const useBackendProducts = (
  fallbackProducts: ProductFrontend[] = []
): UseBackendProductsReturn => {
  const [products, setProducts] = useState<ProductFrontend[]>(fallbackProducts);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await syncService.fetchProducts();
      if (data.length > 0) {
        setProducts(data);
      } else {
        setProducts(fallbackProducts);
      }
    } catch (err) {
      setError('Error al cargar productos del backend');
      console.error(err);
      setProducts(fallbackProducts);
    } finally {
      setLoading(false);
    }
  }, [fallbackProducts]);

  useEffect(() => {
    refresh();
  }, []);

  return {
    products,
    loading,
    error,
    refresh,
  };
};

// ============================================================================
// HOOK COMBINADO: useBackendData
// Carga todos los datos del backend en una sola llamada
// ============================================================================

export interface BackendData {
  suppliers: SupplierFrontend[];
  products: ProductFrontend[];
  isLoading: boolean;
  errors: string[];
  refreshAll: () => Promise<void>;
}

export const useBackendData = (
  fallbackSuppliers: SupplierFrontend[] = [],
  fallbackProducts: ProductFrontend[] = []
): BackendData => {
  const [suppliers, setSuppliers] = useState<SupplierFrontend[]>(fallbackSuppliers);
  const [products, setProducts] = useState<ProductFrontend[]>(fallbackProducts);
  const [isLoading, setIsLoading] = useState(true);
  const [errors, setErrors] = useState<string[]>([]);

  const refreshAll = useCallback(async () => {
    setIsLoading(true);
    setErrors([]);
    const newErrors: string[] = [];

    try {
      const [suppliersData, productsData] = await Promise.all([
        syncService.fetchSuppliers(),
        syncService.fetchProducts(),
      ]);

      if (suppliersData.length > 0) {
        setSuppliers(suppliersData);
      } else {
        newErrors.push('No se encontraron proveedores en el backend');
        setSuppliers(fallbackSuppliers);
      }

      if (productsData.length > 0) {
        setProducts(productsData);
      } else {
        newErrors.push('No se encontraron productos en el backend');
        setProducts(fallbackProducts);
      }
    } catch (err) {
      newErrors.push('Error de conexión con el backend');
      setSuppliers(fallbackSuppliers);
      setProducts(fallbackProducts);
    }

    setErrors(newErrors);
    setIsLoading(false);
  }, [fallbackSuppliers, fallbackProducts]);

  useEffect(() => {
    refreshAll();
  }, []);

  return {
    suppliers,
    products,
    isLoading,
    errors,
    refreshAll,
  };
};

export default useBackendSuppliers;
