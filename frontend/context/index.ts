// ============================================================================
// 🌾 AGRONARE — Context Index
// Exportación centralizada de todos los contextos
// ============================================================================

// Theme Context
export { ThemeProvider, useTheme } from './ThemeContext';

// Notification Context
export { NotificationProvider, useNotification } from './NotificationContext';

// Data Context (Backend Sync - API First)
export { DataProvider, useData } from './DataContext';

// Re-export types from DataContext
export type {
  Client,
  Supplier,
  Product,
  InventoryItem,
  FixedAsset,
  Branch,
  Employee,
  Quote,
  PurchaseOrder,
  PaymentRecord,
  Sale,
  PayrollPeriod,
  PayrollIncident,
  Vehicle,
  Trip,
  Bot,
} from './DataContext';
