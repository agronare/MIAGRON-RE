// ============================================================================
// 🌾 AGRONARE — Hooks Index
// Exportación centralizada de todos los hooks
// ============================================================================

// CRM Hooks
export { 
  useClientes, 
  useOportunidades, 
  useCreditos, 
  useCRMStats 
} from './useCRM';

// RH Hooks
export { 
  useEmpleados, 
  useSucursales as useRHSucursales, 
  useRHStats, 
  useAuth 
} from './useRH';

// ERP Hooks
export { 
  useProducts, 
  useProviders, 
  useSucursales, 
  useInventario, 
  useActivos, 
  useERPStats 
} from './useERP';

// Logistics Hooks
export { 
  useVehiculos, 
  useViajes, 
  useEntregas, 
  useMantenimientos, 
  useLogisticsStats 
} from './useLogistics';

// Connection Hook (backend status)
export { useConnection } from './useConnection';
export type { ConnectionContextValue, ConnectionState, ConnectionStatus } from './useConnection';

// Local Storage Hook (solo para preferencias UI)
export { useLocalStorage } from './useLocalStorage';
