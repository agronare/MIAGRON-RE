
import React from 'react';
import { Code } from 'lucide-react';

const typesContent = `

import { LucideIcon } from 'lucide-react';

export interface KPI {
  id: string;
  title: string;
  value: string;
  change?: number;
  changeLabel?: string;
  icon: LucideIcon;
  iconColor: string;
  iconBg: string;
}

export interface SalesData {
  name: string;
  value: number;
}

export interface ProductData {
  name: string;
  sales: number;
}

export interface NavItem {
  label: string;
  id: string;
  active?: boolean;
}

// CRM Types
export interface Client {
  id: string;
  name: string;
  rfc: string;
  contactName: string;
  creditLimit: number;
  currentDebt: number; // Added to track current debt
  status: 'Activo' | 'Inactivo';
}

export interface PipelineOpportunity {
  id: string;
  title: string;
  value: number;
  client: string;
  stage: 'prospecto' | 'negociacion' | 'cotizacion' | 'seguimiento' | 'cerrada';
}

// ERP Types
export interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  description?: string;
  category?: string;
  unit?: string;
  cost?: number;
  minStock?: number;
  maxStock?: number;
  barcode?: string;
  imageUrl?: string; // Campo para imagen del producto
  techSheetUrl?: string;
  applicationGuideUrl?: string;
  stock: number; // Added stock for inventory management
  
  // Technical & Agronomic Data
  manufacturer?: string;
  activeIngredient?: string;
  autoCost?: boolean; // Cost Calculated automatically based on POs

  // Fiscal / SAT 4.0 Advanced
  satKey?: string;            // Clave Prod/Serv
  satUnitKey?: string;        // Clave Unidad
  taxObject?: string;         // 01, 02, 03, 04
  ivaRate?: number;           // 0.16, 0.08, 0.00
  ivaExempt?: boolean;        // Exento de IVA
  iepsRate?: number;          // Porcentaje
  iepsQuota?: number;         // Cuota fija por unidad
  iepsMode?: 'tasa' | 'cuota' | 'exento';
  retentionIva?: boolean;     // Retención 10.6667% o 4%
  retentionIsr?: boolean;     // Retención ISR 1.25% (RESICO) etc.

  // Bulk & Logistics Advanced
  isBulk?: boolean;
  bulkConfig?: {
    baseUnit: string;           // Unidad de Compra (ej. KG)
    salesUnit: string;          // Unidad de Venta (ej. SACO)
    conversionFactor: number;   // Cuantos Base caben en Sales (ej. 50)
    tolerancePercent: number;   // % Tolerancia en despacho
    allowVariableWeight: boolean; // Si se permite pesar al momento de venta
  };
}

export interface CartItem extends Product {
  quantity: number;
  discount?: number; // Percentage 0-100
  overridePrice?: number; // For manual price adjustments
}

export interface InventoryItem {
  id: string;
  productName: string;
  sku: string;
  batch: string;
  branch: string;
  quantity: number;
  unitPrice: number;
  entryDate: string;
}

export interface Sale {
  id: string;
  date: string; // Should be ISO string for reliable filtering
  client: string;
  clientId?: string;
  total: number;
  subtotal?: number;
  taxes?: number;
  discountTotal?: number;
  globalDiscount?: { type: 'percent' | 'fixed'; value: number };
  items?: number;
  products?: CartItem[]; // Added to store line items
  method: 'Efectivo' | 'Tarjeta' | 'Transferencia' | 'Crédito';
  paymentReference?: string; // Auth code, check number, etc.
  branch: string;
  status: 'Pagado' | 'Pendiente' | 'Cancelado';
  invoiceUuid?: string; // Folio Fiscal SAT
  amountReceived?: number;
  changeGiven?: number;
}

export interface Supplier {
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

export interface QuoteItem {
  id: string; // Product ID
  name: string;
  sku: string;
  quantity: number;
  cost: number;
  ivaRate?: number;
}

export interface Quote {
  id: string;
  quoteNo: string;
  supplierId: string;
  supplierName: string;
  date: string; // ISO string
  validUntil?: string; // ISO string
  campaign?: string;
  items: QuoteItem[];
  notes?: string;
  subtotal: number;
  iva: number;
  total: number;
  status: 'Aprobada' | 'Pendiente' | 'Rechazada';
}


export interface PurchaseOrder {
  id: string;
  supplier: string;
  date: string;
  total: number;
  status: 'Pendiente' | 'Completado';
  logisticsStatus: 'N/A' | 'Solicitada' | 'En camino' | 'Entregado';
}

export interface FixedAsset {
  id: string;
  name: string;
  category: string;
  description: string;
  status: string;
  acquisitionCost: number;
  acquisitionDate: string;
  usefulLife: number;
  branch: string;
  monthlyDepreciation: number;
  currentValue: number;
}

export interface PaymentRecord {
  id: string;
  date: string;
  clientOrSupplier: string;
  note: string;
  referenceId: string;
  amount: number;
}

export interface MaintenanceRecord {
  id: string;
  asset: string;
  type: string;
  date: string;
  technician: string;
  estimatedCost: number;
  status: string;
}

// RH Types
export interface Employee {
  id: string;
  name: string;
  role: string;
  status: 'Activo' | 'Inactivo' | 'Vacaciones';
  joinDate: string;
  avatar?: string;
}

export interface Branch {
  id: string;
  name: string;
  address: string;
  phone: string;
  status?: string;
}

// RPA Types
export interface Bot {
  id: string;
  name: string;
  description: string;
  status: 'Activo' | 'Inactivo' | 'Error';
  schedule: string;
  lastRun: string;
  nextRun: string;
  type: 'Scheduled' | 'Webhook' | 'Manual';
}

// Logistics Types
export interface RouteConfig {
  vehicle: string;
  startPoint: string;
  fuelDiesel: number;
  fuelGasoline: number;
}

export interface Stop {
  id: string;
  location: string;
  type: 'delivery' | 'pickup';
}

// Projects Types
export interface Project {
  id: string;
  name: string;
  manager: string;
  status: 'Planificación' | 'En Curso' | 'Pausado' | 'Completado';
  health: 'On Track' | 'At Risk' | 'Delayed';
  startDate: string;
  endDate: string;
  progress: number;
  budget: number;
  spent: number;
  description: string;
  teamSize: number;
}

export interface Task {
  id: string;
  title: string;
  assignee: string;
  status: 'todo' | 'in-progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high';
  dueDate: string;
  project: string;
  tag?: string;
}`;

// Simple syntax highlighter
const HighlightedCode = ({ code }: { code: string }) => {
    const highlighted = code
        .replace(/(export interface|export type|extends|import|from)/g, '<span class="text-pink-400">$1</span>')
        .replace(/(\w+):/g, '<span class="text-sky-300">$1</span>:')
        .replace(/(string|number|boolean|'Activo'|'Inactivo'|'Pagado'|'Pendiente'|'Cancelado'|LucideIcon|'prospecto'|'negociacion'|'cotizacion'|'seguimiento'|'cerrada'|'Efectivo'|'Tarjeta'|'Transferencia'|'Crédito'|'Aprobada'|'Pendiente'|'Rechazada'|'Completado'|'todo'|'in-progress'|'review'|'done'|'low'|'medium'|'high'|'On Track'|'At Risk'|'Delayed'|'Planificación'|'En Curso'|'Pausado'|'tasa'|'cuota'|'exento'|'Scheduled'|'Webhook'|'Manual'|'delivery'|'pickup')/g, '<span class="text-emerald-300">$1</span>')
        .replace(/(\/\/.*)/g, '<span class="text-slate-500">$1</span>');

    return (
        <pre className="bg-slate-900 text-slate-100 p-6 rounded-lg overflow-x-auto text-sm leading-relaxed font-mono border border-slate-800">
            <code dangerouslySetInnerHTML={{ __html: highlighted }} />
        </pre>
    );
};


export const SchemaView: React.FC = () => {
  return (
    <main className="min-h-[calc(100vh-64px)] bg-[#f8fafc] dark:bg-slate-950 transition-colors duration-300 px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-[1400px] mx-auto w-full">
        <div className="mb-8">
            <div className="flex items-center gap-3 mb-1">
                <Code className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Modelo de Datos (Schema)</h1>
            </div>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Esta es una vista de solo lectura de las interfaces de TypeScript que definen la estructura de datos de la aplicación.</p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-4">
            <h2 className="text-lg font-semibold text-slate-800 dark:text-white p-2">types.ts</h2>
            <HighlightedCode code={typesContent} />
        </div>
      </div>
    </main>
  );
};
