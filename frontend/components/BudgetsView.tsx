import React, { useMemo, useState } from 'react';
import { Wallet, CalendarRange, ShoppingCart, Users, BarChart3, Search } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { PurchaseOrder, PayrollPeriod } from '../types';

interface BudgetsProps {
  purchaseOrders: PurchaseOrder[];
  payrollPeriods: PayrollPeriod[];
}

type Tab = 'dashboard' | 'compras' | 'nomina';

const formatCurrency = (n: number) => n.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });
const monthKey = (iso: string) => {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
};
const monthLabel = (key: string) => {
  const [y,m] = key.split('-').map(Number);
  const date = new Date(y, (m||1)-1, 1);
  return date.toLocaleDateString('es-MX', { month: 'short', year: '2-digit' });
};

export const BudgetsView: React.FC<BudgetsProps> = ({ purchaseOrders = [], payrollPeriods = [] }) => {
  const [tab, setTab] = useState<Tab>('dashboard');
  const [searchPO, setSearchPO] = useState('');

  // Totales
  const totalPO = useMemo(() => purchaseOrders.reduce((a,b)=> a + (b.total||0), 0), [purchaseOrders]);
  const totalPayroll = useMemo(() => payrollPeriods.reduce((a,b)=> a + (b.totalAmount||0), 0), [payrollPeriods]);
  const poCount = purchaseOrders.length;
  const payrollCount = payrollPeriods.length;

  // Serie mensual
  const monthlyData = useMemo(() => {
    const map = new Map<string, { key: string; compras: number; nomina: number }>();
    purchaseOrders.forEach(po => {
      const k = monthKey(po.date);
      const v = map.get(k) || { key: k, compras: 0, nomina: 0 };
      v.compras += po.total || 0;
      map.set(k, v);
    });
    payrollPeriods.forEach(p => {
      const k = monthKey(p.paymentDate || p.endDate);
      const v = map.get(k) || { key: k, compras: 0, nomina: 0 };
      v.nomina += p.totalAmount || 0;
      map.set(k, v);
    });
    return Array.from(map.values()).sort((a,b) => a.key.localeCompare(b.key)).map(row => ({
      name: monthLabel(row.key),
      Compras: Math.round(row.compras),
      Nómina: Math.round(row.nomina)
    }));
  }, [purchaseOrders, payrollPeriods]);

  // PO filtradas
  const filteredPO = useMemo(() => {
    const q = searchPO.trim().toLowerCase();
    if (!q) return purchaseOrders;
    return purchaseOrders.filter(po =>
      po.orderNo.toLowerCase().includes(q) ||
      (po.supplierName || '').toLowerCase().includes(q) ||
      (po.campaign || '').toLowerCase().includes(q)
    );
  }, [purchaseOrders, searchPO]);

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#f8fafc] dark:bg-slate-950 transition-colors duration-300 p-4 sm:p-8">
      <div className="max-w-[1400px] mx-auto w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-200 dark:shadow-none">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Control Presupuestal</h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm">Monitorea compras y nómina por período y proveedor.</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex overflow-x-auto no-scrollbar gap-1 p-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl w-full md:w-fit shadow-sm">
            {[
              { id: 'dashboard', label: 'Dashboard' },
              { id: 'compras', label: 'Compras' },
              { id: 'nomina', label: 'Nómina' },
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id as Tab)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  tab === t.id ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {tab === 'dashboard' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg w-fit mb-2"><ShoppingCart className="w-5 h-5"/></div>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Compras (Total)</p>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{formatCurrency(totalPO)}</h3>
                <span className="text-xs text-slate-400">Órdenes: {poCount}</span>
              </div>
              <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <div className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg w-fit mb-2"><Users className="w-5 h-5"/></div>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Nómina (Total)</p>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{formatCurrency(totalPayroll)}</h3>
                <span className="text-xs text-slate-400">Periodos: {payrollCount}</span>
              </div>
              <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <div className="p-2 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg w-fit mb-2"><BarChart3 className="w-5 h-5"/></div>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Meses Activos</p>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{monthlyData.length}</h3>
              </div>
              <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <div className="p-2 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-lg w-fit mb-2"><CalendarRange className="w-5 h-5"/></div>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Última Actualización</p>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">{new Date().toLocaleString()}</h3>
              </div>
            </div>

            {/* Chart */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <h3 className="font-bold text-slate-900 dark:text-white mb-4">Compras vs Nómina (mensual)</h3>
              <div className="h-[320px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.3} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                    <Tooltip cursor={{fill: 'transparent'}} contentStyle={{backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: 'white'}} />
                    <Legend />
                    <Bar dataKey="Compras" fill="#6366f1" radius={[4,4,0,0]} barSize={28} />
                    <Bar dataKey="Nómina" fill="#22c55e" radius={[4,4,0,0]} barSize={28} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {tab === 'compras' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 dark:text-white">Órdenes de Compra</h3>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  className="pl-10 pr-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:border-indigo-500 w-64 bg-white dark:bg-slate-800 dark:text-white"
                  placeholder="Buscar por #, proveedor o campaña"
                  value={searchPO}
                  onChange={(e)=>setSearchPO(e.target.value)}
                />
              </div>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="text-left py-3 px-6 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase"># Orden</th>
                      <th className="text-left py-3 px-6 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Proveedor</th>
                      <th className="text-left py-3 px-6 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Fecha</th>
                      <th className="text-left py-3 px-6 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Destino</th>
                      <th className="text-right py-3 px-6 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Total</th>
                      <th className="text-center py-3 px-6 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredPO.map(po => (
                      <tr key={po.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="py-3 px-6 text-sm font-bold text-slate-900 dark:text-white">{po.orderNo}</td>
                        <td className="py-3 px-6 text-sm text-slate-700 dark:text-slate-300">{po.supplierName}</td>
                        <td className="py-3 px-6 text-sm text-slate-600 dark:text-slate-400">{new Date(po.date).toLocaleDateString()}</td>
                        <td className="py-3 px-6 text-sm text-slate-600 dark:text-slate-400">{po.destinationBranch}</td>
                        <td className="py-3 px-6 text-right text-sm font-medium text-slate-900 dark:text-white">{formatCurrency(po.total)}</td>
                        <td className="py-3 px-6 text-center">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            po.status === 'Completado' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' :
                            po.status === 'Pendiente' ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300' :
                            'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                          }`}>{po.status}</span>
                        </td>
                      </tr>
                    ))}
                    {filteredPO.length === 0 && (
                      <tr>
                        <td colSpan={6} className="text-center py-10 text-slate-500 dark:text-slate-400">Sin resultados.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {tab === 'nomina' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 dark:text-white">Periodos de Nómina</h3>
              <span className="text-xs text-slate-500 dark:text-slate-400">Total: {payrollCount}</span>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="text-left py-3 px-6 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Periodo</th>
                      <th className="text-left py-3 px-6 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Frecuencia</th>
                      <th className="text-left py-3 px-6 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Pago</th>
                      <th className="text-left py-3 px-6 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Rango</th>
                      <th className="text-right py-3 px-6 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Total</th>
                      <th className="text-center py-3 px-6 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Estatus</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {payrollPeriods.map(p => (
                      <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="py-3 px-6 text-sm font-bold text-slate-900 dark:text-white">{p.name}</td>
                        <td className="py-3 px-6 text-sm text-slate-700 dark:text-slate-300">{p.frequency}</td>
                        <td className="py-3 px-6 text-sm text-slate-600 dark:text-slate-400">{new Date(p.paymentDate).toLocaleDateString()}</td>
                        <td className="py-3 px-6 text-sm text-slate-600 dark:text-slate-400">{new Date(p.startDate).toLocaleDateString()} - {new Date(p.endDate).toLocaleDateString()}</td>
                        <td className="py-3 px-6 text-right text-sm font-medium text-slate-900 dark:text-white">{formatCurrency(p.totalAmount)}</td>
                        <td className="py-3 px-6 text-center">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            p.status === 'Pagado' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' :
                            p.status === 'Timbrado' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' :
                            p.status === 'Calculado' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400' :
                            'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                          }`}>{p.status}</span>
                        </td>
                      </tr>
                    ))}
                    {payrollPeriods.length === 0 && (
                      <tr>
                        <td colSpan={6} className="text-center py-10 text-slate-500 dark:text-slate-400">No hay periodos registrados.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

