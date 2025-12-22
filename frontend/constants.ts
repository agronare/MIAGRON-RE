

import { 
  DollarSign, 
  ShoppingCart, 
  Users, 
  Activity, 
  Percent, 
  Archive,
  FileText,
  RefreshCw,
  BarChart3,
  LayoutDashboard,
  UserCircle,
  Kanban,
  Map as MapIcon,
  Building2,
  GraduationCap,
  ShieldCheck,
  UserCog
} from 'lucide-react';
import { 
  NavItem, ReportTemplate, Bot, LogisticsTask, Vehicle, Driver,
  SavedReport, ScheduledJob, InventoryItem, PurchaseOrder, Employee, Branch,
  Evaluation, PayrollPeriod, PayrollIncident,
  ComplianceRecord, WellnessProgram, PayStub, ExpenseReport, PipelineOpportunity, Product, Client, Supplier
} from './types';

export const APP_NAME = "AGRONARE";

export const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', id: 'dashboard' },
  { label: 'ERP', id: 'erp' },
  { label: 'CRM', id: 'crm' },
  { label: 'RH', id: 'rh' },
  { label: 'RPA', id: 'rpa' },
  { label: 'Logística', id: 'logistica' },
  { label: 'Estados Financieros', id: 'financieros' },
  { label: 'Conteo Físico', id: 'conteo' },
  { label: 'Presupuestos', id: 'presupuestos' },
  { label: 'Proyectos', id: 'proyectos' },
  { label: 'Comunicación', id: 'comunicacion' },
  { label: 'Reportes', id: 'reportes' },
  { label: 'Exportar', id: 'exportar' },
  { label: 'Ajustes', id: 'ajustes' },
];

// Simple mapping from NAV item id to a lucide-react icon for collapsed/compact header usage
export const NAV_ICON_MAP: Record<string, any> = {
  dashboard: LayoutDashboard,
  erp: ShoppingCart,
  crm: Kanban,
  rh: Users,
  rpa: Activity,
  logistica: MapIcon,
  financieros: DollarSign,
  conteo: Archive,
  presupuestos: Percent,
  proyectos: BarChart3,
  comunicacion: Activity,
  reportes: FileText,
  exportar: Archive,
  ajustes: UserCog
};

// --- SUB-MODULE DEFINITIONS FOR GRANULAR ACCESS ---
export const SUB_MODULES: Record<string, { id: string; label: string }[]> = {
    erp: [
        { id: 'erp_productos', label: 'Catálogo de Productos' },
        { id: 'erp_inventario', label: 'Inventario y Stock' },
        { id: 'erp_ventas', label: 'Ventas (POS)' },
        { id: 'erp_proveedores', label: 'Proveedores' },
        { id: 'erp_cotizaciones', label: 'Cotizaciones' },
        { id: 'erp_compras', label: 'Compras' },
        { id: 'erp_activos', label: 'Activos Fijos' },
        { id: 'erp_abonos', label: 'Cuentas por Cobrar/Pagar' },
        { id: 'erp_reportes', label: 'Reportes ERP' },
        { id: 'erp_mantenimiento', label: 'Mantenimiento' }
    ],
    crm: [
        { id: 'crm_dashboard', label: 'Dashboard Comercial' },
        { id: 'crm_directory', label: 'Directorio de Clientes' },
        { id: 'crm_pipeline', label: 'Embudo de Ventas' },
        { id: 'crm_map', label: 'Mapa de Clientes' }
    ],
    rh: [
        { id: 'rh_empleados', label: 'Directorio Empleados' },
        { id: 'rh_sucursales', label: 'Sucursales' },
        { id: 'rh_nomina', label: 'Nómina' },
        { id: 'rh_cumplimiento', label: 'Cumplimiento Legal' },
        { id: 'rh_autoservicio', label: 'Portal del Empleado' }
    ],
    logistica: [
        { id: 'log_operations', label: 'Torre de Control' },
        { id: 'log_schedule', label: 'Listado de Tareas' },
        { id: 'log_fleet', label: 'Flota Vehicular' }
    ]
};

// --- ROLE BASED ACCESS CONTROL (RBAC) CONFIGURATION ---
// Updated to include sub-module permissions by default
export const DEFAULT_ROLE_ACCESS: Record<string, string[]> = {
    'Gerente General': [
        // Modules
        'dashboard', 'erp', 'crm', 'rh', 'rpa', 'logistica', 
        'financieros', 'conteo', 'presupuestos', 'proyectos', 
        'comunicacion', 'reportes', 'exportar', 'ajustes',
        // ERP Sub-modules
        'erp_productos', 'erp_inventario', 'erp_ventas', 'erp_proveedores', 
        'erp_cotizaciones', 'erp_compras', 'erp_activos', 'erp_abonos', 'erp_reportes', 'erp_mantenimiento',
        // CRM Sub-modules
        'crm_dashboard', 'crm_directory', 'crm_pipeline', 'crm_map',
        // RH Sub-modules
        'rh_empleados', 'rh_sucursales', 'rh_nomina', 'rh_cumplimiento', 'rh_autoservicio',
        // Logistics
        'log_operations', 'log_schedule', 'log_fleet'
    ],
    'Gerente de RH': [
        'dashboard', 'rh', 'comunicacion', 'reportes', 'ajustes', 'proyectos',
        'rh_empleados', 'rh_sucursales', 'rh_nomina', 'rh_cumplimiento', 'rh_autoservicio'
    ],
    'Operador de Almacén': [
        'dashboard', 'erp', 'logistica', 'conteo', 'comunicacion', 'ajustes',
        'erp_productos', 'erp_inventario', 'erp_compras', 
        'log_operations', 'log_schedule'
    ],
    'Asesor Técnico de Ventas': [
        'dashboard', 'crm', 'erp', 'comunicacion', 'ajustes', 'reportes',
        'crm_dashboard', 'crm_directory', 'crm_pipeline', 'crm_map',
        'erp_productos', 'erp_ventas', 'erp_cotizaciones'
    ],
    'Usuario': [
        'dashboard', 'comunicacion', 'ajustes',
        'rh_autoservicio'
    ]
};

export const CRM_NAV_ITEMS = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'directory', label: 'Directorio', icon: UserCircle },
    { id: 'pipeline', label: 'Pipeline de Ventas', icon: Kanban },
    { id: 'map', label: 'Mapa de Clientes', icon: MapIcon }
];

export const RH_NAV_ITEMS = [
    { id: 'empleados', label: 'Empleados', icon: Users },
    { id: 'sucursales', label: 'Sucursales', icon: Building2 },
    { id: 'nomina', label: 'Nómina', icon: FileText },
    { id: 'cumplimiento', label: 'Cumplimiento', icon: ShieldCheck },
    { id: 'autoservicio', label: 'Autoservicio', icon: UserCog }
];

// Catalogs (Kept for functionality)
export const SAT_CATALOG = [
    { code: '10171600', description: 'Fertilizantes y nutrientes de plantas', iva: '0%', ieps: false, tags: ['abono', 'nutriente', 'quimico'] },
    { code: '10171603', description: 'Fertilizantes orgánicos', iva: '0%', ieps: false, tags: ['organico', 'composta'] },
    { code: '10191500', description: 'Agentes de control de plagas', iva: '16%', ieps: true, tags: ['plaguicida', 'veneno'] },
    { code: '10191509', description: 'Insecticidas', iva: '16%', ieps: true, tags: ['insecto', 'mosca'] },
    { code: '10151500', description: 'Semillas', iva: '0%', ieps: false, tags: ['semilla', 'maiz', 'trigo'] },
];

// Corrected lists for bulk sales logic.
// PURCHASE_UNITS are the base units for inventory.
export const PURCHASE_UNITS: string[] = ['KG', 'L', 'TON', 'PZA', 'M', 'M2', 'M3'];
// SALES_UNITS are the bulk containers for selling.
export const SALES_UNITS: string[] = ['SACO', 'BULTO', 'GARRAFA', 'CAJA', 'PZA'];

export const SAT_UNIT_CATALOG = [
    { code: 'H87', name: 'Pieza', description: 'Unidad de recuento que define el número de piezas (unidades).' },
    { code: 'KGM', name: 'Kilogramo', description: 'Unidad base de masa en el Sistema Internacional de Unidades.' },
    { code: 'LTR', name: 'Litro', description: 'Unidad de volumen equivalente a 1 decímetro cúbico.' },
    { code: 'XUN', name: 'Unidad', description: 'Unidad genérica.' },
    { code: 'XBX', name: 'Caja', description: 'Contenedor.' },
    { code: 'XKI', name: 'Kit', description: 'Conjunto de artículos.' },
    { code: 'Saco', name: 'Saco', description: 'Bolsa grande de material resistente.' },
    { code: 'E48', name: 'Unidad de servicio', description: 'Unidad para la cuantificación de un servicio.' },
];

export const TEMPLATES: ReportTemplate[] = [
  { id: 't1', name: 'Estado de Resultados', category: 'Finanzas', icon: FileText, color: 'bg-blue-100 text-blue-600' },
  { id: 't2', name: 'Antigüedad de Inventario', category: 'Logística', icon: RefreshCw, color: 'bg-orange-100 text-orange-600' },
  { id: 't3', name: 'Cumplimiento de Ventas', category: 'Comercial', icon: BarChart3, color: 'bg-emerald-100 text-emerald-600' },
  { id: 't4', name: 'Asistencia y Ausentismo', category: 'RH', icon: Users, color: 'bg-purple-100 text-purple-600' },
];

// === PRODUCTION READY - CLEAN DATA ===
// All mock data arrays are initialized as empty arrays.
// Only the default Admin user and one default branch are kept to allow initial system access.

export const OPPORTUNITIES_MOCK: PipelineOpportunity[] = [];

// Clientes de prueba iniciales
export const INITIAL_CLIENTS: Client[] = [
  {
    id: 'client-1',
    name: 'Agronomo Juan Pérez',
    contactName: 'Juan Pérez',
    email: 'juan.perez@agro.com',
    phone: '443-123-4567',
    mobile: '443-987-6543',
    status: 'Activo',
    segment: 'Agricultor',
    isFarmer: true,
    mainCrop: 'Maíz',
    cultivatedArea: 50,
    rfc: 'PEPJ800101ABC',
    creditLimit: 50000,
    currentDebt: 0,
    hasCredit: true,
    location: 'Copándaro de Galeana, Mich.',
  },
  {
    id: 'client-2',
    name: 'Distribuidora Agrícola del Bajío',
    contactName: 'María García',
    email: 'ventas@distbajio.com',
    phone: '443-555-1234',
    mobile: '443-555-5678',
    status: 'Activo',
    segment: 'Distribuidor',
    isFarmer: false,
    rfc: 'DAB150320XYZ',
    creditLimit: 150000,
    currentDebt: 25000,
    hasCredit: true,
    location: 'Morelia, Mich.',
  },
  {
    id: 'client-3',
    name: 'Rancho Los Girasoles',
    contactName: 'Roberto Hernández',
    email: 'rancho.girasoles@gmail.com',
    phone: '443-222-3333',
    status: 'Activo',
    segment: 'Agricultor',
    isFarmer: true,
    mainCrop: 'Aguacate',
    cultivatedArea: 120,
    rfc: 'HERR750515DEF',
    creditLimit: 100000,
    currentDebt: 15000,
    hasCredit: true,
    location: 'Uruapan, Mich.',
  },
  {
    id: 'client-4',
    name: 'Agroservicios del Centro',
    contactName: 'Carlos López',
    email: 'agroservicios@centro.mx',
    phone: '443-777-8888',
    status: 'Activo',
    segment: 'Mayorista',
    isFarmer: false,
    rfc: 'ASC200101GHI',
    creditLimit: 200000,
    currentDebt: 0,
    hasCredit: true,
    location: 'Pátzcuaro, Mich.',
  },
];

export const INITIAL_SUPPLIERS: Supplier[] = [
  {
    id: 'sup-1',
    companyName: 'AGROQUIMICOS LA PLANTA',
    contactName: 'Contacto La Planta',
    phone: '443-100-0001',
    hasCredit: true,
    creditLimit: 100000,
  },
  {
    id: 'sup-2',
    companyName: 'ING. JAIME URIEL LOPEZ',
    contactName: 'Jaime Uriel López',
    phone: '443-100-0002',
    hasCredit: false,
  },
  {
    id: 'sup-3',
    companyName: 'TEPEYAC',
    contactName: 'Contacto Tepeyac',
    phone: '443-100-0003',
    hasCredit: true,
    creditLimit: 80000,
  },
  {
    id: 'sup-4',
    companyName: 'COMERCIALIZADORA MEXIMEX',
    contactName: 'Contacto Meximex',
    phone: '443-100-0004',
    hasCredit: true,
    creditLimit: 150000,
  },
  {
    id: 'sup-5',
    companyName: 'FERTILIZANTES GOMEZ',
    contactName: 'Sr. Gómez',
    phone: '443-100-0005',
    hasCredit: true,
    creditLimit: 120000,
  },
  {
    id: 'sup-6',
    companyName: 'AGROQUIMICA LA ZAMORANA',
    contactName: 'Contacto La Zamorana',
    phone: '443-100-0006',
    hasCredit: true,
    creditLimit: 90000,
  },
  {
    id: 'sup-7',
    companyName: 'FOFECHA',
    contactName: 'Contacto Fofecha',
    phone: '443-100-0007',
    hasCredit: false,
  },
  {
    id: 'sup-8',
    companyName: 'COMERCIALIZADORA DE FERTILIZANTES',
    contactName: 'Contacto CDF',
    phone: '443-100-0008',
    hasCredit: true,
    creditLimit: 200000,
  },
  {
    id: 'sup-9',
    companyName: 'EMMANUEL DIAZ BARRIGA PEDRAZA',
    contactName: 'Emmanuel Díaz Barriga',
    phone: '443-100-0009',
    hasCredit: false,
  },
  {
    id: 'sup-10',
    companyName: 'AGRO PUREPECHA',
    contactName: 'Contacto Agro Purepecha',
    phone: '443-100-0010',
    hasCredit: true,
    creditLimit: 75000,
  },
  {
    id: 'sup-11',
    companyName: 'CHEMICAL',
    contactName: 'Contacto Chemical',
    phone: '443-100-0011',
    hasCredit: true,
    creditLimit: 100000,
  },
  {
    id: 'sup-12',
    companyName: 'TODO EN RIEGO',
    contactName: 'Contacto Todo en Riego',
    phone: '443-100-0012',
    hasCredit: true,
    creditLimit: 60000,
  },
  {
    id: 'sup-13',
    companyName: 'IRCON AGRICOLA',
    contactName: 'Contacto Ircon',
    phone: '443-100-0013',
    hasCredit: true,
    creditLimit: 85000,
  },
];

export const BOTS_DATA: Bot[] = [];

export const LOGISTICS_TASKS_MOCK: LogisticsTask[] = [];

export const VEHICLES_MOCK: Vehicle[] = [];

export const DRIVERS_MOCK: Driver[] = [];

export const INVENTORY_DATA: InventoryItem[] = [];

export const PURCHASES_DATA: PurchaseOrder[] = [];

export const SAVED_REPORTS: SavedReport[] = [];

export const SCHEDULED_JOBS: ScheduledJob[] = [];

// New Product Catalog derived from user input
export const INITIAL_PRODUCTS: Product[] = [
  { id: 'p1', sku: 'agrobofilingbeno250gr', name: 'BELMAX 24X250GR.', category: 'FUNGICIDAS', activeIngredient: 'beno', manufacturer: 'Petroagro', price: 0, description: '1.00 BENOMILO PETRO1/4', stock: 100 },
  { id: 'p2', sku: 'lucvacinpesicipe1lt', name: 'CIPER QL 12X.950LT.', category: 'INSECTICIDAS', activeIngredient: 'cipe', manufacturer: 'Lucava', price: 0, description: '1.00 CIPERMETRINA LUCAVA', stock: 100 },
  { id: 'p3', sku: 'bayerbayertmcmacele1kg', name: 'BAYFOLAN SOLIDO 12X1KG.', category: 'FERTILIZANTES', activeIngredient: 'macmie', manufacturer: 'Bayer', price: 0, description: '1.00 MACRO+MICRO ELEMENTOS', stock: 100 },
  { id: 'p4', sku: 'petroagrocoadaciadhpendisant250ml', name: 'PH CONVER PLUS 24X250ML.', category: 'COADYUVANTES', activeIngredient: 'aciadhpendisant', manufacturer: 'Petroagro', price: 0, description: '1.00 ACIDIF+ADHE+PENETRANTE+DISPERS+ANTIESPUM', stock: 100 },
  { id: 'p5', sku: 'cosmocelkelfertfeamacexor1kg', name: 'KELATEX FE FORTE 20X1KG.', category: 'FERTILIZANTES', activeIngredient: 'feamacexor', manufacturer: 'Cosmocel', price: 0, description: '1.00 FE+AMINOACIDOS+EXTRACTO ORGANICO', stock: 100 },
  { id: 'p6', sku: 'sacoferfertmgs25kg', name: 'FERT. SULFATO DE MAGNESIO 25KG.', category: 'FERTILIZANTES', activeIngredient: 'mgs', manufacturer: 'Saco', price: 0, description: '1.00 MAGNESIO MgO16+13S', stock: 100 },
  { id: 'p7', sku: 'sacoferfertnpk25kg', name: 'FERT. SULFATO DE POTASIO SOP 25KG.', category: 'FERTILIZANTES', activeIngredient: 'npk', manufacturer: 'Saco', price: 0, description: '1.00 POTASIO N00+P00+K52', stock: 100 },
  { id: 'p8', sku: 'sacoferfertnpk25kg', name: 'FERT. NITRATO DE POTASIO NKS 25KG.', category: 'FERTILIZANTES', activeIngredient: 'npk', manufacturer: 'Saco', price: 0, description: '1.00 N12+P00+K44', stock: 100 },
  { id: 'p9', sku: 'petroagroherbatpara5lt', name: 'TRANSQUAT 4X5LT.', category: 'HERBICIDAS', activeIngredient: 'para', manufacturer: 'Petroagro', price: 0, description: '1.00 PARAQUAT PETRO 5LT', stock: 100 },
  { id: 'p10', sku: 'upllobi fertnitr1kg', name: 'LOBI 44 20X1KG.', category: 'FERTILIZANTES', activeIngredient: 'nitr', manufacturer: 'Upl', price: 0, description: '1.00 NITROGENO UPL', stock: 100 },
  { id: 'p11', sku: 'uplbiofertauxgibcit1lt', name: 'BIOZYME TF 12X1LT.', category: 'FERTILIZANTES', activeIngredient: 'auxgibcit', manufacturer: 'Upl', price: 0, description: '1.00 AUXINAS+GIBERELINAS+CITOQUININAS', stock: 100 },
  { id: 'p12', sku: 'uplbiofertauxgibcit225ml', name: 'BIOZYME TF 24X225ML.', category: 'FERTILIZANTES', activeIngredient: 'auxgibcit', manufacturer: 'Upl', price: 0, description: '1.00 AUXINAS+GIBERELINAS+CITOQUININAS UPL', stock: 100 },
  { id: 'p13', sku: 'sacoferfertnpk25kg', name: 'FERT. FOSFATO MONOAMONICO MAP 25KG.', category: 'FERTILIZANTES', activeIngredient: 'npk', manufacturer: 'Saco', price: 0, description: '1.00 N12+P61+K00', stock: 100 },
  { id: 'p14', sku: 'agroenzymasroofertauxcit1lt', name: 'ROOTING 12X1LT.', category: 'FERTILIZANTES', activeIngredient: 'auxcit', manufacturer: 'Agroenzymas', price: 0, description: '1.00 AUXINAS+CITOCININAS', stock: 100 },
  { id: 'p15', sku: 'sacoferfertnpk50kg', name: 'FERT. SULFATO DE AMONIO ESTANDAR 50KG.', category: 'FERTILIZANTES', activeIngredient: 'npk', manufacturer: 'Saco', price: 0, description: '1.00 N21+P00+K00+24S', stock: 100 },
  { id: 'p16', sku: 'tradecorptrafert magn1kg', name: 'TRADECORP MG 12X1KG.', category: 'FERTILIZANTES', activeIngredient: 'magn', manufacturer: 'Tradecorp', price: 0, description: '1.00 MAGNESIO', stock: 100 },
  { id: 'p17', sku: 'sacoferfertnpkme25kg', name: 'FERT. NPK 19-19-19 25KG.', category: 'FERTILIZANTES', activeIngredient: 'npkme', manufacturer: 'Saco', price: 0, description: '1.00 TRIPLE 19+ME', stock: 100 },
  { id: 'p18', sku: 'sacoferfertnpk50kg', name: 'FERT. UREA GRANULADO 50KG.', category: 'FERTILIZANTES', activeIngredient: 'npk', manufacturer: 'Saco', price: 0, description: '1.00 NITROGENO N46+P00+K00', stock: 100 },
  { id: 'p19', sku: 'petroagrobelfungbeno1kg', name: 'BELMAX 15X1KG.', category: 'FUNGICIDAS', activeIngredient: 'beno', manufacturer: 'Petroagro', price: 0, description: '1.00 BENOMILO PETRO', stock: 100 },
  { id: 'p20', sku: 'uplcupfungoxic1lt', name: 'CUPERTRON 12X1LT.', category: 'FUNGICIDAS', activeIngredient: 'oxic', manufacturer: 'Upl', price: 0, description: '1.00 OXICLORURO DE COBRE', stock: 100 },
  { id: 'p21', sku: 'versakaxfungkana1kg', name: 'KAXTOLI 16X1KG.', category: 'FUNGICIDAS', activeIngredient: 'kana', manufacturer: 'Versa', price: 0, description: '1.00 KANAMICINA', stock: 100 },
  { id: 'p22', sku: 'petroagropetfungmetclo1kg', name: 'PETROLAXIL ULTRA 15X1KG.', category: 'FUNGICIDAS', activeIngredient: 'metclo', manufacturer: 'Petroagro', price: 0, description: '1.00 METALAXYL+CLOROTALONIL', stock: 100 },
  { id: 'p23', sku: 'sifatecfunfungthio1kg', name: 'TIOMIL 12X1KG.', category: 'FUNGICIDAS', activeIngredient: 'thio', manufacturer: 'Sifatec', price: 0, description: '1.00 TIOFANAATO METILICO', stock: 100 },
  { id: 'p24', sku: 'petroagrorodfungcapt1kg', name: 'RODEO 15X1KG.', category: 'FUNGICIDAS', activeIngredient: 'capt', manufacturer: 'Petroagro', price: 0, description: '1.00 CAPTAN PETRO', stock: 100 },
  { id: 'p25', sku: 'bayerscafungpiri1lt', name: 'SCALA 12X1LT.', category: 'FUNGICIDAS', activeIngredient: 'piri', manufacturer: 'Bayer', price: 0, description: '1.00 PIRIMETANIL', stock: 100 },
  { id: 'p26', sku: 'bayerserfungbaci1lt', name: 'SERENADE 12X1LT.', category: 'FUNGICIDAS', activeIngredient: 'baci', manufacturer: 'Bayer', price: 0, description: '1.00 BACILLUS SUBTILIS', stock: 100 },
  { id: 'p27', sku: 'syngentaunifungazomet500ml', name: 'UNIFORM 12X500ML.', category: 'FUNGICIDAS', activeIngredient: 'azomet', manufacturer: 'Syngenta', price: 0, description: '1.00 AZOXISTROBIN+METALAXIL', stock: 100 },
  { id: 'p28', sku: 'adamaafaherblinu1kg', name: 'AFALONER 12X1KG.', category: 'HERBICIDAS', activeIngredient: 'linu', manufacturer: 'Adama', price: 0, description: '1.00 LINURON', stock: 100 },
  { id: 'p29', sku: 'petroagroatrherbatra1kg', name: 'ATRA-MEX 90 15X1KG.', category: 'HERBICIDAS', activeIngredient: 'atra', manufacturer: 'Petroagro', price: 0, description: '1.00 ATRAZINA', stock: 100 },
  { id: 'p30', sku: 'anajalsadesherbatrter1lt', name: 'DESYERBAL COMBI 20-20 12X1LT.', category: 'HERBICIDAS', activeIngredient: 'atrter', manufacturer: 'Anajalsa', price: 0, description: '1.00 ATRAZINA+TERBUTRINA', stock: 100 },
  { id: 'p31', sku: 'uplselherbclet500ml', name: 'SELECT ULTRA 12X500ML.', category: 'HERBICIDAS', activeIngredient: 'clet', manufacturer: 'Upl', price: 0, description: '1.00 CLETHODIM', stock: 100 },
  { id: 'p32', sku: 'petroagrosocherbpic24d1lt', name: 'SOCAVON 12X1LT.', category: 'HERBICIDAS', activeIngredient: 'pic24d', manufacturer: 'Petroagro', price: 0, description: '1.00 PICLORAM+2,4+D', stock: 100 },
  { id: 'p33', sku: 'uplbioinseabam1lt', name: 'BIOMEC 1.8% 12X1LT.', category: 'INSECTICIDAS', activeIngredient: 'abam', manufacturer: 'Upl', price: 0, description: '1.00 ABAMECTINA ARYSTA', stock: 100 },
  { id: 'p34', sku: 'uplacainsemono1lt', name: 'ACARITOUCH 12X1LT.', category: 'INSECTICIDAS', activeIngredient: 'mono', manufacturer: 'Upl', price: 0, description: '1.00 MONOLAURATO DE PROPILENGLICOL', stock: 100 },
  { id: 'p35', sku: 'caisaagrinsefosf12tb', name: 'AGRO-FUM 57 C/12 TUBOS.', category: 'INSECTICIDAS', activeIngredient: 'fosf', manufacturer: 'Caisa', price: 0, description: '1.00 FOSFURO DE ALUMINIO CAISA', stock: 100 },
  { id: 'p36', sku: 'bioibericasuztramatra5lt', name: 'SUZUKII TRAP 4X5LT.', category: 'TRAMPAS AGRICOLAS', activeIngredient: 'atra', manufacturer: 'Bioiberica', price: 0, description: '1.00 ATRAYENTE ALIMENTICIO', stock: 100 },
  { id: 'p37', sku: 'cortevaexainsespin1lt', name: 'EXALT 12X1LT.', category: 'INSECTICIDAS', activeIngredient: 'spin', manufacturer: 'Corteva', price: 0, description: '1.00 SPINETORAM', stock: 100 },
  { id: 'p38', sku: 'uplfuminsefosf12tb', name: 'FUMINO 56 TUBO 12TB.', category: 'INSECTICIDAS', activeIngredient: 'fosf', manufacturer: 'Upl', price: 0, description: '1.00 FOSFURO DE ALUMINIO', stock: 100 },
  { id: 'p39', sku: 'uplkaninseaceq1lt', name: 'KANEMITE 12X1LT.', category: 'INSECTICIDAS', activeIngredient: 'aceq', manufacturer: 'Upl', price: 0, description: '1.00 ACEQUINOCYL', stock: 100 },
  { id: 'p40', sku: 'cortevatorinsesulf150ml', name: 'TORETTO 150ML.', category: 'INSECTICIDAS', activeIngredient: 'sulf', manufacturer: 'Corteva', price: 0, description: '1.00 SULFOXAFLOR', stock: 100 },
  { id: 'p41', sku: 'basfstoinseflocgranel', name: 'STORM 10 PASTILLAS', category: 'INSECTICIDAS', activeIngredient: 'floc', manufacturer: 'Basf', price: 0, description: '1.00 FLOCOUMAFEN BASF', stock: 100 },
  { id: 'p42', sku: 'swissmexcompbocomswe mbopz', name: 'EMPAQUE BOQUILLA', category: 'COMPLEMENTOS', activeIngredient: 'swembo', manufacturer: 'Swissmex', price: 0, description: '1.00 SWISSMEX EMP. BOQ.', stock: 100 },
  { id: 'p43', sku: 'swissmexfilcompswfibopz', name: 'FILTRO BOQUILLA', category: 'COMPLEMENTOS', activeIngredient: 'swfibo', manufacturer: 'Swissmex', price: 0, description: '1.00 SWISSMEX FIL. BOQ.', stock: 100 },
  { id: 'p44', sku: 'calorosemicemicalo1lb', name: 'SEM. CALABACITA SABROSA 1LB.', category: 'SEMILLAS', activeIngredient: 'calo', manufacturer: 'Caloro', price: 0, description: '1.00 CALORO SABROSA', stock: 100 },
  { id: 'p45', sku: 'calorosemicemicalo10lb', name: 'SEM. CILANTRO PAKISTAN 10KG.', category: 'SEMILLAS', activeIngredient: 'calo', manufacturer: 'Caloro', price: 0, description: '1.00 CALORO PAKISTAN', stock: 100 },
  { id: 'p46', sku: 'minasemisemisobrsrb', name: 'SEMILLA FLORES SOB.', category: 'SEMILLAS', activeIngredient: 'sobr', manufacturer: 'Mina', price: 0, description: '1.00 SOBRES', stock: 100 },
  { id: 'p47', sku: 'syngentamarherb dicatr1lt', name: 'MARVEL 12X1LT.', category: 'HERBICIDAS', activeIngredient: 'dicatr', manufacturer: 'Syngenta', price: 0, description: '1.00 DICAMBA+ATRAZINA', stock: 100 },
  { id: 'p48', sku: 'uplraifertnpkmgsaux1kg', name: 'RAIZAL 400 15X1KG.', category: 'FERTILIZANTES', activeIngredient: 'npkmgsaux', manufacturer: 'Upl', price: 0, description: '1.00 N+P+K+Mg+S+AUXINAS', stock: 100 },
  { id: 'p49', sku: 'syngentaridfungmetclo1lt', name: 'RIDOMIL GOLD BRAVO 12X1LT.', category: 'FUNGICIDAS', activeIngredient: 'metclo', manufacturer: 'Syngenta', price: 0, description: '1.00 METALAXIL+CLOROTALONIL', stock: 100 },
  { id: 'p50', sku: 'petroagrotenfungcarb1kg', name: 'TENOCH 20X1KG.', category: 'FUNGICIDAS', activeIngredient: 'carb', manufacturer: 'Petroagro', price: 0, description: '1.00 CARBENDAZIM PETRO', stock: 100 },
  { id: 'p51', sku: 'swissmexligcompswcaprpz', name: 'LIGAS CAMARA DE PRESION', category: 'COMPLEMENTOS', activeIngredient: 'swcapr', manufacturer: 'Swissmex', price: 0, description: '1.00 SWISSMEX CAM. PRES.', stock: 100 },
  { id: 'p52', sku: 'swissmextuecompswtubopz', name: 'TUERCA PLASTICO BOQUILLA', category: 'COMPLEMENTOS', activeIngredient: 'swtubo', manufacturer: 'Swissmex', price: 0, description: '1.00 SWISSMEX TUE. BOQ.', stock: 100 },
  { id: 'p53', sku: 'kawashimaaspcompelec20lt', name: 'ASPERSORA ELECTRICA 20LT.', category: 'COMPLEMENTOS', activeIngredient: 'elec', manufacturer: 'Kawashima', price: 0, description: '1.00 ELECTRICA KAWASHIMA', stock: 100 },
  { id: 'p54', sku: 'sagalsagfertacid1lt', name: 'SAGASTIM 12X1LT.', category: 'FERTILIZANTES', activeIngredient: 'acid', manufacturer: 'Sagal', price: 0, description: '1.00 ACIDO FOLICO', stock: 100 },
  { id: 'p55', sku: 'sagalraifertnpkmgsbachufu1lt', name: 'RAIZPLANT-500 12X1LT.', category: 'FERTILIZANTES', activeIngredient: 'npkmgsbachufu', manufacturer: 'Sagal', price: 0, description: '1.00 N+P+K+Mg+S+B+AC. HUMICOS Y FULVICOS', stock: 100 },
  { id: 'p56', sku: 'agrosanidadproinseextr1lt', name: 'PROTECTIVE MIX C 12X1LT.', category: 'INSECTICIDAS', activeIngredient: 'extr', manufacturer: 'Agrosanidad', price: 0, description: '1.00 EXTRACTO DE CANELA', stock: 100 },
  { id: 'p57', sku: 'gowanimpinse sale 10lt', name: 'IMPIDE 10LT.', category: 'INSECTICIDAS', activeIngredient: 'sale', manufacturer: 'Gowan', price: 0, description: '1.00 SALES POTASICAS DE ACIDOS GRASOS', stock: 100 },
  { id: 'p58', sku: 'truperguacompneoppar', name: 'GUANTES NEGROS', category: 'COMPLEMENTOS', activeIngredient: 'neop', manufacturer: 'Truper', price: 0, description: '1.00 NEOPROPENO GRANDE', stock: 100 },
  { id: 'p59', sku: 'truperguacompnitrpar', name: 'GUANTES VERDES', category: 'COMPLEMENTOS', activeIngredient: 'nitr', manufacturer: 'Truper', price: 0, description: '1.00 NITRILO GRANDE', stock: 100 },
  { id: 'p60', sku: 'swissmexmancomp9pulpz', name: 'MANGUERA ASPERSORA', category: 'COMPLEMENTOS', activeIngredient: '9pul', manufacturer: 'Swissmex', price: 0, description: '1.00 TRES OCTAVOS 3/8', stock: 100 },
  { id: 'p61', sku: 'swissmexboqcomprojapz', name: 'BOQUILLA #4', category: 'COMPLEMENTOS', activeIngredient: 'roja', manufacturer: 'Swissmex', price: 0, description: '1.00 ROJA', stock: 100 },
  { id: 'p62', sku: 'swissmexboqcompazulpz', name: 'BOQUILLA #3', category: 'COMPLEMENTOS', activeIngredient: 'azul', manufacturer: 'Swissmex', price: 0, description: '1.00 AZUL', stock: 100 },
  { id: 'p63', sku: 'swissmexboqcompamarpz', name: 'BOQUILLA #2', category: 'COMPLEMENTOS', activeIngredient: 'amar', manufacturer: 'Swissmex', price: 0, description: '1.00 AMARILLO', stock: 100 },
  { id: 'p64', sku: 'calorosemicemicalo10kg', name: 'SEM. CILANTRO LONG STANDING 10KG.', category: 'SEMILLAS', activeIngredient: 'calo', manufacturer: 'Caloro', price: 0, description: '1.00 CALORO CILANTRO', stock: 100 },
  { id: 'p65', sku: 'basfmecinsetialam1lt', name: 'MECTAMITE 12X1LT.', category: 'INSECTICIDAS', activeIngredient: 'tialam', manufacturer: 'Basf', price: 0, description: '1.00 TIAMETOXAN+LAMBDACYHALOTRINA', stock: 100 },
  { id: 'p66', sku: 'graneluregranureakg', name: 'UREA GRANULADO KG.', category: 'GRANEL', activeIngredient: 'urea', manufacturer: 'Granel', price: 0, description: '1.00 UREA A GRANEL', stock: 100 },
  { id: 'p67', sku: 'swissmexbiecompswispz', name: 'BIELAS PARA PISTON', category: 'COMPLEMENTOS', activeIngredient: 'swis', manufacturer: 'Swissmex', price: 0, description: '1.00 SWISSMEX BIELA', stock: 100 },
  { id: 'p68', sku: 'sagalsagfertacid225ml', name: 'SAGASTIM 40X225ML.', category: 'FERTILIZANTES', activeIngredient: 'acid', manufacturer: 'Sagal', price: 0, description: '1.00 ACIDO FOLICO SAGAL', stock: 100 },
  { id: 'p69', sku: 'naturagriaridinseextr1lt', name: 'ARIDANE 10X1LT.', category: 'INSECTICIDAS', activeIngredient: 'extr', manufacturer: 'Naturagri', price: 0, description: '1.00 EXTRACHILE OLERORESINA CAPSICUM', stock: 100 },
  { id: 'p70', sku: 'greencorpakainsecanoremenca1lt', name: 'AKABROWN 12X1LT.', category: 'INSECTICIDAS', activeIngredient: 'canoremencla', manufacturer: 'Greencorp', price: 0, description: '1.00 CANELA+OREGANO+MENTA+CLAVO', stock: 100 },
  { id: 'p71', sku: 'fmcmus insezeta1lt', name: 'MUSTANG MAX EW 12X1LT.', category: 'INSECTICIDAS', activeIngredient: 'zeta', manufacturer: 'Fmc', price: 0, description: '1.00 ZETA CIPERMETRINA', stock: 100 },
  { id: 'p72', sku: 'petroagropetherbnico1lt', name: 'PETROSULFURON 12X1LT.', category: 'HERBICIDAS', activeIngredient: 'nico', manufacturer: 'Petroagro', price: 0, description: '1.00 NICOSULFURON PETRO', stock: 100 },
  { id: 'p73', sku: 'sagalenefe rtcitauxgib250ml', name: 'ENERGER 40X250ML.', category: 'FERTILIZANTES', activeIngredient: 'citauxgib', manufacturer: 'Sagal', price: 0, description: '1.00 CITOCININAS+AUXINAS+GIBERELINAS', stock: 100 },
  { id: 'p74', sku: 'swissmexempcompswemcipz', name: 'EMPAQUE CHECK PARA CILINDRO', category: 'COMPLEMENTOS', activeIngredient: 'swemci', manufacturer: 'Swissmex', price: 0, description: '1.00 SWISSMEX EMP. CIL.', stock: 100 },
  { id: 'p75', sku: 'amvacmaymejoazoclo1lt', name: 'MAYAMAGIC 12X1LT.', category: 'MEJORADORES DE SUELO', activeIngredient: 'azoclo', manufacturer: 'Amvac', price: 0, description: '1.00 AZOTOBACTER+CLOSTRIDIUM', stock: 100 },
  { id: 'p76', sku: 'sagalproinseextr1lt', name: 'PROTEK 12X1LT.', category: 'INSECTICIDAS', activeIngredient: 'extr', manufacturer: 'Sagal', price: 0, description: '1.00 EXTRACTOS VEGETALES', stock: 100 },
  { id: 'p77', sku: 'fmczirfungzira1kg', name: 'ZIRAM GRANUFLO 12X1KG.', category: 'FUNGICIDAS', activeIngredient: 'zira', manufacturer: 'Fmc', price: 0, description: '1.00 ZIRAM', stock: 100 },
  { id: 'p78', sku: 'ankartebioinseextr1lt', name: 'BIOSHAMPOO PLAGUISIN 12X1LT.', category: 'INSECTICIDAS', activeIngredient: 'extr', manufacturer: 'Ankarte', price: 0, description: '1.00 EXTRACTOS VEGETALES', stock: 100 },
  { id: 'p79', sku: 'sacoferfertnpk50kg', name: 'FERT. SULFATO DE AMONIO GRANULADO 50KG.', category: 'FERTILIZANTES', activeIngredient: 'npk', manufacturer: 'Saco', price: 0, description: '1.00 N21+P00+K00+24S', stock: 100 },
  { id: 'p80', sku: 'certisthuinsebaci500gr', name: 'THURICIDE 20X500GR.', category: 'INSECTICIDAS', activeIngredient: 'baci', manufacturer: 'Certis', price: 0, description: '1.00 BACILLUS THURINGIENSIS CERTIS', stock: 100 },
  { id: 'p81', sku: 'sacoferfertnpks25kg', name: 'FERT. NITRATO DE CALCIO 25KG.', category: 'FERTILIZANTES', activeIngredient: 'npks', manufacturer: 'Saco', price: 0, description: '1.00 N15+P00+K00+26.5S', stock: 100 },
  { id: 'p82', sku: 'granelsop fertsulfkg', name: 'SOP KG.', category: 'FERTILIZANTES', activeIngredient: 'sulf', manufacturer: 'Granel', price: 0, description: '1.00 SULFATO DE POTASIO A GRANEL', stock: 100 },
  { id: 'p83', sku: 'agrobamalinsemala20kg', name: 'MALATION 4% BACLOR 20KG.', category: 'INSECTICIDAS', activeIngredient: 'mala', manufacturer: 'Agroba', price: 0, description: '1.00 MALATHION 4% POLVO', stock: 100 },
  { id: 'p84', sku: 'fmcbeleinseflon680gr', name: 'BELEAF 680GR.', category: 'INSECTICIDAS', activeIngredient: 'flon', manufacturer: 'Fmc', price: 0, description: '1.00 FLONICAMID AMERICANO', stock: 100 },
  { id: 'p85', sku: 'riegomincomp2pulpz', name: 'MINI VALVULA MANGUERA-CINTILLA 2"', category: 'COMPLEMENTOS', activeIngredient: '2pul', manufacturer: 'Riego', price: 0, description: '1.00 2PULGADAS+5/8 PRO GRIP', stock: 100 },
  { id: 'p86', sku: 'sacoferfertns25kg', name: 'FERT. SULFONIT 25KG.', category: 'FERTILIZANTES', activeIngredient: 'ns', manufacturer: 'Saco', price: 0, description: '1.00 NITROGENO33.5%+FOSFORO1.67%', stock: 100 },
  { id: 'p87', sku: 'syngentaicoinselamb12.5gr', name: 'ICON 10PH 40X2X12.5GR.', category: 'INSECTICIDAS', activeIngredient: 'lamb', manufacturer: 'Syngenta', price: 0, description: '1.00 LAMBDACYHALOTRINA', stock: 100 },
  { id: 'p88', sku: 'sacoferfertnpkgra50kg', name: 'FERT. SULFATO DE POTASIO GRANULADO 50KG.', category: 'FERTILIZANTES', activeIngredient: 'npkgra', manufacturer: 'Saco', price: 0, description: '1.00 POTASIO N00+P00+K52 GRANULADO', stock: 100 },
  { id: 'p89', sku: 'bayeralifungfose2kg', name: 'ALIETTE 6X2KG.', category: 'FUNGICIDAS', activeIngredient: 'fose', manufacturer: 'Bayer', price: 0, description: '1.00 FOSETIL ALUMINIO', stock: 100 },
  { id: 'p90', sku: 'ultrasolfertnpk25kg', name: 'FERT. UMA VIOLETA 25KG.', category: 'FERTILIZANTES', activeIngredient: 'npk', manufacturer: 'Ultrasol', price: 0, description: '1.00 N13+P40+K13', stock: 100 },
  { id: 'p91', sku: 'ultrasolfertnpkmgmicele25kg', name: 'FERT. MULTIPROSITO TRIPLE 18 25KG.', category: 'FERTILIZANTES', activeIngredient: 'npkmgmicele', manufacturer: 'Ultrasol', price: 0, description: '1.00 N18+P18+K18+Mg+MICROELEMENTOS', stock: 100 },
  { id: 'p92', sku: 'tepeyacnutfertcas20lt', name: 'NUTRIMASTER CATS 20LT.', category: 'FERTILIZANTES', activeIngredient: 'cas', manufacturer: 'Tepeyac', price: 0, description: '1.00 CALCIO+AZUFRE', stock: 100 },
  { id: 'p93', sku: 'tepeyacnutfertks20lt', name: 'NUTRIMASTER KTS 20LT.', category: 'FERTILIZANTES', activeIngredient: 'ks', manufacturer: 'Tepeyac', price: 0, description: '1.00 POTASIO+AZUFRE', stock: 100 },
  { id: 'p94', sku: 'uplpolifertmgsbcocufemnmozn1lt', name: 'POLIQUEL MULTI 12X1LT.', category: 'FERTILIZANTES', activeIngredient: 'mgsbcocufemnmozn', manufacturer: 'Upl', price: 0, description: '1.00 MG+S+B+CO+CU+FE+MN+MO+ZN', stock: 100 },
  { id: 'p95', sku: 'uplphacoadacialcdie1lt', name: 'PHASE 1 12X1LT.', category: 'COADYUVANTES', activeIngredient: 'acialcdie', manufacturer: 'Upl', price: 0, description: '1.00 ACIDIFICANTE+ALCOHOLTRIDESIL+DIETILENGLICOL', stock: 100 },
  { id: 'p96', sku: 'uplmalinsemala1lt', name: 'MALPHOS 12X1LT.', category: 'INSECTICIDAS', activeIngredient: 'mala', manufacturer: 'Upl', price: 0, description: '1.00 MALATHION UPL', stock: 100 },
  { id: 'p97', sku: 'uplpolfertquel1lt', name: 'POLIQUEL ZINC 12X1LT.', category: 'FERTILIZANTES', activeIngredient: 'quel', manufacturer: 'Upl', price: 0, description: '1.00 QUELATO DE ZINC', stock: 100 },
  { id: 'p98', sku: 'sacoferfertnpk25kg', name: 'FERT. FOSFATO MONOPOTASICO MKP 25KG.', category: 'FERTILIZANTES', activeIngredient: 'npk', manufacturer: 'Saco', price: 0, description: '1.00 N12+P61+K00', stock: 100 },
  { id: 'p99', sku: 'agricambeiherb imaz1lt', name: 'BEIRUT 12X1LT.', category: 'HERBICIDAS', activeIngredient: 'imaz', manufacturer: 'Agricam', price: 0, description: '1.00 IMAZETAPIR', stock: 100 },
  { id: 'p100', sku: 'agricambilherboxif1lt', name: 'BILBAO 15X.950LT.', category: 'HERBICIDAS', activeIngredient: 'oxif', manufacturer: 'Agricam', price: 0, description: '1.00 OXIFLUORFEN AGRICAM', stock: 100 },
  { id: 'p101', sku: 'acadianextrfertal gmarmimaele20kg', name: 'EXTRACTO DE ALGAS MARINAS 20KG.', category: 'FERTILIZANTES', activeIngredient: 'algmarmimaele', manufacturer: 'Acadian', price: 0, description: '1.00 ALGAS MARINAS+MICRO/MACROELEMENTOS', stock: 100 },
  { id: 'p102', sku: 'kawashimaaspcompkawa20lt', name: 'ASPERSORA HIBRIDA 20LT.', category: 'COMPLEMENTOS', activeIngredient: 'kawa', manufacturer: 'Kawashima', price: 0, description: '1.00 KAWASHIMA HIBRIDA', stock: 100 },
  { id: 'p103', sku: 'certisamyfungbaci750gr', name: 'AMYLO-X WG 10X750GR.', category: 'FUNGICIDAS', activeIngredient: 'baci', manufacturer: 'Certis', price: 0, description: '1.00 BACILLUS AMYLOLIQUEFACIEN', stock: 100 },
  { id: 'p104', sku: 'bhterrakapfertalga5lt', name: 'KAPU TERRA 5LT.', category: 'FERTILIZANTES', activeIngredient: 'alga', manufacturer: 'Bhterra', price: 0, description: '1.00 ALGAS MARINAS BH TERRA', stock: 100 },
  { id: 'p105', sku: 'petroagromacfungtiof1kg', name: 'MACIZO 15X1KG.', category: 'FUNGICIDAS', activeIngredient: 'tiof', manufacturer: 'Petroagro', price: 0, description: '1.00 TIOFANATO METILICO', stock: 100 },
  { id: 'p106', sku: 'summitagromaxfertbfe mncomozn1lt', name: 'MAXWEL 12X1LT.', category: 'FERTILIZANTES', activeIngredient: 'bfemncomozn', manufacturer: 'Summitagro', price: 0, description: '1.00 B+FE+MN+CO+MO+ZN', stock: 100 },
  { id: 'p107', sku: 'naturabionemfughome5lt', name: 'NEMA-NAT 4X5LT.', category: 'INSECTICIDAS', activeIngredient: 'home', manufacturer: 'Naturabio', price: 0, description: '1.00 HOMEOPATICO', stock: 100 },
  { id: 'p108', sku: 'certisneeinseazad1lt', name: 'NEEMAZAD 1%EC 12X1LT.', category: 'INSECTICIDAS', activeIngredient: 'azad', manufacturer: 'Certis', price: 0, description: '1.00 AZADIRACTINA', stock: 100 },
  { id: 'p109', sku: 'ultraquimiap roinseajochican1lt', name: 'PROGRANIC GAMMA 12X1LT.', category: 'INSECTICIDAS', activeIngredient: 'ajochican', manufacturer: 'Ultraquimia', price: 0, description: '1.00 AJO+CHILE+CANELA', stock: 100 },
  { id: 'p110', sku: 'uplbiocoadcoad1lt', name: 'BIONEX 12X1LT.', category: 'COADYUVANTES', activeIngredient: 'coad', manufacturer: 'Upl', price: 0, description: '1.00 COADYUVANTE', stock: 100 },
  { id: 'p111', sku: 'uphitinselamb1lt', name: 'HIT 70EC 12X1LT.', category: 'INSECTICIDAS', activeIngredient: 'lamb', manufacturer: 'Upl', price: 0, description: '1.00 LAMBDACYHALOTRINA UPL', stock: 100 },
  { id: 'p112', sku: 'uplchlorinseclor1lt', name: 'CHLORBAN 480EC 12X1LT.', category: 'INSECTICIDAS', activeIngredient: 'clor', manufacturer: 'Upl', price: 0, description: '1.00 CLORPIRIFOS UPL LIQUIDO', stock: 100 },
  { id: 'p113', sku: 'certisagsfert sioko1lt', name: 'AGSIL 25 12X1LT.', category: 'FERTILIZANTES', activeIngredient: 'sioko', manufacturer: 'Certis', price: 0, description: '1.00 OXIDO DE SILICIO+POTASIO', stock: 100 },
  { id: 'p114', sku: 'riegocopcompcon2pulpz', name: 'COPLE CINTILLA-CINTILLA 2"', category: 'COMPLEMENTOS', activeIngredient: 'con2pul', manufacturer: 'Riego', price: 0, description: '1.00 CONECTOR 2PULGADAS 5/8', stock: 100 },
  { id: 'p115', sku: 'upladoinsefenp1lt', name: 'ADOBE 12X1LT.', category: 'INSECTICIDAS', activeIngredient: 'fenp', manufacturer: 'Upl', price: 0, description: '1.00 FENPYROXIMATE', stock: 100 },
  { id: 'p116', sku: 'granellibmejoacidkg', name: 'LIBREX 85% KG.', category: 'MEJORADORES DE SUELO', activeIngredient: 'acid', manufacturer: 'Granel', price: 0, description: '1.00 ACIDOS CARBOXILICOS', stock: 100 },
  { id: 'p117', sku: 'uplpolfertquel1lt', name: 'POLIQUEL CALCIO 12X1LT.', category: 'FERTILIZANTES', activeIngredient: 'quel', manufacturer: 'Upl', price: 0, description: '1.00 QUELATO DE CALCIO', stock: 100 },
  { id: 'p118', sku: 'uplnagfungtebu1lt', name: 'NAGATA 250SC 12X1LT.', category: 'FUNGICIDAS', activeIngredient: 'tebu', manufacturer: 'Upl', price: 0, description: '1.00 TEBUCONAZOL UPL', stock: 100 },
  { id: 'p119', sku: 'uplappinsebupr500ml', name: 'APPLAUD 40SC 12X500ML.', category: 'INSECTICIDAS', activeIngredient: 'bupr', manufacturer: 'Upl', price: 0, description: '1.00 BUPROFEZIN', stock: 100 },
  { id: 'p120', sku: 'agrobahorinse mala1kg', name: 'HORMIPLUS 20X1KG.', category: 'INSECTICIDAS', activeIngredient: 'mala', manufacturer: 'Agroba', price: 0, description: '1.00 MALATHION 4%', stock: 100 },
  { id: 'p121', sku: 'uplhummejosust20kg', name: 'HUMIPLEX 50G ESFERICO 20KG.', category: 'MEJORADORES DE SUELO', activeIngredient: 'sust', manufacturer: 'Upl', price: 0, description: '1.00 SUSTANCIAS HUMICAS', stock: 100 },
  { id: 'p122', sku: 'uplstyfertinoacmicitfeznmnb1lt', name: 'STYRON 12X1LT.', category: 'FERTILIZANTES', activeIngredient: 'inoacmicitfeznmnb', manufacturer: 'Upl', price: 0, description: '1.00 INOSITOL+AMINOAC+CITOCININAS+FE+ZN+MN+B', stock: 100 },
  { id: 'p123', sku: 'syngentahavinse brod5kg', name: 'HAVOC BLOQUES 5KG.', category: 'INSECTICIDAS', activeIngredient: 'brod', manufacturer: 'Syngenta', price: 0, description: '1.00 BRODIFACOUM', stock: 100 },
  { id: 'p124', sku: 'verurpreinseperm20kg', name: 'PRESTO 5G 20KG.', category: 'INSECTICIDAS', activeIngredient: 'perm', manufacturer: 'Verur', price: 0, description: '1.00 PERMETRINA URBANO', stock: 100 },
  { id: 'p125', sku: 'detodoc-rinse brom25kg', name: 'C-REAL B 25KG.', category: 'INSECTICIDAS', activeIngredient: 'brom', manufacturer: 'Detodo', price: 0, description: '1.00 BROMADIOLONA', stock: 100 },
  { id: 'p126', sku: 'swissmexboqcompazulpz', name: 'BOQUILLA TK #3', category: 'COMPLEMENTOS', activeIngredient: 'azul', manufacturer: 'Swissmex', price: 0, description: '1.00 AZUL TK', stock: 100 },
  { id: 'p127', sku: 'swissmexboqcompcafepz', name: 'BOQUILLA TK #5', category: 'COMPLEMENTOS', activeIngredient: 'cafe', manufacturer: 'Swissmex', price: 0, description: '1.00 CAFE TK', stock: 100 },
  { id: 'p128', sku: 'visaosaca fertcalc1lt', name: 'CA SUPREME 12X1LT.', category: 'FERTILIZANTES', activeIngredient: 'calc', manufacturer: 'Visaosa', price: 0, description: '1.00 CALCIO SUPREME', stock: 100 },
  { id: 'p129', sku: 'uplevinsetiohid500gr', name: 'EVISECT-S 500GR.', category: 'INSECTICIDAS', activeIngredient: 'tiohid', manufacturer: 'Upl', price: 0, description: '1.00 TIOCYCLAM+HIDROGENOXALATO', stock: 100 },
  { id: 'p130', sku: 'uplperinseperm1lt', name: 'PERKILL 34% 12X1LT.', category: 'INSECTICIDAS', activeIngredient: 'perm', manufacturer: 'Upl', price: 0, description: '1.00 PERMETRINA 34% UPL', stock: 100 },
  { id: 'p131', sku: 'uplpolfertquel1lt', name: 'POLIQUEL BORO 12X1LT.', category: 'FERTILIZANTES', activeIngredient: 'quel', manufacturer: 'Upl', price: 0, description: '1.00 QUELATO DE BORO', stock: 100 },
  { id: 'p132', sku: 'uplbiofer tacgibextveg cafemgmnzn600gr', name: 'BIOFRUT XL 12X600GR.', category: 'FERTILIZANTES', activeIngredient: 'acgibextvegcafemgmnzn', manufacturer: 'Upl', price: 0, description: '1.00 AC.GIB.+EXTRAC.VEG.+Ca+Fe+Mg+Mn+Zn', stock: 100 },
  { id: 'p133', sku: 'rainbowtitfung tiab500gr', name: 'TITLEKEY 24X500GR.', category: 'FUNGICIDAS', activeIngredient: 'tiab', manufacturer: 'Rainbow', price: 0, description: '1.00 TIABENDAZOL RAINBOW', stock: 100 },
  { id: 'p134', sku: 'uplk-tmejo comp1lt', name: 'K-TIONIC 12X1LT.', category: 'MEJORADORES DE SUELO', activeIngredient: 'comp', manufacturer: 'Upl', price: 0, description: '1.00 COMPLEJO ORGANICO FULVICO', stock: 100 },
  { id: 'p135', sku: 'uplpolfertquel1lt', name: 'POLIQUEL FIERRO 12X1LT.', category: 'FERTILIZANTES', activeIngredient: 'quel', manufacturer: 'Upl', price: 0, description: '1.00 QUELATO DE FIERRO', stock: 100 },
  { id: 'p136', sku: 'fertifourcoadadhe1lt', name: 'ADHERE COVER 12X1LT.', category: 'COADYUVANTES', activeIngredient: 'adhe', manufacturer: 'Fertifour', price: 0, description: '1.00 ADHERENTE FERTIFOUR', stock: 100 },
  { id: 'p137', sku: 'dragonlafherbgli1lt', name: 'LAFAM 15X.970LT.', category: 'HERBICIDAS', activeIngredient: 'glif', manufacturer: 'Dragon', price: 0, description: '1.00 GLIFOSATO DRAGON', stock: 100 },
  { id: 'p138', sku: 'tridentediaherbpara1lt', name: 'DIABLOXONE 15X.900LT.', category: 'HERBICIDAS', activeIngredient: 'para', manufacturer: 'Tridente', price: 0, description: '1.00 PARAQUAT TRIDENTE', stock: 100 },
  { id: 'p139', sku: 'indiapackominseimid1lt', name: 'KOMPRESSOR 12X1LT.', category: 'INSECTICIDAS', activeIngredient: 'imid', manufacturer: 'Indiapac', price: 0, description: '1.00 IMIDACLOPRID INDIAPAC', stock: 100 },
  { id: 'p140', sku: 'petroagropetinselamb250ml', name: 'PETROLAMBDA 50 24X250ML.', category: 'INSECTICIDAS', activeIngredient: 'lamb', manufacturer: 'Petroagro', price: 0, description: '1.00 LAMBDACYHALOTRINA PETRO FCO.', stock: 100 },
  { id: 'p141', sku: 'petroagro dalherbnico500ml', name: 'DALILA 500ML.', category: 'HERBICIDAS', activeIngredient: 'nico', manufacturer: 'Petroagro', price: 0, description: '1.00 NICOSULFURON PETRO', stock: 100 },
  { id: 'p142', sku: 'granelsamsalstandkg', name: 'SAM ESTANDAR KG.', category: 'GRANEL', activeIngredient: 'sam', manufacturer: 'Granel', price: 0, description: '1.00 SULFATO SAL A GRANEL', stock: 100 },
  { id: 'p143', sku: 'tridentemetinsemeta1lt', name: 'METRIFOS 600 15X.950LT.', category: 'INSECTICIDAS', activeIngredient: 'meta', manufacturer: 'Tridente', price: 0, description: '1.00 METAMIDOFOS TRIDENTE', stock: 100 },
  { id: 'p144', sku: 'granelbiogranacidgr', name: 'BIOFRUT XL GR.', category: 'GRANEL', activeIngredient: 'acid', manufacturer: 'Granel', price: 0, description: '1.00 ACIDO GIBERELICO A GRANEL', stock: 100 },
  { id: 'p145', sku: 'rainbowbesinseclor50gr', name: 'BESTROLE XTRA 40X50GR.', category: 'INSECTICIDAS', activeIngredient: 'clor', manufacturer: 'Rainbow', price: 0, description: '1.00 CLORANTRANILIPROL RAIMBOW', stock: 100 },
  { id: 'p146', sku: 'dragoncominsecipe240ml', name: 'COMBAT-20 21X240ML.', category: 'INSECTICIDAS', activeIngredient: 'cipe', manufacturer: 'Dragon', price: 0, description: '1.00 CIPERMETRINA DRAGON', stock: 100 },
  { id: 'p147', sku: 'albaughkuijinsemeto100gr', name: 'KUIJK 90 SP 100X100GR.', category: 'INSECTICIDAS', activeIngredient: 'meto', manufacturer: 'Albaugh', price: 0, description: '1.00 METOMILO ROTAM', stock: 100 },
  { id: 'p148', sku: 'sacoferfertnpk25kg', name: 'FERT. FOSFONITRATO 25KG.', category: 'FERTILIZANTES', activeIngredient: 'npk', manufacturer: 'Saco', price: 0, description: '1.00 N33+P03+K00', stock: 100 },
  { id: 'p149', sku: 'innovakbalfertacgalgibet1lt', name: 'BALOX 12X1LT.', category: 'FERTILIZANTES', activeIngredient: 'acgalgibet', manufacturer: 'Innovak', price: 0, description: '1.00 ACIDO GALICO+GLICINA BETAINA', stock: 100 },
  { id: 'p150', sku: 'goldensemisemigold10kg', name: 'SEM. CILANTRO XURIM 10KG.', category: 'SEMILLAS', activeIngredient: 'gold', manufacturer: 'Golden', price: 0, description: '1.00 GOLDEN VEGETABLE SEEDS', stock: 100 },
  { id: 'p151', sku: 'agristarsemsemiagri10kg', name: 'SEM. CILANTRO ESTRELLA 10KG.', category: 'SEMILLAS', activeIngredient: 'agri', manufacturer: 'Agristar', price: 0, description: '1.00 AGRISTAR ESTRELLA', stock: 100 },
  { id: 'p152', sku: 'granelcilsemicilakg', name: 'CILANTRO ESTRELLA KG.', category: 'SEMILLAS', activeIngredient: 'cila', manufacturer: 'Granel', price: 0, description: '1.00 CILANTRO ESTRELLA A GRANEL', stock: 100 },
  { id: 'p153', sku: 'meximexforfertextr1lt', name: 'FORTETIME 12X1LT.', category: 'FERTILIZANTES', activeIngredient: 'extr', manufacturer: 'Meximex', price: 0, description: '1.00 EXTRACTO DE PESCADO', stock: 100 },
  { id: 'p154', sku: 'fmc furainsecarb1lt', name: 'FURADAN 12X1LT.', category: 'INSECTICIDAS', activeIngredient: 'carb', manufacturer: 'Fmc', price: 0, description: '1.00 CARBOFURAN', stock: 100 }
];

export const EMPLOYEES_MOCK: Employee[] = [
  {
    id: 'EMP-001',
    firstName: 'Admin',
    lastName: 'System',
    email: 'admin@agronare.com',
    phone: '',
    role: 'Gerente General',
    department: 'Dirección',
    branch: 'Oficina Central (Copandaro de Galeana)',
    status: 'Activo',
    joinDate: new Date().toISOString().split('T')[0],
    contractType: 'Indeterminado',
    salary: 0,
    paymentFrequency: 'Quincenal',
    documents: [],
    history: [],
    avatar: '',
  }
];

export const BRANCHES_MOCK: Branch[] = [
  { 
    id: 'BR-ZAM', 
    code: 'SUC-010', 
    name: 'Sucursal Zamora', 
    status: 'Activa', 
    manager: 'Raúl González', 
    phone: '4433000000', 
    email: 'suc-zamora@agronare.com', 
    schedule: 'Lunes a Sabado 7:00am a 5:00pm', 
    street: 'El Capricho', 
    colony: 'El Capricho', 
    city: 'Zamora de Hidalgo', 
    state: 'Michoacán', 
    zipCode: '59700',
    address: '59700, El Capricho, 59700 Zamora de Hidalgo, Mich.'
  },
  { 
    id: 'BR-CUA', 
    code: 'SUC-012', 
    name: 'Sucursal Cuanajo', 
    status: 'Activa', 
    manager: 'Raúl González', 
    phone: '4431554466', 
    email: 'suc-cuanajo@agronare.com', 
    schedule: 'Lunes-sabado 6:00am a 5:00pm', 
    street: 'Guadalupe Victoria 1962', 
    colony: 'Guadalupe Victoria 1962', 
    city: 'Cuanajo', 
    state: 'Michoacán', 
    zipCode: '61620',
    address: 'Guadalupe Victoria 1962, 61620 Cuanajo, Mich.'
  },
  { 
    id: 'BR-OFC', 
    code: 'OFC-CEN', 
    name: 'Oficina Central (Copandaro de Galeana)', 
    status: 'Activa', 
    manager: 'Admin System', 
    phone: '443-000-0000', 
    email: 'admin@agronare.com', 
    schedule: 'L-S 9-6', 
    street: 'Cda. de Hidalgo 305', 
    colony: 'Cuartel 4', 
    city: 'Copándaro de Galeana', 
    state: 'Michoacán', 
    zipCode: '58870',
    address: 'Cda. de Hidalgo 305, Cuartel 4, 58870 Copándaro de Galeana, Mich.'
  }
];

export const PAYROLL_PERIODS_MOCK: PayrollPeriod[] = [];

export const INCIDENTS_MOCK: PayrollIncident[] = [];

export const COMPLIANCE_DATA: ComplianceRecord[] = [];

export const PAY_STUBS_MOCK: PayStub[] = [];

export const EXPENSE_REPORTS_MOCK: ExpenseReport[] = [];

export const WELLNESS_PROGRAMS_MOCK: WellnessProgram[] = [];