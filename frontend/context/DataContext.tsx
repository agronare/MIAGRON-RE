// ============================================================================
// 🌾 AGRONARE — Data Context (API-First / Prisma Single Source of Truth)
// Provider centralizado para TODOS los datos de negocio
// ============================================================================

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode, useMemo, useRef } from 'react';
import { crmService, ClienteDB } from '../services/crmService';
import { rhService, EmpleadoDB } from '../services/rhService';
import { erpService, ProductDB, ProviderDB, InventarioDB, ActivoDB, SucursalDB, QuoteDB, PurchaseDB } from '../services/erpService';
import api from '../services/api';
import { useConnection } from '../hooks/useConnection';

// ============================================================================
// TYPES — Mapped from Prisma DB types to Frontend types
// ============================================================================

export interface Client {
  id: string;
  name: string;
  contactName: string;
  email?: string;
  phone?: string;
  description?: string;
  status: 'Activo' | 'Inactivo' | 'Prospecto';
  segment?: string;
  isFarmer: boolean;
  rfc: string;
  creditLimit: number;
  currentDebt: number;
  hasCredit: boolean;
  identityVerified: boolean;
  lastContact: string;
}

export interface Supplier {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  phone?: string;
  rfc?: string;
  credit?: number;
  enableCredit: boolean;
  pendingBalance?: number;
  registrationDate: string;
  lastUpdated: string;
}

export interface Product {
  id: string;
  sku?: string;
  code: string;
  name: string;
  price: number;
  stock: number;
  cost?: number;
  description?: string;
  category?: string;
  manufacturer?: string;
  image?: string;
  // Alert threshold and technical data
  minStock?: number;
  activeIngredient?: string;
  iaPercent?: number;
  // Fiscal / SAT 4.0
  satKey?: string;
  satUnitKey?: string;
  taxObject?: string;
  ivaRate?: number | null;
  iepsRate?: number | null;
  retentionIva?: boolean;
  retentionIsr?: boolean;
  // Bulk config
  isBulk?: boolean;
  bulkConfig?: {
    baseUnit: string;
    salesUnit: string;
    conversionFactor: number;
  };
  techSheetUrl?: string;
  applicationGuideUrl?: string;
}

export interface InventoryItem {
  id: string;
  productId: string;
  productName: string;
  sku?: string;
  batch?: string;
  branch: string;
  branchCode?: string;
  quantity: number;
  unitPrice: number;
  entryDate: string;
}

export interface FixedAsset {
  id: string;
  name: string;
  assetId: string;
  category: string;
  description?: string;
  status: 'Activo' | 'En Mantenimiento' | 'Dado de Baja';
  acquisitionCost: number;
  acquisitionDate: string;
  usefulLife: number;
  branch: string;
  depreciationMethod: 'Lineal' | 'Acelerada';
  salvageValue: number;
}

export interface Branch {
  id: string;
  code: string;
  name: string;
  status: 'Activa' | 'Inactiva';
  manager: string;
  phone: string;
  email: string;
  schedule: string;
  street: string;
  colony: string;
  city: string;
  state: string;
  zipCode: string;
  address?: string;
}

export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: string;
  department: string;
  branch: string;
  status: 'Activo' | 'Inactivo' | 'Vacaciones' | 'Permiso';
  joinDate: string;
  contractType: string;
  salary: number;
  paymentFrequency: string;
}

export interface Quote {
  id: string;
  quoteNo: string;
  supplierId: string;
  supplierName: string;
  date: string;
  validUntil: string;
  items: any[];
  notes?: string;
  subtotal: number;
  iva: number;
  total: number;
  status: 'Pendiente' | 'Aprobada' | 'Rechazada' | 'Vencida';
}

export interface PurchaseOrder {
  id: string;
  orderNo: string;
  supplierId: string;
  supplierName: string;
  date: string;
  items: any[];
  subtotal: number;
  iva: number;
  total: number;
  status: 'Pendiente' | 'Parcial' | 'Completada' | 'Cancelada';
  paymentMethod: string;
  notes?: string;
  quoteId?: string;
}

export interface PaymentRecord {
  id: string;
  date: string;
  type: 'receivable' | 'payable';
  entityId: string;
  entityName: string;
  amount: number;
  method: string;
  reference?: string;
  notes?: string;
}

export interface Sale {
  id: string;
  date: string;
  clientId: string;
  clientName: string;
  items: any[];
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod: string;
  status: string;
}

export interface PayrollPeriod {
  id: string;
  name: string;
  frequency: string;
  startDate: string;
  endDate: string;
  paymentDate: string;
  status: string;
  totalAmount: number;
  employeesCount: number;
}

export interface PayrollIncident {
  id: string;
  employeeId: string;
  employeeName: string;
  type: string;
  date: string;
  value: number;
  status: string;
}

export interface Vehicle {
  id: string;
  plate: string;
  type: string;
  brand: string;
  model: string;
  year: number;
  status: string;
  driver?: string;
  capacity?: number;
}

export interface Trip {
  id: string;
  vehicleId: string;
  driverId: string;
  origin: string;
  destination: string;
  date: string;
  status: string;
}

export interface Bot {
  id: string;
  name: string;
  description: string;
  status: string;
  lastRun?: string;
  schedule?: string;
}

// ============================================================================
// DATA CONTEXT TYPE
// ============================================================================

interface DataContextType {
  // Loading states
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  lastSync: Date | null;
  
  // ─────────────────────────────────────────────────────────────────────────
  // ERP Data
  // ─────────────────────────────────────────────────────────────────────────
  products: Product[];
  suppliers: Supplier[];
  inventory: InventoryItem[];
  quotes: Quote[];
  purchaseOrders: PurchaseOrder[];
  fixedAssets: FixedAsset[];
  branches: Branch[];
  
  // ERP Actions
  loadProducts: () => Promise<void>;
  loadSuppliers: () => Promise<void>;
  loadInventory: () => Promise<void>;
  loadQuotes: () => Promise<void>;
  loadPurchaseOrders: () => Promise<void>;
  loadFixedAssets: () => Promise<void>;
  loadBranches: () => Promise<void>;
  
  // ERP Mutations
  createProduct: (data: Partial<Product>) => Promise<boolean>;
  updateProduct: (id: string, data: Partial<Product>) => Promise<boolean>;
  deleteProduct: (id: string) => Promise<boolean>;
  createSupplier: (data: Partial<Supplier>) => Promise<boolean>;
  updateSupplier: (id: string, data: Partial<Supplier>) => Promise<boolean>;
  deleteSupplier: (id: string) => Promise<boolean>;
  // Branch Mutations (RH)
  createBranch: (data: Partial<Branch>) => Promise<boolean>;
  updateBranch: (id: string, data: Partial<Branch>) => Promise<boolean>;
  deleteBranch: (id: string) => Promise<boolean>;
  
  // ─────────────────────────────────────────────────────────────────────────
  // CRM Data
  // ─────────────────────────────────────────────────────────────────────────
  clients: Client[];
  salesHistory: Sale[];
  payments: PaymentRecord[];
  
  // CRM Actions
  loadClients: () => Promise<void>;
  loadSales: () => Promise<void>;
  loadPayments: () => Promise<void>;
  
  // CRM Mutations
  createClient: (data: Partial<Client>) => Promise<boolean>;
  updateClient: (id: string, data: Partial<Client>) => Promise<boolean>;
  deleteClient: (id: string) => Promise<boolean>;
  
  // ─────────────────────────────────────────────────────────────────────────
  // RH Data
  // ─────────────────────────────────────────────────────────────────────────
  employees: Employee[];
  payrollPeriods: PayrollPeriod[];
  payrollIncidents: PayrollIncident[];
  
  // RH Actions
  loadEmployees: () => Promise<void>;
  loadPayrollPeriods: () => Promise<void>;
  loadPayrollIncidents: () => Promise<void>;
  
  // ─────────────────────────────────────────────────────────────────────────
  // Logistics Data
  // ─────────────────────────────────────────────────────────────────────────
  vehicles: Vehicle[];
  trips: Trip[];
  deliveries: any[];
  pickups: any[];
  
  // Logistics Actions
  loadVehicles: () => Promise<void>;
  loadTrips: () => Promise<void>;
  loadDeliveries: () => Promise<void>;
  loadPickups: () => Promise<void>;
  
  // ─────────────────────────────────────────────────────────────────────────
  // RPA Data
  // ─────────────────────────────────────────────────────────────────────────
  bots: Bot[];
  botLogs: any[];
  
  // RPA Actions
  loadBots: () => Promise<void>;
  loadBotLogs: () => Promise<void>;
  
  // ─────────────────────────────────────────────────────────────────────────
  // Finance Data
  // ─────────────────────────────────────────────────────────────────────────
  financialMovements: any[];
  advisories: any[];
  
  // Finance Actions
  loadFinancialMovements: () => Promise<void>;
  loadAdvisories: () => Promise<void>;
  
  // ─────────────────────────────────────────────────────────────────────────
  // Global Actions
  // ─────────────────────────────────────────────────────────────────────────
  refreshAll: () => Promise<void>;
  refreshModule: (module: 'erp' | 'crm' | 'rh' | 'logistics' | 'rpa' | 'finance') => Promise<void>;
}

// ============================================================================
// CONTEXT
// ============================================================================

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

// ============================================================================
// MAPPERS — Convert DB types to Frontend types
// ============================================================================

const mapClienteToClient = (c: ClienteDB): Client => ({
  id: String(c.id),
  name: c.nombre,
  contactName: c.nombre,
  email: c.email || undefined,
  phone: c.telefono || undefined,
  description: undefined,
  status: 'Activo',
  segment: undefined,
  isFarmer: false,
  rfc: c.rfc || '',
  creditLimit: c.creditLimit ?? 0,
  currentDebt: c.creditUsed ?? 0,
  hasCredit: (c.creditLimit ?? 0) > 0,
  identityVerified: !!c.verificado,
  lastContact: new Date().toISOString(),
});

const mapProviderToSupplier = (p: ProviderDB): Supplier => ({
  id: String(p.id),
  companyName: p.nombreEmpresa,
  contactName: p.nombreContacto,
  email: p.email,
  phone: p.telefono || undefined,
  rfc: p.rfc || undefined,
  credit: p.credito || undefined,
  enableCredit: p.habilitarCredito,
  pendingBalance: p.saldoPendiente || undefined,
  registrationDate: p.fechaAlta,
  lastUpdated: p.actualizadoEn,
});

const mapProductDBToProduct = (p: ProductDB): Product => ({
  id: String(p.id),
  sku: p.sku || undefined,
  code: p.codigo,
  name: p.nombre,
  price: p.precio,
  stock: p.stock,
  cost: p.costo || undefined,
  description: p.descripcion || undefined,
  category: p.categoria || undefined,
  manufacturer: p.fabricante || undefined,
  minStock: (p.minStock ?? 0) as number,
  activeIngredient: p.ingredienteActivo || undefined,
  iaPercent: (p.porcentajeIA ?? undefined) as any,
  satKey: p.claveProdServ || undefined,
  satUnitKey: p.claveUnidad || undefined,
  taxObject: p.objetoImpuesto || undefined,
  ivaRate: (p.iva ?? null) as any,
  iepsRate: (p.ieps ?? null) as any,
  retentionIva: !!p.retencionIva,
  retentionIsr: !!p.retencionIsr,
  isBulk: !!p.isBulk,
  bulkConfig: {
    baseUnit: p.unidadBase || 'KG',
    salesUnit: p.unidadVenta || 'PZA',
    conversionFactor: (p.factorConversion ?? 1) as number,
  },
  techSheetUrl: p.fichaTecnicaUrl || undefined,
  applicationGuideUrl: p.guiaAplicacionUrl || undefined,
});

const mapSucursalToBranch = (s: SucursalDB): Branch => {
  const baseName = (s.nombre || '').toUpperCase().replace(/\s+/g, '-').slice(0, 10);
  const fallbackCode = baseName ? `${baseName}-${s.id}` : `BR-${s.id}`;
  return {
    id: String(s.id),
    code: s.codigoInterno || fallbackCode,
    name: s.nombre || `Sucursal ${s.id}`,
    status: (s.estatus as any) || 'Activa',
    manager: s.responsable || 'No asignado',
    phone: s.telefono || '',
    email: s.email || '',
    schedule: s.horarioAtencion || '',
    street: s.calleNumero || '',
    colony: s.colonia || '',
    city: s.municipio || '',
    state: s.estado || '',
    zipCode: s.codigoPostal || '',
    address: s.ubicacion || undefined,
  };
};

const mapInventarioToItem = (it: InventarioDB, productMap: Map<number, ProductDB>, sucursalMap: Map<number, {nombre: string, code: string}>): InventoryItem => {
  const sucursal = sucursalMap.get(it.sucursalId);
  return {
    id: String(it.id),
    productId: String(it.productoId),
    productName: productMap.get(it.productoId)?.nombre || 'Producto',
    sku: productMap.get(it.productoId)?.sku || undefined,
    batch: it.lote || undefined,
    branch: sucursal?.nombre || '',
    branchCode: sucursal?.code || undefined,
    quantity: it.cantidad,
    unitPrice: Number(
      it.costoUnit ??
      (productMap.get(it.productoId)?.costo as number | undefined) ??
      (productMap.get(it.productoId)?.precio as number | undefined) ??
      0
    ),
    entryDate: it.fechaIngreso,
  };
};

const mapActivoToAsset = (a: ActivoDB): FixedAsset => ({
  id: String(a.id),
  name: a.nombre,
  assetId: a.codigo,
  category: a.categoria || 'Equipo de Cómputo',
  description: a.descripcion || undefined,
  status: (a.estado as any) || 'Activo',
  acquisitionCost: a.costo,
  acquisitionDate: a.fechaCompra,
  usefulLife: a.vidaUtil ?? 0,
  branch: a.sucursal || '',
  depreciationMethod: 'Lineal',
  salvageValue: a.valorActual ?? 0,
});

const mapQuoteDBToQuote = (q: QuoteDB, items: any[] = []): Quote => ({
  id: String(q.id),
  quoteNo: q.codigo,
  supplierId: '',
  supplierName: q.cliente,
  date: q.fechaCreacion,
  validUntil: q.fechaExpiracion,
  items,
  notes: q.notas || undefined,
  subtotal: q.subtotal,
  iva: q.impuestos,
  total: q.total,
  status: (q.estado as any) || 'Pendiente',
});

const mapPurchaseDBToPO = (p: PurchaseDB, providerMap: Map<number, string>, items: any[] = []): PurchaseOrder => ({
  id: String(p.id),
  orderNo: p.codigo,
  supplierId: String(p.proveedorId),
  supplierName: providerMap.get(p.proveedorId) || '',
  date: p.fechaCompra,
  items,
  subtotal: p.subtotal,
  iva: p.impuestos,
  total: p.total,
  status: 'Pendiente',
  paymentMethod: p.metodoPago || 'Transferencia',
  notes: p.comentarios || undefined,
  quoteId: p.quoteId ? String(p.quoteId) : undefined,
});

const mapEmpleadoToEmployee = (e: EmpleadoDB, userMap: Map<number, any>, defaultBranch: string): Employee => ({
  id: String(e.id),
  firstName: e.primerNombre,
  lastName: e.apellidoPaterno,
  email: userMap.get(e.userId)?.email || '',
  phone: userMap.get(e.userId)?.telefono || '',
  avatar: e.avatarUrl || undefined,
  role: userMap.get(e.userId)?.role || e.puesto || 'Empleado',
  department: e.departamento || 'General',
  branch: userMap.get(e.userId)?.sucursal || defaultBranch,
  status: (e.estatus as any) || 'Activo',
  joinDate: e.fechaIngreso,
  contractType: e.tipoContrato || 'Indeterminado',
  salary: e.salario ?? 0,
  paymentFrequency: e.frecuenciaPago || 'Quincenal',
});

// ============================================================================
// PROVIDER
// ============================================================================

interface DataProviderProps {
  children: ReactNode;
}

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  const { isOnline, canWrite } = useConnection();
  const initRef = useRef(false);
  
  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  // Lazy loading cache - tracks which datasets have been loaded
  const [loadedDatasets, setLoadedDatasets] = useState<Set<string>>(new Set());

  // Cache timestamps - tracks when each dataset was last loaded
  const [datasetTimestamps, setDatasetTimestamps] = useState<Map<string, number>>(new Map());

  // Cache TTL (Time To Live) - 5 minutes
  const CACHE_TTL = 5 * 60 * 1000; // 5 minutos en millisegundos

  /**
   * Verifica si un dataset debe recargarse basado en el TTL del cache
   * @param datasetName - Nombre del dataset a verificar
   * @returns true si debe recargar, false si puede usar cache
   */
  const shouldReload = useCallback((datasetName: string): boolean => {
    const timestamp = datasetTimestamps.get(datasetName);
    if (!timestamp) return true; // No hay timestamp, debe cargar
    const age = Date.now() - timestamp;
    const shouldExpire = age > CACHE_TTL;
    if (shouldExpire) {
      console.log(`⏰ Cache expired for ${datasetName} (age: ${Math.round(age/1000)}s, TTL: ${CACHE_TTL/1000}s)`);
    }
    return shouldExpire;
  }, [datasetTimestamps, CACHE_TTL]);

  /**
   * Marca un dataset como cargado y actualiza su timestamp
   * @param datasetName - Nombre del dataset
   */
  const markAsLoaded = useCallback((datasetName: string) => {
    setLoadedDatasets(prev => new Set(prev).add(datasetName));
    setDatasetTimestamps(prev => new Map(prev).set(datasetName, Date.now()));
  }, []);
  
  // ─────────────────────────────────────────────────────────────────────────
  // ERP State
  // ─────────────────────────────────────────────────────────────────────────
  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [fixedAssets, setFixedAssets] = useState<FixedAsset[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  
  // Internal maps for lookups
  const [productDBMap, setProductDBMap] = useState<Map<number, ProductDB>>(new Map());
  const [providerDBMap, setProviderDBMap] = useState<Map<number, string>>(new Map());
  const [sucursalDBMap, setSucursalDBMap] = useState<Map<number, {nombre: string, code: string}>>(new Map());
  
  // ─────────────────────────────────────────────────────────────────────────
  // CRM State
  // ─────────────────────────────────────────────────────────────────────────
  const [clients, setClients] = useState<Client[]>([]);
  const [salesHistory, setSalesHistory] = useState<Sale[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  
  // ─────────────────────────────────────────────────────────────────────────
  // RH State
  // ─────────────────────────────────────────────────────────────────────────
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [payrollPeriods, setPayrollPeriods] = useState<PayrollPeriod[]>([]);
  const [payrollIncidents, setPayrollIncidents] = useState<PayrollIncident[]>([]);
  
  // ─────────────────────────────────────────────────────────────────────────
  // Logistics State
  // ─────────────────────────────────────────────────────────────────────────
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [pickups, setPickups] = useState<any[]>([]);
  
  // ─────────────────────────────────────────────────────────────────────────
  // RPA State
  // ─────────────────────────────────────────────────────────────────────────
  const [bots, setBots] = useState<Bot[]>([]);
  const [botLogs, setBotLogs] = useState<any[]>([]);
  
  // ─────────────────────────────────────────────────────────────────────────
  // Finance State
  // ─────────────────────────────────────────────────────────────────────────
  const [financialMovements, setFinancialMovements] = useState<any[]>([]);
  const [advisories, setAdvisories] = useState<any[]>([]);
  
  // ============================================================================
  // LOADERS
  // ============================================================================
  
  // --- ERP Loaders ---
  
  const loadProducts = useCallback(async (force = false) => {
    if (!isOnline) return;
    if (!force && !shouldReload('products')) {
      console.log('📦 Products already loaded (using cache)');
      return;
    }
    try {
      console.log('🔄 Loading products...');
      const response = await erpService.products.getAll();
      if (response.success && response.data) {
        const map = new Map<number, ProductDB>();
        response.data.forEach(p => map.set(p.id, p));
        setProductDBMap(map);
        setProducts(response.data.map(mapProductDBToProduct));
        markAsLoaded('products');
        console.log('✅ Products loaded');
      }
    } catch (err: any) {
      console.error('Error loading products:', err);
    }
  }, [isOnline, shouldReload, markAsLoaded]);
  
  const loadSuppliers = useCallback(async (force = false) => {
    if (!isOnline) return;
    if (!force && !shouldReload('suppliers')) {
      console.log('📦 Suppliers already loaded (using cache)');
      return;
    }
    try {
      console.log('🔄 Loading suppliers...');
      const response = await erpService.providers.getAll();
      if (response.success && response.data) {
        const map = new Map<number, string>();
        response.data.forEach(p => map.set(p.id, p.nombreEmpresa));
        setProviderDBMap(map);
        setSuppliers(response.data.map(mapProviderToSupplier));
        markAsLoaded('suppliers');
        console.log('✅ Suppliers loaded');
      }
    } catch (err: any) {
      console.error('Error loading suppliers:', err);
    }
  }, [isOnline, shouldReload, markAsLoaded]);
  
  const loadBranches = useCallback(async (force = false) => {
    if (!isOnline) return;
    if (!force && !shouldReload('branches')) {
      console.log('📦 Branches already loaded (using cache)');
      return;
    }
    try {
      console.log('🔄 Loading branches...');
      const response = await erpService.sucursales.getAll();
      if (response.success && response.data) {
        const map = new Map<number, {nombre: string, code: string}>();
        response.data.forEach(s => {
          const baseName = (s.nombre || '').toUpperCase().replace(/\s+/g, '-').slice(0, 10);
          const fallbackCode = baseName ? `${baseName}-${s.id}` : `BR-${s.id}`;
          const code = (s as any).codigoInterno || fallbackCode;
          map.set(s.id, { nombre: s.nombre, code });
        });
        setSucursalDBMap(map);
        setBranches(response.data.map(mapSucursalToBranch));
        markAsLoaded('branches');
        console.log('✅ Branches loaded');
      }
    } catch (err: any) {
      console.error('Error loading branches:', err);
    }
  }, [isOnline, shouldReload, markAsLoaded]);
  
  const loadInventory = useCallback(async (force = false) => {
    if (!isOnline) return;
    if (!force && !shouldReload('inventory')) {
      console.log('📦 Inventory already loaded (using cache)');
      return;
    }
    try {
      console.log('🔄 Loading inventory...');
      const response = await erpService.inventario.getAll();
      if (response.success && response.data) {
        setInventory(response.data.map(it => mapInventarioToItem(it, productDBMap, sucursalDBMap)));
        markAsLoaded('inventory');
        console.log('✅ Inventory loaded');
      }
    } catch (err: any) {
      console.error('Error loading inventory:', err);
    }
  }, [isOnline, productDBMap, sucursalDBMap, shouldReload, markAsLoaded]);
  
  const loadQuotes = useCallback(async (force = false) => {
    if (!isOnline) return;
    if (!force && !shouldReload('quotes')) {
      console.log('📦 Quotes already loaded (using cache)');
      return;
    }
    try {
      console.log('🔄 Loading quotes...');
      const [quotesRes, itemsRes] = await Promise.all([
        erpService.quotes.getAll(),
        api.get<any[]>('/quote-items'),
      ]);

      if (quotesRes.success && quotesRes.data) {
        const itemsByQuote = new Map<number, any[]>();
        if (itemsRes.success && itemsRes.data) {
          itemsRes.data.forEach(it => {
            const arr = itemsByQuote.get(it.quoteId) || [];
            arr.push({
              id: String(it.productoId),
              name: productDBMap.get(it.productoId)?.nombre || 'Producto',
              sku: productDBMap.get(it.productoId)?.sku || '',
              quantity: it.cantidad,
              cost: it.precioUnit,
            });
            itemsByQuote.set(it.quoteId, arr);
          });
        }
        setQuotes(quotesRes.data.map(q => mapQuoteDBToQuote(q, itemsByQuote.get(q.id) || [])));
        markAsLoaded('quotes');
        console.log('✅ Quotes loaded');
      }
    } catch (err: any) {
      console.error('Error loading quotes:', err);
    }
  }, [isOnline, productDBMap, shouldReload, markAsLoaded]);
  
  const loadPurchaseOrders = useCallback(async (force = false) => {
    if (!isOnline) return;
    if (!force && !shouldReload('purchaseOrders')) {
      console.log('📦 PurchaseOrders already loaded (using cache)');
      return;
    }
    try {
      console.log('🔄 Loading purchase orders...');
      const [posRes, itemsRes] = await Promise.all([
        erpService.purchases.getAll(),
        api.get<any[]>('/purchase-items'),
      ]);

      if (posRes.success && posRes.data) {
        const itemsByPO = new Map<number, any[]>();
        if (itemsRes.success && itemsRes.data) {
          itemsRes.data.forEach(it => {
            const arr = itemsByPO.get(it.purchaseId) || [];
            arr.push({
              id: String(it.productoId),
              name: productDBMap.get(it.productoId)?.nombre || 'Producto',
              sku: productDBMap.get(it.productoId)?.sku || '',
              quantity: it.cantidad,
              cost: it.costoUnit,
            });
            itemsByPO.set(it.purchaseId, arr);
          });
        }
        setPurchaseOrders(posRes.data.map(p => mapPurchaseDBToPO(p, providerDBMap, itemsByPO.get(p.id) || [])));
        markAsLoaded('purchaseOrders');
        console.log('✅ PurchaseOrders loaded');
      }
    } catch (err: any) {
      console.error('Error loading purchase orders:', err);
    }
  }, [isOnline, productDBMap, providerDBMap, shouldReload, markAsLoaded]);
  
  const loadFixedAssets = useCallback(async (force = false) => {
    if (!isOnline) return;
    if (!force && !shouldReload('fixedAssets')) {
      console.log('📦 FixedAssets already loaded (using cache)');
      return;
    }
    try {
      console.log('🔄 Loading fixed assets...');
      const response = await erpService.activos.getAll();
      if (response.success && response.data) {
        setFixedAssets(response.data.map(mapActivoToAsset));
        markAsLoaded('fixedAssets');
        console.log('✅ FixedAssets loaded');
      }
    } catch (err: any) {
      console.error('Error loading fixed assets:', err);
    }
  }, [isOnline, shouldReload, markAsLoaded]);
  
  // --- CRM Loaders ---
  
  const loadClients = useCallback(async (force = false) => {
    if (!isOnline) return;
    if (!force && !shouldReload('clients')) {
      console.log('📦 Clients already loaded (using cache)');
      return;
    }
    try {
      console.log('🔄 Loading clients...');
      const response = await crmService.clientes.getAll();
      if (response.success && response.data) {
        setClients(response.data.map(mapClienteToClient));
        markAsLoaded('clients');
        console.log('✅ Clients loaded');
      }
    } catch (err: any) {
      console.error('Error loading clients:', err);
    }
  }, [isOnline, shouldReload, markAsLoaded]);
  
  const loadSales = useCallback(async (force = false) => {
    if (!isOnline) return;
    if (!force && !shouldReload('sales')) {
      console.log('📦 Sales already loaded (using cache)');
      return;
    }
    try {
      console.log('🔄 Loading sales...');
      const response = await api.get<any[]>('/ventas');
      if (response.success && response.data) {
        setSalesHistory(response.data.map(s => ({
          id: String(s.id),
          date: s.fecha,
          clientId: String(s.clienteId),
          clientName: clients.find(c => c.id === String(s.clienteId))?.name || '',
          items: [],
          subtotal: s.subtotal,
          tax: s.impuestos,
          total: s.total,
          paymentMethod: s.metodoPago,
          status: s.estatus,
        })));
        markAsLoaded('sales');
        console.log('✅ Sales loaded');
      }
    } catch (err: any) {
      console.error('Error loading sales:', err);
    }
  }, [isOnline, clients, shouldReload, markAsLoaded]);
  
  const loadPayments = useCallback(async (force = false) => {
    if (!isOnline) return;
    if (!force && !shouldReload('payments')) {
      console.log('📦 Payments already loaded (using cache)');
      return;
    }
    try {
      console.log('🔄 Loading payments...');
      const [clientAbonos, providerAbonos] = await Promise.all([
        crmService.abonos.getAll(),
        erpService.abonosProveedor.getAll(),
      ]);

      const clientNameMap = new Map<string, string>();
      clients.forEach(c => clientNameMap.set(c.id, c.name));

      const supplierNameMap = new Map<string, string>();
      suppliers.forEach(s => supplierNameMap.set(s.id, s.companyName));

      const receivable: PaymentRecord[] = (clientAbonos.data || []).map(a => ({
        id: String(a.id),
        date: a.fecha,
        type: 'receivable' as const,
        entityId: String(a.clienteId),
        entityName: clientNameMap.get(String(a.clienteId)) || '',
        amount: a.monto,
        method: a.metodoPago || 'Otro',
        reference: a.referencia || undefined,
        notes: a.notas || undefined,
      }));

      const payable: PaymentRecord[] = (providerAbonos.data || []).map(a => ({
        id: String(a.id),
        date: a.fecha,
        type: 'payable' as const,
        entityId: String(a.proveedorId),
        entityName: supplierNameMap.get(String(a.proveedorId)) || '',
        amount: a.monto,
        method: a.metodoPago || 'Otro',
        reference: a.referencia || undefined,
        notes: a.notas || undefined,
      }));

      setPayments([...receivable, ...payable].sort((a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
      ));
      markAsLoaded('payments');
      console.log('✅ Payments loaded');
    } catch (err: any) {
      console.error('Error loading payments:', err);
    }
  }, [isOnline, clients, suppliers, shouldReload, markAsLoaded]);
  
  // --- RH Loaders ---
  
  const loadEmployees = useCallback(async (force = false) => {
    if (!isOnline) return;
    if (!force && !shouldReload('employees')) {
      console.log('📦 Employees already loaded (using cache)');
      return;
    }
    try {
      console.log('🔄 Loading employees...');
      const [empRes, usersRes] = await Promise.all([
        rhService.empleados.getAll(),
        rhService.users.getAll(),
      ]);

      if (empRes.success && empRes.data) {
        const userMap = new Map<number, any>();
        (usersRes.data || []).forEach(u => userMap.set(u.id, u));

        const defaultBranch = branches[0]?.name || '';
        setEmployees(empRes.data.map(e => mapEmpleadoToEmployee(e, userMap, defaultBranch)));
        markAsLoaded('employees');
        console.log('✅ Employees loaded');
      }
    } catch (err: any) {
      console.error('Error loading employees:', err);
    }
  }, [isOnline, branches, shouldReload, markAsLoaded]);
  
  const loadPayrollPeriods = useCallback(async (force = false) => {
    if (!isOnline) return;
    if (!force && !shouldReload('payrollPeriods')) {
      console.log('📦 PayrollPeriods already loaded (using cache)');
      return;
    }
    try {
      console.log('🔄 Loading payroll periods...');
      const response = await rhService.nomina.getPeriodos();
      if (response.success && response.data) {
        setPayrollPeriods(response.data.map(p => ({
          id: String(p.id),
          name: p.nombre,
          frequency: p.frecuencia || 'Quincenal',
          startDate: p.fechaInicio,
          endDate: p.fechaFin,
          paymentDate: p.fechaPago,
          status: p.estatus || 'Borrador',
          totalAmount: p.montoTotal ?? 0,
          employeesCount: p.empleadosCount ?? 0,
        })));
        markAsLoaded('payrollPeriods');
        console.log('✅ PayrollPeriods loaded');
      }
    } catch (err: any) {
      console.error('Error loading payroll periods:', err);
    }
  }, [isOnline, shouldReload, markAsLoaded]);
  
  const loadPayrollIncidents = useCallback(async (force = false) => {
    if (!isOnline) return;
    if (!force && !shouldReload('payrollIncidents')) {
      console.log('📦 PayrollIncidents already loaded (using cache)');
      return;
    }
    try {
      console.log('🔄 Loading payroll incidents...');
      const response = await rhService.nomina.getIncidencias();
      if (response.success && response.data) {
        const empNameMap = new Map<string, string>();
        employees.forEach(e => empNameMap.set(e.id, `${e.firstName} ${e.lastName}`));

        setPayrollIncidents(response.data.map(i => ({
          id: String(i.id),
          employeeId: String(i.empleadoId),
          employeeName: empNameMap.get(String(i.empleadoId)) || '',
          type: i.tipo || 'Falta Injustificada',
          date: i.fecha,
          value: i.valor,
          status: i.estatus || 'Pendiente',
        })));
        markAsLoaded('payrollIncidents');
        console.log('✅ PayrollIncidents loaded');
      }
    } catch (err: any) {
      console.error('Error loading payroll incidents:', err);
    }
  }, [isOnline, employees, shouldReload, markAsLoaded]);
  
  // --- Logistics Loaders ---
  
  const loadVehicles = useCallback(async (force = false) => {
    if (!isOnline) return;
    if (!force && !shouldReload('vehicles')) {
      console.log('📦 Vehicles already loaded (using cache)');
      return;
    }
    try {
      console.log('🔄 Loading vehicles...');
      const response = await api.get<any[]>('/vehiculos');
      if (response.success) {
        setVehicles(response.data || []);
        markAsLoaded('vehicles');
        console.log('✅ Vehicles loaded');
      }
    } catch (err: any) {
      console.error('Error loading vehicles:', err);
    }
  }, [isOnline, shouldReload, markAsLoaded]);
  
  const loadTrips = useCallback(async (force = false) => {
    if (!isOnline) return;
    if (!force && !shouldReload('trips')) {
      console.log('📦 Trips already loaded (using cache)');
      return;
    }
    try {
      console.log('🔄 Loading trips...');
      const response = await api.get<any[]>('/viajes');
      if (response.success) {
        setTrips(response.data || []);
        markAsLoaded('trips');
        console.log('✅ Trips loaded');
      }
    } catch (err: any) {
      console.error('Error loading trips:', err);
    }
  }, [isOnline, shouldReload, markAsLoaded]);
  
  const loadDeliveries = useCallback(async (force = false) => {
    if (!isOnline) return;
    if (!force && !shouldReload('deliveries')) {
      console.log('📦 Deliveries already loaded (using cache)');
      return;
    }
    try {
      console.log('🔄 Loading deliveries...');
      const response = await api.get<any[]>('/entregas');
      if (response.success) {
        setDeliveries(response.data || []);
        markAsLoaded('deliveries');
        console.log('✅ Deliveries loaded');
      }
    } catch (err: any) {
      console.error('Error loading deliveries:', err);
    }
  }, [isOnline, shouldReload, markAsLoaded]);
  
  const loadPickups = useCallback(async (force = false) => {
    if (!isOnline) return;
    if (!force && !shouldReload('pickups')) {
      console.log('📦 Pickups already loaded (using cache)');
      return;
    }
    try {
      console.log('🔄 Loading pickups...');
      const response = await api.get<any[]>('/recolecciones');
      if (response.success) {
        setPickups(response.data || []);
        markAsLoaded('pickups');
        console.log('✅ Pickups loaded');
      }
    } catch (err: any) {
      console.error('Error loading pickups:', err);
    }
  }, [isOnline, shouldReload, markAsLoaded]);
  
  // --- RPA Loaders ---
  
  const loadBots = useCallback(async (force = false) => {
    if (!isOnline) return;
    if (!force && !shouldReload('bots')) {
      console.log('📦 Bots already loaded (using cache)');
      return;
    }
    try {
      console.log('🔄 Loading bots...');
      const response = await api.get<any[]>('/bots');
      if (response.success) {
        setBots(response.data || []);
        markAsLoaded('bots');
        console.log('✅ Bots loaded');
      }
    } catch (err: any) {
      console.error('Error loading bots:', err);
    }
  }, [isOnline, shouldReload, markAsLoaded]);
  
  const loadBotLogs = useCallback(async (force = false) => {
    if (!isOnline) return;
    if (!force && !shouldReload('botLogs')) {
      console.log('📦 BotLogs already loaded (using cache)');
      return;
    }
    try {
      console.log('🔄 Loading bot logs...');
      const response = await api.get<any[]>('/bot-logs');
      if (response.success) {
        setBotLogs(response.data || []);
        markAsLoaded('botLogs');
        console.log('✅ BotLogs loaded');
      }
    } catch (err: any) {
      console.error('Error loading bot logs:', err);
    }
  }, [isOnline, shouldReload, markAsLoaded]);
  
  // --- Finance Loaders ---
  
  const loadFinancialMovements = useCallback(async (force = false) => {
    if (!isOnline) return;
    if (!force && !shouldReload('financialMovements')) {
      console.log('📦 FinancialMovements already loaded (using cache)');
      return;
    }
    try {
      console.log('🔄 Loading financial movements...');
      const response = await api.get<any[]>('/movimientos-financieros');
      if (response.success) {
        setFinancialMovements(response.data || []);
        markAsLoaded('financialMovements');
        console.log('✅ FinancialMovements loaded');
      }
    } catch (err: any) {
      console.error('Error loading financial movements:', err);
    }
  }, [isOnline, shouldReload, markAsLoaded]);
  
  const loadAdvisories = useCallback(async (force = false) => {
    if (!isOnline) return;
    if (!force && !shouldReload('advisories')) {
      console.log('📦 Advisories already loaded (using cache)');
      return;
    }
    try {
      console.log('🔄 Loading advisories...');
      const response = await api.get<any[]>('/asesorias');
      if (response.success) {
        setAdvisories(response.data || []);
        markAsLoaded('advisories');
        console.log('✅ Advisories loaded');
      }
    } catch (err: any) {
      console.error('Error loading advisories:', err);
    }
  }, [isOnline, shouldReload, markAsLoaded]);
  
  // ============================================================================
  // MUTATIONS
  // ============================================================================
  
  // --- Product Mutations ---
  
  const createProduct = useCallback(async (data: Partial<Product>): Promise<boolean> => {
    if (!canWrite()) return false;
    try {
      const response = await erpService.products.create({
        nombre: data.name || '',
        precio: data.price || 0,
        stock: data.stock || 0,
        sku: data.sku,
        costo: data.cost,
        descripcion: data.description,
        categoria: data.category,
        fabricante: data.manufacturer,
        minStock: data.minStock,
        ingredienteActivo: data.activeIngredient,
        porcentajeIA: data.iaPercent,
        iva: typeof data.ivaRate === 'number' ? (data.ivaRate >= 0 ? data.ivaRate : null) : null,
        ieps: typeof data.iepsRate === 'number' ? data.iepsRate : null,
        objetoImpuesto: data.taxObject,
        claveProdServ: data.satKey,
        claveUnidad: data.satUnitKey,
        retencionIva: !!data.retentionIva,
        retencionIsr: !!data.retentionIsr,
        isBulk: !!data.isBulk,
        unidadBase: data.bulkConfig?.baseUnit,
        unidadVenta: data.bulkConfig?.salesUnit,
        factorConversion: data.bulkConfig?.conversionFactor,
        fichaTecnicaUrl: data.techSheetUrl,
        guiaAplicacionUrl: data.applicationGuideUrl,
        imageKey: (data as any).imageKey,
      } as any);
      if (response.success) {
        await loadProducts();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error creating product:', err);
      return false;
    }
  }, [canWrite, loadProducts]);
  
  const updateProduct = useCallback(async (id: string, data: Partial<Product>): Promise<boolean> => {
    if (!canWrite()) return false;
    try {
      const response = await erpService.products.update(parseInt(id), {
        nombre: data.name,
        precio: data.price,
        stock: data.stock,
        sku: data.sku,
        costo: data.cost,
        descripcion: data.description,
        categoria: data.category,
        fabricante: data.manufacturer,
        minStock: data.minStock,
        ingredienteActivo: data.activeIngredient,
        porcentajeIA: data.iaPercent,
        iva: typeof data.ivaRate === 'number' ? (data.ivaRate >= 0 ? data.ivaRate : null) : undefined,
        ieps: typeof data.iepsRate === 'number' ? data.iepsRate : undefined,
        objetoImpuesto: data.taxObject,
        claveProdServ: data.satKey,
        claveUnidad: data.satUnitKey,
        retencionIva: data.retentionIva,
        retencionIsr: data.retentionIsr,
        isBulk: data.isBulk,
        unidadBase: data.bulkConfig?.baseUnit,
        unidadVenta: data.bulkConfig?.salesUnit,
        factorConversion: data.bulkConfig?.conversionFactor,
        fichaTecnicaUrl: data.techSheetUrl,
        guiaAplicacionUrl: data.applicationGuideUrl,
        imageKey: (data as any).imageKey,
      } as any);
      if (response.success) {
        await loadProducts();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error updating product:', err);
      return false;
    }
  }, [canWrite, loadProducts]);
  
  const deleteProduct = useCallback(async (id: string): Promise<boolean> => {
    if (!canWrite()) return false;
    try {
      const response = await erpService.products.delete(parseInt(id));
      if (response.success) {
        await loadProducts();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error deleting product:', err);
      return false;
    }
  }, [canWrite, loadProducts]);
  
  // --- Supplier Mutations ---
  
  const createSupplier = useCallback(async (data: Partial<Supplier>): Promise<boolean> => {
    if (!canWrite()) return false;
    try {
      const response = await erpService.providers.create({
        nombreEmpresa: data.companyName || '',
        nombreContacto: data.contactName || '',
        email: data.email || '',
        telefono: data.phone,
        rfc: data.rfc,
        credito: data.credit,
        habilitarCredito: data.enableCredit || false,
        saldoPendiente: data.pendingBalance,
      });
      if (response.success) {
        await loadSuppliers();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error creating supplier:', err);
      return false;
    }
  }, [canWrite, loadSuppliers]);
  
  const updateSupplier = useCallback(async (id: string, data: Partial<Supplier>): Promise<boolean> => {
    if (!canWrite()) return false;
    try {
      const response = await erpService.providers.update(parseInt(id), {
        nombreEmpresa: data.companyName,
        nombreContacto: data.contactName,
        email: data.email,
        telefono: data.phone,
        rfc: data.rfc,
        credito: data.credit,
        habilitarCredito: data.enableCredit,
        saldoPendiente: data.pendingBalance,
      });
      if (response.success) {
        await loadSuppliers();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error updating supplier:', err);
      return false;
    }
  }, [canWrite, loadSuppliers]);
  
  const deleteSupplier = useCallback(async (id: string): Promise<boolean> => {
    if (!canWrite()) return false;
    try {
      const response = await erpService.providers.delete(parseInt(id));
      if (response.success) {
        await loadSuppliers();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error deleting supplier:', err);
      return false;
    }
  }, [canWrite, loadSuppliers]);

  // --- Branch Mutations ---

  const createBranch = useCallback(async (data: Partial<Branch>): Promise<boolean> => {
    if (!canWrite()) return false;
    try {
      const response = await erpService.sucursales.create({
        nombre: data.name || '',
        codigoInterno: data.code || null,
        estatus: data.status || 'Activa',
        ubicacion: data.address || null,
        responsable: data.manager || null,
        telefono: data.phone || null,
        email: data.email || null,
        horarioAtencion: data.schedule || null,
        calleNumero: data.street || null,
        colonia: data.colony || null,
        municipio: data.city || null,
        estado: data.state || null,
        codigoPostal: data.zipCode || null,
      });
      if (response.success) {
        await loadBranches(true);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error creating branch:', err);
      return false;
    }
  }, [canWrite, loadBranches]);

  const updateBranch = useCallback(async (id: string, data: Partial<Branch>): Promise<boolean> => {
    if (!canWrite()) return false;
    try {
      const response = await erpService.sucursales.update(parseInt(id), {
        nombre: data.name,
        codigoInterno: data.code,
        estatus: data.status,
        ubicacion: data.address,
        responsable: data.manager,
        telefono: data.phone,
        email: data.email,
        horarioAtencion: data.schedule,
        calleNumero: data.street,
        colonia: data.colony,
        municipio: data.city,
        estado: data.state,
        codigoPostal: data.zipCode,
      });
      if (response.success) {
        await loadBranches(true);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error updating branch:', err);
      return false;
    }
  }, [canWrite, loadBranches]);

  const deleteBranch = useCallback(async (id: string): Promise<boolean> => {
    if (!canWrite()) return false;
    try {
      const response = await erpService.sucursales.delete(parseInt(id));
      if (response.success) {
        await loadBranches(true);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error deleting branch:', err);
      return false;
    }
  }, [canWrite, loadBranches]);
  
  // --- Client Mutations ---
  
  const createClient = useCallback(async (data: Partial<Client>): Promise<boolean> => {
    if (!canWrite()) return false;
    try {
      const response = await crmService.clientes.create({
        nombre: data.name || '',
        email: data.email,
        telefono: data.phone,
        rfc: data.rfc,
        creditLimit: data.creditLimit,
        verificado: data.identityVerified,
      });
      if (response.success) {
        await loadClients();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error creating client:', err);
      return false;
    }
  }, [canWrite, loadClients]);
  
  const updateClient = useCallback(async (id: string, data: Partial<Client>): Promise<boolean> => {
    if (!canWrite()) return false;
    try {
      const response = await crmService.clientes.update(parseInt(id), {
        nombre: data.name,
        email: data.email,
        telefono: data.phone,
        rfc: data.rfc,
        creditLimit: data.creditLimit,
        verificado: data.identityVerified,
      });
      if (response.success) {
        await loadClients();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error updating client:', err);
      return false;
    }
  }, [canWrite, loadClients]);
  
  const deleteClient = useCallback(async (id: string): Promise<boolean> => {
    if (!canWrite()) return false;
    try {
      const response = await crmService.clientes.delete(parseInt(id));
      if (response.success) {
        await loadClients();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error deleting client:', err);
      return false;
    }
  }, [canWrite, loadClients]);
  
  // ============================================================================
  // REFRESH FUNCTIONS
  // ============================================================================
  
  const refreshModule = useCallback(async (module: 'erp' | 'crm' | 'rh' | 'logistics' | 'rpa' | 'finance') => {
    setIsLoading(true);
    try {
      console.log(`🔄 Refreshing ${module} module (forced reload)...`);
      switch (module) {
        case 'erp':
          await Promise.all([loadProducts(true), loadSuppliers(true), loadBranches(true)]);
          // After base data, load dependent data
          await Promise.all([loadInventory(true), loadQuotes(true), loadPurchaseOrders(true), loadFixedAssets(true)]);
          break;
        case 'crm':
          await loadClients(true);
          await Promise.all([loadSales(true), loadPayments(true)]);
          break;
        case 'rh':
          await loadEmployees(true);
          await Promise.all([loadPayrollPeriods(true), loadPayrollIncidents(true)]);
          break;
        case 'logistics':
          await Promise.all([loadVehicles(true), loadTrips(true), loadDeliveries(true), loadPickups(true)]);
          break;
        case 'rpa':
          await Promise.all([loadBots(true), loadBotLogs(true)]);
          break;
        case 'finance':
          await Promise.all([loadFinancialMovements(true), loadAdvisories(true)]);
          break;
      }
      console.log(`✅ ${module} module refreshed`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
      setLastSync(new Date());
    }
  }, [
    loadProducts, loadSuppliers, loadBranches, loadInventory, loadQuotes,
    loadPurchaseOrders, loadFixedAssets, loadClients, loadSales, loadPayments,
    loadEmployees, loadPayrollPeriods, loadPayrollIncidents, loadVehicles,
    loadTrips, loadDeliveries, loadPickups, loadBots, loadBotLogs,
    loadFinancialMovements, loadAdvisories
  ]);
  
  const refreshAll = useCallback(async () => {
    if (!isOnline) {
      setError('Backend no disponible');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('🔄 Refreshing all data (forced reload)...');
      // Phase 1: Load base/independent data (force=true to bypass cache)
      await Promise.all([
        loadProducts(true),
        loadSuppliers(true),
        loadBranches(true),
        loadClients(true),
      ]);

      // Phase 2: Load dependent data (requires maps from phase 1)
      await Promise.all([
        loadInventory(true),
        loadQuotes(true),
        loadPurchaseOrders(true),
        loadFixedAssets(true),
        loadEmployees(true),
        loadSales(true),
        loadPayments(true),
        loadPayrollPeriods(true),
        loadVehicles(true),
        loadTrips(true),
        loadDeliveries(true),
        loadPickups(true),
        loadBots(true),
        loadBotLogs(true),
        loadFinancialMovements(true),
        loadAdvisories(true),
      ]);

      // Phase 3: Load data that depends on employees
      await loadPayrollIncidents(true);

      console.log('✅ DataContext: Todos los datos sincronizados desde backend');
    } catch (err: any) {
      setError(err.message);
      console.error('❌ DataContext: Error sincronizando datos:', err);
    } finally {
      setIsLoading(false);
      setIsInitialized(true);
      setLastSync(new Date());
    }
  }, [
    isOnline, loadProducts, loadSuppliers, loadBranches, loadClients,
    loadInventory, loadQuotes, loadPurchaseOrders, loadFixedAssets,
    loadEmployees, loadSales, loadPayments, loadPayrollPeriods,
    loadPayrollIncidents, loadVehicles, loadTrips, loadDeliveries,
    loadPickups, loadBots, loadBotLogs, loadFinancialMovements, loadAdvisories
  ]);
  
  // ============================================================================
  // INITIAL LOAD & RECONNECT HANDLER
  // ============================================================================

  // LAZY LOADING: Data is now loaded on-demand by individual views
  // Instead of loading all data at startup, each view calls its load functions
  useEffect(() => {
    if (isOnline && !initRef.current) {
      initRef.current = true;
      setIsInitialized(true);
      console.log('🎯 DataContext initialized - Lazy loading enabled');
      console.log('📦 Data will be loaded on-demand as you navigate');
    }
  }, [isOnline]);
  
  // Listen for reconnect events
  useEffect(() => {
    const handleReconnect = () => {
      console.log('🔄 DataContext: Backend reconectado, recargando datos...');
      refreshAll();
    };
    
    const handleResync = () => {
      console.log('🔄 DataContext: Resync manual solicitado');
      refreshAll();
    };
    
    window.addEventListener('backend-reconnected', handleReconnect);
    window.addEventListener('manual-resync', handleResync);
    
    return () => {
      window.removeEventListener('backend-reconnected', handleReconnect);
      window.removeEventListener('manual-resync', handleResync);
    };
  }, [refreshAll]);
  
  // ============================================================================
  // CONTEXT VALUE
  // ============================================================================
  
  const value = useMemo<DataContextType>(() => ({
    // Loading states
    isLoading,
    isInitialized,
    error,
    lastSync,
    
    // ERP Data
    products,
    suppliers,
    inventory,
    quotes,
    purchaseOrders,
    fixedAssets,
    branches,
    
    // ERP Actions
    loadProducts,
    loadSuppliers,
    loadInventory,
    loadQuotes,
    loadPurchaseOrders,
    loadFixedAssets,
    loadBranches,
    
    // ERP Mutations
    createProduct,
    updateProduct,
    deleteProduct,
    createSupplier,
    updateSupplier,
    deleteSupplier,
    createBranch,
    updateBranch,
    deleteBranch,
    
    // CRM Data
    clients,
    salesHistory,
    payments,
    
    // CRM Actions
    loadClients,
    loadSales,
    loadPayments,
    
    // CRM Mutations
    createClient,
    updateClient,
    deleteClient,
    
    // RH Data
    employees,
    payrollPeriods,
    payrollIncidents,
    
    // RH Actions
    loadEmployees,
    loadPayrollPeriods,
    loadPayrollIncidents,
    
    // Logistics Data
    vehicles,
    trips,
    deliveries,
    pickups,
    
    // Logistics Actions
    loadVehicles,
    loadTrips,
    loadDeliveries,
    loadPickups,
    
    // RPA Data
    bots,
    botLogs,
    
    // RPA Actions
    loadBots,
    loadBotLogs,
    
    // Finance Data
    financialMovements,
    advisories,
    
    // Finance Actions
    loadFinancialMovements,
    loadAdvisories,
    
    // Global Actions
    refreshAll,
    refreshModule,
  }), [
    isLoading, isInitialized, error, lastSync,
    products, suppliers, inventory, quotes, purchaseOrders, fixedAssets, branches,
    loadProducts, loadSuppliers, loadInventory, loadQuotes, loadPurchaseOrders, loadFixedAssets, loadBranches,
    createProduct, updateProduct, deleteProduct, createSupplier, updateSupplier, deleteSupplier,
    createBranch, updateBranch, deleteBranch,
    clients, salesHistory, payments, loadClients, loadSales, loadPayments,
    createClient, updateClient, deleteClient,
    employees, payrollPeriods, payrollIncidents, loadEmployees, loadPayrollPeriods, loadPayrollIncidents,
    vehicles, trips, deliveries, pickups, loadVehicles, loadTrips, loadDeliveries, loadPickups,
    bots, botLogs, loadBots, loadBotLogs,
    financialMovements, advisories, loadFinancialMovements, loadAdvisories,
    refreshAll, refreshModule,
  ]);
  
  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};

export default DataContext;
