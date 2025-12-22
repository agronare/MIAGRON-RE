

import { LucideIcon } from 'lucide-react';

export interface KPI {
  id: string;
  title: string;
  value: string;
  valueLabel?: string;
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

// --- NOTIFICATION SYSTEM TYPES ---
export type NotificationType = 'info' | 'success' | 'warning' | 'error';
export type NotificationCategory = 'System' | 'ERP' | 'CRM' | 'RH' | 'Security' | 'Tasks';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  category: NotificationCategory;
  timestamp: string; // ISO String
  read: boolean;
  link?: string;
  actionLabel?: string;
  metadata?: any;
}

export interface ToastMessage {
    id: string;
    title: string;
    message: string;
    type: NotificationType;
    duration?: number;
}

export interface NotificationSettings {
    email: boolean;
    push: boolean;
    sound: boolean;
    categories: {
        [key in NotificationCategory]: boolean;
    };
}

// CRM Types
export interface FiscalAddress {
  street: string;
  exteriorNo: string;
  interiorNo?: string;
  colony: string;
  zipCode: string;
  municipality: string;
  state: string;
  country?: string;
}

export interface ClientDocument {
  id: string;
  name: string;
  type: 'PDF' | 'IMG' | 'DOC';
  uploadDate: string;
  size: string;
  category: 'Fiscal' | 'Legal' | 'Identificación' | 'Contrato';
}

export interface CRMTask {
  id: string;
  title: string;
  type: 'call' | 'meeting' | 'email' | 'todo';
  dueDate: string;
  status: 'pending' | 'completed' | 'overdue';
  priority: 'low' | 'medium' | 'high';
  assignedTo: string;
}

export interface Client {
  id: string;
  name: string; // Commercial Name
  contactName: string;
  email?: string;
  phone?: string;
  mobile?: string;
  description?: string; // Nickname/Description
  
  // Status & Classification
  status: 'Activo' | 'Inactivo';
  segment?: 'Mayorista' | 'Minorista' | 'Distribuidor' | 'Agricultor';
  
  // Agricultural Data
  isFarmer?: boolean;
  mainCrop?: string;
  cultivatedArea?: number; // hectares
  otherCrops?: string[];
  
  // Logistics
  location?: string;
  coordinates?: { lat: number, lng: number }; // Added for Map View
  mileage?: number;
  
  // Financial & Credit
  rfc: string;
  creditLimit: number;
  currentDebt: number;
  hasCredit?: boolean;
  identityVerified?: boolean;
  
  // Fiscal
  fiscalName?: string; // Razon Social
  fiscalRegime?: string;
  cfdiUse?: string;
  address?: FiscalAddress; // Structured address
  fullAddressString?: string; // Legacy or computed display address
  
  lastContact?: string;
  documents?: ClientDocument[]; // Added documents
  pendingTasks?: CRMTask[]; // Added tasks
}

export interface PipelineOpportunity {
  id: string;
  title: string;
  value: number;
  client: string;
  stage: 'prospecto' | 'calificado' | 'negociacion' | 'ganada' | 'perdida';
  probability: number;
  expectedCloseDate: string;
  assignedTo: string;
}

export interface Interaction {
  id: string;
  clientId: string;
  type: 'call' | 'meeting' | 'email' | 'note';
  date: string;
  summary: string;
  user: string;
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
  imageKey?: string; // Key to find image in IndexedDB
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
  branchCode?: string;
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
  paidAmount?: number;
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
  status: 'Aprobada' | 'Pendiente' | 'Rechazada' | 'Convertida';
  purchaseOrderId?: string;
}

export interface PurchaseOrderItem {
  id: string; // Product ID
  name: string;
  sku: string;
  quantity: number;
  cost: number;
  lote: string;
  receivedQuantity?: number;
}

export interface PurchaseOrder {
  id: string;
  orderNo: string;
  qrCodeUrl: string;
  supplierId: string;
  supplierName: string;
  date: string; // ISO String
  campaign?: string; // Also Reception ID
  items: PurchaseOrderItem[];
  subtotal: number;
  iva: number;
  total: number;
  status: 'Pendiente' | 'Completado' | 'Cancelado';
  logisticsStatus: 'N/A' | 'Solicitada' | 'En camino' | 'Entregado';
  destinationBranch: string;
  destinationBranchCode?: string;
  paymentMethod: 'Efectivo' | 'Transferencia' | 'Crédito';
  notes?: string;
  quoteId?: string; // Optional link to the source quote
  paidAmount?: number;
}

export interface FixedAsset {
  id: string;
  name: string;
  assetId: string;
  category: 'Maquinaria' | 'Vehículo' | 'Equipo de Cómputo' | 'Mobiliario' | 'Edificios';
  description?: string;
  status: 'Activo' | 'En Mantenimiento' | 'Dado de Baja';
  acquisitionCost: number;
  acquisitionDate: string; // ISO string
  usefulLife: number; // in years
  branch: string;
  depreciationMethod: 'Lineal' | 'Saldo Decreciente';
  salvageValue: number;
}

export interface PaymentApplication {
  documentId: string; // ID of the Sale or PurchaseOrder
  amountApplied: number;
}
export interface PaymentRecord {
  id: string;
  date: string; // ISO string
  type: 'receivable' | 'payable'; // receivable from client, payable to supplier
  entityId: string; // Client or Supplier ID
  entityName: string;
  amount: number;
  method: 'Efectivo' | 'Transferencia' | 'Cheque' | 'Otro';
  reference?: string;
  notes?: string;
  applications: PaymentApplication[];
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
export interface EmployeeHistory {
  id: string;
  date: string;
  type: 'Contratación' | 'Promoción' | 'Aumento' | 'Falta' | 'Documento';
  description: string;
  user: string;
}

export interface Employee {
  id: string;
  // Personal
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  avatar?: string;
  coverImage?: string;
  birthDate?: string;
  rfc?: string;
  curp?: string;
  nss?: string;
  address?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  
  // Laboral
  role: string;
  department: string;
  branch: string;
  status: 'Activo' | 'Inactivo' | 'Vacaciones' | 'Suspendido' | 'Baja';
  joinDate: string;
  contractType: 'Indeterminado' | 'Determinado' | 'Honorarios' | 'Prueba';
  salary: number;
  paymentFrequency: 'Semanal' | 'Quincenal' | 'Mensual';
  
  // Data
  documents: ClientDocument[];
  history: EmployeeHistory[];
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
  
  // Address breakdown
  street: string;
  colony: string;
  city: string;
  state: string;
  zipCode: string;
  
  address?: string; // Legacy/Display formatted
}

// Payroll Types
export interface PayrollPeriod {
  id: string;
  name: string;
  frequency: 'Semanal' | 'Quincenal' | 'Mensual';
  startDate: string;
  endDate: string;
  paymentDate: string;
  status: 'Borrador' | 'Calculado' | 'Timbrado' | 'Pagado';
  totalAmount: number;
  employeesCount: number;
  incidentsCount: number;
}

export interface PayrollIncident {
  id: string;
  employeeId: string;
  employeeName: string;
  type: 'Falta Injustificada' | 'Retardo' | 'Incapacidad' | 'Vacaciones' | 'Horas Extra' | 'Bono';
  date: string;
  value: number; // Hours or Amount depending on type
  status: 'Pendiente' | 'Aprobado' | 'Rechazado';
}

export interface LoanRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  amount: number;
  termMonths: number;
  monthlyDeduction: number;
  reason?: string;
  status: 'Pendiente' | 'Aprobado' | 'Rechazado' | 'Pagado';
  requestDate: string;
}

// Compliance & EHS Types
export interface ComplianceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  role: string;
  contractStatus: 'Vigente' | 'Por Vencer' | 'Vencido' | 'Inexistente';
  contractExpiry?: string;
  fileStatus: 'Completo' | 'Incompleto' | 'Revisión';
  missingDocs: string[]; // List of missing docs like 'INE', 'Comprobante', etc.
  ppeStatus: 'Entregado' | 'Pendiente' | 'Renovación'; // EPP
  riskScore: number; // 0-100 AI calculated risk
  blockPayroll: boolean; // If critical docs missing
}

export interface EHSRecord {
  id: string;
  title: string; // e.g. "Encuesta NOM-035", "Recorrido Comisión"
  type: 'Normativa' | 'Seguridad' | 'Entrega EPP';
  status: 'Cumplido' | 'Pendiente' | 'Riesgo';
  complianceLevel: number; // %
  lastAudit: string;
}

// Self Service Types
export interface PayStub {
  id: string;
  period: string;
  paymentDate: string;
  grossAmount: number;
  netAmount: number;
  taxes: number;
  deductions: number;
  pdfUrl: string;
  xmlUrl: string;
}

export interface TimeOffRequest {
  id: string;
  employeeId?: string; // Added for filtering
  type: 'Vacaciones' | 'Permiso' | 'Incapacidad' | 'Home Office';
  startDate: string;
  endDate: string;
  days: number;
  status: 'Pendiente' | 'Aprobado' | 'Rechazado';
  reason: string;
}

export interface ExpenseReport {
  id: string;
  employeeId?: string; // Added for filtering
  date: string;
  concept: string;
  amount: number;
  status: 'Pendiente' | 'Aprobado' | 'Pagado';
  receiptUrl?: string;
}

// Health & Wellness Types
export interface WellnessProgram {
  id: string;
  name: string;
  category: 'Salud Física' | 'Salud Mental' | 'Integración';
  startDate: string;
  endDate: string;
  enrolled: number;
  capacity: number;
  status: 'Activo' | 'Planeado' | 'Finalizado';
}

// Talent Management Types
export interface Evaluation {
  id: string;
  employeeId?: string;
  employeeName: string;
  type: 'Desempeño 360' | 'Objetivos' | 'Competencias' | 'Clima Laboral';
  period: string;
  score: number; // 0-100
  status: 'Pendiente' | 'En Proceso' | 'Completada';
  date: string;
  evaluator: string;
  // Detailed fields
  competencies?: any[]; // Re-define if CompetencyScore is needed
  objectives?: any[]; // Re-define if Objective is needed
  feedback?: string;
  rating?: number; // 1-5 stars
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
  type?: 'Scheduled' | 'Webhook' | 'Manual';
  actions?: string[];
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

export type LogisticsTaskType = 'Entrega' | 'Recolección' | 'Visita Comercial' | 'Asesoría Técnica';

export interface LogisticsTask {
  id: string;
  type: LogisticsTaskType;
  title: string; // e.g., Client Name or Supplier
  address: string;
  coordinates: { lat: number; lng: number };
  status: 'Pendiente' | 'En Ruta' | 'Completada' | 'Cancelada';
  scheduledDate: string; // ISO Date
  assignedTo?: string; // Driver/Technician Name
  vehicleId?: string;
  
  // Specific Details
  relatedId?: string; // ID of Sale, PurchaseOrder, or Client
  items?: string; // Summary of items
  notes?: string;
  
  // Field Evidence
  checkInTime?: string;
  checkOutTime?: string;
  proofOfDelivery?: string; // URL to signature/photo
  diagnosticReport?: string; // For advisory
}

export interface Vehicle {
  id: string;
  name: string; // e.g. Nissan NP300
  plate: string;
  type: 'Camión' | 'Camioneta' | 'Automóvil' | 'Motocicleta';
  status: 'Disponible' | 'En Ruta' | 'Mantenimiento';
  capacity: string; // e.g., 3.5 Ton
  fuelLevel: number; // %
  driverId?: string;
}

export interface Driver {
  id: string;
  name: string;
  license: string;
  status: 'Disponible' | 'En Ruta' | 'Descanso';
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
}

// Reports Types
export interface SavedReport {
  id: number;
  name: string;
  category: string;
  lastRun: string;
  format: string;
  frequency: string;
}

export interface ReportTemplate {
  id: string;
  name: string;
  category: string;
  icon: LucideIcon;
  color: string;
}

export interface ScheduledJob {
  id: number;
  report: string;
  recipients: string;
  schedule: string;
  status: string;
}

// Audit Types
export interface AuditItem extends InventoryItem {
  physicalCount: number | '';
  variance: number;
  varianceValue: number;
  notes?: string;
}

// Communication Types
export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  avatar?: string;
  text: string;
  timestamp: string; // ISO
  channelId: string; // or userId for DM
  type: 'text' | 'file' | 'system';
  fileName?: string;
  fileSize?: string;
}

export interface ChatChannel {
  id: string;
  name: string;
  type: 'public' | 'private' | 'branch' | 'alert';
  members?: string[];
}