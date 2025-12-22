
import React, { useState, useMemo } from 'react';
import { 
    Heart, Phone, FileText, BarChart3, Plus, Activity, Brain, ShieldAlert, Download, MessageCircle, X,
    Sparkles, Loader2, Send, CheckCircle, Users, AlertTriangle, CheckSquare,
    FileBarChart, ArrowRight,
    PieChart as PieChartIcon,
    ClipboardList,
    Calendar
} from 'lucide-react';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend
} from 'recharts';
import { WELLNESS_PROGRAMS_MOCK, EMPLOYEES_MOCK } from '../../constants';
import { WellnessProgram } from '../../types';
import { generateSurveyQuestions } from '../../services/geminiService';

// Clean Data
const NOM035_RESULTS: any[] = [];

const AddProgramModal = ({ isOpen, onClose, onSave }: { isOpen: boolean, onClose: () => void, onSave: (p: any) => void }) => {
    const [formData, setFormData] = useState({ name: '', category: 'Salud Física', capacity: 50 });
    
    if (!isOpen) return null;
    
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 animate-in zoom-in-95">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-slate-900">Nuevo Programa</h3>
                    <button onClick={onClose}><X className="w-5 h-5 text-slate-400"/></button>
                </div>
                <div className="space-y-3">
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase">Nombre</label>
                        <input type="text" className="w-full p-2 border rounded" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Ej. Reto de Pasos" />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase">Categoría</label>
                        <select className="w-full p-2 border rounded" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                            <option>Salud Física</option><option>Salud Mental</option><option>Integración</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase">Cupo</label>
                        <input type="number" className="w-full p-2 border rounded" value={formData.capacity} onChange={e => setFormData({...formData, capacity: Number(e.target.value)})} />
                    </div>
                </div>
                <div className="mt-6 flex justify-end gap-2">
                    <button onClick={onClose} className="px-4 py-2 border rounded text-sm">Cancelar</button>
                    <button onClick={() => { onSave(formData); onClose(); }} className="px-4 py-2 bg-emerald-600 text-white rounded text-sm font-bold">Guardar</button>
                </div>
            </div>
        </div>
    );
};

const SurveyResultsModal = ({ isOpen, onClose, activeSurveys = [] }: { isOpen: boolean, onClose: () => void, activeSurveys?: any[] }) => {
    const [selectedSurveyId, setSelectedSurveyId] = useState('NOM-035');

    if (!isOpen) return null;

    const selectedSurvey = activeSurveys.find(s => s.id === selectedSurveyId);
    const isStandard = selectedSurveyId === 'NOM-035';

    const analysisData = useMemo(() => {
        if (isStandard) {
            // If mock is empty, return empty state
            if (NOM035_RESULTS.length === 0) return null;

            return {
                title: 'Diagnóstico NOM-035',
                date: 'Octubre 2025',
                participation: 78,
                riskLevel: 'Alto',
                chartData: NOM035_RESULTS,
                questions: []
            };
        } else if (selectedSurvey) {
            const mockQuestions = selectedSurvey.questions || [];
            const simulatedChartData = mockQuestions.map((q: string, idx: number) => {
                const score = Math.floor(Math.random() * (90 - 40 + 1)) + 40; 
                let risk = 'Bajo';
                let color = '#10b981';
                
                if (score > 80) { risk = 'Alto'; color = '#ef4444'; }
                else if (score > 60) { risk = 'Medio'; color = '#f59e0b'; }

                return {
                    category: `P${idx + 1}`, 
                    fullQuestion: q,
                    score: score,
                    risk: risk,
                    color: color
                };
            });

            return {
                title: selectedSurvey.title,
                date: selectedSurvey.date || 'Reciente',
                participation: selectedSurvey.status === 'Completada' ? 100 : 45,
                riskLevel: simulatedChartData.some((d: any) => d.risk === 'Alto') ? 'Alto' : 'Bajo',
                chartData: simulatedChartData,
                questions: simulatedChartData
            };
        }
        return null;
    }, [selectedSurveyId, activeSurveys, isStandard, selectedSurvey]);

    if (!analysisData) {
         return (
            <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4 transition-all">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8 animate-in zoom-in-95 text-center">
                     <FileBarChart className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                     <h3 className="text-lg font-bold text-slate-900">Sin resultados disponibles</h3>
                     <p className="text-slate-500 mt-2">No se han generado encuestas o datos de la NOM-035 aún.</p>
                     <button onClick={onClose} className="mt-6 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200">Cerrar</button>
                </div>
            </div>
         );
    }

    return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4 transition-all">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl flex flex-col max-h-[90vh] animate-in zoom-in-95 overflow-hidden">
                <div className="p-6 border-b bg-white flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
                            <FileBarChart className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">Resultados de Encuesta</h2>
                            <p className="text-sm text-slate-500">Análisis de respuestas y tendencias.</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <select 
                            className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2.5 outline-none font-medium"
                            value={selectedSurveyId}
                            onChange={(e) => setSelectedSurveyId(e.target.value)}
                        >
                            <option value="NOM-035">NOM-035 (Estándar)</option>
                            {activeSurveys.map(s => (
                                <option key={s.id} value={s.id}>{s.title}</option>
                            ))}
                        </select>
                        <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                            <p className="text-xs font-bold text-slate-400 uppercase mb-1">Encuesta Analizada</p>
                            <h3 className="text-lg font-bold text-slate-900 truncate" title={analysisData.title}>{analysisData.title}</h3>
                            <p className="text-xs text-slate-500 mt-1">{analysisData.date}</p>
                        </div>
                        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                            <p className="text-xs font-bold text-slate-400 uppercase mb-1">Participación</p>
                            <div className="flex items-center gap-2">
                                <Users className="w-5 h-5 text-blue-500" />
                                <span className="text-2xl font-bold text-slate-900">{analysisData.participation}%</span>
                            </div>
                            <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2">
                                <div className="bg-blue-500 h-1.5 rounded-full" style={{width: `${analysisData.participation}%`}}></div>
                            </div>
                        </div>
                        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                            <p className="text-xs font-bold text-slate-400 uppercase mb-1">Nivel de Riesgo Detectado</p>
                            <div className="flex items-center gap-2">
                                <ShieldAlert className={`w-5 h-5 ${analysisData.riskLevel === 'Alto' ? 'text-red-500' : 'text-emerald-500'}`} />
                                <span className={`text-2xl font-bold ${analysisData.riskLevel === 'Alto' ? 'text-red-600' : 'text-emerald-600'}`}>
                                    {analysisData.riskLevel}
                                </span>
                            </div>
                            <p className="text-xs text-slate-500 mt-2">Basado en respuestas ponderadas.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm min-w-0">
                            <h3 className="font-bold text-slate-800 mb-6 text-lg">Distribución de Puntajes</h3>
                            <div className="h-[350px] w-full min-w-0">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={analysisData.chartData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="var(--card-2)" />
                                        <XAxis type="number" hide />
                                        <YAxis dataKey="category" type="category" width={120} tick={{fontSize: 11, fontWeight: 500, fill: 'var(--muted)'}} />
                                        <RechartsTooltip 
                                            cursor={{fill: 'transparent'}}
                                            content={({ active, payload }) => {
                                                if (active && payload && payload.length) {
                                                    const data = payload[0].payload;
                                                    return (
                                                        <div className="p-3 rounded-lg text-xs max-w-xs" style={{ background: 'var(--card)', color: 'var(--text)', border: '1px solid rgba(99,102,241,0.25)' }}>
                                                            <p className="font-bold mb-1" style={{ color: 'var(--text)' }}>{data.category}</p>
                                                            {data.fullQuestion && <p className="mb-2 italic" style={{ color: 'var(--muted)' }}>{data.fullQuestion}</p>}
                                                            <div className="flex justify-between gap-4">
                                                                <span>Puntaje:</span>
                                                                <span className="font-bold">{data.score}</span>
                                                            </div>
                                                            <div className="flex justify-between gap-4 mt-1">
                                                                <span>Riesgo:</span>
                                                                <span style={{color: data.color}} className="font-bold">{data.risk}</span>
                                                            </div>
                                                        </div>
                                                    );
                                                }
                                                return null;
                                            }}
                                        />
                                        <Bar dataKey="score" radius={[0, 4, 4, 0]} barSize={24}>
                                            {analysisData.chartData.map((entry: any, index: number) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-xl p-6 text-white shadow-lg">
                                <div className="flex items-center gap-2 mb-3">
                                    <Sparkles className="w-5 h-5 text-yellow-300" />
                                    <h3 className="font-bold">Insights Inteligentes</h3>
                                </div>
                                <p className="text-sm text-indigo-100 leading-relaxed">
                                    {analysisData.riskLevel === 'Alto' 
                                        ? "Se detectan focos rojos en áreas críticas. Se recomienda priorizar un plan de acción inmediato para mitigar riesgos psicosociales." 
                                        : "El clima organizacional se muestra estable. Continúe con las prácticas actuales y considere programas de refuerzo positivo."}
                                </p>
                            </div>

                            {!isStandard && analysisData.questions && (
                                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm max-h-[300px] overflow-y-auto custom-scrollbar">
                                    <h4 className="font-bold text-slate-800 mb-4 text-sm">Detalle por Pregunta</h4>
                                    <div className="space-y-4">
                                        {analysisData.questions.map((q: any, idx: number) => (
                                            <div key={idx} className="border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                                                <p className="text-xs text-slate-500 mb-1 line-clamp-2">{q.fullQuestion}</p>
                                                <div className="flex items-center justify-between">
                                                    <div className="flex-1 h-1.5 bg-slate-100 rounded-full mr-3">
                                                        <div 
                                                            className="h-1.5 rounded-full" 
                                                            style={{width: `${q.score}%`, backgroundColor: q.color}}
                                                        ></div>
                                                    </div>
                                                    <span className="text-xs font-bold text-slate-700">{q.score}%</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="p-5 bg-white border-t border-slate-200 flex justify-end gap-3 shrink-0">
                    <button onClick={onClose} className="px-5 py-2.5 border border-slate-200 rounded-xl text-slate-600 font-medium hover:bg-slate-50 transition-colors text-sm">
                        Cerrar
                    </button>
                    <button className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors flex items-center text-sm shadow-lg shadow-indigo-200">
                        <Download className="w-4 h-4 mr-2" /> Exportar PDF
                    </button>
                </div>
            </div>
        </div>
    );
};


const ActionPlanModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-xl p-6 max-w-md w-full animate-in fade-in zoom-in-95">
                <h3 className="font-bold text-lg mb-4 text-slate-900">Plan de Acción NOM-035</h3>
                <p className="text-sm text-slate-500 mb-6">
                    Asigne tareas correctivas a los departamentos correspondientes para mitigar los riesgos detectados.
                </p>
                <button onClick={onClose} className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition-colors">
                    Entendido
                </button>
            </div>
        </div>
    );
};

const SurveyGeneratorModal = ({ isOpen, onClose, onLaunch, onPublish }: { isOpen: boolean, onClose: () => void, onLaunch: (count: number) => void, onPublish?: (survey: any) => void }) => {
    const [topic, setTopic] = useState('');
    const [questions, setQuestions] = useState<string[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSending, setIsSending] = useState(false);

    if (!isOpen) return null;

    const handleGenerate = async () => {
        if (!topic) return;
        setIsGenerating(true);
        try {
            const generated = await generateSurveyQuestions(topic);
            setQuestions(generated);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSendWhatsApp = async () => {
        setIsSending(true);
        const total = EMPLOYEES_MOCK.length;
        
        const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://agronare.com';
        const surveyLink = `${baseUrl}/survey/NOM-${Date.now()}`;
        const message = `Hola, Agronare te invita a responder la encuesta de "${topic}".\n\nTu opinión es importante: ${surveyLink}`;
        
        const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');

        setTimeout(() => {
            if (onPublish) {
                onPublish({
                    id: `sur-${Date.now()}`,
                    title: topic,
                    date: new Date().toLocaleDateString(),
                    status: 'Pendiente',
                    link: surveyLink,
                    questions: questions
                });
            }
            
            onLaunch(total);
            setIsSending(false);
            setTopic('');
            setQuestions([]);
            onClose();
        }, 1500);
    };

    return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95">
                <div className="p-6 border-b bg-gradient-to-r from-indigo-600 to-purple-700 rounded-t-2xl flex justify-between items-center text-white">
                    <div>
                        <h2 className="text-xl font-bold flex items-center">
                            <Brain className="w-6 h-6 mr-2 text-indigo-200" /> Generador de Encuestas IA
                        </h2>
                        <p className="text-indigo-100 text-sm">Diseña y distribuye encuestas.</p>
                    </div>
                    <button onClick={() => onClose()}><X className="text-indigo-200 hover:text-white" /></button>
                </div>

                <div className="p-8 flex-1 overflow-y-auto">
                    {!isSending ? (
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Tema de la Encuesta</label>
                                <div className="flex gap-2">
                                    <input 
                                        type="text" 
                                        value={topic}
                                        onChange={(e) => setTopic(e.target.value)}
                                        placeholder="Ej. Estrés Laboral..." 
                                        className="flex-1 p-3 border border-slate-300 rounded-xl focus:border-indigo-500 outline-none"
                                        onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                                    />
                                    <button 
                                        onClick={handleGenerate}
                                        disabled={isGenerating || !topic}
                                        className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-50 flex items-center"
                                    >
                                        {isGenerating ? <Loader2 className="w-5 h-5 animate-spin"/> : <Sparkles className="w-5 h-5 mr-2"/>}
                                        Generar
                                    </button>
                                </div>
                            </div>

                            {questions.length > 0 && (
                                <div className="bg-slate-50 rounded-xl border border-slate-200 p-5">
                                    <h4 className="text-sm font-bold text-slate-500 uppercase mb-3">Preguntas Generadas</h4>
                                    <ul className="space-y-3">
                                        {questions.map((q, idx) => (
                                            <li key={idx} className="flex gap-3 items-start bg-white p-3 rounded-lg border border-slate-100">
                                                <span className="bg-indigo-100 text-indigo-700 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">{idx + 1}</span>
                                                <p className="text-slate-700 text-sm font-medium">{q}</p>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <Loader2 className="w-10 h-10 text-emerald-600 animate-spin mb-4" />
                            <h3 className="text-xl font-bold text-slate-900 mb-2">Enviando...</h3>
                        </div>
                    )}
                </div>

                <div className="p-6 border-t bg-slate-50 rounded-b-2xl flex justify-end">
                    {!isSending && (
                        <button 
                            onClick={handleSendWhatsApp}
                            disabled={questions.length === 0}
                            className="bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-emerald-700 disabled:opacity-50 flex items-center"
                        >
                            <Send className="w-5 h-5 mr-2" /> Lanzar Encuesta
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

interface HealthViewProps {
    onPublishSurvey?: (survey: any) => void;
    activeSurveys?: any[];
}

const HealthView: React.FC<HealthViewProps> = ({ onPublishSurvey, activeSurveys = [] }) => {
    const [programs, setPrograms] = useState<WellnessProgram[]>(WELLNESS_PROGRAMS_MOCK);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isSurveyModalOpen, setIsSurveyModalOpen] = useState(false);
    const [isResultsModalOpen, setIsResultsModalOpen] = useState(false);
    const [isActionPlanModalOpen, setIsActionPlanModalOpen] = useState(false);
    
    const surveyStats = useMemo(() => {
        let sent = 0;
        let responded = 0;
        let pending = 0;

        activeSurveys.forEach(s => {
            const totalRecipients = EMPLOYEES_MOCK.length; 
            sent += totalRecipients; 
            if (s.status === 'Completada') {
                responded += totalRecipients;
            } else {
                pending += totalRecipients;
            }
        });

        return { sent, responded, pending };
    }, [activeSurveys]);

    const completionRate = surveyStats.sent > 0 ? Math.round((surveyStats.responded / surveyStats.sent) * 100) : 0;

    const handleLaunchComplete = (count: number) => {
        alert(`${count} encuestas han sido enviadas exitosamente.`);
    };

    const handleAddProgram = (data: any) => {
        setPrograms(prev => [...prev, {
            id: `wp-${Date.now()}`,
            ...data,
            startDate: new Date().toISOString().split('T')[0],
            endDate: new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0],
            enrolled: 0,
            status: 'Planeado'
        }]);
    };

    return (
        <div className="animate-fadeIn space-y-6">
            <div className="flex justify-between items-center mb-2">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Salud y Bienestar</h1>
                    <p className="text-slate-500 text-sm mt-1">Monitoreo de salud organizacional y programas preventivos.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 relative overflow-hidden flex flex-col h-full">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h3 className="font-bold text-slate-900 flex items-center text-lg">
                                <Brain className="w-6 h-6 mr-2 text-indigo-600" /> Cumplimiento NOM-035
                            </h3>
                            <p className="text-xs text-slate-500 mt-1">Evaluación de Factores de Riesgo Psicosocial</p>
                        </div>
                        <span className="bg-yellow-100 text-yellow-700 text-xs font-bold px-3 py-1 rounded-full border border-yellow-200 flex items-center shadow-sm">
                            <ShieldAlert className="w-3 h-3 mr-1" /> Riesgo Medio
                        </span>
                    </div>

                    <div className="flex-1 flex flex-col sm:flex-row items-center gap-8 px-4">
                        <div className="relative w-48 h-24 flex items-end justify-center">
                            <svg className="w-full h-full overflow-visible" viewBox="0 0 100 50">
                                <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#e2e8f0" strokeWidth="10" strokeLinecap="round" />
                                <path 
                                    d="M 10 50 A 40 40 0 0 1 90 50" 
                                    fill="none" 
                                    stroke="#6366f1" 
                                    strokeWidth="10" 
                                    strokeLinecap="round" 
                                    strokeDasharray="125.6"
                                    strokeDashoffset={125.6 - (125.6 * (completionRate / 100))}
                                    className="transition-all duration-1000 ease-out"
                                />
                            </svg>
                            <div className="absolute bottom-0 flex flex-col items-center">
                                <span className="text-3xl font-black text-slate-900 leading-none">{completionRate}%</span>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Completado</span>
                            </div>
                        </div>

                        <div className="flex-1 w-full space-y-3">
                            <div className="flex justify-between items-center p-2 bg-slate-50 rounded-lg border border-slate-100">
                                <span className="text-xs font-medium text-slate-600">Encuestas Enviadas</span>
                                <span className="text-sm font-bold text-slate-900">{surveyStats.sent}</span>
                            </div>
                            <div className="flex justify-between items-center p-2 bg-emerald-50 rounded-lg border border-emerald-100">
                                <span className="text-xs font-medium text-emerald-700 flex items-center">
                                    <CheckCircle className="w-3 h-3 mr-1.5" /> Respondidas
                                </span>
                                <span className="text-sm font-bold text-emerald-700">{surveyStats.responded}</span>
                            </div>
                            <div className="flex justify-between items-center p-2 bg-amber-50 rounded-lg border border-amber-100">
                                <span className="text-xs font-medium text-amber-700 flex items-center">
                                    <AlertTriangle className="w-3 h-3 mr-1.5" /> Pendientes
                                </span>
                                <span className="text-sm font-bold text-amber-700">{surveyStats.pending}</span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 pt-6 border-t border-slate-100">
                        <button 
                            onClick={() => setIsSurveyModalOpen(true)} 
                            className="md:col-span-1 px-4 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition-colors flex items-center justify-center shadow-md shadow-indigo-200"
                        >
                            <Sparkles className="w-4 h-4 mr-2" /> Lanzar Encuesta
                        </button>
                        <button 
                            onClick={() => setIsResultsModalOpen(true)}
                            className="md:col-span-1 px-4 py-2.5 border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors flex items-center justify-center"
                        >
                            <FileBarChart className="w-4 h-4 mr-2" /> Ver Resultados
                        </button>
                        <button 
                            onClick={() => setIsActionPlanModalOpen(true)}
                            className="md:col-span-1 px-4 py-2.5 border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors flex items-center justify-center"
                        >
                            <ClipboardList className="w-4 h-4 mr-2" /> Plan de Acción
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col">
                    <h3 className="font-bold text-slate-900 flex items-center mb-6 text-lg">
                        <Heart className="w-5 h-5 mr-2 text-rose-500" /> Recursos y Apoyo
                    </h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 flex-1">
                        <div className="space-y-3">
                            <p className="text-xs font-bold text-slate-400 uppercase mb-2">Emergencias</p>
                            {[
                                { name: 'Ambulancia', num: '911' },
                                { name: 'Seguridad Planta', num: 'Ext. 5050' },
                                { name: 'Médico Laboral', num: 'Ext. 5051' },
                            ].map((contact, idx) => (
                                <a key={idx} href={`tel:${contact.num}`} className="flex items-center justify-between p-3 bg-rose-50 rounded-lg hover:bg-rose-100 transition-colors cursor-pointer group border border-rose-100">
                                    <span className="text-sm font-medium text-rose-900">{contact.name}</span>
                                    <div className="flex items-center text-rose-600 font-bold text-sm">
                                        <Phone className="w-3 h-3 mr-2" /> {contact.num}
                                    </div>
                                </a>
                            ))}
                        </div>

                        <div className="flex flex-col h-full">
                            <p className="text-xs font-bold text-slate-400 uppercase mb-3">Apoyo Emocional</p>
                            <button className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm flex items-center justify-center shadow-lg shadow-indigo-200 transition-all mb-auto">
                                <MessageCircle className="w-4 h-4 mr-2" /> Chat con Psicólogo
                            </button>

                            <div className="mt-6">
                                <p className="text-xs font-bold text-slate-400 uppercase mb-2">Guías Rápidas</p>
                                <div className="space-y-2">
                                    <button className="w-full flex items-center text-xs text-slate-600 hover:text-indigo-600 hover:underline text-left bg-slate-50 p-2 rounded-lg border border-transparent hover:border-indigo-200 transition-all">
                                        <Download className="w-3 h-3 mr-2 text-slate-400" /> Protocolo Hidratación Campo.pdf
                                    </button>
                                    <button className="w-full flex items-center text-xs text-slate-600 hover:text-indigo-600 hover:underline text-left bg-slate-50 p-2 rounded-lg border border-transparent hover:border-indigo-200 transition-all">
                                        <Download className="w-3 h-3 mr-2 text-slate-400" /> Ergonomía en Oficina.pdf
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="font-bold text-slate-900 flex items-center text-lg">
                            <Activity className="w-5 h-5 mr-2 text-emerald-600" /> Programas de Bienestar Activos
                        </h3>
                        <p className="text-xs text-slate-500 mt-1">Iniciativas vigentes para la salud del personal.</p>
                    </div>
                    <button onClick={() => setIsAddModalOpen(true)} className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 flex items-center shadow-sm shadow-emerald-200">
                        <Plus className="w-4 h-4 mr-2" /> Agregar Programa
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {programs.length > 0 ? programs.map(prog => (
                        <div key={prog.id} className="border border-slate-200 rounded-xl p-5 hover:shadow-lg transition-all bg-white group">
                            <div className="flex justify-between items-start mb-3">
                                <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide
                                    ${prog.category === 'Salud Física' ? 'bg-blue-50 text-blue-700 border border-blue-100' : 
                                      prog.category === 'Integración' ? 'bg-purple-50 text-purple-700 border border-purple-100' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'}`}>
                                    {prog.category}
                                </span>
                                <span className={`w-2.5 h-2.5 rounded-full ${prog.status === 'Activo' ? 'bg-emerald-500 shadow-sm shadow-emerald-200' : 'bg-slate-300'}`}></span>
                            </div>
                            <h4 className="font-bold text-slate-800 mb-1 text-base line-clamp-1 group-hover:text-indigo-600 transition-colors">{prog.name}</h4>
                            <p className="text-xs text-slate-500 mb-4 flex items-center">
                                <Calendar className="w-3 h-3 mr-1 text-slate-400"/> Vence: {prog.endDate}
                            </p>
                            
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs font-medium">
                                    <span className="text-slate-700">{prog.enrolled} inscritos</span>
                                    <span className="text-slate-400">Cupo: {prog.capacity}</span>
                                </div>
                                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                                    <div 
                                        className={`h-full rounded-full transition-all duration-700 ${prog.category === 'Salud Física' ? 'bg-blue-500' : prog.category === 'Integración' ? 'bg-purple-500' : 'bg-emerald-500'}`}
                                        style={{ width: `${(prog.enrolled / prog.capacity) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    )) : (
                         <div className="col-span-3 py-10 text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
                             <p className="text-slate-500 text-sm">No hay programas de bienestar activos.</p>
                         </div>
                    )}
                </div>
            </div>
            
            <AddProgramModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onSave={handleAddProgram} />
            
            <SurveyGeneratorModal 
                isOpen={isSurveyModalOpen} 
                onClose={() => setIsSurveyModalOpen(false)} 
                onLaunch={handleLaunchComplete} 
                onPublish={onPublishSurvey}
            />
            
            <SurveyResultsModal 
                isOpen={isResultsModalOpen} 
                onClose={() => setIsResultsModalOpen(false)}
                activeSurveys={activeSurveys}
            />
            
            <ActionPlanModal 
                isOpen={isActionPlanModalOpen} 
                onClose={() => setIsActionPlanModalOpen(false)} 
            />
        </div>
    );
};

export default HealthView;
