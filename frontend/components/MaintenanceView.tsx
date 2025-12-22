
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Wrench, Gauge, Calendar as CalendarIcon, AlertTriangle, CheckCircle2, 
  BarChart3, Search, Filter, Plus, Truck, Activity, 
  Clock, Settings, ChevronRight, FileText, AlertOctagon,
  Play, PauseCircle, ArrowUpRight, Fuel, Thermometer,
  X, Save, MoreVertical, PenTool, Info, Cpu, Bell, Mail, User,
  ChevronLeft
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line
} from 'recharts';
import { FixedAsset } from '../types';

// --- Types ---
type MaintenanceTab = 'dashboard' | 'fleet' | 'workorders' | 'calendar';

interface Asset {
  id: string;
  name: string;
  category: string;
  status: 'Activo' | 'En Mantenimiento' | 'Inactivo';
  counter: number;
  counterType: 'km' | 'hrs';
  location: string;
  model: string;
  serviceEvery: number;
  alertBefore: number;
  lastServiceDate?: string;
}

interface WorkOrder {
  id: string;
  assetId: string;
  assetName: string;
  type: 'Preventivo' | 'Correctivo' | 'Predictivo';
  priority: 'Baja' | 'Media' | 'Alta' | 'Crítica';
  status: 'Abierta' | 'En Progreso' | 'Espera Refacciones' | 'Completada';
  description: string;
  assignedTo: string;
  dueDate: string;
  cost: number;
  createdAt: string;
}

// Clean Data
const INITIAL_WORK_ORDERS: WorkOrder[] = [];
const COST_HISTORY: any[] = [];
const SENSOR_DATA: any[] = [];

// --- Helper Components & Modals ---

const GeneralSettingsModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in zoom-in-95 border border-slate-200 dark:border-slate-700">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">Configuración General</h2>
                    <button onClick={onClose}><X className="text-slate-400 hover:text-slate-600" /></button>
                </div>
                <div className="text-center text-slate-500 py-8">Configuración guardada (Simulación).</div>
                <button onClick={onClose} className="w-full py-2 bg-indigo-600 text-white rounded-lg">Cerrar</button>
            </div>
        </div>
    );
};

const WorkOrderModal = ({ isOpen, onClose, onSave, assets }: { isOpen: boolean, onClose: () => void, onSave: (wo: Partial<WorkOrder>) => void, assets: Asset[] }) => {
    const [formData, setFormData] = useState<Partial<WorkOrder>>({
        type: 'Correctivo', priority: 'Media', status: 'Abierta', assetId: '', description: '', assignedTo: '', dueDate: new Date().toISOString().split('T')[0]
    });

    if (!isOpen) return null;

    const handleSubmit = () => {
        if (!formData.assetId || !formData.description) return alert("Complete los campos obligatorios");
        const asset = assets.find(a => a.id === formData.assetId);
        onSave({ ...formData, assetName: asset?.name || 'Desconocido' });
        onClose();
        setFormData({ type: 'Correctivo', priority: 'Media', status: 'Abierta', assetId: '', description: '', assignedTo: '', dueDate: new Date().toISOString().split('T')[0] });
    };

    return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg p-6 animate-in zoom-in-95 border border-slate-200 dark:border-slate-700">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">Nueva Orden de Trabajo</h2>
                    <button onClick={onClose}><X className="w-5 h-5 text-slate-400" /></button>
                </div>
                <div className="space-y-4">
                    <div>
                         <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Activo</label>
                         <select className="w-full p-2 border rounded" value={formData.assetId} onChange={e => setFormData({...formData, assetId: e.target.value})}>
                             <option value="">Seleccionar...</option>
                             {assets.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                         </select>
                    </div>
                    <div>
                         <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Descripción</label>
                         <textarea className="w-full p-2 border rounded" rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                             <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tipo</label>
                             <select className="w-full p-2 border rounded" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as any})}>
                                 <option>Correctivo</option><option>Preventivo</option><option>Predictivo</option>
                             </select>
                        </div>
                        <div>
                             <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Prioridad</label>
                             <select className="w-full p-2 border rounded" value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value as any})}>
                                 <option>Baja</option><option>Media</option><option>Alta</option><option>Crítica</option>
                             </select>
                        </div>
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                             <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Fecha</label>
                             <input type="date" className="w-full p-2 border rounded" value={formData.dueDate} onChange={e => setFormData({...formData, dueDate: e.target.value})} />
                        </div>
                        <div>
                             <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Asignado a</label>
                             <input type="text" className="w-full p-2 border rounded" value={formData.assignedTo} onChange={e => setFormData({...formData, assignedTo: e.target.value})} />
                        </div>
                    </div>
                </div>
                <div className="mt-6 flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 border rounded">Cancelar</button>
                    <button onClick={handleSubmit} className="px-4 py-2 bg-indigo-600 text-white rounded font-bold">Crear Orden</button>
                </div>
            </div>
        </div>
    );
};

const DashboardTab = ({ kpis }: any) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-fadeIn">
      {/* Cards implementation simplified */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm"><h3 className="font-bold text-slate-500 text-sm">Disponibilidad</h3><p className="text-2xl font-bold text-slate-900 dark:text-white">{kpis.availability}%</p></div>
      <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm"><h3 className="font-bold text-slate-500 text-sm">Órdenes Activas</h3><p className="text-2xl font-bold text-slate-900 dark:text-white">{kpis.activeRepairs}</p></div>
      <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm"><h3 className="font-bold text-slate-500 text-sm">Costo Mes</h3><p className="text-2xl font-bold text-slate-900 dark:text-white">${kpis.monthlyCost}</p></div>
      
       <div className="lg:col-span-4 bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm h-80">
          <h3 className="font-bold mb-4">Costos Mantenimiento</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={COST_HISTORY}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="preventivo" stackId="a" fill="#6366f1" />
              <Bar dataKey="correctivo" stackId="a" fill="#f43f5e" />
            </BarChart>
          </ResponsiveContainer>
      </div>
  </div>
);

const FleetTab = ({ assets }: { assets: Asset[] }) => (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-fadeIn">
        <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800"><tr><th className="p-3 text-left">Activo</th><th className="p-3 text-left">Estado</th><th className="p-3 text-right">Contador</th></tr></thead>
            <tbody>
                {assets.map(a => (
                    <tr key={a.id} className="border-b dark:border-slate-700"><td className="p-3">{a.name}</td><td className="p-3">{a.status}</td><td className="p-3 text-right">{a.counter} {a.counterType}</td></tr>
                ))}
                {assets.length === 0 && <tr><td colSpan={3} className="p-6 text-center text-slate-400">Sin vehículos registrados.</td></tr>}
            </tbody>
        </table>
    </div>
);

const WorkOrdersTab = ({ orders }: { orders: WorkOrder[] }) => (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-fadeIn">
        <table className="w-full text-sm">
             <thead className="bg-slate-50 dark:bg-slate-800"><tr><th className="p-3 text-left">ID</th><th className="p-3 text-left">Activo</th><th className="p-3 text-left">Descripción</th><th className="p-3 text-center">Estado</th></tr></thead>
             <tbody>
                {orders.map(o => (
                    <tr key={o.id} className="border-b dark:border-slate-700"><td className="p-3">{o.id}</td><td className="p-3">{o.assetName}</td><td className="p-3">{o.description}</td><td className="p-3 text-center">{o.status}</td></tr>
                ))}
                {orders.length === 0 && <tr><td colSpan={4} className="p-6 text-center text-slate-400">Sin órdenes de trabajo.</td></tr>}
             </tbody>
        </table>
    </div>
);

// --- NEW FUNCTIONAL CALENDAR COMPONENT ---
const MaintenanceCalendar = ({ workOrders }: { workOrders: WorkOrder[] }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    
    // Generate days for current month
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const startDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
    
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const blanks = Array.from({ length: startDay }, (_, i) => i);
    
    const getOrdersForDay = (day: number) => {
        const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return workOrders.filter(o => o.dueDate === dateStr);
    };

    const changeMonth = (delta: number) => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + delta, 1));
    };

    const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm animate-fadeIn">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center">
                    <CalendarIcon className="mr-2 w-5 h-5 text-indigo-600" /> Calendario de Servicios
                </h3>
                <div className="flex items-center gap-4">
                    <button onClick={() => changeMonth(-1)} className="p-1 hover:bg-slate-100 rounded"><ChevronLeft /></button>
                    <span className="font-bold text-slate-700 dark:text-slate-300 w-32 text-center">{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</span>
                    <button onClick={() => changeMonth(1)} className="p-1 hover:bg-slate-100 rounded"><ChevronRight /></button>
                </div>
            </div>
            
            <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-center py-2 text-xs font-bold text-slate-500 uppercase">
                {['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'].map(d => <div key={d}>{d}</div>)}
            </div>
            
            <div className="grid grid-cols-7 auto-rows-fr bg-slate-200 dark:bg-slate-700 gap-px">
                {blanks.map(b => <div key={`blank-${b}`} className="bg-white dark:bg-slate-900 h-32"></div>)}
                {days.map(day => {
                    const orders = getOrdersForDay(day);
                    const isToday = new Date().toDateString() === new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();
                    
                    return (
                        <div key={day} className={`bg-white dark:bg-slate-900 h-32 p-2 relative group hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors ${isToday ? 'bg-blue-50/30' : ''}`}>
                            <span className={`text-sm font-bold block mb-2 ${isToday ? 'text-blue-600 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center' : 'text-slate-700 dark:text-slate-300'}`}>{day}</span>
                            <div className="space-y-1 overflow-y-auto max-h-[85px] custom-scrollbar">
                                {orders.map(o => (
                                    <div key={o.id} className={`text-[10px] p-1.5 rounded border border-l-4 truncate cursor-pointer hover:opacity-80
                                        ${o.type === 'Preventivo' ? 'bg-blue-50 border-blue-100 border-l-blue-500 text-blue-700' : 
                                          o.type === 'Correctivo' ? 'bg-rose-50 border-rose-100 border-l-rose-500 text-rose-700' : 
                                          'bg-purple-50 border-purple-100 border-l-purple-500 text-purple-700'}`}>
                                        <span className="font-bold">{o.assetName}</span>
                                        <span className="block opacity-75">{o.description}</span>
                                    </div>
                                ))}
                            </div>
                            {orders.length === 0 && (
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none">
                                    <Plus className="w-6 h-6 text-slate-300" />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};


export const MaintenanceView = ({ fixedAssets = [] }: { fixedAssets?: FixedAsset[] }) => {
    const [activeTab, setActiveTab] = useState<MaintenanceTab>('dashboard');
    const [workOrders, setWorkOrders] = useState<WorkOrder[]>(INITIAL_WORK_ORDERS);
    const [isNewOrderOpen, setIsNewOrderOpen] = useState(false);

    // Derived state from fixedAssets for Fleet view
    const assets = useMemo(() => {
        return (fixedAssets || []).map(fa => ({
            id: fa.assetId || fa.id,
            name: fa.name,
            category: fa.category,
            status: fa.status as any,
            counter: 0, 
            counterType: (fa.category === 'Vehículo' ? 'km' : 'hrs') as any,
            location: fa.branch,
            model: 'N/A',
            serviceEvery: 1000,
            alertBefore: 100,
        }));
    }, [fixedAssets]);

    const kpis = {
        availability: 100,
        activeRepairs: workOrders.filter(o => o.status === 'En Progreso' || o.status === 'Espera Refacciones').length,
        monthlyCost: workOrders.reduce((acc, order) => acc + order.cost, 0),
        overdueMaintenance: 0
    };

    return (
        <div className="min-h-[calc(100vh-64px)] bg-[#f8fafc] dark:bg-slate-950 transition-colors duration-300 p-4 sm:p-8">
            <div className="max-w-[1400px] mx-auto w-full">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-200 dark:shadow-none text-white">
                            <Wrench className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Gestión de Mantenimiento</h1>
                            <p className="text-slate-500 dark:text-slate-400 text-sm">Control de flota y órdenes de servicio.</p>
                        </div>
                    </div>
                    <button onClick={() => setIsNewOrderOpen(true)} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 flex items-center shadow-sm">
                        <Plus className="w-4 h-4 mr-2" /> Nueva Orden
                    </button>
                </div>

                <div className="flex overflow-x-auto no-scrollbar gap-1 p-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl w-full md:w-fit mb-8 shadow-sm">
                    {[{ id: 'dashboard', label: 'Dashboard', icon: BarChart3 }, { id: 'fleet', label: 'Flota', icon: Truck }, { id: 'workorders', label: 'Órdenes', icon: FileText }, { id: 'calendar', label: 'Calendario', icon: CalendarIcon }].map((tab) => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}>
                            <tab.icon className="w-4 h-4 mr-2" /> {tab.label}
                        </button>
                    ))}
                </div>

                <div className="min-h-[500px]">
                    {activeTab === 'dashboard' && <DashboardTab kpis={kpis} />}
                    {activeTab === 'fleet' && <FleetTab assets={assets} />}
                    {activeTab === 'workorders' && <WorkOrdersTab orders={workOrders} />}
                    {activeTab === 'calendar' && <MaintenanceCalendar workOrders={workOrders} />}
                </div>
            </div>

            <WorkOrderModal 
                isOpen={isNewOrderOpen} 
                onClose={() => setIsNewOrderOpen(false)} 
                onSave={(wo) => {
                    const newOrder = { ...wo, id: `OT-${Date.now()}`, status: 'Abierta', createdAt: new Date().toISOString().split('T')[0], cost: 0 } as WorkOrder;
                    setWorkOrders([newOrder, ...workOrders]);
                }} 
                assets={assets} 
            />
        </div>
    );
};
