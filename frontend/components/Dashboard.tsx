
import React, { useState, useMemo, useEffect } from 'react';
import { useConnection } from '../hooks/useConnection';
import { KPICard } from './KPICard';
import { SalesChart } from './SalesChart';
import { TopProductsChart } from './TopProductsChart';
import { RefreshCw, Calendar, DollarSign, ShoppingCart, Users, Activity, Percent, Wallet, Package, AlertTriangle, X, Wifi, WifiOff, Server, Database, Clock } from 'lucide-react';
import { Sale, InventoryItem, Client, Product, KPI, SalesData, ProductData, Employee } from '../types';

interface DashboardProps {
  salesHistory: Sale[];
  inventory: InventoryItem[];
  clients: Client[];
  products: Product[];
  currentUser: Employee;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
    salesHistory = [], 
    inventory = [], 
    clients = [], 
    products = [], 
    currentUser 
}) => {
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showWelcomeCard, setShowWelcomeCard] = useState(false);
  const { isOnline, isChecking, lastCheck, checkConnection } = useConnection();

  useEffect(() => {
    const welcomeShown = sessionStorage.getItem('agronareWelcomeShown');
    if (!welcomeShown) {
      setShowWelcomeCard(true);
      sessionStorage.setItem('agronareWelcomeShown', 'true');
    }
  }, []);

  // --- Real-time Calculations ---
  const kpiData: KPI[] = useMemo(() => {
    const now = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(now.getDate() - 30);

    // 1. Sales (Last 30 Days)
    const recentSales = (salesHistory || []).filter(s => new Date(s.date) >= thirtyDaysAgo);
    const totalSales30d = recentSales.reduce((sum, s) => sum + s.total, 0);
    
    // 2. Pending Orders (Sales marked as 'Pendiente')
    const pendingOrders = (salesHistory || []).filter(s => s.status === 'Pendiente').length;

    // 3. Inventory Value
    const inventoryValue = (inventory || []).reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);

    // 4. Active Clients
    const activeClients = (clients || []).filter(c => c.status === 'Activo').length;

    // 5. Gross Margin (Estimate)
    let totalRevenue = 0;
    let totalCost = 0;
    recentSales.forEach(sale => {
        totalRevenue += sale.total;
        if (sale.products) {
             sale.products.forEach(p => {
                 totalCost += (p.cost || p.price * 0.7) * p.quantity;
             });
        } else {
             totalCost += sale.total * 0.7;
        }
    });
    const margin = totalRevenue > 0 ? ((totalRevenue - totalCost) / totalRevenue) * 100 : 0;

    // 6. Total units
    const totalUnits = (inventory || []).reduce((sum, item) => sum + item.quantity, 0);

    // 7. Low stock alerts
    const lowStockBatches = (inventory || []).filter(item => item.quantity < 20).length;

    return [
      {
        id: '1',
        title: 'Ventas Totales (30d)',
        value: `$${totalSales30d.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}`,
        icon: DollarSign,
        iconColor: 'text-blue-600',
        iconBg: 'bg-blue-100'
      },
      {
        id: '2',
        title: 'Pedidos Pendientes',
        value: pendingOrders.toString(),
        icon: ShoppingCart,
        iconColor: 'text-yellow-600',
        iconBg: 'bg-yellow-100'
      },
      {
        id: '3',
        title: 'Clientes Activos',
        value: activeClients.toString(),
        icon: Users,
        iconColor: 'text-emerald-600',
        iconBg: 'bg-emerald-100'
      },
      {
        id: '5',
        title: 'Margen Bruto (Est.)',
        value: `${margin.toFixed(1)}%`,
        icon: Percent,
        iconColor: 'text-sky-600',
        iconBg: 'bg-sky-100'
      },
      {
        id: '6',
        title: 'Valor Total Inventario',
        value: `$${inventoryValue.toLocaleString(undefined, {maximumFractionDigits: 0})}`,
        icon: Wallet,
        iconColor: 'text-emerald-600',
        iconBg: 'bg-emerald-100'
      },
      {
        id: '7',
        title: 'Total Unidades',
        value: totalUnits.toLocaleString(),
        icon: Package,
        iconColor: 'text-blue-600',
        iconBg: 'bg-blue-100'
      },
      {
        id: '8',
        title: 'Alertas de Stock',
        value: lowStockBatches.toString(),
        valueLabel: 'Lotes Bajos',
        icon: AlertTriangle,
        iconColor: 'text-amber-600',
        iconBg: 'bg-amber-100'
      },
      {
        id: '4',
        title: 'Total Productos',
        value: (products || []).length.toString(),
        icon: Activity,
        iconColor: 'text-indigo-600',
        iconBg: 'bg-indigo-100'
      }
    ];
  }, [salesHistory, inventory, clients, products]);

  const salesChartData: SalesData[] = useMemo(() => {
    const data: Record<string, number> = {};
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    
    // Initialize last 6 months with 0
    const currentMonth = new Date().getMonth();
    for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(currentMonth - i);
        const mName = months[d.getMonth()];
        data[mName] = 0;
    }

    // Sum sales
    (salesHistory || []).forEach(sale => {
        const date = new Date(sale.date);
        const monthName = months[date.getMonth()];
        if (data[monthName] !== undefined) {
            data[monthName] += sale.total;
        }
    });

    return Object.entries(data).map(([name, value]) => ({ name, value }));
  }, [salesHistory]);

  const topProductsData: ProductData[] = useMemo(() => {
      const productSales: Record<string, number> = {};
      (salesHistory || []).forEach(sale => {
          if (sale.products) {
              sale.products.forEach(p => {
                   productSales[p.name] = (productSales[p.name] || 0) + (p.quantity * (p.price || 0));
              });
          }
      });
      
      return Object.entries(productSales)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([name, sales]) => ({ name, sales }));
  }, [salesHistory]);

  const handleRefresh = () => {
      setIsRefreshing(true);
      // Simulate data re-check delay for UX
      setTimeout(() => {
          setLastUpdated(new Date());
          setIsRefreshing(false);
      }, 600);
  };

  return (
    <main className="max-w-[1400px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Card */}
      {showWelcomeCard && (
        <div className="relative mb-8 overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 shadow-lg animate-fade-in">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 opacity-90"></div>

          {/* Content overlay with better readability */}
          <div className="relative p-8">
            <div className="flex items-start gap-4">
              <span className="text-5xl animate-wave origin-bottom-right inline-block floaty drop-shadow-lg" style={{animationDelay: '0.2s'}}>👋</span>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-white drop-shadow-md mb-2">
                  ¡Bienvenido de vuelta, {currentUser?.firstName}!
                </h3>
                <p className="text-base text-white/95 drop-shadow font-medium">
                  Estamos contentos de verte. Revisa tus KPIs y ¡vamos a tener un día productivo!
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowWelcomeCard(false)}
              className="absolute top-4 right-4 p-2 text-white/80 hover:text-white hover:bg-white/20 transition-all rounded-full backdrop-blur-sm"
              aria-label="Cerrar mensaje de bienvenida"
              title="Cerrar"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {/* Header Section */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="h1 text-3xl font-bold">Dashboard</h1>
          <div className="flex items-center gap-2 mt-1 text-slate-500 dark:text-slate-400 text-sm">
            <span>Resumen en tiempo real de tu negocio.</span>
            <span className="hidden sm:inline">•</span>
            <span className="badge font-mono">
              <Calendar className="w-3 h-3 mr-1" /> Actualizado: {lastUpdated.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
            </span>
          </div>
        </div>

        <div className="flex gap-3 items-center">
            <button
                type="button"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="button disabled:opacity-70"
                title="Actualizar datos"
                aria-label="Actualizar datos del dashboard"
            >
                <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin text-indigo-600' : ''}`} />
            </button>
        </div>
      </div>

      {/* Backend Status Card */}
      <div className="mb-8">
        <div className={`card transition-all duration-300 ${
          isOnline
            ? 'border-l-4 border-emerald-500 bg-gradient-to-r from-emerald-50/50 to-transparent dark:from-emerald-900/10'
            : 'border-l-4 border-red-500 bg-gradient-to-r from-red-50/50 to-transparent dark:from-red-900/10'
        }`}>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-start gap-4 flex-1 min-w-0">
              {/* Icon Section */}
              <div className={`flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center ${
                isOnline
                  ? 'bg-emerald-100 dark:bg-emerald-900/30'
                  : 'bg-red-100 dark:bg-red-900/30'
              }`}>
                {isChecking ? (
                  <RefreshCw className={`w-7 h-7 animate-spin ${
                    isOnline ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                  }`} />
                ) : isOnline ? (
                  <Wifi className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <WifiOff className="w-7 h-7 text-red-600 dark:text-red-400" />
                )}
              </div>

              {/* Status Information */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className={`font-bold text-lg ${
                    isOnline
                      ? 'text-emerald-900 dark:text-emerald-100'
                      : 'text-red-900 dark:text-red-100'
                  }`}>
                    Estado del Backend
                  </h3>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    isOnline
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300'
                      : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'
                  }`}>
                    {isChecking ? 'Verificando...' : isOnline ? 'Conectado' : 'Desconectado'}
                  </span>
                </div>

                <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                  {isOnline
                    ? 'El servidor backend está funcionando correctamente y procesando solicitudes.'
                    : 'No se puede conectar al servidor backend. Verifica que el servicio esté ejecutándose.'}
                </p>

                {/* Connection Details */}
                <div className="flex flex-wrap gap-4 text-xs">
                  <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                    <Server className="w-4 h-4" />
                    <span>Servidor: localhost:4000</span>
                  </div>
                  {lastCheck && (
                    <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                      <Clock className="w-4 h-4" />
                      <span>Última verificación: {new Date(lastCheck).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second: '2-digit'})}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                    <Database className="w-4 h-4" />
                    <span>Base de datos: {isOnline ? 'Activa' : 'No disponible'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <div className="flex-shrink-0">
              <button
                type="button"
                onClick={() => checkConnection()}
                disabled={isChecking}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 ${
                  isOnline
                    ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:hover:bg-emerald-900/50'
                    : 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-300 dark:hover:bg-red-900/50'
                }`}
                title="Verificar conexión manualmente"
                aria-label="Verificar conexión con el backend"
              >
                <RefreshCw className={`w-4 h-4 ${isChecking ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Verificar Conexión</span>
                <span className="sm:hidden">Verificar</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {kpiData.map((kpi) => (
          <KPICard key={kpi.id} data={kpi} />
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Chart Container */}
        <div className="lg:col-span-2 min-w-0 card h-[400px] overflow-hidden">
          <SalesChart data={salesChartData} />
        </div>
        
        {/* Top Products Chart Container */}
        <div className="lg:col-span-1 min-w-0 card h-[400px] overflow-hidden">
          <TopProductsChart data={topProductsData} />
        </div>
      </div>
    </main>
  );
};
