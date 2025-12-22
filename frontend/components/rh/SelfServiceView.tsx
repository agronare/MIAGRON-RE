
import React, { useState, useEffect } from 'react';
import { 
    Wallet, Clock, Receipt, Plus, MapPin, 
    Smile, DollarSign,  
    Calendar, CreditCard, Zap, 
    Trash2, User, Award, 
    Meh, Frown, Sun, Briefcase,
    Umbrella, Upload, Download
} from 'lucide-react';
import { PAY_STUBS_MOCK, EXPENSE_REPORTS_MOCK } from '../../constants';
import { TimeOffRequest, ExpenseReport, LoanRequest, Employee } from '../../types';

// Helper Modal Component
const Modal = ({ isOpen, onClose, title, children, footer }: any) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 flex flex-col max-h-[90vh]">
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h3>
                    <button onClick={onClose} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full text-slate-400 transition-colors"><XIcon className="w-5 h-5"/></button>
                </div>
                <div className="p-6 overflow-y-auto">{children}</div>
                {footer && <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-2">{footer}</div>}
            </div>
        </div>
    );
};

// Icon helper to avoid collision with lucide imports
const XIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
);

const ProfileHeader = ({ currentUser }: { currentUser: any }) => {
    const initials = currentUser?.firstName && currentUser?.lastName 
        ? `${currentUser.firstName.charAt(0)}${currentUser.lastName.charAt(0)}` 
        : 'U';
    
    return (
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-lg mb-6 p-6 md:p-8 flex flex-col md:flex-row items-center md:items-start justify-between text-white relative overflow-hidden">
             {/* Decorative Circles */}
             <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
             <div className="absolute bottom-0 left-0 -ml-10 -mb-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>

             <div className="flex flex-col md:flex-row items-center gap-6 z-10">
                <div className="w-24 h-24 rounded-2xl bg-white p-1 shadow-xl flex-shrink-0">
                    {currentUser?.avatar ? (
                        <img 
                            src={currentUser.avatar} 
                            alt="Profile" 
                            className="w-full h-full object-cover rounded-xl" 
                        />
                    ) : (
                        <div className="w-full h-full rounded-xl bg-indigo-100 flex items-center justify-center text-3xl font-bold text-indigo-600 uppercase">
                            {initials}
                        </div>
                    )}
                </div>
                <div className="text-center md:text-left">
                    <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                        <h1 className="text-3xl font-bold">Hola, {currentUser?.firstName || 'Colaborador'}</h1>
                        <span className="text-2xl animate-wave origin-bottom-right inline-block">👋</span>
                    </div>
                    <p className="text-indigo-100 font-medium mb-1">{currentUser?.role || 'Puesto no asignado'} • {currentUser?.department || 'General'}</p>
                    <div className="inline-flex items-center px-3 py-1 rounded-full bg-white/20 text-xs font-semibold backdrop-blur-sm border border-white/10">
                        <Briefcase className="w-3 h-3 mr-1.5" /> 3 Años en Agronare
                    </div>
                </div>
             </div>

             <div className="mt-6 md:mt-0 flex flex-col items-center md:items-end z-10">
                 <p className="text-xs font-bold uppercase tracking-wider opacity-80 mb-3">¿CÓMO TE SIENTES HOY?</p>
                 <div className="flex gap-2 bg-white/10 p-1.5 rounded-xl backdrop-blur-sm border border-white/10">
                     <button className="p-2 hover:bg-white/20 rounded-lg transition-colors group" title="Bien">
                        <Smile className="w-6 h-6 text-emerald-300 group-hover:scale-110 transition-transform" />
                     </button>
                     <button className="p-2 hover:bg-white/20 rounded-lg transition-colors group" title="Regular">
                        <Meh className="w-6 h-6 text-amber-300 group-hover:scale-110 transition-transform" />
                     </button>
                     <button className="p-2 hover:bg-white/20 rounded-lg transition-colors group" title="Mal">
                        <Frown className="w-6 h-6 text-rose-300 group-hover:scale-110 transition-transform" />
                     </button>
                 </div>
             </div>
        </div>
    );
};

const SummaryTab = ({ setActiveTab, currentUser }: { setActiveTab: (t: string) => void, currentUser: Employee }) => {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }).replace(/\./g, '').toLowerCase();
    };
    
    // Split time for styling
    const timeString = formatTime(time);
    const [timeVal, ampm] = timeString.split(' ');

    return (
        <div className="animate-fadeIn space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Clock In Card */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl p-6 md:p-8 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
                    <div>
                        <div className="flex items-center text-slate-500 dark:text-slate-400 text-sm mb-2">
                            <MapPin className="w-4 h-4 mr-1.5 text-indigo-500" />
                            {currentUser.branch || 'Oficina Central'}, {currentUser.address ? 'Registrado' : 'Ubicación'}
                        </div>
                        <div className="flex items-baseline text-slate-900 dark:text-white">
                            <span className="text-5xl md:text-6xl font-black tracking-tighter font-mono">{timeVal}</span>
                            <span className="text-xl md:text-2xl font-medium ml-2 text-slate-400">{ampm}.m.</span>
                        </div>
                        <p className="text-slate-400 text-sm mt-1 capitalize">
                            {time.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })}
                        </p>
                    </div>
                    
                    <button className="group relative flex items-center justify-center px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20 hover:bg-indigo-700 hover:shadow-xl hover:-translate-y-0.5 transition-all">
                        <div className="bg-white/20 p-2 rounded-lg mr-3 group-hover:rotate-12 transition-transform">
                            <Sun className="w-6 h-6" />
                        </div>
                        <div className="text-left">
                            <span className="block text-[10px] uppercase tracking-wider opacity-80">INICIAR JORNADA</span>
                            <span className="text-lg">Check-In</span>
                        </div>
                    </button>
                </div>

                {/* Gamification Card */}
                <div className="bg-slate-900 dark:bg-black rounded-2xl p-6 border border-slate-800 shadow-sm text-white flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-indigo-500 rounded-full blur-3xl opacity-20"></div>
                    
                    <div className="flex justify-between items-start mb-4 relative z-10">
                        <h3 className="font-bold flex items-center">
                            <Award className="w-5 h-5 mr-2 text-yellow-400" /> Mis Insignias
                        </h3>
                    </div>
                    
                    <div className="flex gap-3 relative z-10">
                        <div className="flex-1 bg-white/10 rounded-xl p-3 text-center border border-white/5 hover:bg-white/20 transition-colors cursor-pointer">
                            <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-2">
                                <Clock className="w-4 h-4" />
                            </div>
                            <span className="text-xs font-medium block">Puntual</span>
                        </div>
                        <div className="flex-1 bg-white/10 rounded-xl p-3 text-center border border-white/5 hover:bg-white/20 transition-colors cursor-pointer">
                            <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center mx-auto mb-2">
                                <Briefcase className="w-4 h-4" />
                            </div>
                            <span className="text-xs font-medium block">Top Performer</span>
                        </div>
                        <div className="flex-1 bg-white/5 rounded-xl p-3 text-center border border-dashed border-white/10 flex items-center justify-center cursor-pointer hover:border-white/30 transition-colors">
                            <Plus className="w-6 h-6 text-slate-500" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Quick Access Cards */}
                <div onClick={() => setActiveTab('money')} className="md:col-span-1 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-800 transition-all cursor-pointer group">
                    <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Wallet className="w-6 h-6 text-emerald-600 dark:text-emerald-400"/>
                    </div>
                    <h3 className="font-bold text-slate-900 dark:text-white mb-1">Mi Dinero</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Nómina y préstamos</p>
                </div>

                <div onClick={() => setActiveTab('time')} className="md:col-span-1 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-blue-200 dark:hover:border-blue-800 transition-all cursor-pointer group">
                    <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Umbrella className="w-6 h-6 text-blue-600 dark:text-blue-400"/>
                    </div>
                    <h3 className="font-bold text-slate-900 dark:text-white mb-1">Mi Tiempo</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Vacaciones: 12 días</p>
                </div>

                <div onClick={() => setActiveTab('expenses')} className="md:col-span-1 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-amber-200 dark:hover:border-amber-800 transition-all cursor-pointer group">
                    <div className="w-12 h-12 bg-amber-50 dark:bg-amber-900/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Receipt className="w-6 h-6 text-amber-600 dark:text-amber-400"/>
                    </div>
                    <h3 className="font-bold text-slate-900 dark:text-white mb-1">Mis Gastos</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Viáticos y Reembolsos</p>
                </div>

                 {/* Holiday Card */}
                 <div className="md:col-span-1 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
                    <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-3 text-center min-w-[70px] border border-red-100 dark:border-red-900/30">
                        <span className="block text-xs font-bold text-red-600 dark:text-red-400 uppercase">DIC</span>
                        <span className="block text-2xl font-bold text-red-700 dark:text-red-300">25</span>
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase mb-1">Próximo Feriado</p>
                        <h4 className="font-bold text-slate-900 dark:text-white">Navidad</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Faltan 35 días</p>
                    </div>
                 </div>
            </div>
        </div>
    );
};

const TimeTab = ({ requests, setRequests, currentUser }: { requests: TimeOffRequest[], setRequests: React.Dispatch<React.SetStateAction<TimeOffRequest[]>>, currentUser: Employee }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ type: 'Vacaciones', startDate: '', endDate: '', reason: '' });

    const myRequests = requests.filter((r: any) => r.employeeId === currentUser.id);

    const handleRequest = () => {
        if (!formData.startDate || !formData.endDate) return alert("Fechas requeridas");
        const days = Math.floor((new Date(formData.endDate).getTime() - new Date(formData.startDate).getTime()) / (1000 * 3600 * 24)) + 1;
        const newReq: any = {
            id: `REQ-${Date.now()}`,
            type: formData.type as any,
            startDate: formData.startDate,
            endDate: formData.endDate,
            days: days > 0 ? days : 1,
            status: 'Pendiente',
            reason: formData.reason,
            employeeId: currentUser.id // Link to current user
        };
        setRequests([newReq, ...requests]);
        setIsModalOpen(false);
    };

    return (
         <div className="animate-fadeIn space-y-6">
             <div className="flex justify-between items-center">
                 <h3 className="font-bold text-slate-900 dark:text-white text-xl">Solicitudes de Ausencia</h3>
                 <button onClick={() => setIsModalOpen(true)} className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 flex items-center shadow-sm">
                     <Plus className="w-4 h-4 mr-2"/> Nueva Solicitud
                 </button>
             </div>

             <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                 <table className="w-full text-sm">
                     <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                         <tr>
                             <th className="p-4 text-left font-semibold text-slate-600 dark:text-slate-400">Tipo</th>
                             <th className="p-4 text-left font-semibold text-slate-600 dark:text-slate-400">Fechas</th>
                             <th className="p-4 text-center font-semibold text-slate-600 dark:text-slate-400">Días</th>
                             <th className="p-4 text-center font-semibold text-slate-600 dark:text-slate-400">Estado</th>
                        </tr>
                    </thead>
                     <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                         {myRequests.map(r => (
                             <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                 <td className="p-4 font-medium text-slate-900 dark:text-white">{r.type}</td>
                                 <td className="p-4 text-slate-500 dark:text-slate-400">{r.startDate} - {r.endDate}</td>
                                 <td className="p-4 text-center text-slate-700 dark:text-slate-300">{r.days}</td>
                                 <td className="p-4 text-center">
                                     <span className={`px-3 py-1 rounded-full text-xs font-bold 
                                        ${r.status === 'Aprobado' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' : 
                                          r.status === 'Rechazado' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' : 
                                          'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'}`}>
                                        {r.status}
                                     </span>
                                 </td>
                             </tr>
                         ))}
                         {myRequests.length === 0 && <tr><td colSpan={4} className="p-8 text-center text-slate-400">No hay historial de solicitudes.</td></tr>}
                     </tbody>
                 </table>
             </div>

             <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Solicitar Ausencia" footer={<><button onClick={() => setIsModalOpen(false)} className="px-4 py-2 border dark:border-slate-600 rounded-lg text-slate-600 dark:text-slate-300">Cancelar</button><button onClick={handleRequest} className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold">Enviar Solicitud</button></>}>
                 <div className="space-y-4">
                     <div><label className="block text-xs font-bold uppercase mb-1 text-slate-500 dark:text-slate-400">Tipo</label><select className="w-full p-2 border dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 dark:text-white" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}><option>Vacaciones</option><option>Permiso</option><option>Incapacidad</option></select></div>
                     <div className="grid grid-cols-2 gap-3">
                         <div><label className="block text-xs font-bold uppercase mb-1 text-slate-500 dark:text-slate-400">Desde</label><input type="date" className="w-full p-2 border dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 dark:text-white" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} /></div>
                         <div><label className="block text-xs font-bold uppercase mb-1 text-slate-500 dark:text-slate-400">Hasta</label><input type="date" className="w-full p-2 border dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 dark:text-white" value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} /></div>
                     </div>
                     <div><label className="block text-xs font-bold uppercase mb-1 text-slate-500 dark:text-slate-400">Motivo</label><textarea className="w-full p-2 border dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 dark:text-white resize-none" rows={3} value={formData.reason} onChange={e => setFormData({...formData, reason: e.target.value})}></textarea></div>
                 </div>
             </Modal>
         </div>
    );
};

const ExpensesTab = ({ currentUser }: { currentUser: Employee }) => {
    // Ideally we filter expenses by currentUser.id, but the mock doesn't have it. 
    // We'll simulate empty or filter if we had the field.
    const [expenses, setExpenses] = useState<ExpenseReport[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ concept: '', amount: '', date: new Date().toISOString().split('T')[0] });

    // Load initial filtered data (simulated)
    useEffect(() => {
        // Simulating that the mock data belongs to no one or someone else, so we start empty 
        // OR we can assign some mocks to this user for demo.
        const userExpenses = EXPENSE_REPORTS_MOCK.filter((e: any) => e.employeeId === currentUser.id);
        setExpenses(userExpenses);
    }, [currentUser.id]);

    const handleAdd = () => {
        if (!formData.concept || !formData.amount) return;
        const newExp: any = {
            id: `EXP-${Date.now()}`,
            date: formData.date,
            concept: formData.concept,
            amount: Number(formData.amount),
            status: 'Pendiente',
            employeeId: currentUser.id
        };
        setExpenses([newExp, ...expenses]);
        setIsModalOpen(false);
    };

    return (
        <div className="animate-fadeIn space-y-6">
             <div className="flex justify-between items-center">
                 <h3 className="font-bold text-slate-900 dark:text-white text-xl">Mis Gastos</h3>
                 <button onClick={() => setIsModalOpen(true)} className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 flex items-center shadow-sm">
                     <Plus className="w-4 h-4 mr-2"/> Nuevo Gasto
                 </button>
             </div>
             
             <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                 <table className="w-full text-sm">
                     <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                         <tr>
                             <th className="p-4 text-left font-semibold text-slate-600 dark:text-slate-400">Fecha</th>
                             <th className="p-4 text-left font-semibold text-slate-600 dark:text-slate-400">Concepto</th>
                             <th className="p-4 text-right font-semibold text-slate-600 dark:text-slate-400">Monto</th>
                             <th className="p-4 text-center font-semibold text-slate-600 dark:text-slate-400">Estado</th>
                             <th className="p-4 text-center font-semibold text-slate-600 dark:text-slate-400">Recibo</th>
                        </tr>
                    </thead>
                     <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                         {expenses.map(e => (
                             <tr key={e.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                 <td className="p-4 text-slate-500 dark:text-slate-400">{e.date}</td>
                                 <td className="p-4 font-medium text-slate-900 dark:text-white">{e.concept}</td>
                                 <td className="p-4 text-right font-bold text-slate-900 dark:text-white">${e.amount.toFixed(2)}</td>
                                 <td className="p-4 text-center">
                                     <span className={`px-3 py-1 rounded-full text-xs font-bold 
                                        ${e.status === 'Pagado' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'}`}>
                                        {e.status}
                                     </span>
                                 </td>
                                 <td className="p-4 text-center"><button className="text-indigo-600 dark:text-indigo-400 hover:underline text-xs font-medium">Ver</button></td>
                             </tr>
                         ))}
                         {expenses.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-slate-400">No hay gastos registrados.</td></tr>}
                     </tbody>
                 </table>
             </div>

             <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Registrar Gasto" footer={<><button onClick={() => setIsModalOpen(false)} className="px-4 py-2 border dark:border-slate-600 rounded-lg text-slate-600 dark:text-slate-300">Cancelar</button><button onClick={handleAdd} className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold">Guardar</button></>}>
                 <div className="space-y-4">
                     <div><label className="block text-xs font-bold uppercase mb-1 text-slate-500 dark:text-slate-400">Concepto</label><input type="text" className="w-full p-2 border dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 dark:text-white" value={formData.concept} onChange={e => setFormData({...formData, concept: e.target.value})} placeholder="Ej. Gasolina" /></div>
                     <div className="grid grid-cols-2 gap-3">
                         <div><label className="block text-xs font-bold uppercase mb-1 text-slate-500 dark:text-slate-400">Monto</label><input type="number" className="w-full p-2 border dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 dark:text-white" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} placeholder="0.00" /></div>
                         <div><label className="block text-xs font-bold uppercase mb-1 text-slate-500 dark:text-slate-400">Fecha</label><input type="date" className="w-full p-2 border dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 dark:text-white" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} /></div>
                     </div>
                     <div className="p-6 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl text-center text-slate-400 dark:text-slate-500 text-xs flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                        <Upload className="w-6 h-6 mb-2 text-slate-300" />
                        Arrastra tu comprobante aquí o click para subir.
                     </div>
                 </div>
             </Modal>
        </div>
    );
};

const MoneyTab = ({ loans, setLoans, currentUser }: { loans: LoanRequest[], setLoans: React.Dispatch<React.SetStateAction<LoanRequest[]>>, currentUser: Employee }) => {
    // Filter loans by current user ID
    const myLoans = loans.filter(l => l.employeeId === currentUser.id);

    return (
    <div className="animate-fadeIn p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <h3 className="font-bold text-xl mb-2 text-slate-900 dark:text-white">Nómina y Finanzas</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Descarga tus recibos de nómina y gestiona préstamos.</p>
        
        {/* Loans Section */}
        {myLoans.length > 0 && (
             <div className="mb-6">
                 <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 uppercase">Mis Préstamos Activos</h4>
                 <div className="space-y-2">
                     {myLoans.map(loan => (
                         <div key={loan.id} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg flex justify-between items-center border border-slate-100 dark:border-slate-700">
                             <div>
                                 <p className="font-bold text-slate-900 dark:text-white">${loan.amount.toLocaleString()}</p>
                                 <p className="text-xs text-slate-500">{loan.termMonths} meses • {loan.reason || 'Personal'}</p>
                             </div>
                             <span className={`px-2 py-1 text-xs font-bold rounded ${
                                 loan.status === 'Aprobado' ? 'bg-emerald-100 text-emerald-700' : 
                                 loan.status === 'Rechazado' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                             }`}>
                                 {loan.status}
                             </span>
                         </div>
                     ))}
                 </div>
             </div>
        )}

        <div className="space-y-3">
             <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase">Recibos de Nómina</h4>
             {PAY_STUBS_MOCK.map(stub => (
                 <div key={stub.id} className="flex justify-between items-center p-4 border border-slate-100 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                     <div>
                         <p className="font-bold text-slate-800 dark:text-white text-sm">{stub.period}</p>
                         <p className="text-xs text-slate-500 dark:text-slate-400">Pagado: {stub.paymentDate}</p>
                     </div>
                     <div className="text-right">
                         <p className="font-bold text-emerald-600 dark:text-emerald-400 text-lg">${stub.netAmount.toLocaleString()}</p>
                         <button className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium flex items-center justify-end w-full">
                            <Download className="w-3 h-3 mr-1" /> Descargar PDF
                         </button>
                     </div>
                 </div>
             ))}
             {PAY_STUBS_MOCK.length === 0 && <p className="text-slate-400 italic text-sm text-center py-4">No hay recibos de nómina disponibles.</p>}
        </div>
    </div>
)};

interface SelfServiceProps {
    loans?: LoanRequest[];
    setLoans?: React.Dispatch<React.SetStateAction<LoanRequest[]>>;
    timeOffRequests?: TimeOffRequest[];
    setTimeOffRequests?: React.Dispatch<React.SetStateAction<TimeOffRequest[]>>;
    activeSurveys?: any[];
    onUpdateSurvey?: (survey: any) => void;
    currentUser?: any;
}

export const SelfServiceView: React.FC<SelfServiceProps> = ({ 
    loans = [], 
    setLoans = () => {}, 
    timeOffRequests = [], 
    setTimeOffRequests = () => {},
    activeSurveys = [],
    onUpdateSurvey,
    currentUser
}) => {
    const [activeTab, setActiveTab] = useState('hub');
    
    if (!currentUser) return null; // Safety check

    return (
        <div className="min-h-full">
            <ProfileHeader currentUser={currentUser} />

            <div className="flex overflow-x-auto no-scrollbar gap-2 p-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl w-full md:w-fit mb-8 shadow-sm">
                {[
                    { id: 'hub', label: 'Resumen', icon: Zap },
                    { id: 'money', label: 'Mis Finanzas', icon: DollarSign },
                    { id: 'time', label: 'Tiempo y Asistencia', icon: Clock },
                    { id: 'expenses', label: 'Gastos', icon: CreditCard }
                ].map((tab) => (
                    <button 
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all whitespace-nowrap flex items-center ${
                            activeTab === tab.id 
                            ? 'bg-slate-900 dark:bg-indigo-600 text-white shadow-md' 
                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                    >
                        {tab.id === 'hub' ? <Zap className="w-4 h-4 mr-2" /> : tab.id === 'money' ? <DollarSign className="w-4 h-4 mr-2" /> : tab.id === 'time' ? <Clock className="w-4 h-4 mr-2" /> : <CreditCard className="w-4 h-4 mr-2" />}
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="min-h-[400px]">
                {activeTab === 'hub' && <SummaryTab setActiveTab={setActiveTab} currentUser={currentUser} />}
                {activeTab === 'money' && <MoneyTab loans={loans} setLoans={setLoans} currentUser={currentUser} />}
                {activeTab === 'time' && <TimeTab requests={timeOffRequests} setRequests={setTimeOffRequests} currentUser={currentUser} />}
                {activeTab === 'expenses' && <ExpensesTab currentUser={currentUser} />}
            </div>
        </div>
    );
};
