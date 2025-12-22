
import React from 'react';
import { Users, DollarSign, Building2, AlertTriangle, UserPlus, Cake, Briefcase, TrendingUp } from 'lucide-react';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
    PieChart, Pie, Cell, Legend
} from 'recharts';
import { Employee, Branch, PayrollPeriod } from '../../types';

interface RHDashboardProps {
    employees: Employee[];
    branches: Branch[];
    payrollPeriods: PayrollPeriod[];
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const KPICard = ({ title, value, subtext, icon: Icon, color }: any) => (
    <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="flex justify-between items-start mb-3">
            <div className={`p-2.5 rounded-lg ${color}`}>
                <Icon className="w-5 h-5" />
            </div>
        </div>
        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{value}</h3>
        {subtext && <p className="text-slate-400 text-xs mt-2">{subtext}</p>}
    </div>
);

export const RHDashboard: React.FC<RHDashboardProps> = ({ employees, branches, payrollPeriods }) => {
    
    // Metrics
    const activeEmployees = employees.filter(e => e.status === 'Activo').length;
    const totalBranches = branches.filter(b => b.status === 'Activa').length;
    const lastPayroll = payrollPeriods.find(p => p.status === 'Pagado');
    const monthlyCost = lastPayroll ? lastPayroll.totalAmount : 0;
    const onLeave = employees.filter(e => e.status === 'Vacaciones' || e.status === 'Suspendido').length;

    // Chart Data: Employees by Dept
    const deptData = employees.reduce((acc: any[], curr) => {
        const existing = acc.find(x => x.name === curr.department);
        if (existing) {
            existing.value++;
        } else {
            if (curr.department) acc.push({ name: curr.department, value: 1 });
        }
        return acc;
    }, []);

    // Chart Data: Contract Type
    const contractData = employees.reduce((acc: any[], curr) => {
        const existing = acc.find(x => x.name === curr.contractType);
        if (existing) {
            existing.value++;
        } else {
            if (curr.contractType) acc.push({ name: curr.contractType, value: 1 });
        }
        return acc;
    }, []);

    return (
        <div className="animate-fadeIn space-y-6 w-full">
            {/* KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard 
                    title="Total Colaboradores" 
                    value={activeEmployees.toString()} 
                    subtext="+2 contrataciones este mes" 
                    icon={Users} 
                    color="bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400" 
                />
                <KPICard 
                    title="Costo Nómina Mensual" 
                    value={`$${monthlyCost.toLocaleString()}`} 
                    subtext="Último periodo pagado" 
                    icon={DollarSign} 
                    color="bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400" 
                />
                <KPICard 
                    title="Sucursales Activas" 
                    value={totalBranches.toString()} 
                    subtext="Operatividad al 100%" 
                    icon={Building2} 
                    color="bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400" 
                />
                <KPICard 
                    title="Ausentismo Actual" 
                    value={onLeave.toString()} 
                    subtext="Personas en vacaciones/baja" 
                    icon={AlertTriangle} 
                    color="bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400" 
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Chart - Added min-w-0 to parent to prevent grid overflow */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm min-w-0">
                    <h3 className="font-bold text-slate-900 dark:text-white mb-6 flex items-center">
                        <Briefcase className="w-5 h-5 mr-2 text-indigo-600 dark:text-indigo-400" />
                        Distribución por Departamento
                    </h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={deptData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-slate-700" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} allowDecimals={false} />
                                <Tooltip 
                                    cursor={{fill: 'transparent'}}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', backgroundColor: '#fff', color: '#0f172a' }}
                                />
                                <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Secondary Chart - Added min-w-0 */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm min-w-0">
                    <h3 className="font-bold text-slate-900 dark:text-white mb-6 flex items-center">
                        <TrendingUp className="w-5 h-5 mr-2 text-emerald-600 dark:text-emerald-400" />
                        Tipos de Contrato
                    </h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={contractData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {contractData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none' }} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Quick Widgets */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-xl p-6 text-white shadow-lg flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-bold mb-1">Cumpleaños del Mes 🎉</h3>
                        <p className="text-indigo-100 text-sm">3 colaboradores celebran años en Noviembre.</p>
                        <div className="flex -space-x-2 mt-4">
                            {[1,2,3].map(i => (
                                <div key={i} className="w-8 h-8 rounded-full bg-white/20 border-2 border-indigo-500 flex items-center justify-center text-xs font-bold">
                                    {String.fromCharCode(64+i)}
                                </div>
                            ))}
                        </div>
                    </div>
                    <Cake className="w-16 h-16 text-white/20" />
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-6 flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Próximos Aniversarios 🎖️</h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">Reconoce la lealtad de tu equipo.</p>
                        <button className="mt-4 text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:underline">Ver lista completa</button>
                    </div>
                    <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center text-amber-600 dark:text-amber-400">
                        <UserPlus className="w-6 h-6" />
                    </div>
                </div>
            </div>
        </div>
    );
};
