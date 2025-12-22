// ============================================================================
// 🌾 AGRONARE — Services Index
// Exportación centralizada de todos los servicios API
// ============================================================================

// Base API Client
export { default as api, type ApiResponse } from './api';

// CRM Service
export { default as crmService } from './crmService';
export type { 
  ClienteDB, 
  OportunidadDB, 
  CreditoDB, 
  AbonoClienteDB,
  ClienteVerificacionDB 
} from './crmService';

// RH Service
export { default as rhService } from './rhService';
export type { 
  UserDB, 
  EmpleadoDB, 
  SucursalDB as RHSucursalDB,
  PeriodoNominaDB,
  IncidenciaNominaDB,
  PrestamoDB,
  SolicitudPermisoDB 
} from './rhService';

// ERP Service
export { default as erpService } from './erpService';
export type { 
  ProductDB, 
  ProviderDB, 
  SucursalDB,
  InventarioDB,
  InventarioMovimientoDB,
  QuoteDB,
  PurchaseDB,
  ActivoDB 
} from './erpService';

// Logistics Service
export { default as logisticsService } from './logisticsService';
export type { 
  VehiculoDB, 
  ViajeDB, 
  EntregaDB,
  RecoleccionDB,
  MantenimientoDB,
  MantenimientoProgramadoDB,
  VehiculoReporteDiarioDB,
  ItinerarioDB,
  ParadaDB,
  PlanRutaDB,
  VisitaDB 
} from './logisticsService';

// RPA Service
export { default as rpaService } from './rpaService';
export type { 
  BotDB, 
  BotLogDB, 
  RpaScheduleDB 
} from './rpaService';

// Finance Service
export { default as financeService } from './financeService';
export type { 
  MovimientoFinancieroDB, 
  AsesoriaDB 
} from './financeService';
