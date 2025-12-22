
import React, { useState, useMemo, useRef } from 'react';
import { 
    ShieldCheck, AlertTriangle, XCircle, CheckCircle, FileText, 
    Users, HardHat, Lock, Search, Filter, Plus, AlertOctagon, 
    FileSignature, Download, ExternalLink, Brain, RefreshCw,
    UploadCloud, Eye, X, Save, Calendar, MapPin, Camera,
    MessageSquare, TrendingDown, Loader2, DollarSign, CheckSquare, Mail,
    ArrowRight, Send, Image as ImageIcon, File, Calculator, Check, Laptop, Key, Briefcase
} from 'lucide-react';
import { COMPLIANCE_DATA } from '../../constants';
import { ComplianceRecord, Employee } from '../../types';

// --- Types ---
interface DocumentItem {
    id: string;
    name: string;
    status: 'Valid' | 'Missing' | 'Expired' | 'Review';
    expiryDate?: string;
    fileUrl?: string;
    type?: 'PDF' | 'IMG';
}

interface SafetyIncident {
    id: string;
    type: 'Accidente' | 'Incidente' | 'Condición Insegura';
    severity: 'Baja' | 'Media' | 'Alta';
    location: string;
    description: string;
    date: string;
    status: 'Abierto' | 'En Investigación' | 'Cerrado';
}

interface OffboardingCase {
    id: string;
    employeeName: string;
    role: string;
    type: 'Renuncia' | 'Despido Justificado' | 'Despido Injustificado';
    status: 'Entrevista' | 'Cálculo' | 'Firma' | 'Concluido';
    severanceAmount: number; // Finiquito/Liquidación
    date: string;
}

interface EthicsMessage {
    id: string;
    date: string;
    subject: string;
    message: string;
    status: 'Nuevo' | 'Leído';
    isAnonymous: boolean;
}

// --- Mock Data ---
const REQUIRED_DOCS: DocumentItem[] = [
    { id: 'doc1', name: 'Contrato Individual de Trabajo', status: 'Valid', expiryDate: '2025-12-31', type: 'PDF' },
    { id: 'doc2', name: 'Identificación Oficial (INE/Passport)', status: 'Valid', type: 'IMG' },
    { id: 'doc3', name: 'Comprobante de Domicilio', status: 'Expired', expiryDate: '2024-01-01', type: 'PDF' },
    { id: 'doc4', name: 'Constancia de Situación Fiscal', status: 'Missing', type: 'PDF' },
    { id: 'doc5', name: 'NSS (Seguro Social)', status: 'Valid', type: 'PDF' },
];

const INITIAL_INCIDENTS: SafetyIncident[] = [
    { id: 'INC-001', type: 'Condición Insegura', severity: 'Media', location: 'Almacén B', description: 'Piso resbaloso por derrame de aceite.', date: '2025-11-10', status: 'Cerrado' },
    { id: 'INC-002', type: 'Incidente', severity: 'Baja', location: 'Campo Sector 4', description: 'Ruptura de manguera de riego a alta presión.', date: '2025-11-15', status: 'En Investigación' },
];

const INITIAL_OFFBOARDING: OffboardingCase[] = [
    { id: 'BJ-001', employeeName: 'Pedro Sánchez', role: 'Jornalero', type: 'Renuncia', status: 'Firma', severanceAmount: 15400, date: '2025-11-01' }
];

const INITIAL_ETHICS_MESSAGES: EthicsMessage[] = [
    { id: '1', date: '2025-11-18', subject: 'Reporte de Conducta', message: 'Un supervisor en planta 2 utiliza lenguaje inapropiado.', status: 'Nuevo', isAnonymous: true },
    { id: '2', date: '2025-11-15', subject: 'Seguridad', message: 'Las botas entregadas el mes pasado son de mala calidad.', status: 'Leído', isAnonymous: true },
];

// --- Modals ---

const OffboardingModal = ({ isOpen, onClose, onSave, caseData }: { isOpen: boolean, onClose: () => void, onSave: (updatedCase: OffboardingCase) => void, caseData: OffboardingCase | null }) => {
    const [formData, setFormData] = useState<OffboardingCase | null>(null);
    const [checklist, setChecklist] = useState({
        equipment: false,
        access: false,
        exitInterview: false,
        imss: false
    });
    // Simulation inputs for calculation
    const [dailySalary, setDailySalary] = useState(500);
    const [yearsWorked, setYearsWorked] = useState(2);
    const [pendingVacation, setPendingVacation] = useState(6);

    React.useEffect(() => {
        if (isOpen && caseData) {
            setFormData(caseData);
            // Reset checklist or load from mock if available
            setChecklist({ equipment: false, access: false, exitInterview: false, imss: false });
        }
    }, [isOpen, caseData]);

    if (!isOpen || !formData) return null;

    const calculateSeverance = () => {
        // Simple Mock Calculation based on Mexican Law (Approximate)
        let total = 0;
        
        // Aguinaldo Proporcional (15 days / 365 * worked days this year ~ assumed full year for simplicity)
        total += dailySalary * 15; 
        
        // Vacaciones Pendientes
        total += dailySalary * pendingVacation;
        
        // Prima Vacacional (25%)
        total += (dailySalary * pendingVacation) * 0.25;

        // If termination (Despido)
        if (formData.type.includes('Despido')) {
            total += dailySalary * 90; // 3 months indemnity
            total += dailySalary * 20 * yearsWorked; // 20 days per year
        }

        // Prima Antigüedad (12 days per year)
        total += (dailySalary * 12 * yearsWorked);

        setFormData({ ...formData, severanceAmount: Math.round(total) });
    };

    const handleSave = () => {
        onSave(formData);
        onClose();
    };

    const stages = ['Entrevista', 'Cálculo', 'Firma', 'Concluido'];
    const currentStageIndex = stages.indexOf(formData.status);

    return (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl flex flex-col max-h-[90vh] animate-in zoom-in-95">
                {/* Header */}
                <div className="p-6 border-b flex justify-between items-center bg-slate-50 rounded-t-xl">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 flex items-center">
                            <Briefcase className="w-5 h-5 mr-2 text-indigo-600" /> Gestión de Baja
                        </h2>
                        <p className="text-sm text-slate-500">{formData.employeeName} • {formData.role} • {formData.type}</p>
                    </div>
                    <button onClick={onClose}><X className="text-slate-400 hover:text-slate-600" /></button>
                </div>

                <div className="flex-1 overflow-y-auto p-8">
                    {/* Stage Stepper */}
                    <div className="flex justify-between items-center mb-8 px-4">
                        {stages.map((stage, idx) => (
                            <div key={stage} className="flex flex-col items-center relative z-10">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-colors duration-300 border-2
                                    ${idx <= currentStageIndex ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-400 border-slate-200'}`}>
                                    {idx < currentStageIndex ? <Check className="w-4 h-4" /> : idx + 1}
                                </div>
                                <span className={`text-xs mt-2 font-medium ${idx <= currentStageIndex ? 'text-indigo-700' : 'text-slate-400'}`}>
                                    {stage}
                                </span>
                                {idx < stages.length - 1 && (
                                    <div className={`absolute top-4 left-full w-[calc(100%_+_3rem)] h-0.5 -translate-y-1/2 -z-10
                                        ${idx < currentStageIndex ? 'bg-indigo-600' : 'bg-slate-200'}`}></div>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Calculator Section */}
                        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                            <h4 className="font-bold text-slate-800 mb-4 flex items-center">
                                <Calculator className="w-4 h-4 mr-2 text-slate-500" /> Simulador de Finiquito
                            </h4>
                            <div className="space-y-3 text-sm">
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="block text-xs text-slate-500 mb-1">Salario Diario</label>
                                        <input type="number" value={dailySalary} onChange={e => setDailySalary(Number(e.target.value))} className="w-full p-2 border rounded bg-white"/>
                                    </div>
                                    <div>
                                        <label className="block text-xs text-slate-500 mb-1">Años Antigüedad</label>
                                        <input type="number" value={yearsWorked} onChange={e => setYearsWorked(Number(e.target.value))} className="w-full p-2 border rounded bg-white"/>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs text-slate-500 mb-1">Días Vacaciones Pendientes</label>
                                    <input type="number" value={pendingVacation} onChange={e => setPendingVacation(Number(e.target.value))} className="w-full p-2 border rounded bg-white"/>
                                </div>
                                <button 
                                    onClick={calculateSeverance}
                                    className="w-full py-2 bg-white border border-indigo-200 text-indigo-600 font-bold rounded hover:bg-indigo-50 transition-colors mt-2 text-xs"
                                >
                                    Recalcular Monto
                                </button>
                                <div className="pt-4 border-t border-slate-200 mt-2">
                                    <p className="text-slate-500 text-xs">Total Estimado a Pagar</p>
                                    <p className="text-2xl font-bold text-slate-900">${formData.severanceAmount.toLocaleString()}</p>
                                </div>
                            </div>
                        </div>

                        {/* Checklist & Status */}
                        <div className="space-y-6">
                            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                                <h4 className="font-bold text-slate-800 mb-4 flex items-center">
                                    <CheckSquare className="w-4 h-4 mr-2 text-slate-500" /> Checklist de Salida
                                </h4>
                                <div className="space-y-2">
                                    <label className="flex items-center p-2 hover:bg-slate-50 rounded cursor-pointer">
                                        <input type="checkbox" checked={checklist.equipment} onChange={e => setChecklist({...checklist, equipment: e.target.checked})} className="w-4 h-4 text-indigo-600 rounded border-slate-300 mr-3" />
                                        <span className="text-sm text-slate-700 flex items-center"><Laptop className="w-3 h-3 mr-2 text-slate-400"/> Devolución de Equipo</span>
                                    </label>
                                    <label className="flex items-center p-2 hover:bg-slate-50 rounded cursor-pointer">
                                        <input type="checkbox" checked={checklist.access} onChange={e => setChecklist({...checklist, access: e.target.checked})} className="w-4 h-4 text-indigo-600 rounded border-slate-300 mr-3" />
                                        <span className="text-sm text-slate-700 flex items-center"><Key className="w-3 h-3 mr-2 text-slate-400"/> Baja de Accesos/Sistemas</span>
                                    </label>
                                    <label className="flex items-center p-2 hover:bg-slate-50 rounded cursor-pointer">
                                        <input type="checkbox" checked={checklist.imss} onChange={e => setChecklist({...checklist, imss: e.target.checked})} className="w-4 h-4 text-indigo-600 rounded border-slate-300 mr-3" />
                                        <span className="text-sm text-slate-700 flex items-center"><ShieldCheck className="w-3 h-3 mr-2 text-slate-400"/> Baja ante IMSS</span>
                                    </label>
                                    <label className="flex items-center p-2 hover:bg-slate-50 rounded cursor-pointer">
                                        <input type="checkbox" checked={checklist.exitInterview} onChange={e => setChecklist({...checklist, exitInterview: e.target.checked})} className="w-4 h-4 text-indigo-600 rounded border-slate-300 mr-3" />
                                        <span className="text-sm text-slate-700 flex items-center"><MessageSquare className="w-3 h-3 mr-2 text-slate-400"/> Entrevista de Salida</span>
                                    </label>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Actualizar Etapa</label>
                                <select 
                                    className="w-full p-3 border border-slate-200 rounded-lg bg-white text-sm font-medium focus:border-indigo-500 outline-none"
                                    value={formData.status}
                                    onChange={e => setFormData({...formData, status: e.target.value as any})}
                                >
                                    <option value="Entrevista">Entrevista</option>
                                    <option value="Cálculo">Cálculo</option>
                                    <option value="Firma">Firma de Documentos</option>
                                    <option value="Concluido">Concluido</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t bg-slate-50 flex justify-end gap-3 rounded-b-xl">
                    <button onClick={onClose} className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-100 font-medium text-sm">Cancelar</button>
                    <button onClick={handleSave} className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-bold flex items-center shadow-sm">
                        <Save className="w-4 h-4 mr-2" /> Guardar Cambios
                    </button>
                </div>
            </div>
        </div>
    );
};

const FilePreviewOverlay = ({ doc, onClose }: { doc: DocumentItem | null, onClose: () => void }) => {
    if (!doc) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl h-[85vh] flex flex-col overflow-hidden relative">
                <div className="p-4 border-b flex justify-between items-center bg-slate-50">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${doc.type === 'IMG' ? 'bg-blue-100 text-blue-600' : 'bg-red-100 text-red-600'}`}>
                            {doc.type === 'IMG' ? <ImageIcon className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900">{doc.name}</h3>
                            <p className="text-xs text-slate-500">Vista Previa • Solo Lectura</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="p-2 text-slate-500 hover:bg-slate-200 rounded-lg transition-colors" title="Descargar">
                            <Download className="w-5 h-5" />
                        </button>
                        <button onClick={onClose} className="p-2 text-slate-500 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors">
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>
                <div className="flex-1 bg-slate-100 p-8 flex items-center justify-center overflow-auto">
                    {/* Simulation of content based on type */}
                    <div className="bg-white shadow-lg border border-slate-200 w-full h-full max-w-3xl flex flex-col items-center justify-center p-10 text-center">
                        {doc.type === 'IMG' ? (
                            <div className="flex flex-col items-center">
                                <ImageIcon className="w-24 h-24 text-slate-300 mb-4" />
                                <p className="text-slate-400 font-medium">Vista previa de imagen simulada</p>
                                <p className="text-xs text-slate-300 mt-2">ID: {doc.id}</p>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center w-full h-full">
                                <div className="w-full h-full border-2 border-dashed border-slate-200 rounded-lg flex flex-col items-center justify-center bg-slate-50">
                                    <File className="w-16 h-16 text-slate-300 mb-4" />
                                    <p className="text-slate-500 font-bold text-lg">Documento PDF</p>
                                    <p className="text-slate-400 mt-1">Contenido del archivo simulado para demostración</p>
                                    <div className="mt-6 w-1/2 space-y-3 opacity-30">
                                        <div className="h-4 bg-slate-300 rounded w-3/4 mx-auto"></div>
                                        <div className="h-4 bg-slate-300 rounded w-full"></div>
                                        <div className="h-4 bg-slate-300 rounded w-5/6 mx-auto"></div>
                                        <div className="h-4 bg-slate-300 rounded w-full"></div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const EthicsModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
    const [view, setView] = useState<'list' | 'new'>('list');
    const [messages, setMessages] = useState<EthicsMessage[]>(INITIAL_ETHICS_MESSAGES);
    const [newMessage, setNewMessage] = useState({ subject: '', message: '' });

    if (!isOpen) return null;

    const handleSend = () => {
        if (!newMessage.subject || !newMessage.message) return alert("Por favor complete los campos.");
        
        const msg: EthicsMessage = {
            id: Date.now().toString(),
            date: new Date().toISOString().split('T')[0],
            subject: newMessage.subject,
            message: newMessage.message,
            status: 'Nuevo',
            isAnonymous: true
        };
        setMessages([msg, ...messages]);
        setNewMessage({ subject: '', message: '' });
        setView('list');
        alert("Reporte enviado anónimamente.");
    };

    return (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 animate-in zoom-in-95 flex flex-col max-h-[80vh]">
                <div className="flex justify-between items-center mb-4 border-b pb-4">
                    <h2 className="text-xl font-bold text-slate-900 flex items-center">
                        <Mail className="w-5 h-5 mr-2 text-indigo-600" /> Buzón Ético (Anónimo)
                    </h2>
                    <button onClick={onClose}><X className="text-slate-400 hover:text-slate-600" /></button>
                </div>

                {view === 'list' ? (
                    <div className="flex-1 overflow-y-auto space-y-3">
                        <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100 mb-4 flex justify-between items-center">
                            <p className="text-xs text-indigo-800">Este canal es confidencial y seguro.</p>
                            <button onClick={() => setView('new')} className="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded-lg font-bold hover:bg-indigo-700">
                                + Nuevo Reporte
                            </button>
                        </div>
                        {messages.map(msg => (
                            <div key={msg.id} className={`p-4 rounded-lg border ${msg.status === 'Nuevo' ? 'bg-white border-l-4 border-l-indigo-500 shadow-sm' : 'bg-slate-50 border-slate-200'}`}>
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-bold text-sm text-slate-800">{msg.subject}</h4>
                                    <span className="text-xs text-slate-500">{msg.date}</span>
                                </div>
                                <p className="text-sm text-slate-600">{msg.message}</p>
                                {msg.status === 'Nuevo' && (
                                    <div className="mt-2 flex justify-end">
                                        <span className="text-[10px] font-bold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded">Enviado</span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex-1 space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Asunto</label>
                            <select 
                                className="w-full p-2 border rounded-lg"
                                value={newMessage.subject}
                                onChange={e => setNewMessage({...newMessage, subject: e.target.value})}
                            >
                                <option value="">Seleccione un tema...</option>
                                <option value="Acoso Laboral">Acoso Laboral</option>
                                <option value="Seguridad">Condiciones de Seguridad</option>
                                <option value="Fraude">Fraude o Robo</option>
                                <option value="Discriminación">Discriminación</option>
                                <option value="Otro">Otro</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Mensaje Detallado</label>
                            <textarea 
                                className="w-full p-3 border rounded-lg h-32 resize-none"
                                placeholder="Describa la situación con el mayor detalle posible. Su identidad permanecerá protegida."
                                value={newMessage.message}
                                onChange={e => setNewMessage({...newMessage, message: e.target.value})}
                            ></textarea>
                        </div>
                        <div className="flex items-center text-xs text-slate-500 bg-slate-50 p-3 rounded">
                            <Lock className="w-4 h-4 mr-2 text-emerald-500" />
                            Reporte 100% anónimo y encriptado.
                        </div>
                    </div>
                )}

                <div className="mt-4 pt-4 border-t flex justify-end gap-2">
                    {view === 'new' ? (
                        <>
                            <button onClick={() => setView('list')} className="px-4 py-2 border rounded-lg text-slate-600 text-sm">Cancelar</button>
                            <button onClick={handleSend} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold flex items-center">
                                <Send className="w-4 h-4 mr-2" /> Enviar Reporte
                            </button>
                        </>
                    ) : (
                        <button onClick={onClose} className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-200">Cerrar</button>
                    )}
                </div>
            </div>
        </div>
    );
};

const DigitalFileModal = ({ isOpen, onClose, employee }: { isOpen: boolean, onClose: () => void, employee: ComplianceRecord | null }) => {
    const [docs, setDocs] = useState<DocumentItem[]>(REQUIRED_DOCS);
    const [viewingDoc, setViewingDoc] = useState<DocumentItem | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploadingId, setUploadingId] = useState<string | null>(null);

    if (!isOpen || !employee) return null;

    const handleFileClick = (docId: string) => {
        setUploadingId(docId);
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0] && uploadingId) {
            // Simulate upload process
            const newDocs = docs.map(d => {
                if (d.id === uploadingId) {
                    return { ...d, status: 'Valid' as const, expiryDate: '2026-12-31', type: 'PDF' as const }; // Simulate validation
                }
                return d;
            });
            setDocs(newDocs);
            setUploadingId(null);
        }
    };

    const getStatusBadge = (status: string) => {
        switch(status) {
            case 'Valid': return <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded text-xs font-bold flex items-center"><CheckCircle className="w-3 h-3 mr-1"/> Vigente</span>;
            case 'Missing': return <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-bold flex items-center"><XCircle className="w-3 h-3 mr-1"/> Faltante</span>;
            case 'Expired': return <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded text-xs font-bold flex items-center"><AlertTriangle className="w-3 h-3 mr-1"/> Vencido</span>;
            case 'Review': return <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-bold flex items-center"><RefreshCw className="w-3 h-3 mr-1 animate-spin"/> Revisión</span>;
            default: return null;
        }
    };

    return (
        <>
            <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95">
                    <div className="p-6 border-b flex justify-between items-center bg-slate-50 rounded-t-2xl">
                        <div>
                            <h2 className="text-xl font-bold text-slate-900 flex items-center">
                                <FileText className="w-5 h-5 mr-2 text-indigo-600" /> Expediente Digital
                            </h2>
                            <p className="text-sm text-slate-500">{employee.employeeName} • {employee.role}</p>
                        </div>
                        <button onClick={onClose}><X className="text-slate-400 hover:text-slate-600" /></button>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-6">
                        <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
                        <div className="space-y-3">
                            {docs.map(doc => (
                                <div key={doc.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-2 rounded-lg ${doc.status === 'Valid' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                                            {doc.type === 'IMG' ? <ImageIcon className="w-6 h-6" /> : <FileText className="w-6 h-6" />}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-800 text-sm">{doc.name}</p>
                                            {doc.expiryDate && <p className="text-xs text-slate-500">Vence: {doc.expiryDate}</p>}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        {getStatusBadge(doc.status)}
                                        {doc.status !== 'Valid' && doc.status !== 'Review' && (
                                            <button 
                                                onClick={() => handleFileClick(doc.id)}
                                                className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" 
                                                title="Cargar Documento"
                                            >
                                                <UploadCloud className="w-5 h-5" />
                                            </button>
                                        )}
                                        {doc.status === 'Valid' && (
                                            <button 
                                                onClick={() => setViewingDoc(doc)}
                                                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors" 
                                                title="Ver Documento"
                                            >
                                                <Eye className="w-5 h-5" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="p-4 border-t bg-slate-50 flex justify-end rounded-b-2xl">
                        <button onClick={onClose} className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-100 font-medium text-sm">Cerrar</button>
                    </div>
                </div>
            </div>
            
            {/* File Viewer Overlay */}
            <FilePreviewOverlay doc={viewingDoc} onClose={() => setViewingDoc(null)} />
        </>
    );
};

const IncidentReportModal = ({ isOpen, onClose, onSave }: { isOpen: boolean, onClose: () => void, onSave: (inc: SafetyIncident) => void }) => {
    const [formData, setFormData] = useState<Partial<SafetyIncident>>({
        type: 'Condición Insegura',
        severity: 'Baja',
        date: new Date().toISOString().split('T')[0],
        location: '',
        description: ''
    });

    if (!isOpen) return null;

    const handleSubmit = () => {
        if (!formData.location || !formData.description) return alert("Complete los campos obligatorios");
        onSave({
            ...formData as SafetyIncident,
            id: `INC-${Date.now()}`,
            status: 'Abierto'
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 animate-in zoom-in-95">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-bold text-slate-900 flex items-center">
                        <AlertOctagon className="w-5 h-5 mr-2 text-red-600" /> Reportar Incidente EHS
                    </h2>
                    <button onClick={onClose}><X className="text-slate-400 hover:text-slate-600" /></button>
                </div>
                
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tipo</label>
                            <select 
                                className="w-full p-2 border rounded-lg"
                                value={formData.type}
                                onChange={e => setFormData({...formData, type: e.target.value as any})}
                            >
                                <option>Accidente</option>
                                <option>Incidente</option>
                                <option>Condición Insegura</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Severidad</label>
                            <select 
                                className="w-full p-2 border rounded-lg"
                                value={formData.severity}
                                onChange={e => setFormData({...formData, severity: e.target.value as any})}
                            >
                                <option>Baja</option>
                                <option>Media</option>
                                <option>Alta</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Ubicación</label>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input 
                                type="text" 
                                className="w-full pl-9 p-2 border rounded-lg"
                                placeholder="Ej. Pasillo 4, Almacén Central"
                                value={formData.location}
                                onChange={e => setFormData({...formData, location: e.target.value})}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Descripción</label>
                        <textarea 
                            className="w-full p-3 border rounded-lg" 
                            rows={3}
                            placeholder="Describa lo sucedido..."
                            value={formData.description}
                            onChange={e => setFormData({...formData, description: e.target.value})}
                        ></textarea>
                    </div>
                    
                    <div className="p-4 border-2 border-dashed border-slate-300 rounded-lg bg-slate-50 flex flex-col items-center justify-center text-slate-400 cursor-pointer hover:bg-slate-100 hover:border-indigo-300 transition-colors">
                        <Camera className="w-8 h-8 mb-2" />
                        <span className="text-xs font-bold">Adjuntar Evidencia (Foto)</span>
                    </div>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 border rounded-lg text-slate-600 font-medium text-sm hover:bg-slate-50">Cancelar</button>
                    <button onClick={handleSubmit} className="px-6 py-2 bg-red-600 text-white rounded-lg font-medium text-sm hover:bg-red-700 flex items-center">
                        <Save className="w-4 h-4 mr-2" /> Registrar
                    </button>
                </div>
            </div>
        </div>
    );
};

const ContractGeneratorModal = ({ isOpen, onClose, employees }: { isOpen: boolean, onClose: () => void, employees: Employee[] }) => {
    const [isGenerating, setIsGenerating] = useState(false);

    if (!isOpen) return null;

    const handleGenerate = () => {
        setIsGenerating(true);
        setTimeout(() => {
            setIsGenerating(false);
            alert("Contrato generado y enviado a firma digital.");
            onClose();
        }, 2000);
    };

    return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in zoom-in-95">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-bold text-slate-900 flex items-center">
                        <Brain className="w-5 h-5 mr-2 text-indigo-600" /> Generador Legal IA
                    </h2>
                    <button onClick={onClose}><X className="text-slate-400 hover:text-slate-600" /></button>
                </div>
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tipo de Documento</label>
                        <select className="w-full p-2 border rounded-lg">
                            <option>Contrato Individual (Indeterminado)</option>
                            <option>Contrato Temporal</option>
                            <option>Convenio de Confidencialidad (NDA)</option>
                            <option>Carta de Renuncia</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Empleado</label>
                        <select className="w-full p-2 border rounded-lg">
                            <option>Seleccionar...</option>
                            {employees.map(c => <option key={c.id}>{c.firstName} {c.lastName}</option>)}
                        </select>
                    </div>
                    
                    <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-100">
                        <p className="text-xs text-indigo-800 leading-relaxed">
                            <strong className="block mb-1">Nota Legal:</strong>
                            El sistema utilizará los datos vigentes del empleado para llenar la plantilla. Se requiere revisión final antes de firma.
                        </p>
                    </div>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 border rounded-lg text-slate-600 font-medium text-sm hover:bg-slate-50">Cancelar</button>
                    <button 
                        onClick={handleGenerate} 
                        disabled={isGenerating}
                        className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium text-sm hover:bg-indigo-700 flex items-center disabled:opacity-70"
                    >
                        {isGenerating ? 'Generando...' : <><FileSignature className="w-4 h-4 mr-2" /> Generar</>}
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- KPI Component ---
const KPICard = ({ title, value, subtext, icon: Icon, color }: any) => (
    <div className={`p-5 rounded-xl border shadow-sm ${color}`}>
        <div className="flex justify-between items-start mb-3">
            <div className="p-2.5 bg-white/30 rounded-lg backdrop-blur-sm">
                <Icon className="w-5 h-5" />
            </div>
        </div>
        <p className="text-sm font-medium mb-1 opacity-90">{title}</p>
        <h3 className="text-2xl font-bold">{value}</h3>
        {subtext && <p className="text-xs mt-2 opacity-80">{subtext}</p>}
    </div>
);

// --- Tabs Components ---

const AuditTab = ({ records, onOpenDetails, onRenew }: { records: ComplianceRecord[], onOpenDetails: (rec: ComplianceRecord) => void, onRenew: (id: string) => void }) => {
    
    return (
        <div className="animate-fadeIn">
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                    <div>
                        <h3 className="font-bold text-slate-900 text-lg">Matriz de Auditoría Legal</h3>
                        <p className="text-slate-500 text-sm">Estado actual de expedientes y bloqueos preventivos.</p>
                    </div>
                    <div className="flex gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input type="text" placeholder="Buscar empleado..." className="pl-9 pr-4 py-2 border rounded-lg text-sm w-64" />
                        </div>
                    </div>
                </div>
                <table className="w-full text-sm">
                    <thead className="bg-white text-slate-600 font-semibold border-b">
                        <tr>
                            <th className="p-4 text-left">Empleado</th>
                            <th className="p-4 text-center">Contrato</th>
                            <th className="p-4 text-center">Expediente Digital</th>
                            <th className="p-4 text-center">Seguridad (EPP)</th>
                            <th className="p-4 text-center">Riesgo Legal (IA)</th>
                            <th className="p-4 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {records.map((record) => (
                            <tr 
                                key={record.id} 
                                className="hover:bg-slate-50 transition-colors group cursor-pointer"
                                onClick={() => onOpenDetails(record)}
                            >
                                <td className="p-4">
                                    <div className="font-medium text-slate-900">{record.employeeName}</div>
                                    <div className="text-xs text-slate-500">{record.role}</div>
                                    {record.blockPayroll && (
                                        <span className="inline-flex items-center mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700">
                                            <Lock className="w-3 h-3 mr-1" /> Nómina Bloqueada
                                        </span>
                                    )}
                                </td>
                                <td className="p-4 text-center">
                                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-bold 
                                        ${record.contractStatus === 'Vigente' ? 'bg-emerald-100 text-emerald-700' : 
                                          record.contractStatus === 'Por Vencer' ? 'bg-amber-100 text-amber-700' : 
                                          record.contractStatus === 'Inexistente' ? 'bg-red-100 text-red-700' :
                                          'bg-slate-100 text-slate-600'}`}>
                                        {record.contractStatus}
                                    </span>
                                    {record.contractExpiry && <div className="text-xs text-slate-400 mt-1">Vence: {record.contractExpiry}</div>}
                                </td>
                                <td className="p-4 text-center">
                                    {record.fileStatus === 'Completo' ? (
                                        <div className="flex flex-col items-center text-emerald-600">
                                            <CheckCircle className="w-5 h-5 mb-1" />
                                            <span className="text-xs font-medium">Validado</span>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center text-slate-500">
                                            <span className="text-xs font-medium mb-1">{record.missingDocs.length} faltantes</span>
                                            <div className="text-[10px] bg-slate-100 px-2 py-1 rounded max-w-[120px] truncate">
                                                {record.missingDocs.join(', ')}
                                            </div>
                                        </div>
                                    )}
                                </td>
                                <td className="p-4 text-center">
                                    <span className={`text-xs font-medium px-2 py-1 rounded 
                                        ${record.ppeStatus === 'Entregado' ? 'text-emerald-700 bg-emerald-50' : 'text-orange-700 bg-orange-50'}`}>
                                        {record.ppeStatus}
                                    </span>
                                </td>
                                <td className="p-4">
                                    <div className="flex items-center justify-center gap-2">
                                        <div className="w-24 bg-slate-200 rounded-full h-2 overflow-hidden">
                                            <div 
                                                className={`h-full rounded-full ${
                                                    record.riskScore < 30 ? 'bg-emerald-500' : 
                                                    record.riskScore < 70 ? 'bg-amber-500' : 'bg-red-500'
                                                }`} 
                                                style={{ width: `${record.riskScore}%` }}
                                            ></div>
                                        </div>
                                        <span className="text-xs font-bold">{record.riskScore}%</span>
                                    </div>
                                </td>
                                <td className="p-4 text-right">
                                    {(record.contractStatus === 'Por Vencer' || record.contractStatus === 'Vencido') && (
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); onRenew(record.id); }}
                                            className="text-indigo-600 hover:text-indigo-800 text-xs font-bold bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded transition-colors flex items-center ml-auto border border-indigo-100"
                                        >
                                            <RefreshCw className="w-3 h-3 mr-1" /> Renovar
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const ContractsTab = ({ records, onGenerate, onRenew, onTerminate }: { records: ComplianceRecord[], onGenerate: () => void, onRenew: (id: string) => void, onTerminate: (id: string) => void }) => {
    const urgentContracts = records.filter(r => r.contractStatus === 'Por Vencer' || r.contractStatus === 'Vencido');

    return (
        <div className="animate-fadeIn grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="font-bold text-slate-900 text-lg mb-4 flex items-center">
                    <FileSignature className="w-5 h-5 mr-2 text-indigo-600" /> Gestión de Contratos
                </h3>
                
                {/* Urgent Alerts */}
                {urgentContracts.length > 0 && (
                    <div className="mb-6 space-y-3">
                        <h4 className="text-xs font-bold text-amber-700 uppercase mb-2">Acciones Requeridas</h4>
                        {urgentContracts.map(r => (
                            <div key={r.id} className="p-4 border border-amber-200 bg-amber-50 rounded-lg flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <AlertTriangle className="w-5 h-5 text-amber-600" />
                                    <div>
                                        <p className="font-bold text-amber-900 text-sm">{r.employeeName} - Contrato {r.contractStatus}</p>
                                        <p className="text-xs text-amber-700">Vence: {r.contractExpiry || 'Fecha desconocida'}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => onRenew(r.id)} className="px-3 py-1.5 bg-white text-amber-700 border border-amber-200 rounded text-xs font-bold hover:bg-amber-100 transition-colors">Renovar</button>
                                    <button onClick={() => onTerminate(r.id)} className="px-3 py-1.5 bg-white text-red-600 border border-red-200 rounded text-xs font-medium hover:bg-red-50 transition-colors">Terminar</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Full Contracts List */}
                <div>
                    <h4 className="font-bold text-slate-800 text-sm mb-3 flex items-center justify-between">
                        Directorio de Contratos Activos
                        <span className="text-xs font-normal text-slate-500 bg-slate-100 px-2 py-1 rounded">{records.length} Registros</span>
                    </h4>
                    <div className="border rounded-lg overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 text-slate-600 text-xs uppercase">
                                <tr>
                                    <th className="p-3 text-left">Empleado</th>
                                    <th className="p-3 text-center">Estado</th>
                                    <th className="p-3 text-center">Vencimiento</th>
                                    <th className="p-3 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {records.map(r => (
                                    <tr key={r.id} className="hover:bg-slate-50">
                                        <td className="p-3 font-medium text-slate-800">{r.employeeName}</td>
                                        <td className="p-3 text-center">
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                                                r.contractStatus === 'Vigente' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
                                                r.contractStatus === 'Por Vencer' ? 'bg-amber-50 text-amber-700 border-amber-200' : 
                                                'bg-red-50 text-red-700 border-red-200'
                                            }`}>
                                                {r.contractStatus}
                                            </span>
                                        </td>
                                        <td className="p-3 text-center text-slate-500 text-xs">{r.contractExpiry || '-'}</td>
                                        <td className="p-3 text-right">
                                            <div className="flex justify-end gap-2">
                                                {(r.contractStatus === 'Por Vencer' || r.contractStatus === 'Vencido') && (
                                                    <button onClick={() => onRenew(r.id)} className="text-indigo-600 hover:underline text-xs font-medium">Renovar</button>
                                                )}
                                                <button onClick={() => onTerminate(r.id)} className="text-red-600 hover:underline text-xs font-medium">Terminar</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <div className="bg-indigo-900 text-white p-6 rounded-xl shadow-lg flex flex-col justify-between h-fit">
                <div>
                    <Brain className="w-10 h-10 text-indigo-300 mb-4" />
                    <h3 className="text-xl font-bold mb-2">Generador Legal IA</h3>
                    <p className="text-indigo-200 text-sm mb-6">
                        Crea contratos personalizados, cartas de despido o convenios en segundos utilizando plantillas validadas y datos del empleado.
                    </p>
                </div>
                <button onClick={onGenerate} className="w-full py-3 bg-white text-indigo-900 rounded-lg font-bold hover:bg-indigo-50 transition-colors flex items-center justify-center">
                    <Plus className="w-4 h-4 mr-2" /> Generar Documento
                </button>
            </div>
        </div>
    );
};

const EHSTab = ({ incidents, onReport }: { incidents: SafetyIncident[], onReport: () => void }) => {
    return (
        <div className="animate-fadeIn space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                    <h4 className="text-sm font-bold text-slate-500 uppercase mb-4 flex items-center"><HardHat className="w-4 h-4 mr-2"/> Entrega de EPP</h4>
                    <div className="flex items-end gap-2 mb-2">
                        <span className="text-3xl font-bold text-slate-900">85%</span>
                        <span className="text-sm text-slate-500 mb-1">de cumplimiento</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-2 rounded-full" style={{width: '85%'}}></div>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                    <h4 className="text-sm font-bold text-slate-500 uppercase mb-4 flex items-center"><FileSignature className="w-4 h-4 mr-2"/> NOM-035</h4>
                    <div className="flex items-end gap-2 mb-2">
                        <span className="text-3xl font-bold text-slate-900">12</span>
                        <span className="text-sm text-slate-500 mb-1">pendientes</span>
                    </div>
                    <p className="text-xs text-orange-600 font-medium">Cuestionarios por aplicar esta semana.</p>
                </div>
                <div onClick={onReport} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center items-center text-center cursor-pointer hover:bg-slate-50 hover:border-indigo-200 transition-all group">
                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-full mb-2 group-hover:scale-110 transition-transform">
                        <AlertOctagon className="w-6 h-6" />
                    </div>
                    <span className="text-sm font-bold text-indigo-900">Reportar Incidente</span>
                </div>
            </div>

            {/* Incidents List */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-100 bg-slate-50 font-bold text-slate-700 text-sm">
                    Bitácora de Incidentes Recientes
                </div>
                <table className="w-full text-sm">
                    <thead className="bg-white text-slate-500">
                        <tr>
                            <th className="p-3 text-left font-medium">Fecha</th>
                            <th className="p-3 text-left font-medium">Tipo</th>
                            <th className="p-3 text-left font-medium">Ubicación</th>
                            <th className="p-3 text-left font-medium">Descripción</th>
                            <th className="p-3 text-center font-medium">Severidad</th>
                            <th className="p-3 text-center font-medium">Estado</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {incidents.map(inc => (
                            <tr key={inc.id} className="hover:bg-slate-50">
                                <td className="p-3 text-slate-600">{inc.date}</td>
                                <td className="p-3 font-medium text-slate-800">{inc.type}</td>
                                <td className="p-3 text-slate-600">{inc.location}</td>
                                <td className="p-3 text-slate-600 max-w-xs truncate">{inc.description}</td>
                                <td className="p-3 text-center">
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                                        inc.severity === 'Alta' ? 'bg-red-100 text-red-700' :
                                        inc.severity === 'Media' ? 'bg-amber-100 text-amber-700' : 'bg-blue-50 text-blue-700'
                                    }`}>{inc.severity}</span>
                                </td>
                                <td className="p-3 text-center">
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold border ${
                                        inc.status === 'Abierto' ? 'bg-red-50 text-red-600 border-red-200' : 
                                        inc.status === 'Cerrado' ? 'bg-slate-100 text-slate-600 border-slate-200' : 'bg-indigo-50 text-indigo-600 border-indigo-200'
                                    }`}>{inc.status}</span>
                                </td>
                            </tr>
                        ))}
                        {incidents.length === 0 && (
                            <tr>
                                <td colSpan={6} className="text-center py-8 text-slate-500">Sin incidentes registrados.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const OffboardingTab = ({ cases, onManage }: { cases: OffboardingCase[], onManage: (c: OffboardingCase) => void }) => {
    return (
        <div className="animate-fadeIn space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                    <div>
                        <h3 className="font-bold text-slate-900 text-lg">Gestión de Bajas y Finiquitos</h3>
                        <p className="text-slate-500 text-sm">Procesos de separación laboral en curso.</p>
                    </div>
                </div>
                <table className="w-full text-sm">
                    <thead className="bg-white text-slate-600 font-semibold border-b">
                        <tr>
                            <th className="p-4 text-left">Empleado</th>
                            <th className="p-4 text-left">Tipo de Baja</th>
                            <th className="p-4 text-center">Fecha Inicio</th>
                            <th className="p-4 text-center">Etapa Actual</th>
                            <th className="p-4 text-right">Cálculo Estimado</th>
                            <th className="p-4 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {cases.map(item => (
                            <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                                <td className="p-4">
                                    <div className="font-bold text-slate-900">{item.employeeName}</div>
                                    <div className="text-xs text-slate-500">{item.role}</div>
                                </td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${item.type === 'Renuncia' ? 'bg-blue-50 text-blue-700' : 'bg-red-50 text-red-700'}`}>
                                        {item.type}
                                    </span>
                                </td>
                                <td className="p-4 text-center text-slate-600">{item.date}</td>
                                <td className="p-4">
                                    <div className="flex flex-col items-center">
                                        <span className="font-bold text-indigo-600">{item.status}</span>
                                        <div className="w-24 h-1.5 bg-slate-100 rounded-full mt-1 overflow-hidden">
                                            <div className="h-full bg-indigo-600" style={{width: item.status === 'Entrevista' ? '25%' : item.status === 'Cálculo' ? '50%' : item.status === 'Firma' ? '75%' : '100%'}}></div>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-4 text-right font-mono font-bold text-slate-800">
                                    ${item.severanceAmount.toLocaleString()}
                                </td>
                                <td className="p-4 text-right">
                                    <button 
                                        onClick={() => onManage(item)}
                                        className="text-slate-500 hover:text-indigo-600 text-xs font-bold border px-3 py-1.5 rounded hover:bg-slate-50"
                                    >
                                        Gestionar
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {cases.length === 0 && (
                            <tr>
                                <td colSpan={6} className="text-center py-12 text-slate-400 italic">No hay procesos de baja activos.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

interface ComplianceViewProps {
    employees: Employee[];
    complianceRecords: ComplianceRecord[];
    setComplianceRecords: React.Dispatch<React.SetStateAction<ComplianceRecord[]>>;
}

export const ComplianceView: React.FC<ComplianceViewProps> = ({ employees, complianceRecords, setComplianceRecords }) => {
    const [activeTab, setActiveTab] = useState('audit');
    // We use props instead of internal state for records
    const [incidents, setIncidents] = useState<SafetyIncident[]>(INITIAL_INCIDENTS);
    const [offboardingCases, setOffboardingCases] = useState<OffboardingCase[]>(INITIAL_OFFBOARDING);
    
    const [selectedEmployee, setSelectedEmployee] = useState<ComplianceRecord | null>(null);
    const [selectedOffboardingCase, setSelectedOffboardingCase] = useState<OffboardingCase | null>(null);
    const [isIncidentModalOpen, setIsIncidentModalOpen] = useState(false);
    const [isContractModalOpen, setIsContractModalOpen] = useState(false);
    const [isEthicsModalOpen, setIsEthicsModalOpen] = useState(false);
    const [isScanning, setIsScanning] = useState(false);

    // -- Actions --

    const handleRenewContract = (id: string) => {
        const emp = complianceRecords.find(r => r.id === id);
        if (!emp) return;

        if (window.confirm(`¿Renovar contrato de ${emp.employeeName} por 1 año?`)) {
            const today = new Date();
            const nextYear = new Date(today);
            nextYear.setFullYear(today.getFullYear() + 1);
            const formattedDate = nextYear.toISOString().split('T')[0];
            
            setComplianceRecords(prev => prev.map(r => 
                r.id === id ? { 
                    ...r, 
                    contractStatus: 'Vigente', 
                    contractExpiry: formattedDate,
                    riskScore: 0, // Reset risk
                    fileStatus: 'Completo', // Assume renewal includes file update
                    blockPayroll: false
                } : r
            ));
            alert(`Contrato de ${emp.employeeName} renovado exitosamente hasta ${formattedDate}.`);
        }
    };

    const handleTerminateContract = (id: string) => {
        const emp = complianceRecords.find(r => r.id === id);
        if (!emp) return;

        // Evitar doble terminación
        if (emp.contractStatus === 'Inexistente') {
             alert("Este contrato ya ha sido terminado.");
             return;
        }

        if (window.confirm(`ATENCIÓN: ¿Desea iniciar el proceso de baja para ${emp.employeeName}? \n\nEsta acción:\n1. Marcará el contrato como Inexistente.\n2. Bloqueará la nómina automáticamente.\n3. Creará un expediente de salida.`)) {
            // Update compliance record to reflect termination
            setComplianceRecords(prev => prev.map(r => 
                r.id === id ? { 
                    ...r, 
                    contractStatus: 'Inexistente', 
                    blockPayroll: true,
                    riskScore: 100, // Max risk until resolved
                    contractExpiry: undefined
                } : r
            ));
            
            // Create offboarding case automatically
            const newCase: OffboardingCase = {
                id: `BJ-${Date.now()}`,
                employeeName: emp.employeeName,
                role: emp.role,
                type: 'Despido Justificado', // Default, can be changed in management
                status: 'Entrevista',
                severanceAmount: 0, // To be calculated
                date: new Date().toISOString().split('T')[0]
            };
            setOffboardingCases(prev => [newCase, ...prev]);
            
            // Redirect to Offboarding tab to handle the case
            setActiveTab('offboarding');
            alert(`Proceso de baja iniciado para ${emp.employeeName}. Redirigiendo al módulo de Bajas.`);
        }
    };

    const handleQuickAudit = () => {
        setIsScanning(true);
        setTimeout(() => {
            setComplianceRecords(prev => prev.map(r => {
                // Smart Audit Logic Simulation
                let newRisk = 0;
                if (r.contractStatus === 'Vencido' || r.contractStatus === 'Inexistente') newRisk += 50;
                if (r.contractStatus === 'Por Vencer') newRisk += 20;
                if (r.fileStatus === 'Incompleto') newRisk += 30;
                if (r.missingDocs.length > 0) newRisk += (r.missingDocs.length * 10);
                
                return { ...r, riskScore: Math.min(100, newRisk) };
            }));
            setIsScanning(false);
            alert("Auditoría completada. Se han recalculado los niveles de riesgo basados en la documentación vigente.");
        }, 2000);
    };

    const handleAddIncident = (inc: SafetyIncident) => {
        setIncidents([inc, ...incidents]);
    };

    const handleSaveOffboarding = (updatedCase: OffboardingCase) => {
        setOffboardingCases(prev => prev.map(c => c.id === updatedCase.id ? updatedCase : c));
    };

    return (
        <div className="min-h-[calc(100vh-64px)] bg-[#f8fafc] p-4 sm:p-8">
            <div className="max-w-[1400px] mx-auto w-full">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-emerald-600 rounded-xl shadow-lg shadow-emerald-200">
                            <ShieldCheck className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">Cumplimiento y Normativa</h1>
                            <p className="text-slate-500 text-sm">Auditoría legal, seguridad industrial y gestión de riesgos.</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button 
                            onClick={() => setIsEthicsModalOpen(true)}
                            className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 shadow-sm flex items-center"
                        >
                            <ExternalLink className="w-4 h-4 mr-2" /> Buzón Ético
                        </button>
                        <button 
                            onClick={handleQuickAudit}
                            disabled={isScanning}
                            className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 shadow-sm shadow-emerald-200 flex items-center disabled:opacity-70"
                        >
                            {isScanning ? <Loader2 className="w-4 h-4 mr-2 animate-spin"/> : <Users className="w-4 h-4 mr-2" />}
                            {isScanning ? 'Auditando...' : 'Auditoría Rápida'}
                        </button>
                    </div>
                </div>

                {/* Traffic Light Dashboard */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <KPICard 
                        title="Riesgo Alto" 
                        value={`${complianceRecords.filter(r => r.riskScore > 70).length} Casos`} 
                        subtext="Contratos inexistentes o demandas potenciales" 
                        icon={XCircle} 
                        color="bg-red-50 text-red-700 border-red-100" 
                    />
                    <KPICard 
                        title="Atención Requerida" 
                        value={`${complianceRecords.filter(r => r.contractStatus === 'Por Vencer').length} Docs`} 
                        subtext="Por vencer en los próximos 30 días" 
                        icon={AlertTriangle} 
                        color="bg-amber-50 text-amber-700 border-amber-100" 
                    />
                    <KPICard 
                        title="Cumplimiento General" 
                        value={`${Math.round((complianceRecords.filter(r => r.riskScore < 30).length / complianceRecords.length) * 100)}%`} 
                        subtext="Plantilla con expediente verificado" 
                        icon={CheckCircle} 
                        color="bg-emerald-50 text-emerald-700 border-emerald-100" 
                    />
                </div>

                {/* Tabs */}
                <div className="flex gap-1 p-1 bg-white border border-slate-200 rounded-xl w-full md:w-fit mb-8 shadow-sm overflow-x-auto">
                    {[
                        { id: 'audit', label: 'Auditoría' },
                        { id: 'contracts', label: 'Contratos' },
                        { id: 'ehs', label: 'Seguridad (EHS)' },
                        { id: 'offboarding', label: 'Bajas y Legal' },
                    ].map((tab) => (
                        <button 
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-6 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                                activeTab === tab.id 
                                ? 'bg-slate-900 text-white shadow-sm' 
                                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="min-h-[500px]">
                    {activeTab === 'audit' && <AuditTab records={complianceRecords} onOpenDetails={setSelectedEmployee} onRenew={handleRenewContract} />}
                    {activeTab === 'contracts' && <ContractsTab records={complianceRecords} onGenerate={() => setIsContractModalOpen(true)} onRenew={handleRenewContract} onTerminate={handleTerminateContract} />}
                    {activeTab === 'ehs' && <EHSTab incidents={incidents} onReport={() => setIsIncidentModalOpen(true)} />}
                    {activeTab === 'offboarding' && <OffboardingTab cases={offboardingCases} onManage={setSelectedOffboardingCase} />}
                </div>
            </div>

            {/* Modals */}
            <DigitalFileModal 
                isOpen={!!selectedEmployee} 
                onClose={() => setSelectedEmployee(null)} 
                employee={selectedEmployee}
            />
            <IncidentReportModal
                isOpen={isIncidentModalOpen}
                onClose={() => setIsIncidentModalOpen(false)}
                onSave={handleAddIncident}
            />
            <ContractGeneratorModal
                isOpen={isContractModalOpen}
                onClose={() => setIsContractModalOpen(false)}
                employees={employees}
            />
            <EthicsModal
                isOpen={isEthicsModalOpen}
                onClose={() => setIsEthicsModalOpen(false)}
            />
            <OffboardingModal 
                isOpen={!!selectedOffboardingCase} 
                onClose={() => setSelectedOffboardingCase(null)} 
                onSave={handleSaveOffboarding}
                caseData={selectedOffboardingCase}
            />
        </div>
    );
};
