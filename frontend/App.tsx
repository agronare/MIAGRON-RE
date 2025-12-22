// ============================================================================
// 🌾 AGRONARE — Main Application (API-First Architecture)
// Datos de negocio provienen de DataContext (Prisma DB)
// localStorage solo para preferencias de UI
// ============================================================================

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { LoginView } from './components/LoginView';

// Lazy-loaded views for better code splitting
// Core modules - loaded on demand
const CRMView = React.lazy(() => import('./components/CRMView').then(m => ({ default: m.CRMView })));
const ERPView = React.lazy(() => import('./components/erp/ERPView').then(m => ({ default: m.ERPView })));
const RHView = React.lazy(() => import('./components/rh/RHView').then(m => ({ default: m.RHView })));
const LogisticsView = React.lazy(() => import('./components/LogisticsView').then(m => ({ default: m.LogisticsView })));

// Secondary modules
const RPAView = React.lazy(() => import('./components/RPAView').then(m => ({ default: m.RPAView })));
const FinanceView = React.lazy(() => import('./components/FinanceView').then(m => ({ default: m.FinanceView })));
const BudgetsView = React.lazy(() => import('./components/BudgetsView').then(m => ({ default: m.BudgetsView })));
const ProjectsView = React.lazy(() => import('./components/ProjectsView').then(m => ({ default: m.ProjectsView })));
const PhysicalCountView = React.lazy(() => import('./components/PhysicalCountView').then(m => ({ default: m.PhysicalCountView })));

// Utility modules
const CommunicationView = React.lazy(() => import('./components/CommunicationView').then(m => ({ default: m.CommunicationView })));
const ReportsView = React.lazy(() => import('./components/ReportsView').then(m => ({ default: m.ReportsView })));
const MaintenanceView = React.lazy(() => import('./components/MaintenanceView').then(m => ({ default: m.MaintenanceView })));
const LIMSView = React.lazy(() => import('./components/LIMSView').then(m => ({ default: m.LIMSView })));
const ExportView = React.lazy(() => import('./components/ExportView').then(m => ({ default: m.ExportView })));
const SettingsView = React.lazy(() => import('./components/SettingsView').then(m => ({ default: m.SettingsView })));

// Special modules
const BlockchainView = React.lazy(() => import('./components/BlockchainView').then(m => ({ default: m.BlockchainView })));
const SchemaView = React.lazy(() => import('./components/SchemaView').then(m => ({ default: m.SchemaView })));

// ChatBot - always loaded for user assistance
const ChatBot = React.lazy(() => import('./components/ChatBot').then(m => ({ default: m.ChatBot })));

// Types from types.ts (legacy compatibility)
import { LoanRequest, TimeOffRequest, ComplianceRecord, ChatMessage, Task, Project } from './types';

// Context providers
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider, useNotification } from './context/NotificationContext';
import { ConnectionProvider } from './providers/ConnectionProvider';
import { DataProvider, useData } from './context/DataContext';

// Hooks - useLocalStorage ONLY for UI preferences
import { useLocalStorage } from './hooks/useLocalStorage';

// Constants - only for RBAC defaults (not business data)
import { DEFAULT_ROLE_ACCESS } from './constants';

// UI Components
import { Toast } from './components/ui/Toast';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { SystemMonitor } from './components/SystemMonitor';

// Constant for stable empty array reference
const EMPTY_ARRAY: string[] = [];

// Componente de acceso denegado
const UnauthorizedView = () => (
  <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] text-center">
      <div className="bg-slate-100 dark:bg-slate-800 p-6 rounded-full mb-4">
          <svg className="w-12 h-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
      </div>
      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Acceso Restringido</h3>
      <p className="text-slate-500 dark:text-slate-400 max-w-md">
          No tienes permisos para visualizar este módulo. Contacta al administrador si crees que esto es un error.
      </p>
  </div>
);

// Toast Container Component
const ToastContainer = () => {
    const { toasts, removeToast } = useNotification();
    return (
        <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
            {toasts.map(toast => (
                <Toast 
                    key={toast.id} 
                    {...toast} 
                    onClose={removeToast} 
                />
            ))}
        </div>
    );
};

// Inner App component to access Context hooks
const InnerApp: React.FC = () => {
  // ─────────────────────────────────────────────────────────────────────────
  // AUTH STATE (session-based, not in DataContext)
  // ─────────────────────────────────────────────────────────────────────────
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  // ─────────────────────────────────────────────────────────────────────────
  // UI PREFERENCES (localStorage is OK for these)
  // ─────────────────────────────────────────────────────────────────────────
  const [currentView, setCurrentView] = useLocalStorage<string>('agronare_current_view', 'dashboard');
  const { addNotification, settings, updateSettings } = useNotification();
  
  // ─────────────────────────────────────────────────────────────────────────
  // BUSINESS DATA FROM API (via DataContext)
  // ─────────────────────────────────────────────────────────────────────────
  const {
    // Loading state
    isLoading: dataLoading,
    isInitialized,
    error: dataError,
    
    // ERP Data
    products,
    suppliers,
    inventory,
    quotes,
    purchaseOrders,
    fixedAssets,
    branches,
    
    // CRM Data
    clients,
    salesHistory,
    payments,
    
    // RH Data
    employees,
    payrollPeriods,
    payrollIncidents,
    
    // Logistics Data
    vehicles,
    trips,
    deliveries,
    pickups,
    
    // RPA Data
    bots,
    botLogs,
    
    // Finance Data
    financialMovements,
    advisories,
    
    // Actions
    refreshAll,
    refreshModule,
  } = useData();
  
  // ─────────────────────────────────────────────────────────────────────────
  // LOCAL STATE FOR NON-MIGRATED FEATURES (temporary)
  // These will be migrated in future phases
  // ─────────────────────────────────────────────────────────────────────────
  const [loans, setLoans] = useLocalStorage<LoanRequest[]>('agronare_loans', []);
  const [timeOffRequests, setTimeOffRequests] = useLocalStorage<TimeOffRequest[]>('agronare_timeoff', []);
  const [complianceRecords, setComplianceRecords] = useLocalStorage<ComplianceRecord[]>('agronare_compliance_records', []);
  const [chatMessages, setChatMessages] = useLocalStorage<ChatMessage[]>('agronare_chat_messages', []);
  const [projects, setProjects] = useLocalStorage<Project[]>('agronare_projects', []);
  const [tasks, setTasks] = useLocalStorage<Task[]>('agronare_tasks', []);

  // RBAC State (will be migrated to ConfiguracionRol table)
  const [roleAccess, setRoleAccess] = useLocalStorage<Record<string, string[]>>('agronare_role_access', DEFAULT_ROLE_ACCESS);

  // ─────────────────────────────────────────────────────────────────────────
  // DATA SYNC IS NOW HANDLED BY DataContext
  // No manual sync needed - DataContext auto-syncs on mount and reconnect
  // ─────────────────────────────────────────────────────────────────────────

  // Show notification when data is loaded
  useEffect(() => {
    if (isInitialized && !dataLoading) {
      addNotification(
        'Datos sincronizados',
        `Datos cargados desde el servidor correctamente`,
        'success',
        'System'
      );
    }
  }, [isInitialized, dataLoading]);

  // Show error notification if data loading fails
  useEffect(() => {
    if (dataError) {
      addNotification(
        'Error de sincronización',
        dataError,
        'error',
        'System'
      );
    }
  }, [dataError]);

  // Global error handlers: evitar ruido de extensiones y notificar errores reales
  useEffect(() => {
    const EXTENSION_ERROR_SNIPPET = 'A listener indicated an asynchronous response';

    const onUnhandled = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      const msg = typeof reason === 'string' ? reason : (reason?.message || JSON.stringify(reason));
      if (msg && msg.includes(EXTENSION_ERROR_SNIPPET)) {
        // Ruido típico de extensiones del navegador; ignorar para no afectar UX
        event.preventDefault?.();
        console.debug('[Ignorado] Error de extensión:', msg);
        return;
      }
      addNotification('Error no capturado', msg || 'Se produjo un error inesperado.', 'error', 'System');
    };

    const onError = (event: ErrorEvent) => {
      const msg = event.message || String(event.error || 'Error desconocido');
      if (msg.includes(EXTENSION_ERROR_SNIPPET)) {
        event.preventDefault?.();
        console.debug('[Ignorado] Error de extensión:', msg);
        return;
      }
      addNotification('Error en la aplicación', msg, 'error', 'System');
    };

    window.addEventListener('unhandledrejection', onUnhandled);
    window.addEventListener('error', onError);
    return () => {
      window.removeEventListener('unhandledrejection', onUnhandled);
      window.removeEventListener('error', onError);
    };
  }, [addNotification]);

  // Persist Login check
  useEffect(() => {
    const savedUser = localStorage.getItem('agronare_user');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      setCurrentUser(user);
      setIsAuthenticated(true);
      
      // Determine allowed views
      const userRole = user.role || 'Usuario';
      const accessMap = roleAccess || DEFAULT_ROLE_ACCESS;
      const allowed = accessMap[userRole] || accessMap['Usuario'] || [];
      
      if (Array.isArray(allowed) && !allowed.includes(currentView) && currentView !== 'dashboard') {
          setCurrentView('dashboard');
      }
    }
  }, [roleAccess, currentView, setCurrentView]);

  // --- SYNC CURRENT USER WITH EMPLOYEE RECORDS ---
  // This ensures if an admin edits the employee record (e.g. new photo), the current session updates immediately.
  useEffect(() => {
    if (currentUser && employees.length > 0) {
        // Find the record in the employees list that matches the current logged in user
        const updatedUserRecord = employees.find(e => e.id === currentUser.id);
        
        if (updatedUserRecord) {
            // Check if relevant data changed (specifically avatar or name) to avoid loops
            if (updatedUserRecord.avatar !== currentUser.avatar || 
                updatedUserRecord.firstName !== currentUser.firstName || 
                updatedUserRecord.lastName !== currentUser.lastName) {
                
                const newSessionUser = { ...currentUser, ...updatedUserRecord };
                setCurrentUser(newSessionUser);
                localStorage.setItem('agronare_user', JSON.stringify(newSessionUser));
            }
        }
    }
  }, [employees, currentUser]);

  const handleLogin = (user: any) => {
      // Always fetch fresh data from employees array if available to ensure latest photo
      const freshUserData = employees.find(e => e.email === user.email) || user;
      
      setCurrentUser(freshUserData);
      setIsAuthenticated(true);
      localStorage.setItem('agronare_user', JSON.stringify(freshUserData));
      addNotification('Bienvenido', `Hola ${freshUserData.firstName}, has iniciado sesión correctamente.`, 'success', 'System');
      setCurrentView('dashboard');
  };

  const handleLogout = () => {
      setIsAuthenticated(false);
      setCurrentUser(null);
      localStorage.removeItem('agronare_user');
      sessionStorage.removeItem('agronareWelcomeShown');
      setCurrentView('dashboard');
  };

  // --- RBAC Logic ---
  const userRole = currentUser?.role || 'Usuario';
  const safeRoleAccess = roleAccess || DEFAULT_ROLE_ACCESS;
  const rawPermissions = safeRoleAccess[userRole] || safeRoleAccess['Usuario'];
  const userPermissions = Array.isArray(rawPermissions) ? rawPermissions : EMPTY_ARRAY;
  const allowedModules = (userPermissions || []).filter(p => p && !p.includes('_'));

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER VIEW
  // All business data comes from DataContext (read-only in this component)
  // Mutations go through DataContext methods or component-level API calls
  // ─────────────────────────────────────────────────────────────────────────
  const renderView = () => {
    if (!allowedModules.includes(currentView) && currentView !== 'dashboard') {
        return <UnauthorizedView />;
    }

    // Data props (read-only from DataContext)
    // Note: Components that need to mutate data should use useData() hook internally
    // or receive mutation callbacks as props
    const dataProps = {
      // ERP
      products,
      suppliers,
      inventory,
      quotes,
      purchaseOrders,
      fixedAssets,
      branches,
      // CRM
      clients,
      salesHistory,
      payments,
      // RH
      employees,
      payrollPeriods,
      payrollIncidents,
      // Logistics
      vehicles,
      trips,
      deliveries,
      pickups,
      // RPA
      bots,
      botLogs,
      // Finance
      financialMovements,
      advisories,
      // Refresh actions
      refreshAll,
      refreshModule,
    };

    switch(currentView) {
      case 'dashboard': 
        return <Dashboard 
          salesHistory={salesHistory} 
          inventory={inventory} 
          clients={clients} 
          products={products} 
          currentUser={currentUser} 
        />;
      
      case 'crm':
        return <CRMView
          permissions={userPermissions}
        />;
      
      case 'erp':
        return <ERPView
          permissions={userPermissions}
        />;
      
      case 'rh':
        return <RHView
          permissions={userPermissions}
          currentUser={currentUser}
        />;
      
      case 'rpa': 
        return <RPAView bots={bots} botLogs={botLogs} />;
      
      case 'logistica': 
        return <LogisticsView 
          clients={clients} 
          suppliers={suppliers} 
          fixedAssets={fixedAssets} 
          employees={employees} 
          vehicles={vehicles} 
          trips={trips} 
          deliveries={deliveries} 
          pickups={pickups} 
        />;
      
      case 'financieros': 
        return <FinanceView 
          salesHistory={salesHistory} 
          purchaseOrders={purchaseOrders} 
          inventory={inventory} 
          fixedAssets={fixedAssets} 
          payrollPeriods={payrollPeriods} 
          payments={payments} 
          financialMovements={financialMovements} 
          advisories={advisories} 
        />;
      
      case 'conteo': 
        // TODO: PhysicalCountView needs refactoring for API mutations
        return <PhysicalCountView 
          inventory={inventory} 
          purchaseOrders={purchaseOrders}
          onRefresh={() => refreshModule('erp')}
        />;
      
      case 'presupuestos': 
        return <BudgetsView 
          purchaseOrders={purchaseOrders} 
          payrollPeriods={payrollPeriods} 
        />;
      
      case 'proyectos': 
        return <ProjectsView />;
      
      case 'comunicacion': 
        return <CommunicationView 
          currentUser={currentUser} 
          employees={employees} 
          branches={branches} 
          messages={chatMessages} 
          onSendMessage={(msg) => setChatMessages([...chatMessages, msg])} 
        />;
      
      case 'reportes': 
        return <ReportsView 
          inventory={inventory} 
          products={products} 
          salesHistory={salesHistory} 
          clients={clients} 
          payments={payments} 
        />;
      
      case 'mantenimiento': 
        return <MaintenanceView fixedAssets={fixedAssets} />;
      
      case 'lims': 
        return <LIMSView />;
      
      case 'blockchain': 
        return <BlockchainView />;
      
      case 'schema': 
        return <SchemaView />;
      
      case 'exportar': 
        return <ExportView />;
      
      case 'ajustes': 
        return <SettingsView 
          onLogout={handleLogout} 
          currentUser={currentUser} 
          roleAccess={roleAccess} 
          setRoleAccess={setRoleAccess} 
          notificationSettings={settings} 
          onUpdateNotificationSettings={updateSettings} 
        />;
      
      default: 
        return <Dashboard 
          salesHistory={salesHistory} 
          inventory={inventory} 
          clients={clients} 
          products={products} 
          currentUser={currentUser} 
        />;
    }
  };

  if (!isAuthenticated) {
      return <LoginView onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 transition-colors duration-300 text-slate-900 dark:text-slate-100">
      {/* Background Monitor for Smart Alerts */}
      <SystemMonitor inventory={inventory} tasks={tasks} purchaseOrders={purchaseOrders} projects={projects} />
      
      {/* Global Toast Container */}
      <ToastContainer />

      <Header 
        currentView={currentView} 
        onNavigate={setCurrentView} 
        currentUser={currentUser} 
        onLogout={handleLogout} 
        allowedViews={allowedModules}
      />
      <main className="max-w-[1400px] mx-auto w-full px-4 sm:px-6 lg:px-8">
        <ErrorBoundary>
          <React.Suspense fallback={
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-solid border-indigo-600 border-r-transparent mb-4"></div>
                <p className="text-slate-600 dark:text-slate-400 font-medium">Cargando módulo...</p>
              </div>
            </div>
          }>
            {renderView()}
          </React.Suspense>
        </ErrorBoundary>
      </main>
      <React.Suspense fallback={null}>
        <ChatBot />
      </React.Suspense>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <NotificationProvider>
        <ConnectionProvider>
          <DataProvider>
            <InnerApp />
          </DataProvider>
        </ConnectionProvider>
      </NotificationProvider>
    </ThemeProvider>
  );
};

export default App;