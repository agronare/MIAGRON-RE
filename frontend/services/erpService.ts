// ============================================================================
// 🌾 AGRONARE — ERP Service
// Conexión con API backend para módulo ERP (Productos, Inventario, Compras)
// ============================================================================

import api from './api';

// ============================================================================
// TIPOS DE PRISMA (sincronizados con backend)
// ============================================================================

export interface ProductDB {
  id: number;
  sku?: string | null;
  codigo: string;
  nombre: string;
  precio: number;
  stock: number;
  costo?: number | null;
  descripcion?: string | null;
  categoria?: string | null;
  fabricante?: string | null;
  // Campos adicionales sincronizados con Prisma
  minStock?: number | null;
  ingredienteActivo?: string | null;
  porcentajeIA?: number | null;
  iva?: number | null;
  ieps?: number | null;
  objetoImpuesto?: string | null;
  claveProdServ?: string | null;
  claveUnidad?: string | null;
  retencionIva?: boolean | null;
  retencionIsr?: boolean | null;
  imageKey?: string | null;
  isBulk?: boolean;
  unidadVenta?: string | null;
  unidadBase?: string | null;
  factorConversion?: number | null;
  fichaTecnicaUrl?: string | null;
  guiaAplicacionUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProviderDB {
  id: number;
  nombreEmpresa: string;
  nombreContacto: string;
  email: string;
  telefono?: string | null;
  rfc?: string | null;
  credito?: number | null;
  habilitarCredito: boolean;
  saldoPendiente?: number | null;
  fechaAlta: string;
  actualizadoEn: string;
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

export interface InventarioDB {
  id: number;
  productoId: number;
  sucursalId: number;
  cantidad: number;
  lote?: string | null;
  ubicacion?: string | null;
  costoUnit?: number | null;
  metodoCosto?: string | null;
  fechaIngreso: string;
  ultimaActualizacion: string;
}

export interface InventarioMovimientoDB {
  id: number;
  productoId: number;
  sucursalId: number;
  tipo: string;
  cantidad: number;
  costoUnit?: number | null;
  referencia?: string | null;
  origenModulo?: string | null;
  fecha: string;
}

export interface InventarioTransferDB {
  id: number;
  transferId: string;
  productoId: number;
  origenSucursalId: number;
  destinoSucursalId: number;
  origenInventarioId: number;
  destinoInventarioId: number;
  movimientoSalidaId: number;
  movimientoEntradaId: number;
  cantidad: number;
  costoUnit?: number | null;
  lote?: string | null;
  referencia?: string | null;
  createdAt: string;
}

export interface QuoteDB {
  id: number;
  codigo: string;
  cliente: string;
  fechaCreacion: string;
  fechaExpiracion: string;
  estado: string;
  subtotal: number;
  impuestos: number;
  descuento?: number | null;
  total: number;
  notas?: string | null;
  createdBy: string;
  updatedAt: string;
}

export interface PurchaseDB {
  id: number;
  codigo: string;
  proveedorId: number;
  fechaCompra: string;
  metodoPago: string;
  subtotal: number;
  impuestos: number;
  total: number;
  comentarios?: string | null;
  createdAt: string;
  updatedAt: string;
  quoteId?: number | null;
}

export interface ActivoDB {
  id: number;
  codigo: string;
  nombre: string;
  descripcion?: string | null;
  categoria?: string | null;
  estado?: string | null;
  costo: number;
  fechaCompra: string;
  vidaUtil?: number | null;
  sucursal?: string | null;
  depreciacionMensual?: number | null;
  valorActual?: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface VentaItemDB {
  id?: number;
  ventaId?: number;
  productoId?: number | null;
  sku: string;
  nombre: string;
  cantidad: number;
  unidad?: string;
  precioUnitario: number;
  descuento?: number;
  subtotal: number;
  impuestoMonto: number;
  total: number;
  claveProdServ?: string | null;
  claveUnidad?: string | null;
  objetoImpuesto?: string | null;
  tasaIva?: number | null;
}

export interface VentaDB {
  id?: number;
  folio: string;
  clienteId?: number | null;
  clienteNombre: string;
  clienteRfc?: string | null;
  fecha: string;
  sucursal: string;
  subtotal: number;
  impuestos: number;
  descuentoTotal?: number;
  total: number;
  metodoPago: string;
  referenciaPago?: string | null;
  montoRecibido?: number | null;
  cambioDevuelto?: number | null;
  montoPagado?: number;
  estatus: string;
  requiereFactura?: boolean;
  ticketPdfBase64?: string | null;
  cfdiEstatus?: string;
  cfdiUuid?: string | null;
  cfdiXmlPath?: string | null;
  cfdiPdfPath?: string | null;
  cfdiErrorMsg?: string | null;
  cfdiTimbradoAt?: string | null;
  cfdiPacProvider?: string | null;
  regimenFiscal?: string | null;
  usoCfdi?: string | null;
  creadoPor?: string | null;
  createdAt?: string;
  updatedAt?: string;
  items?: VentaItemDB[];
}

export interface SolicitudCfdiDB {
  id: number;
  ventaId: number;
  clienteEmail: string;
  clienteTelefono?: string | null;
  estatusSolicitud: string;
  notaCliente?: string | null;
  createdAt: string;
  procesadoAt?: string | null;
}

// ============================================================================
// SERVICIO ERP
// ============================================================================

export const erpService = {
  // ─────────────────────────────────────────────────────────────────────────
  // PRODUCTOS
  // ─────────────────────────────────────────────────────────────────────────
  products: {
    getAll: (options?: { skip?: number; take?: number; where?: any }) =>
      api.get<ProductDB[]>('/products', options),
    
    getById: (id: number) =>
      api.getById<ProductDB>('/products', id),
    
    create: (data: Omit<ProductDB, 'id' | 'codigo' | 'createdAt' | 'updatedAt'>) =>
      api.post<ProductDB>('/products', data),
    
    update: (id: number, data: Partial<ProductDB>) =>
      api.put<ProductDB>('/products', id, data),
    
    delete: (id: number) =>
      api.delete<void>('/products', id),
    
    count: (where?: any) =>
      api.count('/products', where),
    
    search: (query: string) =>
      api.get<ProductDB[]>('/products', { 
        where: { nombre: { contains: query } } 
      }),
    
    getByCategory: (categoria: string) =>
      api.get<ProductDB[]>('/products', { where: { categoria } }),
    
    getLowStock: (minStock: number = 10) =>
      api.get<ProductDB[]>('/products', { 
        where: { stock: { lte: minStock } } 
      }),
  },

  // ─────────────────────────────────────────────────────────────────────────
  // PROVEEDORES
  // ─────────────────────────────────────────────────────────────────────────
  providers: {
    getAll: (options?: { skip?: number; take?: number; where?: any }) =>
      api.get<ProviderDB[]>('/providers', options),
    
    getById: (id: number) =>
      api.getById<ProviderDB>('/providers', id),
    
    create: (data: Omit<ProviderDB, 'id' | 'fechaAlta' | 'actualizadoEn'>) =>
      api.post<ProviderDB>('/providers', data),
    
    update: (id: number, data: Partial<ProviderDB>) =>
      api.put<ProviderDB>('/providers', id, data),
    
    delete: (id: number) =>
      api.delete<void>('/providers', id),
    
    count: (where?: any) =>
      api.count('/providers', where),
    
    getWithCredit: () =>
      api.get<ProviderDB[]>('/providers', { where: { habilitarCredito: true } }),
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
  // INVENTARIO
  // ─────────────────────────────────────────────────────────────────────────
  inventario: {
    getAll: (options?: { skip?: number; take?: number; where?: any }) =>
      api.get<InventarioDB[]>('/inventario', options),
    
    getById: (id: number) =>
      api.getById<InventarioDB>('/inventario', id),
    
    create: (data: Omit<InventarioDB, 'id' | 'fechaIngreso' | 'ultimaActualizacion'>) =>
      api.post<InventarioDB>('/inventario', data),
    
    update: (id: number, data: Partial<InventarioDB>) =>
      api.put<InventarioDB>('/inventario', id, data),
    
    delete: (id: number) =>
      api.delete<void>('/inventario', id),
    
    getBySucursal: (sucursalId: number) =>
      api.get<InventarioDB[]>('/inventario', { where: { sucursalId } }),
    
    getByProduct: (productoId: number) =>
      api.get<InventarioDB[]>('/inventario', { where: { productoId } }),
    
    // Movimientos
    getMovimientos: (options?: { skip?: number; take?: number; where?: any }) =>
      api.get<InventarioMovimientoDB[]>('/inventario-movimientos', options),
    
    createMovimiento: (data: Omit<InventarioMovimientoDB, 'id' | 'fecha'>) =>
      api.post<InventarioMovimientoDB>('/inventario-movimientos', data),
    
    bulkImport: (items: Array<{ productoId: number; sucursalId: number; cantidad: number; lote?: string; ubicacion?: string; costoUnit?: number; metodoCosto?: string }>) =>
      api.bulkCreate<{ inserted: number }>('/inventario', items),

    // Transferencia transaccional entre sucursales
    transfer: (payload: {
      origenInventarioId?: number;
      productoId: number;
      origenSucursalId: number;
      destinoSucursalId: number;
      cantidad: number;
      costoUnit?: number | null;
      lote?: string | null;
      referencia?: string | null;
    }) => api.post<{ origen: InventarioDB; destino: InventarioDB; movimientos: { salidaId: number; entradaId: number }; transferId: string }>(
      '/inventario/transfer',
      payload
    ),

    // Auditoría de transferencias
    getTransfers: (options?: { skip?: number; take?: number; where?: any; orderBy?: any }) =>
      api.get<InventarioTransferDB[]>('/inventario/transfer-audit', options),
  },

  // ─────────────────────────────────────────────────────────────────────────
  // COTIZACIONES
  // ─────────────────────────────────────────────────────────────────────────
  quotes: {
    getAll: (options?: { skip?: number; take?: number; where?: any }) =>
      api.get<QuoteDB[]>('/quotes', options),
    
    getById: (id: number) =>
      api.getById<QuoteDB>('/quotes', id),
    
    create: (data: Omit<QuoteDB, 'id' | 'updatedAt'>) =>
      api.post<QuoteDB>('/quotes', data),
    
    update: (id: number, data: Partial<QuoteDB>) =>
      api.put<QuoteDB>('/quotes', id, data),
    
    delete: (id: number) =>
      api.delete<void>('/quotes', id),
    
    getPending: () =>
      api.get<QuoteDB[]>('/quotes', { where: { estado: 'pendiente' } }),
    
    getApproved: () =>
      api.get<QuoteDB[]>('/quotes', { where: { estado: 'aprobada' } }),
  },

  // ─────────────────────────────────────────────────────────────────────────
  // COMPRAS
  // ─────────────────────────────────────────────────────────────────────────
  purchases: {
    getAll: (options?: { skip?: number; take?: number; where?: any }) =>
      api.get<PurchaseDB[]>('/purchases', options),
    
    getById: (id: number) =>
      api.getById<PurchaseDB>('/purchases', id),
    
    create: (data: Omit<PurchaseDB, 'id' | 'createdAt' | 'updatedAt'>) =>
      api.post<PurchaseDB>('/purchases', data),
    
    update: (id: number, data: Partial<PurchaseDB>) =>
      api.put<PurchaseDB>('/purchases', id, data),
    
    delete: (id: number) =>
      api.delete<void>('/purchases', id),
    
    getByProvider: (proveedorId: number) =>
      api.get<PurchaseDB[]>('/purchases', { where: { proveedorId } }),
  },

  // ─────────────────────────────────────────────────────────────────────────
  // ACTIVOS FIJOS
  // ─────────────────────────────────────────────────────────────────────────
  activos: {
    getAll: (options?: { skip?: number; take?: number; where?: any }) =>
      api.get<ActivoDB[]>('/activos', options),
    
    getById: (id: number) =>
      api.getById<ActivoDB>('/activos', id),
    
    create: (data: Omit<ActivoDB, 'id' | 'codigo' | 'createdAt' | 'updatedAt'>) =>
      api.post<ActivoDB>('/activos', data),
    
    update: (id: number, data: Partial<ActivoDB>) =>
      api.put<ActivoDB>('/activos', id, data),
    
    delete: (id: number) =>
      api.delete<void>('/activos', id),
    
    count: (where?: any) =>
      api.count('/activos', where),
    
    getByCategory: (categoria: string) =>
      api.get<ActivoDB[]>('/activos', { where: { categoria } }),
    
    getActive: () =>
      api.get<ActivoDB[]>('/activos', { where: { estado: 'Activo' } }),
  },

  // ─────────────────────────────────────────────────────────────────────────
  // ABONOS PROVEEDOR
  // ─────────────────────────────────────────────────────────────────────────
  abonosProveedor: {
    getAll: (options?: { skip?: number; take?: number; where?: any }) =>
      api.get<any[]>('/abonos-proveedor', options),
    
    create: (data: { proveedorId: number; monto: number; metodoPago?: string; referencia?: string; notas?: string }) =>
      api.post<any>('/abonos-proveedor', data),
    
    getByProvider: (proveedorId: number) =>
      api.get<any[]>('/abonos-proveedor', { where: { proveedorId } }),
  },

  // ─────────────────────────────────────────────────────────────────────────
  // DASHBOARD STATS
  // ─────────────────────────────────────────────────────────────────────────
  stats: {
    getOverview: async () => {
      const [
        totalProducts, 
        totalProviders, 
        totalActivos,
        sucursales,
      ] = await Promise.all([
        api.count('/products'),
        api.count('/providers'),
        api.count('/activos'),
        api.get<SucursalDB[]>('/sucursales'),
      ]);

      return {
        productos: totalProducts.data?.count || 0,
        proveedores: totalProviders.data?.count || 0,
        activos: totalActivos.data?.count || 0,
        sucursales: sucursales.data?.length || 0,
      };
    },
    
    getInventoryValue: async () => {
      const inventario = await api.get<InventarioDB[]>('/inventario');
      if (!inventario.success || !inventario.data) return 0;
      
      return inventario.data.reduce((total, item) => {
        return total + (item.cantidad * (item.costoUnit || 0));
      }, 0);
    },
    
    getByCategory: async () => {
      const products = await api.get<ProductDB[]>('/products');
      if (!products.success || !products.data) return [];
      
      const catCount: Record<string, number> = {};
      products.data.forEach(p => {
        const cat = p.categoria || 'Sin categoría';
        catCount[cat] = (catCount[cat] || 0) + 1;
      });
      
      return Object.entries(catCount).map(([name, count]) => ({ name, count }));
    },
  },
};

// ============================================================================
// MAPPERS: Conversión entre tipos Backend (DB) y Frontend
// ============================================================================

export interface SupplierFrontend {
  id: string;
  companyName: string;
  contactName: string;
  phone: string;
  mobile?: string;
  email?: string;
  rfc?: string;
  mileage?: number;
  hasCredit?: boolean;
  creditLimit?: number;
}

export interface ProductFrontend {
  id: string;
  sku: string;
  name: string;
  presentation?: string;
  unit?: string;
  stock: number;
  price: number;
  cost?: number;
  category?: string;
  manufacturer?: string;
  image?: string;
}

export const mappers = {
  // Convierte ProviderDB (backend) a Supplier (frontend)
  providerToSupplier: (provider: ProviderDB): SupplierFrontend => ({
    id: String(provider.id),
    companyName: provider.nombreEmpresa,
    contactName: provider.nombreContacto,
    phone: provider.telefono || '',
    email: provider.email,
    rfc: provider.rfc || undefined,
    hasCredit: provider.habilitarCredito,
    creditLimit: provider.credito || 0,
  }),

  // Convierte Supplier (frontend) a ProviderDB (para crear/actualizar)
  supplierToProvider: (supplier: SupplierFrontend): Omit<ProviderDB, 'id' | 'fechaAlta' | 'actualizadoEn'> => ({
    nombreEmpresa: supplier.companyName,
    nombreContacto: supplier.contactName,
    email: supplier.email || '',
    telefono: supplier.phone || null,
    rfc: supplier.rfc || null,
    habilitarCredito: supplier.hasCredit || false,
    credito: supplier.creditLimit || null,
    saldoPendiente: 0,
  }),

  // Convierte ProductDB (backend) a Product (frontend)
  productDbToFrontend: (product: ProductDB): ProductFrontend => ({
    id: String(product.id),
    sku: product.sku || product.codigo,
    name: product.nombre,
    stock: product.stock,
    price: product.precio,
    cost: product.costo || undefined,
    category: product.categoria || undefined,
    manufacturer: product.fabricante || undefined,
  }),

  // Convierte array de ProviderDB a array de Supplier
  providersToSuppliers: (providers: ProviderDB[]): SupplierFrontend[] =>
    providers.map(mappers.providerToSupplier),

  // Convierte array de ProductDB a array de Product
  productsToFrontend: (products: ProductDB[]): ProductFrontend[] =>
    products.map(mappers.productDbToFrontend),
};

// ============================================================================
// FUNCIONES DE SINCRONIZACIÓN CON BACKEND
// ============================================================================

export const syncService = {
  // Obtiene proveedores del backend y los convierte a formato frontend
  fetchSuppliers: async (): Promise<SupplierFrontend[]> => {
    try {
      const result = await erpService.providers.getAll();
      if (result.success && result.data) {
        return mappers.providersToSuppliers(result.data);
      }
      console.warn('No se pudieron obtener proveedores del backend');
      return [];
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      return [];
    }
  },

  // Obtiene productos del backend y los convierte a formato frontend
  fetchProducts: async (): Promise<ProductFrontend[]> => {
    try {
      const result = await erpService.products.getAll();
      if (result.success && result.data) {
        return mappers.productsToFrontend(result.data);
      }
      console.warn('No se pudieron obtener productos del backend');
      return [];
    } catch (error) {
      console.error('Error fetching products:', error);
      return [];
    }
  },

  // Crea un proveedor en el backend desde formato frontend
  createSupplier: async (supplier: Omit<SupplierFrontend, 'id'>): Promise<SupplierFrontend | null> => {
    try {
      const providerData = mappers.supplierToProvider(supplier as SupplierFrontend);
      const result = await erpService.providers.create(providerData);
      if (result.success && result.data) {
        return mappers.providerToSupplier(result.data);
      }
      return null;
    } catch (error) {
      console.error('Error creating supplier:', error);
      return null;
    }
  },

  // Actualiza un proveedor en el backend
  updateSupplier: async (id: string, supplier: Partial<SupplierFrontend>): Promise<SupplierFrontend | null> => {
    try {
      const updateData: Partial<ProviderDB> = {};
      if (supplier.companyName) updateData.nombreEmpresa = supplier.companyName;
      if (supplier.contactName) updateData.nombreContacto = supplier.contactName;
      if (supplier.email) updateData.email = supplier.email;
      if (supplier.phone) updateData.telefono = supplier.phone;
      if (supplier.rfc !== undefined) updateData.rfc = supplier.rfc || null;
      if (supplier.hasCredit !== undefined) updateData.habilitarCredito = supplier.hasCredit;
      if (supplier.creditLimit !== undefined) updateData.credito = supplier.creditLimit;
      
      const result = await erpService.providers.update(Number(id), updateData);
      if (result.success && result.data) {
        return mappers.providerToSupplier(result.data);
      }
      return null;
    } catch (error) {
      console.error('Error updating supplier:', error);
      return null;
    }
  },

  // Elimina un proveedor del backend
  deleteSupplier: async (id: string): Promise<boolean> => {
    try {
      const result = await erpService.providers.delete(Number(id));
      return result.success;
    } catch (error) {
      console.error('Error deleting supplier:', error);
      return false;
    }
  },

  // ─────────────────────────────────────────────────────────────────────────
  // VENTAS
  // ─────────────────────────────────────────────────────────────────────────
  ventas: {
    getAll: (options?: {
      skip?: number;
      take?: number;
      folio?: string;
      clienteId?: number;
      estatus?: string;
      fechaInicio?: string;
      fechaFin?: string;
    }) => {
      const params: any = {};
      if (options?.skip !== undefined) params.skip = options.skip;
      if (options?.take !== undefined) params.take = options.take;
      if (options?.folio) params.folio = options.folio;
      if (options?.clienteId) params.clienteId = options.clienteId;
      if (options?.estatus) params.estatus = options.estatus;
      if (options?.fechaInicio) params.fechaInicio = options.fechaInicio;
      if (options?.fechaFin) params.fechaFin = options.fechaFin;

      return api.get<VentaDB[]>('/ventas', params);
    },

    getById: (id: number) =>
      api.getById<VentaDB>('/ventas', id),

    create: async (data: Omit<VentaDB, 'id' | 'createdAt' | 'updatedAt'>) => {
      return api.post<VentaDB>('/ventas', data);
    },

    processSale: async (data: Omit<VentaDB, 'id' | 'createdAt' | 'updatedAt'> & {
      items: Array<any>
    }) => {
      return api.post<{ venta: VentaDB; inventarioActualizado: any[] }>(
        '/ventas/process-sale',
        data
      );
    },

    update: (id: number, data: Partial<VentaDB>) =>
      api.put<VentaDB>('/ventas', id, data),

    getByFolio: (folio: string) =>
      api.get<VentaDB>(`/ventas/public/ticket/${folio}`),

    downloadTicketPDF: async (folio: string): Promise<Blob | null> => {
      try {
        const response = await fetch(`${api.baseURL}/ventas/public/ticket/${folio}/pdf`);
        if (!response.ok) return null;
        return await response.blob();
      } catch (error) {
        console.error('Error downloading ticket PDF:', error);
        return null;
      }
    },

    requestCFDI: (data: {
      folio: string;
      clienteEmail: string;
      clienteTelefono?: string;
      notaCliente?: string;
    }) =>
      api.post<any>('/ventas/public/cfdi/request', data),

    getCFDIStatus: (folio: string) =>
      api.get<any>(`/ventas/public/cfdi/status/${folio}`),

    downloadCFDIPDF: async (folio: string): Promise<Blob | null> => {
      try {
        const response = await fetch(`${api.baseURL}/ventas/public/cfdi/download/${folio}/pdf`);
        if (!response.ok) return null;
        return await response.blob();
      } catch (error) {
        console.error('Error downloading CFDI PDF:', error);
        return null;
      }
    },

    downloadCFDIXML: async (folio: string): Promise<Blob | null> => {
      try {
        const response = await fetch(`${api.baseURL}/ventas/public/cfdi/download/${folio}/xml`);
        if (!response.ok) return null;
        return await response.blob();
      } catch (error) {
        console.error('Error downloading CFDI XML:', error);
        return null;
      }
    },
  },
};

export default erpService;
