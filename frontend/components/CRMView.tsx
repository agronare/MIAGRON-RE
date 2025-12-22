
import React, { useState, useMemo, useEffect } from 'react';
import { Client, Sale, PaymentRecord, PipelineOpportunity, Interaction } from '../types';
import { OPPORTUNITIES_MOCK } from '../constants';
import { useData } from '../context';
import { 
  Search, Plus, Edit, DollarSign, TrendingUp, UserCircle, Phone, Mail, Calendar,
  AlertCircle, MessageSquare, PhoneCall, StickyNote, Lock, MapPin, ChevronRight,
  Activity, Briefcase, Navigation
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { NewClientModal } from './crm/NewClientModal';
import { PipelineBoard } from './crm/PipelineBoard';
import { CRMSidebar } from './crm/CRMSidebar';

// ... (Existing LocationAssignModal remains same) ...
interface LocationAssignModalProps {
    isOpen: boolean;
    onClose: () => void;
    client: Client | null;
    onSave: (lat: number, lng: number) => void;
}
const LocationAssignModal = ({ isOpen, onClose, client, onSave }: LocationAssignModalProps) => {
    const [lat, setLat] = useState('');
    const [lng, setLng] = useState('');
    useEffect(() => {
        if (isOpen && client) {
            setLat(client.coordinates?.lat.toString() || '');
            setLng(client.coordinates?.lng.toString() || '');
        }
    }, [isOpen, client]);
    const handleSave = () => {
        const latNum = parseFloat(lat);
        const lngNum = parseFloat(lng);
        if (isNaN(latNum) || isNaN(lngNum)) return alert('Ingrese coordenadas válidas');
        onSave(latNum, lngNum);
        onClose();
    };
    if (!isOpen || !client) return null;
    return (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="card rounded-2xl w-full max-w-sm p-6 animate-in zoom-in-95">
                <div className="flex justify-between items-center mb-4 border-b border-slate-100 dark:border-slate-700 pb-2">
                    <h3 className="font-bold text-slate-800 dark:text-white flex items-center">
                        <MapPin className="w-5 h-5 mr-2 text-indigo-600"/> Asignar Ubicación
                    </h3>
                    <button onClick={onClose}><AlertCircle className="w-5 h-5 text-slate-400 hover:text-slate-600"/></button>
                </div>
                <div className="space-y-3">
                    <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Latitud</label><input type="number" step="any" value={lat} onChange={e => setLat(e.target.value)} className="w-full p-2 border rounded-lg" placeholder="19.xxx" /></div>
                    <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Longitud</label><input type="number" step="any" value={lng} onChange={e => setLng(e.target.value)} className="w-full p-2 border rounded-lg" placeholder="-101.xxx" /></div>
                </div>
                <div className="mt-6 flex justify-end gap-2">
                    <button onClick={onClose} className="button text-sm">Cancelar</button>
                    <button onClick={handleSave} className="button text-sm">Guardar</button>
                </div>
            </div>
        </div>
    );
};

// --- Improved Client Map View Component ---
const ClientMapView = ({ clients, onUpdateClientLocation }: { clients: Client[], onUpdateClientLocation: (id: string, lat: number, lng: number) => void }) => {
    const [locatingClient, setLocatingClient] = useState<Client | null>(null);
    const clientsWithLocation = (clients || []).filter(c => c.coordinates);
    const clientsWithoutLocation = (clients || []).filter(c => !c.coordinates);

    // Simulated Map Scale (Center Mexico approx)
    // We render points on a 100% x 100% container based on relative coords to a bounding box
    // Bounding Box (Michoacan/Central Mexico approx): Lat 18 to 21, Lng -104 to -100
    const MIN_LAT = 18.5, MAX_LAT = 20.5;
    const MIN_LNG = -103.5, MAX_LNG = -100.0;

    const getPosition = (lat: number, lng: number) => {
        const y = ((MAX_LAT - lat) / (MAX_LAT - MIN_LAT)) * 100;
        const x = ((lng - MIN_LNG) / (MAX_LNG - MIN_LNG)) * 100;
        return { x: Math.max(5, Math.min(95, x)), y: Math.max(5, Math.min(95, y)) };
    };

    return (
        <div className="animate-fadeIn space-y-4 h-full flex flex-col">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 flex-1 min-h-0">
                {/* Visual Map Container */}
                <div className="lg:col-span-3 card relative overflow-hidden group min-h-[500px]">
                     {/* Map Background Simulation */}
                     <div className="absolute inset-0 bg-[url('https://upload.wikimedia.org/wikipedia/commons/e/ec/USA_Mexico_location_map.svg')] bg-cover bg-center opacity-20 dark:opacity-10 grayscale"></div>
                     
                     <div className="absolute inset-0 p-10">
                        {clientsWithLocation.map(client => {
                            const pos = getPosition(client.coordinates!.lat, client.coordinates!.lng);
                            return (
                                <div 
                                    key={client.id}
                                    className="absolute w-8 h-8 -ml-4 -mt-8 flex flex-col items-center group/pin cursor-pointer hover:z-50 transition-all duration-300 hover:scale-110"
                                    style={{ top: `${pos.y}%`, left: `${pos.x}%` }}
                                >
                                    <MapPin className={`w-8 h-8 ${client.currentDebt > 0 ? 'text-red-500' : 'text-emerald-500'} drop-shadow-md`} fill="currentColor" />
                                    <div className="absolute bottom-full mb-2 bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-xl opacity-0 group-hover/pin:opacity-100 transition-opacity whitespace-nowrap border border-slate-200 dark:border-slate-700 flex flex-col items-center">
                                        <span>{client.name}</span>
                                        <span className={client.currentDebt > 0 ? 'text-red-500' : 'text-emerald-500'}>
                                            {client.currentDebt > 0 ? `Deuda: $${client.currentDebt}` : 'Al corriente'}
                                        </span>
                                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-white dark:border-t-slate-900"></div>
                                    </div>
                                </div>
                            );
                        })}
                     </div>

                     <div className="absolute bottom-4 right-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs shadow-lg">
                         <div className="flex items-center gap-2 mb-1"><span className="w-3 h-3 rounded-full bg-emerald-500"></span> Al Corriente</div>
                         <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-red-500"></span> Con Deuda</div>
                     </div>
                </div>

                {/* Unlocated List */}
                <div className="card overflow-hidden flex flex-col">
                    <div className="p-4 border-b border-slate-700 bg-slate-800/50">
                        <h4 className="font-bold text-slate-800 dark:text-white text-sm flex items-center">
                            <AlertCircle className="w-4 h-4 mr-2 text-orange-500" />
                            Sin Ubicación ({clientsWithoutLocation.length})
                        </h4>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 space-y-2 max-h-[500px]">
                        {clientsWithoutLocation.map(client => (
                            <div key={client.id} className="p-3 border border-slate-700 rounded-lg hover:bg-slate-800 transition-colors group">
                                <p className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">{client.name}</p>
                                <div className="flex justify-between items-center mt-2">
                                    <span className="text-xs text-slate-400 truncate max-w-[100px]">{client.location || 'N/A'}</span>
                                    <button onClick={() => setLocatingClient(client)} className="button text-xs px-2 py-1">Asignar</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <LocationAssignModal 
                isOpen={!!locatingClient}
                onClose={() => setLocatingClient(null)}
                client={locatingClient}
                onSave={(lat, lng) => {
                    if(locatingClient) onUpdateClientLocation(locatingClient.id, lat, lng);
                }}
            />
        </div>
    );
}

interface CRMViewProps {
  permissions?: string[];
}

export const CRMView: React.FC<CRMViewProps> = ({ permissions = [] }) => {
  // Use centralized DataContext as single source of truth
  const data = useData();

  // Destructure data from DataContext - no local copies needed
  const { clients, salesHistory, payments } = data;

  // LAZY LOADING: Load CRM data when component mounts
  useEffect(() => {
    const loadCRMData = async () => {
      await Promise.all([
        data.loadClients(),
        data.loadSales(),
        data.loadPayments()
      ]);
    };
    loadCRMData();
  }, []);

  // Permission mapping
  const PERM_MAP: Record<string, string> = {
      'crm_dashboard': 'dashboard',
      'crm_directory': 'directory',
      'crm_pipeline': 'pipeline',
      'crm_map': 'map'
  };

  const allowedTabs = useMemo(() => {
      return permissions.length > 0 
      ? Object.entries(PERM_MAP).filter(([perm, id]) => permissions.includes(perm)).map(([_, id]) => id)
      : ['dashboard', 'directory', 'pipeline', 'map'];
  }, [permissions]);

  const [activeTab, setActiveTab] = useState<string>(allowedTabs.length > 0 ? allowedTabs[0] : 'dashboard');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [clientDetailTab, setClientDetailTab] = useState<'resumen' | 'transacciones' | 'bitacora'>('resumen');
  const [isNewClientModalOpen, setIsNewClientModalOpen] = useState(false);
  const [opportunities, setOpportunities] = useState<PipelineOpportunity[]>(OPPORTUNITIES_MOCK);
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [clientToEdit, setClientToEdit] = useState<Client | undefined>(undefined);
  const [newNote, setNewNote] = useState('');
  const [clientSearch, setClientSearch] = useState('');

  useEffect(() => {
      if (allowedTabs.length > 0 && !allowedTabs.includes(activeTab)) {
          setActiveTab(allowedTabs[0]);
      }
  }, [allowedTabs, activeTab]);

  const clientTransactions = useMemo(() => {
      if (!selectedClient) return [];
      const clientSales = (salesHistory || [])
          .filter(s => s.clientId === selectedClient.id)
          .map(s => ({ ...s, displayType: 'sale' }));
      const clientPayments = (payments || [])
          .filter(p => p.entityId === selectedClient.id && p.type === 'receivable')
          .map(p => ({ ...p, displayType: 'payment' }));
      
      return [...clientSales, ...clientPayments].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [selectedClient, salesHistory, payments]);

  const filteredClients = useMemo(() => {
      return (clients || []).filter(c => 
          c.name.toLowerCase().includes(clientSearch.toLowerCase()) || 
          c.contactName.toLowerCase().includes(clientSearch.toLowerCase())
      );
  }, [clients, clientSearch]);

  const clientInteractions = useMemo(() => {
      if (!selectedClient) return [];
      return interactions.filter(i => i.clientId === selectedClient.id).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [selectedClient, interactions]);

  const dashboardStats = useMemo(() => {
      const totalPipeline = opportunities.reduce((sum, op) => sum + op.value, 0);
      const weightedPipeline = opportunities.reduce((sum, op) => sum + (op.value * (op.probability / 100)), 0);
      const closedOps = opportunities.filter(op => op.stage === 'ganada' || op.stage === 'perdida').length;
      const wonOps = opportunities.filter(op => op.stage === 'ganada').length;
      const conversionRate = closedOps > 0 ? (wonOps / closedOps) * 100 : 0;
      const activeOps = opportunities.filter(op => op.stage !== 'ganada' && op.stage !== 'perdida').length;
      
      const funnelData = [
          { name: 'Prospecto', value: opportunities.filter(o => o.stage === 'prospecto').reduce((s, o) => s + o.value, 0) },
          { name: 'Calificado', value: opportunities.filter(o => o.stage === 'calificado').reduce((s, o) => s + o.value, 0) },
          { name: 'Negociación', value: opportunities.filter(o => o.stage === 'negociacion').reduce((s, o) => s + o.value, 0) },
          { name: 'Cerrada', value: opportunities.filter(o => o.stage === 'ganada').reduce((s, o) => s + o.value, 0) }
      ];

      return { totalPipeline, weightedPipeline, conversionRate, activeOps, funnelData };
  }, [opportunities]);

  const handleUpdateClient = async (id: string, updateData: Partial<Client>) => {
      try {
          await data.updateClient(id, updateData as any);
          // Update local selected client if it's the one being updated
          if (selectedClient && selectedClient.id === id) {
              setSelectedClient({ ...selectedClient, ...updateData });
          }
          await data.refreshModule('crm');
      } catch (err) {
          console.error('Error updating client:', err);
      }
  };

  const handleAddInteraction = () => {
      if (!selectedClient || !newNote.trim()) return;
      const newInteraction: Interaction = {
          id: `int-${Date.now()}`,
          clientId: selectedClient.id,
          type: 'note',
          date: new Date().toISOString(),
          summary: newNote,
          user: 'YO'
      };
      setInteractions([newInteraction, ...interactions]);
      setNewNote('');
  };

  const handleSaveClient = async (clientData: Client) => {
      try {
          if (clientToEdit) {
              await data.updateClient(clientData.id, clientData as any);
              if (selectedClient && selectedClient.id === clientData.id) {
                  setSelectedClient(clientData);
              }
          } else {
              await data.createClient(clientData as any);
          }
          await data.refreshModule('crm');
      } catch (err) {
          console.error('Error saving client:', err);
      } finally {
          setClientToEdit(undefined);
          setIsNewClientModalOpen(false);
      }
  };

  if (allowedTabs.length === 0) {
      return (
        <div className="flex min-h-[calc(100vh-64px)] bg-[#f8fafc] dark:bg-slate-950 transition-colors duration-300 items-center justify-center">
            <div className="text-center p-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
                    <Lock className="w-8 h-8 text-slate-400" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Acceso Limitado</h2>
                <p className="text-slate-500 dark:text-slate-400 mt-2">No tienes permisos para ver ninguna sección de este módulo.</p>
            </div>
        </div>
      );
  }

        return (
            <>
                                <div className="flex min-h-[calc(100vh-64px)] bg-[#f8fafc] dark:bg-slate-950 transition-colors duration-300 w-screen relative left-[calc(50%-50vw)]">
                    <CRMSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        
                    {/* Main Content */}
                                            <div className="flex-1 min-w-0 px-4 py-8 overflow-x-auto">
                        <div className="max-w-[1400px]">
                
                {/* Dashboard View */}
                {activeTab === 'dashboard' && (
                    <div className="animate-fadeIn space-y-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Dashboard Comercial</h1>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                                <div className="flex justify-between items-start mb-3">
                                    <div className="p-2.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg"><DollarSign className="w-5 h-5" /></div>
                                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 px-2 py-1 rounded">Pipeline Total</span>
                                </div>
                                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">${dashboardStats.totalPipeline.toLocaleString()}</h3>
                            </div>
                            <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                                <div className="flex justify-between items-start mb-3">
                                    <div className="p-2.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg"><TrendingUp className="w-5 h-5" /></div>
                                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded">Ponderado</span>
                                </div>
                                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">${dashboardStats.weightedPipeline.toLocaleString()}</h3>
                            </div>
                            <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                                <div className="flex justify-between items-start mb-3">
                                    <div className="p-2.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg"><Activity className="w-5 h-5" /></div>
                                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded">Tasa Conversión</span>
                                </div>
                                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{dashboardStats.conversionRate.toFixed(1)}%</h3>
                            </div>
                            <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                                <div className="flex justify-between items-start mb-3">
                                    <div className="p-2.5 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-lg"><Briefcase className="w-5 h-5" /></div>
                                    <span className="text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded">Oportunidades</span>
                                </div>
                                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{dashboardStats.activeOps} Activas</h3>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                            <h3 className="font-bold text-slate-900 dark:text-white mb-6">Embudo de Ventas</h3>
                            <div className="w-full">
                                <ResponsiveContainer width="100%" height={300} minWidth={0}>
                                    <BarChart data={dashboardStats.funnelData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#334155" opacity={0.3} />
                                        <XAxis type="number" hide />
                                        <YAxis dataKey="name" type="category" width={100} tick={{fill: '#94a3b8'}} />
                                        <Tooltip cursor={{fill: 'transparent'}} contentStyle={{backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: 'white'}} />
                                        <Bar dataKey="value" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={30}>
                                            {dashboardStats.funnelData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={['#60a5fa', '#3b82f6', '#2563eb', '#1d4ed8'][index % 4]} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                )}

                {/* Directory View */}
                {activeTab === 'directory' && (
                    <div className="animate-fadeIn space-y-6">
                        <div className="flex justify-between items-center">
                            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Directorio de Clientes</h1>
                            <button onClick={() => { setClientToEdit(undefined); setIsNewClientModalOpen(true); }} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 flex items-center shadow-sm">
                                <Plus className="w-4 h-4 mr-2"/> Nuevo Cliente
                            </button>
                        </div>

                        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                            <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex gap-4 bg-slate-50 dark:bg-slate-800/50">
                                <div className="relative flex-1 max-w-md">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                    <input 
                                        type="text" 
                                        placeholder="Buscar cliente..." 
                                        className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-800 dark:text-white"
                                        value={clientSearch}
                                        onChange={(e) => setClientSearch(e.target.value)}
                                    />
                                </div>
                            </div>
                            <table className="w-full text-sm">
                                <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase border-b border-slate-200 dark:border-slate-700">
                                    <tr>
                                        <th className="p-4 text-left">Cliente</th>
                                        <th className="p-4 text-left">Contacto</th>
                                        <th className="p-4 text-left">Ubicación</th>
                                        <th className="p-4 text-left">Estado</th>
                                        <th className="p-4 text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {filteredClients.map(client => (
                                        <tr key={client.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer" onClick={() => setSelectedClient(client)}>
                                            <td className="p-4">
                                                <div className="font-bold text-slate-900 dark:text-white">{client.name}</div>
                                                <div className="text-xs text-slate-500 dark:text-slate-400">{client.rfc}</div>
                                            </td>
                                            <td className="p-4 text-slate-600 dark:text-slate-300">{client.contactName}</td>
                                            <td className="p-4 text-slate-600 dark:text-slate-300">{client.location || 'N/A'}</td>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${client.status === 'Activo' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
                                                    {client.status}
                                                </span>
                                            </td>
                                            <td className="p-4 text-right">
                                                <button onClick={(e) => { e.stopPropagation(); setClientToEdit(client); setIsNewClientModalOpen(true); }} className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-full">
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Pipeline View */}
                {activeTab === 'pipeline' && <PipelineBoard opportunities={opportunities} />}

                {/* Map View */}
                {activeTab === 'map' && (
                    <ClientMapView 
                        clients={clients}
                        onUpdateClientLocation={(id, lat, lng) => handleUpdateClient(id, { coordinates: { lat, lng } })} 
                    />
                )}

                        </div>
                    </div>
                </div>

                {/* Client Detail Overlay */}
                {selectedClient && (
                         <div className="animate-in slide-in-from-right duration-300 flex flex-col bg-slate-50 dark:bg-slate-950 fixed inset-0 top-16 z-40 overflow-hidden">
                <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex justify-between items-center shadow-sm sticky top-0 z-10">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setSelectedClient(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
                            <ChevronRight className="w-6 h-6 text-slate-400 rotate-180" />
                        </button>
                        <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-xl font-bold text-white">
                            {selectedClient.name.charAt(0)}
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 dark:text-white leading-tight">{selectedClient.name}</h1>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => { setClientToEdit(selectedClient); setIsNewClientModalOpen(true); }} className="px-4 py-2 border bg-white rounded-lg flex items-center">
                            <Edit className="w-4 h-4 mr-2"/> Editar
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
                    <div className="w-full lg:w-80 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 overflow-y-auto p-6 space-y-6 shrink-0">
                        <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-lg">
                            <p className="text-xs font-bold text-slate-400 uppercase mb-1">Estado de Cuenta</p>
                            <h3 className="text-2xl font-bold mb-4">${selectedClient.currentDebt.toLocaleString()}</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between text-xs">
                                    <span className="text-slate-400">Límite de Crédito</span>
                                    <span className="font-bold">${selectedClient.creditLimit.toLocaleString()}</span>
                                </div>
                                <div className="w-full bg-slate-700 rounded-full h-1.5 overflow-hidden">
                                    <div 
                                        className={`h-full rounded-full ${selectedClient.currentDebt > selectedClient.creditLimit ? 'bg-red-500' : 'bg-emerald-400'}`} 
                                        style={{width: `${Math.min((selectedClient.currentDebt / (selectedClient.creditLimit || 1)) * 100, 100)}%`}}
                                    ></div>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span className="text-slate-400">Disponible</span>
                                    <span className="font-bold text-emerald-400">${Math.max(0, selectedClient.creditLimit - selectedClient.currentDebt).toLocaleString()}</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Contacto</h4>
                            <div className="space-y-3">
                                <div className="flex items-center p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100">
                                    <Phone className="w-4 h-4 mr-3" />
                                    <div>
                                        <p className="text-xs text-slate-500">Teléfono</p>
                                        <p className="text-sm font-bold">{selectedClient.phone || 'N/A'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100">
                                    <Mail className="w-4 h-4 mr-3" />
                                    <div>
                                        <p className="text-xs text-slate-500">Email</p>
                                        <p className="text-sm font-bold truncate max-w-[180px]">{selectedClient.email || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 flex flex-col min-w-0 bg-slate-50 dark:bg-slate-950">
                        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6">
                            <button onClick={() => setClientDetailTab('resumen')} className={`px-6 py-4 text-sm font-medium border-b-2 ${clientDetailTab === 'resumen' ? 'border-indigo-600 text-indigo-600' : 'border-transparent'}`}>Resumen</button>
                            <button onClick={() => setClientDetailTab('transacciones')} className={`px-6 py-4 text-sm font-medium border-b-2 ${clientDetailTab === 'transacciones' ? 'border-indigo-600 text-indigo-600' : 'border-transparent'}`}>Transacciones</button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8">
                            {clientDetailTab === 'resumen' && (
                                <div className="space-y-8">
                                    <div>
                                        <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center">
                                            <StickyNote className="w-5 h-5 mr-2 text-indigo-600" /> Bitácora
                                        </h3>
                                        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 shadow-sm mb-6">
                                            <textarea 
                                                className="w-full p-3 border border-slate-200 rounded-lg text-sm resize-none outline-none mb-3 bg-white dark:bg-slate-800 dark:text-white"
                                                rows={2}
                                                placeholder="Escribe una nota..."
                                                value={newNote}
                                                onChange={(e) => setNewNote(e.target.value)}
                                            ></textarea>
                                            <div className="flex justify-end">
                                                <button onClick={handleAddInteraction} disabled={!newNote.trim()} className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700">Agregar Nota</button>
                                            </div>
                                        </div>
                                        <div className="space-y-6 relative before:absolute before:left-4 before:top-0 before:bottom-0 before:w-0.5 before:bg-slate-200">
                                            {clientInteractions.map((interaction) => (
                                                <div key={interaction.id} className="relative pl-10">
                                                    <div className="absolute left-[11px] top-1 w-2.5 h-2.5 rounded-full bg-white border-2 border-indigo-600 z-10"></div>
                                                    <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 shadow-sm">
                                                        <div className="flex justify-between items-start mb-2">
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-bold text-slate-900 dark:text-white text-sm">{interaction.user}</span>
                                                                <span className="text-xs text-slate-500">• {new Date(interaction.date).toLocaleDateString()}</span>
                                                            </div>
                                                        </div>
                                                        <p className="text-sm text-slate-600 dark:text-slate-300">{interaction.summary}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {clientDetailTab === 'transacciones' && (
                                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                                    <table className="w-full text-sm">
                                        <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200">
                                            <tr>
                                                <th className="p-4 text-left font-bold text-slate-500">Fecha</th>
                                                <th className="p-4 text-left font-bold text-slate-500">Concepto</th>
                                                <th className="p-4 text-center font-bold text-slate-500">Tipo</th>
                                                <th className="p-4 text-right font-bold text-slate-500">Monto</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                            {clientTransactions.map((tx: any) => (
                                                <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                                                    <td className="p-4 text-slate-600">{new Date(tx.date).toLocaleDateString()}</td>
                                                    <td className="p-4">
                                                        <span className="font-medium text-slate-900 dark:text-white block">{tx.displayType === 'sale' ? `Venta #${tx.id}` : `Abono ${tx.method}`}</span>
                                                    </td>
                                                    <td className="p-4 text-center">
                                                        <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${tx.displayType === 'sale' ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'}`}>
                                                            {tx.displayType === 'sale' ? 'Cargo' : 'Abono'}
                                                        </span>
                                                    </td>
                                                    <td className={`p-4 text-right font-bold ${tx.displayType === 'sale' ? 'text-slate-900 dark:text-white' : 'text-emerald-600'}`}>
                                                        {tx.displayType === 'sale' ? '' : '-'}${ (tx.amount || tx.total).toLocaleString(undefined, {minimumFractionDigits: 2}) }
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        )}

        <NewClientModal 
            isOpen={isNewClientModalOpen} 
            onClose={() => { setIsNewClientModalOpen(false); setClientToEdit(undefined); }} 
            onSave={handleSaveClient} 
            initialData={clientToEdit} 
        />
      </>
    );
};
