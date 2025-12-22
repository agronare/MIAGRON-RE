
import React, { useState } from 'react';
import { 
  FlaskConical, TestTube, ClipboardCheck, Activity, AlertCircle, 
  Search, Filter, Plus, FileCheck, QrCode, Thermometer, Scale, 
  Clock, CheckCircle2, ChevronRight, Microscope, FileText, AlertTriangle,
  BarChart3, History, Settings, Download, Printer, Save, Trash2
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend 
} from 'recharts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Clean Data
const SAMPLES_DATA: any[] = [];
const ANALYTICS_DATA: any[] = [];

type LIMSTab = 'dashboard' | 'muestras' | 'resultados' | 'equipos' | 'certificados';

const getStatusColor = (status: string) => {
    switch (status) {
      case 'Recibido': return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300';
      case 'En Análisis': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400';
      case 'Validación': return 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400';
      case 'Completado': return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400';
      default: return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Urgente': return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
      case 'Alta': return 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800';
      default: return 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800';
    }
  };

  // --- Components ---

  const DashboardTab = () => (
    <div className="animate-fadeIn space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
                    <TestTube className="w-6 h-6" />
                </div>
                <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase">Muestras Activas</p>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">0</h3>
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center">
                        <Activity className="w-3 h-3 mr-1" /> -
                    </span>
                </div>
            </div>
            {/* ... other KPIs ... */}
             <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
                <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg">
                    <FileCheck className="w-6 h-6" />
                </div>
                <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase">Liberados (Semana)</p>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">0</h3>
                    <span className="text-xs text-slate-400 font-medium">-</span>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-slate-900 dark:text-white flex items-center">
                        <BarChart3 className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
                        Volumen de Muestras (Semanal)
                    </h3>
                </div>
                <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={ANALYTICS_DATA}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-slate-700" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} />
                            <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', backgroundColor: '#fff', color: '#0f172a' }} />
                            <Bar dataKey="muestras" name="Recibidas" fill="#94a3b8" radius={[4,4,0,0]} />
                            <Bar dataKey="procesadas" name="Procesadas" fill="#3b82f6" radius={[4,4,0,0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    </div>
  );

  const SamplesTab = ({ searchTerm, setSearchTerm }: { searchTerm: string, setSearchTerm: (term: string) => void }) => (
    <div className="animate-fadeIn bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50 dark:bg-slate-800/50">
             <div className="flex gap-3 w-full sm:w-auto">
                 <div className="relative flex-1 sm:w-64">
                     <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                     <input 
                        type="text" 
                        placeholder="Buscar ID, cliente..." 
                        className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:border-blue-500 dark:focus:border-blue-500 bg-white dark:bg-slate-800 dark:text-white"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                     />
                 </div>
             </div>
        </div>
        
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                    <tr>
                        <th className="text-left py-4 px-6 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">ID Muestra</th>
                        <th className="text-left py-4 px-6 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Cliente / Matriz</th>
                        <th className="text-left py-4 px-6 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Recepción</th>
                        <th className="text-center py-4 px-6 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Prioridad</th>
                        <th className="text-center py-4 px-6 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Estado</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {SAMPLES_DATA.length > 0 ? SAMPLES_DATA.map(sample => (
                        <tr key={sample.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                            <td className="py-4 px-6">
                                <span className="font-mono font-medium text-slate-700 dark:text-slate-300 text-sm">{sample.id}</span>
                            </td>
                            <td className="py-4 px-6">
                                <p className="text-sm font-bold text-slate-900 dark:text-white">{sample.client}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">{sample.matrix}</p>
                            </td>
                            <td className="py-4 px-6">
                                <p className="text-xs text-slate-500 dark:text-slate-400">{sample.received}</p>
                            </td>
                            <td className="py-4 px-6 text-center">
                                 <span className={`px-2 py-1 rounded text-xs font-bold border ${getPriorityColor(sample.priority)}`}>
                                     {sample.priority}
                                 </span>
                            </td>
                            <td className="py-4 px-6 text-center">
                                 <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(sample.status)}`}>
                                     {sample.status}
                                 </span>
                            </td>
                        </tr>
                    )) : (
                         <tr>
                            <td colSpan={5} className="py-12 text-center text-slate-500 dark:text-slate-400 text-sm">
                                No hay muestras registradas.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    </div>
  );

  const ResultsEntryTab = () => {
    const [selectedSample, setSelectedSample] = useState<string>('');
    const [parameters, setParameters] = useState([{ name: 'pH', value: '', unit: '' }, { name: 'Nitrógeno', value: '', unit: '%' }]);

    const handleSave = () => {
        if(!selectedSample) return alert("Seleccione una muestra.");
        alert("Resultados guardados correctamente.");
        setParameters([{ name: 'pH', value: '', unit: '' }, { name: 'Nitrógeno', value: '', unit: '%' }]);
        setSelectedSample('');
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
            <div className="lg:col-span-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 overflow-hidden">
                <h3 className="font-bold text-slate-900 dark:text-white mb-4">Muestras Pendientes</h3>
                <div className="space-y-2">
                    {SAMPLES_DATA.filter(s => s.status === 'En Análisis').length > 0 ? (
                         SAMPLES_DATA.filter(s => s.status === 'En Análisis').map(s => (
                            <div 
                                key={s.id} 
                                onClick={() => setSelectedSample(s.id)}
                                className={`p-3 border rounded-lg cursor-pointer transition-colors ${selectedSample === s.id ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                            >
                                <p className="font-bold text-sm text-slate-800 dark:text-white">{s.id}</p>
                                <p className="text-xs text-slate-500">{s.matrix}</p>
                            </div>
                        ))
                    ) : (
                         <p className="text-xs text-slate-400 italic p-2">No hay muestras pendientes de análisis.</p>
                    )}
                </div>
            </div>
            
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6">
                <h3 className="font-bold text-slate-900 dark:text-white mb-6 flex items-center">
                    <Microscope className="w-5 h-5 mr-2 text-indigo-600" /> Captura de Resultados
                </h3>
                
                {selectedSample ? (
                    <div className="space-y-4">
                        <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg mb-4">
                            <p className="text-sm font-medium">Capturando para: <span className="font-bold">{selectedSample}</span></p>
                        </div>
                        
                        {parameters.map((param, idx) => (
                            <div key={idx} className="flex gap-4 items-end">
                                <div className="flex-1">
                                    <label className="text-xs font-bold text-slate-500 uppercase mb-1">Parámetro</label>
                                    <input type="text" value={param.name} className="w-full p-2 border rounded bg-slate-100" readOnly />
                                </div>
                                <div className="flex-1">
                                    <label className="text-xs font-bold text-slate-500 uppercase mb-1">Valor</label>
                                    <input 
                                        type="number" 
                                        value={param.value} 
                                        onChange={(e) => {
                                            const newParams = [...parameters];
                                            newParams[idx].value = e.target.value;
                                            setParameters(newParams);
                                        }}
                                        className="w-full p-2 border border-slate-300 rounded focus:border-blue-500 outline-none" 
                                        placeholder="0.00"
                                    />
                                </div>
                                <div className="w-20">
                                    <label className="text-xs font-bold text-slate-500 uppercase mb-1">Unidad</label>
                                    <input type="text" value={param.unit} onChange={(e) => {
                                         const newParams = [...parameters];
                                         newParams[idx].unit = e.target.value;
                                         setParameters(newParams);
                                    }} className="w-full p-2 border border-slate-300 rounded" placeholder="mg/L" />
                                </div>
                            </div>
                        ))}
                        
                        <div className="pt-4 flex justify-end">
                            <button onClick={handleSave} className="px-6 py-2 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700 flex items-center">
                                <Save className="w-4 h-4 mr-2" /> Guardar Resultados
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="h-64 flex flex-col items-center justify-center text-slate-400">
                        <TestTube className="w-12 h-12 mb-3 opacity-20" />
                        <p>Selecciona una muestra para ingresar datos.</p>
                    </div>
                )}
            </div>
        </div>
    );
  };

  const InstrumentsTab = () => {
      const [instruments, setInstruments] = useState<any[]>([]);
      
      return (
          <div className="animate-fadeIn">
              <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Inventario de Instrumentos</h3>
                  <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">
                      <Plus className="w-4 h-4 mr-2 inline" /> Nuevo Equipo
                  </button>
              </div>
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                  <table className="w-full text-sm">
                      <thead className="bg-slate-50 dark:bg-slate-800 border-b dark:border-slate-700">
                          <tr>
                              <th className="p-4 text-left">ID</th>
                              <th className="p-4 text-left">Equipo</th>
                              <th className="p-4 text-center">Estado</th>
                              <th className="p-4 text-left">Última Calibración</th>
                              <th className="p-4 text-right">Acciones</th>
                          </tr>
                      </thead>
                      <tbody>
                          {instruments.length > 0 ? instruments.map(inst => (
                              <tr key={inst.id} className="border-b dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                  <td className="p-4 font-mono text-slate-500">{inst.id}</td>
                                  <td className="p-4 font-medium text-slate-900 dark:text-white">{inst.name}</td>
                                  <td className="p-4 text-center">
                                      <span className={`px-2 py-1 rounded text-xs font-bold ${inst.status === 'Operativo' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                          {inst.status}
                                      </span>
                                  </td>
                                  <td className="p-4 text-slate-600">{inst.lastCal}</td>
                                  <td className="p-4 text-right">
                                      <button className="text-slate-400 hover:text-indigo-600 mr-2"><Settings className="w-4 h-4" /></button>
                                  </td>
                              </tr>
                          )) : (
                              <tr><td colSpan={5} className="p-8 text-center text-slate-400">No hay equipos registrados.</td></tr>
                          )}
                      </tbody>
                  </table>
              </div>
          </div>
      );
  };

  const CertificatesTab = () => {
      const generateCOA = (sample: any) => {
          const doc = new jsPDF();
          doc.setFontSize(18);
          doc.text("CERTIFICADO DE ANÁLISIS (COA)", 105, 20, { align: 'center' });
          
          doc.setFontSize(10);
          doc.text(`ID Muestra: ${sample.id}`, 14, 35);
          doc.text(`Cliente: ${sample.client}`, 14, 40);
          doc.text(`Matriz: ${sample.matrix}`, 14, 45);
          doc.text(`Fecha Emisión: ${new Date().toLocaleDateString()}`, 14, 50);

          if (sample.params && sample.params.length > 0) {
              const body = sample.params.map((p: any) => [p.name, p.value, p.unit, 'Conforme']);
              autoTable(doc, {
                  startY: 60,
                  head: [['Parámetro', 'Resultado', 'Unidad', 'Evaluación']],
                  body: body,
                  theme: 'grid'
              });
          } else {
              doc.text("Resultados no disponibles.", 14, 65);
          }
          
          // Footer
          const finalY = (doc as any).lastAutoTable?.finalY || 80;
          doc.text("Validado por: Gerencia Técnica LIMS", 14, finalY + 20);
          doc.text("Este documento es generado electrónicamente.", 14, finalY + 30);

          doc.save(`COA_${sample.id}.pdf`);
      };

      return (
          <div className="animate-fadeIn grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {SAMPLES_DATA.filter(s => s.status === 'Completado').map(s => (
                  <div key={s.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
                      <div className="flex justify-between items-start mb-2">
                          <FileCheck className="w-8 h-8 text-emerald-500" />
                          <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-1 rounded font-bold">Disponible</span>
                      </div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-lg">{s.id}</h4>
                      <p className="text-sm text-slate-500 mb-4">{s.client} - {s.matrix}</p>
                      <button 
                          onClick={() => generateCOA(s)}
                          className="w-full py-2 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 flex items-center justify-center font-medium text-sm transition-colors"
                      >
                          <Download className="w-4 h-4 mr-2" /> Descargar PDF
                      </button>
                  </div>
              ))}
              {SAMPLES_DATA.filter(s => s.status === 'Completado').length === 0 && (
                  <p className="col-span-3 text-center text-slate-400 py-10">No hay certificados listos para descarga.</p>
              )}
          </div>
      );
  };

export const LIMSView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<LIMSTab>('dashboard');
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#f8fafc] dark:bg-slate-950 transition-colors duration-300 p-4 sm:p-8">
        <div className="max-w-[1400px] mx-auto w-full">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-emerald-600 rounded-xl shadow-lg shadow-emerald-200 dark:shadow-none">
                        <FlaskConical className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">LIMS - Laboratorio</h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">Sistema de Gestión de Información de Laboratorio.</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center px-4 py-2.5 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 shadow-sm shadow-emerald-600/20 transition-all">
                        <Plus className="w-4 h-4 mr-2" />
                        Nueva Muestra
                    </button>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex overflow-x-auto no-scrollbar gap-1 p-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl w-full md:w-fit mb-8 shadow-sm">
                {[
                    { id: 'dashboard', label: 'Dashboard', icon: Activity },
                    { id: 'muestras', label: 'Gestión de Muestras', icon: TestTube },
                    { id: 'resultados', label: 'Entrada de Resultados', icon: Microscope },
                    { id: 'equipos', label: 'Instrumentos', icon: Settings },
                    { id: 'certificados', label: 'Certificados (COA)', icon: FileCheck },
                ].map((tab) => (
                    <button 
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as LIMSTab)}
                        className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                            activeTab === tab.id 
                            ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' 
                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                    >
                        <tab.icon className="w-4 h-4 mr-2" />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="min-h-[500px]">
                {activeTab === 'dashboard' && <DashboardTab />}
                {activeTab === 'muestras' && <SamplesTab searchTerm={searchTerm} setSearchTerm={setSearchTerm} />}
                {activeTab === 'resultados' && <ResultsEntryTab />}
                {activeTab === 'equipos' && <InstrumentsTab />}
                {activeTab === 'certificados' && <CertificatesTab />}
            </div>
        </div>
    </div>
  );
};
