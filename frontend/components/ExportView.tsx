
import React, { useState } from 'react';
import { 
  Download, FileSpreadsheet, FileText, Database, Calendar, 
  CheckCircle2, AlertCircle, Clock, Shield, Lock, History,
  ChevronRight, Filter
} from 'lucide-react';

const EXPORT_MODULES = [
  { id: 'sales', name: 'Ventas y Facturación', count: 1250, icon: FileText },
  { id: 'inventory', name: 'Inventario y Stock', count: 450, icon: Database },
  { id: 'finance', name: 'Registros Financieros', count: 890, icon: FileSpreadsheet },
  { id: 'crm', name: 'Base de Datos Clientes', count: 220, icon: Database },
  { id: 'hr', name: 'Nómina y Empleados', count: 45, icon: FileText },
];

const EXPORT_HISTORY = [
  { id: 1, name: 'Backup_Mensual_Oct2025.zip', type: 'Full Backup', date: '01 Nov 2025, 02:00 AM', user: 'System (Auto)', size: '45.2 MB' },
  { id: 2, name: 'Reporte_Ventas_Q3.xlsx', type: 'Ventas', date: '15 Oct 2025, 10:30 AM', user: 'Roberto Diaz', size: '1.2 MB' },
  { id: 3, name: 'Inventario_Cierre_Sep.csv', type: 'Inventario', date: '30 Sep 2025, 06:15 PM', user: 'Ana Torres', size: '850 KB' },
];

export const ExportView: React.FC = () => {
  const [selectedFormat, setSelectedFormat] = useState('excel');
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const toggleModule = (id: string) => {
    if (selectedModules.includes(id)) {
      setSelectedModules(selectedModules.filter(m => m !== id));
    } else {
      setSelectedModules([...selectedModules, id]);
    }
  };

  const handleExport = () => {
    setIsProcessing(true);
    // Simulate API call
    setTimeout(() => {
      setIsProcessing(false);
      setIsComplete(true);
    }, 2000);
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#f8fafc] dark:bg-slate-950 transition-colors duration-300 p-4 sm:p-8">
      <div className="max-w-[1400px] mx-auto w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2 bg-blue-600 rounded-lg text-white">
                <Download className="w-6 h-6" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Centro de Exportación de Datos</h1>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Extrae información masiva para auditorías, respaldos o análisis externos.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Left Panel: Configuration */}
          <div className="xl:col-span-2 space-y-6">
            
            {/* Step 1: Select Data */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                <h3 className="font-bold text-slate-900 dark:text-white flex items-center">
                  <span className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center text-xs font-bold mr-3">1</span>
                  Seleccionar Módulos de Datos
                </h3>
              </div>
              <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {EXPORT_MODULES.map((mod) => (
                  <div 
                    key={mod.id}
                    onClick={() => toggleModule(mod.id)}
                    className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      selectedModules.includes(mod.id) 
                      ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:border-blue-500' 
                      : 'border-slate-100 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className={`p-3 rounded-full mr-4 ${selectedModules.includes(mod.id) ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}>
                      <mod.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className={`font-bold text-sm ${selectedModules.includes(mod.id) ? 'text-blue-900 dark:text-blue-300' : 'text-slate-700 dark:text-slate-300'}`}>{mod.name}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{mod.count} registros disponibles</p>
                    </div>
                    {selectedModules.includes(mod.id) && (
                      <CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-blue-400 ml-auto" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Step 2: Settings */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                <h3 className="font-bold text-slate-900 dark:text-white flex items-center">
                  <span className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center text-xs font-bold mr-3">2</span>
                  Configuración de Salida
                </h3>
              </div>
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Formato de Archivo</label>
                      <div className="flex gap-3">
                        {['excel', 'csv', 'json', 'pdf'].map(fmt => (
                          <button
                            key={fmt}
                            onClick={() => setSelectedFormat(fmt)}
                            className={`flex-1 py-2.5 px-3 rounded-lg text-sm font-medium border uppercase ${
                              selectedFormat === fmt 
                              ? 'bg-slate-900 dark:bg-indigo-600 text-white border-slate-900 dark:border-indigo-600' 
                              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                            }`}
                          >
                            {fmt}
                          </button>
                        ))}
                      </div>
                   </div>
                   <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Rango de Fechas</label>
                      <div className="relative">
                        <input type="text" className="w-full pl-10 pr-4 py-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg text-sm dark:text-white" placeholder="Últimos 30 días" readOnly />
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                      </div>
                   </div>
                </div>

                <div className="flex items-start p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 rounded-lg">
                  <Lock className="w-5 h-5 text-amber-600 dark:text-amber-400 mr-3 mt-0.5" />
                  <div>
                    <h5 className="text-sm font-bold text-amber-900 dark:text-amber-300">Protección de Datos</h5>
                    <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">
                      Los datos sensibles (PII) serán automáticamente encriptados o anonimizados según la política de privacidad de la empresa.
                      <span className="underline cursor-pointer ml-1">Ver política.</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action */}
            <div className="flex justify-end">
               <button 
                 onClick={handleExport}
                 disabled={selectedModules.length === 0 || isProcessing}
                 className={`px-8 py-4 rounded-xl font-bold text-white shadow-lg transition-all flex items-center
                    ${selectedModules.length === 0 
                      ? 'bg-slate-300 dark:bg-slate-700 cursor-not-allowed' 
                      : isProcessing 
                        ? 'bg-blue-500 cursor-wait'
                        : 'bg-blue-600 hover:bg-blue-700 hover:shadow-blue-600/30 hover:-translate-y-1'}`}
               >
                 {isProcessing ? 'Generando Archivos...' : isComplete ? '¡Exportación Lista!' : 'Generar Exportación'}
                 {!isProcessing && !isComplete && <ChevronRight className="w-5 h-5 ml-2" />}
               </button>
            </div>
            
            {isComplete && (
               <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4 flex justify-between items-center animate-in fade-in slide-in-from-bottom-4">
                  <div className="flex items-center">
                     <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400 mr-3" />
                     <div>
                        <p className="font-bold text-emerald-900 dark:text-emerald-300">Descarga lista</p>
                        <p className="text-sm text-emerald-700 dark:text-emerald-400">export_20251119_full.zip (12.5 MB)</p>
                     </div>
                  </div>
                  <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold hover:bg-emerald-700">
                     Descargar Ahora
                  </button>
               </div>
            )}

          </div>

          {/* Right Panel: History */}
          <div className="space-y-6">
             <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden h-full">
                <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                   <h3 className="font-bold text-slate-900 dark:text-white flex items-center">
                      <History className="w-5 h-5 mr-2 text-slate-500 dark:text-slate-400" />
                      Historial de Descargas
                   </h3>
                   <button className="p-2 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg"><Filter className="w-4 h-4" /></button>
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                   {EXPORT_HISTORY.map((item) => (
                      <div key={item.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                         <div className="flex items-start justify-between mb-1">
                            <div className="flex items-center">
                               <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded text-slate-500 dark:text-slate-400 mr-3">
                                  <FileSpreadsheet className="w-4 h-4" />
                               </div>
                               <div>
                                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate max-w-[150px]">{item.name}</p>
                                  <p className="text-xs text-slate-500 dark:text-slate-400">{item.type}</p>
                               </div>
                            </div>
                            <span className="text-xs font-mono text-slate-400">{item.size}</span>
                         </div>
                         <div className="flex justify-between items-center mt-2 pl-11">
                            <span className="text-[10px] text-slate-400 flex items-center">
                               <Clock className="w-3 h-3 mr-1" /> {item.date}
                            </span>
                            <button className="text-xs text-blue-600 dark:text-blue-400 font-medium hover:underline">Volver a descargar</button>
                         </div>
                      </div>
                   ))}
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 text-center">
                   <button className="text-sm text-slate-600 dark:text-slate-400 font-medium hover:text-slate-900 dark:hover:text-white">Ver historial completo</button>
                </div>
             </div>
             
             <div className="bg-slate-900 dark:bg-indigo-950 rounded-xl p-6 text-white">
                 <Shield className="w-10 h-10 text-blue-400 mb-4" />
                 <h4 className="font-bold text-lg mb-2">Auditoría de Datos</h4>
                 <p className="text-slate-400 text-sm mb-4">Todas las exportaciones quedan registradas en el log de seguridad del sistema por cumplimiento normativo.</p>
                 <div className="w-full bg-slate-800 dark:bg-indigo-900 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-blue-500 h-full w-3/4"></div>
                 </div>
                 <p className="text-xs text-slate-500 mt-2 text-right">Almacenamiento de logs: 75%</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};
