

import React, { useState, useMemo, useRef, useEffect } from 'react';
// FIX: Add 'Calculator' icon to lucide-react imports to fix 'Cannot find name' error.
import { 
    DollarSign, Users, Calendar, AlertTriangle, Play, Lock, 
    FileCheck, Send, CheckCircle, X, Plus, Filter, Search, 
    ArrowRight, Printer, Download, Sparkles, History, Settings,
    ChevronRight, ChevronLeft, UploadCloud, CheckSquare, Loader2, Wallet, XCircle, Umbrella, Calculator
} from 'lucide-react';
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { PayrollPeriod, PayrollIncident, LoanRequest, TimeOffRequest, Employee } from '../../types';

// Mock Data for Charts
const COST_TREND_DATA = [
    { month: 'Jun', salary: 180000, taxes: 45000, bonus: 10000 },
    { month: 'Jul', salary: 182000, taxes: 46000, bonus: 12000 },
    { month: 'Ago', salary: 185000, taxes: 48000, bonus: 15000 },
    { month: 'Sep', salary: 185000, taxes: 48000, bonus: 8000 },
    { month: 'Oct', salary: 190000, taxes: 50000, bonus: 20000 },
    { month: 'Nov', salary: 195000, taxes: 52000, bonus: 25000 },
];

const KPICard = ({ title, value, subtext, icon: Icon, color }: any) => (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex justify-between items-start mb-3">
            <div className={`p-2.5 rounded-lg ${color}`}>
                <Icon className="w-5 h-5" />
            </div>
        </div>
        <p className="text-slate-500 text-sm font-medium mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
        {subtext && <p className="text-slate-400 text-xs mt-2">{subtext}</p>}
    </div>
);

const LoanApprovalWidget = ({ loans, setLoans }: { loans: LoanRequest[], setLoans: React.Dispatch<React.SetStateAction<LoanRequest[]>> }) => {
    const pendingLoans = loans.filter(l => l.status === 'Pendiente');

    const handleAction = (id: string, action: 'Aprobado' | 'Rechazado') => {
        setLoans(prev => prev.map(l => l.id === id ? { ...l, status: action } : l));
        alert(`Solicitud ${action}`);
    };

    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                <h3 className="font-bold text-slate-900 flex items-center text-sm">
                    <Wallet className="w-4 h-4 mr-2 text-indigo-600" /> Aprobación de Préstamos
                </h3>
                {pendingLoans.length > 0 && <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2 py-1 rounded-full">{pendingLoans.length}</span>}
            </div>
            <div className="divide-y divide-slate-100 max-h-[200px] overflow-y-auto">
                {pendingLoans.length > 0 ? pendingLoans.map(loan => (
                    <div key={loan.id} className="p-3 flex items-center justify-between hover:bg-slate-50 transition-colors">
                        <div>
                            <p className="font-bold text-slate-900 text-xs">{loan.employeeName}</p>
                            <p className="text-[10px] text-slate-500">Solicita: ${loan.amount.toLocaleString()} (3m)</p>
                        </div>
                        <div className="flex gap-1">
                            <button onClick={() => handleAction(loan.id, 'Aprobado')} className="p-1 bg-emerald-100 text-emerald-700 rounded hover:bg-emerald-200 transition-colors">
                                <CheckCircle className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleAction(loan.id, 'Rechazado')} className="p-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors">
                                <XCircle className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )) : (
                    <div className="p-4 text-center text-slate-400 text-xs">No hay solicitudes pendientes.</div>
                )}
            </div>
        </div>
    );
};

const TimeOffApprovalWidget = ({ requests, setRequests }: { requests: TimeOffRequest[], setRequests: React.Dispatch<React.SetStateAction<TimeOffRequest[]>> }) => {
    const pendingRequests = requests.filter(r => r.status === 'Pendiente');

    const handleAction = (id: string, action: 'Aprobado' | 'Rechazado') => {
        setRequests(prev => prev.map(r => r.id === id ? { ...r, status: action } : r));
    };

    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                <h3 className="font-bold text-slate-900 flex items-center text-sm">
                    <Umbrella className="w-4 h-4 mr-2 text-blue-600" /> Aprobación de Ausencias
                </h3>
                {pendingRequests.length > 0 && <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2 py-1 rounded-full">{pendingRequests.length}</span>}
            </div>
            <div className="divide-y divide-slate-100 max-h-[200px] overflow-y-auto">
                {pendingRequests.length > 0 ? pendingRequests.map(req => (
                    <div key={req.id} className="p-3 flex items-center justify-between hover:bg-slate-50 transition-colors">
                        <div>
                            <p className="font-bold text-slate-900 text-xs">{req.type}</p>
                            <p className="text-[10px] text-slate-500">{req.days} días • {req.startDate}</p>
                        </div>
                        <div className="flex gap-1">
                            <button onClick={() => handleAction(req.id, 'Aprobado')} className="p-1 bg-emerald-100 text-emerald-700 rounded hover:bg-emerald-200 transition-colors">
                                <CheckCircle className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleAction(req.id, 'Rechazado')} className="p-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors">
                                <XCircle className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )) : (
                    <div className="p-4 text-center text-slate-400 text-xs">No hay solicitudes pendientes.</div>
                )}
            </div>
        </div>
    );
};

const DashboardTab = ({ periods, incidents, employees, onStartWizard, loans, setLoans, timeOffRequests, setTimeOffRequests }: { periods: PayrollPeriod[], incidents: PayrollIncident[], employees: Employee[], onStartWizard: () => void, loans?: LoanRequest[], setLoans?: React.Dispatch<React.SetStateAction<LoanRequest[]>>, timeOffRequests?: TimeOffRequest[], setTimeOffRequests?: React.Dispatch<React.SetStateAction<TimeOffRequest[]>> }) => {
    const activePeriod = periods.find(p => p.status === 'Borrador');
    const lastPaid = periods.find(p => p.status === 'Pagado');
    const pendingIncidents = incidents.filter(i => i.status === 'Pendiente').length;

    return (
        <div className="animate-fadeIn space-y-6">
            {/* Quick Action Banner */}
            <div className="bg-gradient-to-r from-slate-900 to-indigo-900 rounded-xl p-6 text-white shadow-lg flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold mb-1">Centro de Comando de Nómina</h2>
                    <p className="text-indigo-200 text-sm">Periodo actual: <span className="font-mono font-bold text-white">{activePeriod?.name || 'No activo'}</span></p>
                </div>
                <button 
                    onClick={onStartWizard}
                    className="px-6 py-3 bg-indigo-500 hover:bg-indigo-400 text-white rounded-lg font-bold shadow-lg shadow-indigo-900/50 flex items-center transition-all transform active:scale-95"
                >
                    <Play className="w-5 h-5 mr-2 fill-current" />
                    {activePeriod ? 'Continuar Cálculo' : 'Iniciar Nueva Nómina'}
                </button>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <KPICard 
                    title="Costo Total (Mes)" 
                    value={`$${(lastPaid?.totalAmount || 0).toLocaleString()}`} 
                    subtext="Última nómina pagada" 
                    icon={DollarSign} 
                    color="bg-emerald-100 text-emerald-600" 
                />
                <KPICard 
                    title="Plantilla Activa" 
                    value={employees.filter(e => e.status === 'Activo').length.toString()} 
                    subtext="Sin cambios este mes" 
                    icon={Users} 
                    color="bg-blue-100 text-blue-600" 
                />
                <KPICard 
                    title="Incidencias Pendientes" 
                    value={pendingIncidents.toString()} 
                    subtext="Requieren aprobación" 
                    icon={AlertTriangle} 
                    color={pendingIncidents > 0 ? "bg-amber-100 text-amber-600" : "bg-slate-100 text-slate-600"} 
                />
            </div>

            {/* Charts & Approval Center */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="font-bold text-slate-900 mb-6">Tendencia de Costos (Últimos 6 Meses)</h3>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={COST_TREND_DATA} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorSalary" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--brand)" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="var(--brand)" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="month" tick={{ fill: 'var(--muted)', fontSize: 12 }} />
                                <YAxis tick={{ fill: 'var(--muted)', fontSize: 12 }} />
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--card-2)" />
                                <Tooltip contentStyle={{ background: 'var(--card)', color: 'var(--text)', border: '1px solid rgba(99,102,241,0.25)', borderRadius: '8px' }} cursor={{ stroke: 'var(--muted)', opacity: 0.2 }} />
                                <Area type="monotone" dataKey="salary" stackId="1" stroke="var(--brand)" fill="url(#colorSalary)" />
                                <Area type="monotone" dataKey="taxes" stackId="1" stroke="var(--success)" fill="var(--success)" fillOpacity={0.2} />
                                <Area type="monotone" dataKey="bonus" stackId="1" stroke="var(--warning)" fill="var(--warning)" fillOpacity={0.2} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Right Column: Loan Approvals & Calendar */}
                <div className="space-y-4">
                    {loans && setLoans && (
                        <LoanApprovalWidget loans={loans} setLoans={setLoans} />
                    )}
                    
                    {timeOffRequests && setTimeOffRequests && (
                        <TimeOffApprovalWidget requests={timeOffRequests} setRequests={setTimeOffRequests} />
                    )}

                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <h3 className="font-bold text-slate-900 mb-4">Obligaciones Próximas</h3>
                        <div className="space-y-4">
                            {[
                                { date: '17 Nov', title: 'Pago Provisional ISR', type: 'Fiscal', urgent: true },
                                { date: '20 Nov', title: 'Cuotas IMSS/INFONAVIT', type: 'Seguridad Social', urgent: false },
                                { date: '30 Nov', title: 'Dispersión Nómina Q2', type: 'Interno', urgent: false },
                            ].map((event, idx) => (
                                <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100">
                                    <div className={`flex flex-col items-center justify-center w-12 h-12 rounded-lg border ${event.urgent ? 'bg-red-50 border-red-200 text-red-600' : 'bg-white border-slate-200 text-slate-600'}`}>
                                        <span className="text-xs font-bold uppercase">{event.date.split(' ')[1]}</span>
                                        <span className="text-lg font-bold">{event.date.split(' ')[0]}</span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-800">{event.title}</p>
                                        <p className="text-xs text-slate-500">{event.type}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const IncidentsManager = ({ incidents, setIncidents, employees }: { incidents: PayrollIncident[], setIncidents: React.Dispatch<React.SetStateAction<PayrollIncident[]>>, employees: Employee[] }) => {
    const [isAdding, setIsAdding] = useState(false);
    const [newIncident, setNewIncident] = useState({ employee: '', type: 'Falta Injustificada', value: 0, date: new Date().toISOString().split('T')[0] });

    const handleAdd = () => {
        const emp = employees.find(e => e.id === newIncident.employee);
        if (emp) {
            setIncidents([...incidents, {
                id: `inc-${Date.now()}`,
                employeeId: emp.id,
                employeeName: `${emp.firstName} ${emp.lastName}`,
                type: newIncident.type as any,
                date: newIncident.date,
                value: newIncident.value,
                status: 'Pendiente'
            }]);
            setIsAdding(false);
        }
    };

    const handleAction = (id: string, action: 'Aprobado' | 'Rechazado') => {
        setIncidents(incidents.map(i => i.id === id ? { ...i, status: action } : i));
    };

    return (
        <div className="animate-fadeIn bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-200 flex justify-between items-center">
                <h3 className="font-bold text-slate-900 text-lg">Bitácora de Incidencias</h3>
                <div className="flex gap-3">
                    <button onClick={() => setIsAdding(true)} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium flex items-center hover:bg-indigo-700">
                        <Plus className="w-4 h-4 mr-2" /> Registrar
                    </button>
                </div>
            </div>
            
            {isAdding && (
                <div className="p-4 bg-indigo-50 border-b border-indigo-100 flex gap-2 items-end">
                    <div className="flex-1">
                        <label className="text-xs font-bold text-indigo-800">Empleado</label>
                        <select className="w-full p-2 rounded border" onChange={e => setNewIncident({...newIncident, employee: e.target.value})}>
                            <option value="">Seleccionar...</option>
                            {employees.map(e => <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>)}
                        </select>
                    </div>
                    <div className="flex-1">
                        <label className="text-xs font-bold text-indigo-800">Tipo</label>
                        <select className="w-full p-2 rounded border" onChange={e => setNewIncident({...newIncident, type: e.target.value})}>
                            <option>Falta Injustificada</option>
                            <option>Horas Extra</option>
                            <option>Bono</option>
                        </select>
                    </div>
                    <div className="w-24">
                        <label className="text-xs font-bold text-indigo-800">Valor</label>
                        <input type="number" className="w-full p-2 rounded border" value={newIncident.value} onChange={e => setNewIncident({...newIncident, value: Number(e.target.value)})} />
                    </div>
                    <button onClick={handleAdd} className="px-4 py-2 bg-indigo-600 text-white rounded font-bold">Guardar</button>
                    <button onClick={() => setIsAdding(false)} className="px-4 py-2 bg-white border rounded text-slate-600">Cancelar</button>
                </div>
            )}

            <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                        <th className="p-4 text-left text-xs font-bold text-slate-500 uppercase">Empleado</th>
                        <th className="p-4 text-left text-xs font-bold text-slate-500 uppercase">Tipo</th>
                        <th className="p-4 text-left text-xs font-bold text-slate-500 uppercase">Fecha</th>
                        <th className="p-4 text-right text-xs font-bold text-slate-500 uppercase">Valor</th>
                        <th className="p-4 text-center text-xs font-bold text-slate-500 uppercase">Estado</th>
                        <th className="p-4 text-right text-xs font-bold text-slate-500 uppercase">Acciones</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {incidents.map(inc => (
                        <tr key={inc.id} className="hover:bg-slate-50">
                            <td className="p-4 font-medium text-slate-900">{inc.employeeName}</td>
                            <td className="p-4 text-sm text-slate-600">{inc.type}</td>
                            <td className="p-4 text-sm text-slate-600">{inc.date}</td>
                            <td className="p-4 text-right font-mono text-sm">{inc.value}</td>
                            <td className="p-4 text-center">
                                <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${
                                    inc.status === 'Pendiente' ? 'bg-amber-100 text-amber-700' :
                                    inc.status === 'Aprobado' ? 'bg-emerald-100 text-emerald-700' :
                                    'bg-red-100 text-red-700'
                                }`}>{inc.status}</span>
                            </td>
                            <td className="p-4 text-right">
                                {inc.status === 'Pendiente' && (
                                    <div className="flex justify-end gap-2">
                                        <button onClick={() => handleAction(inc.id, 'Aprobado')} className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded"><CheckCircle className="w-4 h-4" /></button>
                                        <button onClick={() => handleAction(inc.id, 'Rechazado')} className="p-1.5 text-red-600 hover:bg-red-50 rounded"><X className="w-4 h-4" /></button>
                                    </div>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

interface WizardEntry {
    employeeId: string;
    employeeName: string;
    salary: number;
    absences: number;
    delays: number;
    overtime: number;
    bonus: number;
}

interface CalculationResult {
    totalGross: number;
    totalTax: number;
    totalIMSS: number;
    totalNet: number;
    details: any[];
}

const PayrollWizard = ({ onCancel, onComplete, employees, incidents }: { onCancel: () => void, onComplete: () => void, employees: Employee[], incidents: PayrollIncident[] }) => {
    const [step, setStep] = useState(1);
    const [calculating, setCalculating] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    // Closing Process State
    const [closingSteps, setClosingSteps] = useState({
        locked: false,
        stamped: false,
        dispersed: false
    });
    const [processingStep, setProcessingStep] = useState<string | null>(null);

    // Step 1: Config State
    const [payrollConfig, setPayrollConfig] = useState({
        type: 'Ordinaria',
        frequency: 'Quincenal',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 12096e5).toISOString().split('T')[0] // +14 days approx
    });

    // Step 2: Entries State
    const [payrollEntries, setPayrollEntries] = useState<WizardEntry[]>(() => 
        employees.map(e => {
            const approvedIncidents = incidents.filter(i => i.employeeId === e.id && i.status === 'Aprobado');
            const absences = approvedIncidents.filter(i => i.type === 'Falta Injustificada').reduce((sum, i) => sum + i.value, 0);
            const delays = approvedIncidents.filter(i => i.type === 'Retardo').reduce((sum, i) => sum + i.value, 0);
            const overtime = approvedIncidents.filter(i => i.type === 'Horas Extra').reduce((sum, i) => sum + i.value, 0);
            const bonus = approvedIncidents.filter(i => i.type === 'Bono').reduce((sum, i) => sum + i.value, 0);

            return {
                employeeId: e.id,
                employeeName: `${e.firstName} ${e.lastName}`,
                salary: e.salary,
                absences,
                delays,
                overtime,
                bonus,
            };
        })
    );

    // Step 3: Calculation Result
    const [calculatedResults, setCalculatedResults] = useState<CalculationResult | null>(null);

    const handleEntryChange = (id: string, field: keyof WizardEntry, value: number) => {
        setPayrollEntries(prev => prev.map(entry => 
            entry.employeeId === id ? { ...entry, [field]: value } : entry
        ));
    };

    const performCalculation = () => {
        setCalculating(true);
        
        // Dynamic Calculation Logic
        const daysToPay = payrollConfig.frequency === 'Quincenal' ? 15 : 7;
        let totalGross = 0;
        let totalTax = 0;
        let totalIMSS = 0;
        let totalNet = 0;
        
        const details = payrollEntries.map(entry => {
            const dailySalary = entry.salary / 30;
            const hourlySalary = dailySalary / 8;
            
            // Base Salary for the period
            const basePeriodSalary = dailySalary * daysToPay;

            const absenceDeduction = entry.absences * dailySalary;
            const overtimePay = entry.overtime * hourlySalary * 2; // Double time
            
            const grossPay = basePeriodSalary - absenceDeduction + overtimePay + entry.bonus; 
            
            // Simplified Tax Logic
            const imss = grossPay * 0.025; // Dummy IMSS 2.5%
            const taxBase = grossPay - imss;
            let taxRate = 0.10;
            if (taxBase > 15000) taxRate = 0.20;
            if (taxBase > 30000) taxRate = 0.30;
            
            const tax = taxBase * taxRate;
            const netPay = grossPay - imss - tax;

            totalGross += grossPay;
            totalTax += tax;
            totalIMSS += imss;
            totalNet += netPay;

            return {
                ...entry,
                grossPay,
                tax,
                imss,
                netPay
            };
        });

        setTimeout(() => {
            setCalculatedResults({
                totalGross,
                totalTax,
                totalIMSS,
                totalNet,
                details
            });
            setCalculating(false);
            setStep(4);
        }, 2000);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const text = event.target?.result as string;
            const lines = text.split('\n');
            const newEntries = [...payrollEntries];
            let updatedCount = 0;

            lines.forEach(line => {
                const [id, faltas, retardos, extras, bono] = line.split(',');
                if (id) {
                    const index = newEntries.findIndex(entry => entry.employeeId === id.trim());
                    if (index !== -1) {
                        newEntries[index] = {
                            ...newEntries[index],
                            absences: Number(faltas) || 0,
                            delays: Number(retardos) || 0,
                            overtime: Number(extras) || 0,
                            bonus: Number(bono) || 0
                        };
                        updatedCount++;
                    }
                }
            });
            setPayrollEntries(newEntries);
            alert(`Se actualizaron ${updatedCount} registros desde el archivo CSV.`);
        };
        reader.readAsText(file);
        if(fileInputRef.current) fileInputRef.current.value = '';
    };

    const processClosingStep = (stepName: 'locked' | 'stamped' | 'dispersed') => {
        setProcessingStep(stepName);
        setTimeout(() => {
            setClosingSteps(prev => ({ ...prev, [stepName]: true }));
            setProcessingStep(null);
        }, 1500);
    };

    const StepIndicator = () => (
        <div className="flex justify-center mb-8">
            <div className="flex items-center w-full max-w-3xl">
                {[
                    { s: 1, l: 'Periodo' },
                    { s: 2, l: 'Incidencias' },
                    { s: 3, l: 'Cálculo' },
                    { s: 4, l: 'Auditoría' },
                    { s: 5, l: 'Cierre' }
                ].map((item, idx) => (
                    <React.Fragment key={item.s}>
                        <div className="relative flex flex-col items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-colors
                                ${step === item.s ? 'bg-indigo-600 text-white border-indigo-600' : 
                                  step > item.s ? 'bg-emerald-500 text-white border-emerald-500' : 
                                  'bg-white text-slate-400 border-slate-200'}`}>
                                {step > item.s ? <CheckCircle className="w-5 h-5" /> : item.s}
                            </div>
                            <span className={`absolute -bottom-6 text-xs font-medium ${step === item.s ? 'text-indigo-600' : 'text-slate-500'}`}>{item.l}</span>
                        </div>
                        {idx < 4 && <div className={`flex-1 h-0.5 mx-2 ${step > item.s ? 'bg-emerald-500' : 'bg-slate-200'}`}></div>}
                    </React.Fragment>
                ))}
            </div>
        </div>
    );

    return (
        <div className="animate-fadeIn">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-slate-900">Asistente de Nómina</h2>
                <button onClick={onCancel} className="text-slate-500 hover:text-slate-700"><X /></button>
            </div>
            
            <StepIndicator />

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm min-h-[400px] p-8 relative overflow-hidden">
                
                {/* Step 1: Period Definition */}
                {step === 1 && (
                    <div className="max-w-lg mx-auto space-y-6 animate-in fade-in slide-in-from-right-8">
                        <h3 className="text-lg font-bold text-slate-800 text-center mb-4">Definición del Periodo</h3>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Tipo de Nómina</label>
                            <select 
                                className="w-full p-3 border border-slate-200 rounded-lg bg-white"
                                value={payrollConfig.type}
                                onChange={e => setPayrollConfig({...payrollConfig, type: e.target.value})}
                            >
                                <option>Ordinaria</option>
                                <option>Extraordinaria (Aguinaldo)</option>
                                <option>Extraordinaria (PTU)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Frecuencia</label>
                            <select 
                                className="w-full p-3 border border-slate-200 rounded-lg bg-white"
                                value={payrollConfig.frequency}
                                onChange={e => setPayrollConfig({...payrollConfig, frequency: e.target.value})}
                            >
                                <option>Quincenal</option>
                                <option>Semanal</option>
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Fecha Inicio</label>
                                <input 
                                    type="date" 
                                    className="w-full p-3 border border-slate-200 rounded-lg" 
                                    value={payrollConfig.startDate}
                                    onChange={e => setPayrollConfig({...payrollConfig, startDate: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Fecha Fin</label>
                                <input 
                                    type="date" 
                                    className="w-full p-3 border border-slate-200 rounded-lg" 
                                    value={payrollConfig.endDate}
                                    onChange={e => setPayrollConfig({...payrollConfig, endDate: e.target.value})}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 2: Incidents Grid */}
                {step === 2 && (
                    <div className="h-full flex flex-col animate-in fade-in slide-in-from-right-8">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-slate-800">Captura de Incidencias</h3>
                            <div className="flex gap-2">
                                <input 
                                    type="file" 
                                    ref={fileInputRef} 
                                    onChange={handleFileUpload} 
                                    accept=".csv" 
                                    className="hidden" 
                                />
                                <button 
                                    onClick={() => fileInputRef.current?.click()}
                                    className="px-3 py-2 text-sm border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-50 flex items-center transition-colors"
                                >
                                    <UploadCloud className="w-4 h-4 mr-2 text-slate-500" /> Importar CSV
                                </button>
                            </div>
                        </div>
                        <div className="flex-1 border border-slate-200 rounded-lg overflow-hidden overflow-y-auto max-h-[400px]">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-100 text-slate-600 font-medium sticky top-0 z-10">
                                    <tr>
                                        <th className="p-3 text-left border-b border-r w-10 bg-slate-100">#</th>
                                        <th className="p-3 text-left border-b border-r bg-slate-100">Empleado</th>
                                        <th className="p-3 text-center border-b border-r bg-slate-100 w-24">Faltas</th>
                                        <th className="p-3 text-center border-b border-r bg-slate-100 w-24">Retardos</th>
                                        <th className="p-3 text-center border-b border-r bg-slate-100 w-24">Hrs Extra</th>
                                        <th className="p-3 text-center border-b bg-slate-100 w-32">Bono ($)</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {payrollEntries.map((entry, i) => (
                                        <tr key={entry.employeeId} className="hover:bg-blue-50 transition-colors group">
                                            <td className="p-2 border-r text-center bg-slate-50 text-slate-400">{i + 1}</td>
                                            <td className="p-2 border-r font-medium text-slate-700">{entry.employeeName}</td>
                                            <td className="p-0 border-r">
                                                <input 
                                                    type="number" 
                                                    value={entry.absences}
                                                    onChange={(e) => handleEntryChange(entry.employeeId, 'absences', Number(e.target.value))}
                                                    className="w-full h-full p-2 text-center outline-none bg-transparent focus:bg-white focus:ring-2 focus:ring-indigo-500 inset-0" 
                                                />
                                            </td>
                                            <td className="p-0 border-r">
                                                <input 
                                                    type="number" 
                                                    value={entry.delays}
                                                    onChange={(e) => handleEntryChange(entry.employeeId, 'delays', Number(e.target.value))}
                                                    className="w-full h-full p-2 text-center outline-none bg-transparent focus:bg-white focus:ring-2 focus:ring-indigo-500 inset-0" 
                                                />
                                            </td>
                                            <td className="p-0 border-r">
                                                <input 
                                                    type="number" 
                                                    value={entry.overtime}
                                                    onChange={(e) => handleEntryChange(entry.employeeId, 'overtime', Number(e.target.value))}
                                                    className="w-full h-full p-2 text-center outline-none bg-transparent focus:bg-white focus:ring-2 focus:ring-indigo-500 inset-0" 
                                                />
                                            </td>
                                            <td className="p-0">
                                                <input 
                                                    type="number" 
                                                    value={entry.bonus}
                                                    onChange={(e) => handleEntryChange(entry.employeeId, 'bonus', Number(e.target.value))}
                                                    className="w-full h-full p-2 text-right outline-none bg-transparent focus:bg-white focus:ring-2 focus:ring-indigo-500 inset-0 font-mono" 
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="mt-2 text-xs text-slate-400 text-right">
                            * Los cambios se guardan automáticamente en memoria para el cálculo.
                        </div>
                    </div>
                )}

                {/* Step 3: Calculation Process */}
                {step === 3 && (
                    <div className="flex flex-col items-center justify-center h-full py-10 animate-in fade-in zoom-in">
                        {calculating ? (
                            <>
                                <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-6"></div>
                                <h3 className="text-xl font-bold text-slate-900 mb-2">Procesando Nómina...</h3>
                                <p className="text-slate-500">Aplicando reglas fiscales, calculando IMSS e ISR para {payrollEntries.length} empleados.</p>
                            </>
                        ) : (
                            <button onClick={performCalculation} className="px-8 py-4 bg-indigo-600 text-white rounded-xl shadow-xl hover:bg-indigo-700 transition-all transform hover:scale-105 font-bold text-lg flex items-center">
                                <Play className="w-6 h-6 mr-2" /> Ejecutar Cálculo Batch
                            </button>
                        )}
                    </div>
                )}

                {/* Step 4: Audit & AI */}
                {step === 4 && calculatedResults && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-8">
                        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 flex gap-4">
                            <div className="p-2 bg-white rounded-lg shadow-sm text-indigo-600 h-fit"><Sparkles className="w-5 h-5" /></div>
                            <div>
                                <h4 className="font-bold text-indigo-900 text-sm mb-1">Smart Payroll: Detector de Anomalías</h4>
                                <ul className="list-disc list-inside text-xs text-indigo-800 space-y-1">
                                    {calculatedResults.details.some(d => d.netPay <= 0) && <li>Se detectó al menos 1 empleado con sueldo neto $0.00 o negativo.</li>}
                                    <li>El pago de Horas Extra representa un {(calculatedResults.details.reduce((a: any, b: any) => a + (b.overtime * 200), 0) / calculatedResults.totalGross * 100).toFixed(1)}% del total.</li>
                                </ul>
                            </div>
                        </div>

                        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-50 text-slate-600 font-medium">
                                    <tr>
                                        <th className="p-3 text-left">Concepto</th>
                                        <th className="p-3 text-right">Nómina Actual</th>
                                        <th className="p-3 text-right">Nómina Anterior (Simulado)</th>
                                        <th className="p-3 text-right">Variación</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    <tr>
                                        <td className="p-3 font-medium">Total Percepciones (Bruto)</td>
                                        <td className="p-3 text-right font-bold">${calculatedResults.totalGross.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                                        <td className="p-3 text-right text-slate-500">${(calculatedResults.totalGross * 0.98).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                                        <td className="p-3 text-right text-emerald-600">+2.0%</td>
                                    </tr>
                                    <tr>
                                        <td className="p-3 font-medium">ISR Retenido</td>
                                        <td className="p-3 text-right font-bold">${calculatedResults.totalTax.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                                        <td className="p-3 text-right text-slate-500">${(calculatedResults.totalTax * 0.99).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                                        <td className="p-3 text-right text-emerald-600">+1.0%</td>
                                    </tr>
                                    <tr>
                                        <td className="p-3 font-medium">IMSS Cuota Obrero</td>
                                        <td className="p-3 text-right font-bold">${calculatedResults.totalIMSS.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                                        <td className="p-3 text-right text-slate-500">${(calculatedResults.totalIMSS * 1).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                                        <td className="p-3 text-right text-slate-600">0.0%</td>
                                    </tr>
                                    <tr className="bg-slate-50">
                                        <td className="p-3 font-bold text-slate-900">NETO A PAGAR</td>
                                        <td className="p-3 text-right font-bold text-indigo-600 text-lg">${calculatedResults.totalNet.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                                        <td className="p-3 text-right text-slate-500">${(calculatedResults.totalNet * 0.98).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                                        <td className="p-3 text-right text-emerald-600 font-bold">+2.0%</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Step 5: Closing */}
                {step === 5 && (
                    <div className="text-center py-8 animate-in fade-in zoom-in">
                        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                            <CheckCircle className="w-10 h-10" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">¡Nómina Lista para Cierre!</h2>
                        <p className="text-slate-500 mb-8 max-w-md mx-auto">El cálculo ha sido validado. Al confirmar, se generarán los recibos CFDI 4.0 y los archivos de dispersión bancaria.</p>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
                            <button 
                                onClick={() => !closingSteps.locked && processClosingStep('locked')}
                                disabled={closingSteps.locked || processingStep === 'locked'}
                                className={`p-4 border rounded-xl flex flex-col items-center justify-center gap-2 transition-all ${closingSteps.locked ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'hover:bg-slate-50 text-slate-600'}`}
                            >
                                {processingStep === 'locked' ? <Loader2 className="w-6 h-6 animate-spin"/> : closingSteps.locked ? <CheckCircle className="w-6 h-6"/> : <Lock className="w-6 h-6" />}
                                <span className="text-sm font-bold">1. Bloquear Periodo</span>
                            </button>
                            <button 
                                onClick={() => closingSteps.locked && !closingSteps.stamped && processClosingStep('stamped')}
                                disabled={!closingSteps.locked || closingSteps.stamped || processingStep === 'stamped'}
                                className={`p-4 border rounded-xl flex flex-col items-center justify-center gap-2 transition-all ${closingSteps.stamped ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : closingSteps.locked ? 'hover:bg-indigo-50 border-indigo-200 text-indigo-600 cursor-pointer' : 'opacity-50 cursor-not-allowed text-slate-400'}`}
                            >
                                {processingStep === 'stamped' ? <Loader2 className="w-6 h-6 animate-spin"/> : closingSteps.stamped ? <CheckCircle className="w-6 h-6"/> : <FileCheck className="w-6 h-6" />}
                                <span className="text-sm font-bold">2. Timbrar Recibos</span>
                            </button>
                            <button 
                                onClick={() => closingSteps.stamped && !closingSteps.dispersed && processClosingStep('dispersed')}
                                disabled={!closingSteps.stamped || closingSteps.dispersed || processingStep === 'dispersed'}
                                className={`p-4 border rounded-xl flex flex-col items-center justify-center gap-2 transition-all ${closingSteps.dispersed ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : closingSteps.stamped ? 'hover:bg-indigo-50 border-indigo-200 text-indigo-600 cursor-pointer' : 'opacity-50 cursor-not-allowed text-slate-400'}`}
                            >
                                {processingStep === 'dispersed' ? <Loader2 className="w-6 h-6 animate-spin"/> : closingSteps.dispersed ? <CheckCircle className="w-6 h-6"/> : <Send className="w-6 h-6" />}
                                <span className="text-sm font-bold">3. Dispersar y Enviar</span>
                            </button>
                        </div>
                    </div>
                )}

            </div>

            {/* Wizard Footer Navigation */}
            <div className="flex justify-between mt-6 px-2">
                {step > 1 && step < 5 && (
                    <button onClick={() => setStep(step - 1)} className="px-6 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg flex items-center">
                        <ChevronLeft className="w-4 h-4 mr-2" /> Anterior
                    </button>
                )}
                <div className="flex-1"></div>
                {step < 3 && (
                    <button onClick={() => setStep(step + 1)} className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 flex items-center shadow-sm">
                        Siguiente <ChevronRight className="w-4 h-4 ml-2" />
                    </button>
                )}
                 {step === 3 && (
                    <button onClick={performCalculation} disabled={calculating} className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 flex items-center shadow-sm disabled:opacity-60">
                        {calculating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Calculator className="w-4 h-4 mr-2" />}
                        {calculating ? 'Calculando...' : 'Calcular Ahora'}
                    </button>
                )}
                {step === 4 && (
                    <button onClick={() => setStep(5)} className="px-6 py-2 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700 flex items-center shadow-sm">
                        Aprobar y Cerrar <CheckCircle className="w-4 h-4 ml-2" />
                    </button>
                )}
                {step === 5 && (
                    <button 
                        onClick={onComplete} 
                        disabled={!closingSteps.dispersed}
                        className={`px-6 py-2 border rounded-lg font-medium ${closingSteps.dispersed ? 'bg-indigo-600 text-white hover:bg-indigo-700 border-transparent' : 'border-slate-300 text-slate-400 cursor-not-allowed'}`}
                    >
                        Finalizar Proceso
                    </button>
                )}
            </div>
        </div>
    );
};

interface PayrollViewProps {
    employees: Employee[];
    loans?: LoanRequest[];
    setLoans?: React.Dispatch<React.SetStateAction<LoanRequest[]>>;
    timeOffRequests?: TimeOffRequest[];
    setTimeOffRequests?: React.Dispatch<React.SetStateAction<TimeOffRequest[]>>;
    payrollPeriods: PayrollPeriod[];
    setPayrollPeriods: React.Dispatch<React.SetStateAction<PayrollPeriod[]>>;
    incidents: PayrollIncident[];
    setIncidents: React.Dispatch<React.SetStateAction<PayrollIncident[]>>;
}

export const PayrollView: React.FC<PayrollViewProps> = ({ 
    employees,
    loans, setLoans, timeOffRequests, setTimeOffRequests,
    payrollPeriods, setPayrollPeriods, incidents, setIncidents
}) => {
    const [view, setView] = useState<'dashboard' | 'wizard' | 'incidents'>('dashboard');

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {view !== 'wizard' && (
                <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Nómina & Fiscal</h1>
                        <p className="text-slate-500 text-sm mt-1">Gestión integral de pagos, impuestos y cumplimiento laboral.</p>
                    </div>
                    
                    <div className="flex bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
                        <button 
                            onClick={() => setView('dashboard')} 
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${view === 'dashboard' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Dashboard
                        </button>
                        <button 
                            onClick={() => setView('incidents')} 
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${view === 'incidents' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Incidencias
                        </button>
                    </div>
                </div>
            )}

            <div className="min-h-[500px]">
                {view === 'dashboard' && (
                    <DashboardTab 
                        periods={payrollPeriods} 
                        incidents={incidents}
                        employees={employees}
                        onStartWizard={() => setView('wizard')} 
                        loans={loans}
                        setLoans={setLoans}
                        timeOffRequests={timeOffRequests}
                        setTimeOffRequests={setTimeOffRequests}
                    />
                )}
                {view === 'wizard' && <PayrollWizard 
                    onCancel={() => setView('dashboard')} 
                    onComplete={() => {
                        const activePeriod = payrollPeriods.find(p => p.status === 'Borrador');
                        if (activePeriod) {
                            setPayrollPeriods(prev => prev.map(p => p.id === activePeriod.id ? { ...p, status: 'Pagado' } : p));
                        }
                        setView('dashboard');
                    }}
                    employees={employees}
                    incidents={incidents}
                />}
                {view === 'incidents' && <IncidentsManager 
                    incidents={incidents}
                    setIncidents={setIncidents}
                    employees={employees}
                />}
            </div>
        </div>
    );
};