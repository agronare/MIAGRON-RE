import React, { useState, useEffect } from 'react';
import { X, Save, Sparkles, Loader2, Bot as BotIcon, ListChecks, ChevronRight } from 'lucide-react';
import { Bot } from '../../types';
import { generateBotConfigFromPrompt } from '../../services/geminiService';

interface NewBotModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (bot: Bot) => void;
    initialData: Bot | null;
}

const defaultBot: Partial<Bot> = {
    name: '',
    description: '',
    status: 'Activo',
    schedule: 'N/A',
    type: 'Manual',
    lastRun: 'Nunca',
    nextRun: 'N/A',
    actions: []
};

export const NewBotModal: React.FC<NewBotModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
    const [formData, setFormData] = useState<Partial<Bot>>(defaultBot);
    const [naturalLanguagePrompt, setNaturalLanguagePrompt] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setFormData({
                    name: initialData.name ?? defaultBot.name,
                    description: initialData.description ?? defaultBot.description,
                    status: initialData.status ?? defaultBot.status,
                    schedule: initialData.schedule ?? defaultBot.schedule,
                    type: initialData.type ?? defaultBot.type,
                    lastRun: initialData.lastRun ?? defaultBot.lastRun,
                    nextRun: initialData.nextRun ?? defaultBot.nextRun,
                    actions: initialData.actions ?? defaultBot.actions,
                });
                setNaturalLanguagePrompt(initialData?.description || '');
            } else {
                setFormData(defaultBot);
                setNaturalLanguagePrompt('');
            }
        }
    }, [initialData, isOpen]);

    const handleAnalyze = async () => {
        if (!naturalLanguagePrompt) return;
        setIsAnalyzing(true);
        try {
            const config = await generateBotConfigFromPrompt(naturalLanguagePrompt);
            setFormData(prev => ({
                ...prev,
                name: config.name || prev.name,
                description: config.description || prev.description,
                type: config.type || prev.type,
                schedule: config.schedule || prev.schedule,
                actions: config.actions || prev.actions,
            }));
        } catch (error) {
            console.error(error);
            alert('Error al analizar la descripción. Por favor, intente de nuevo.');
        } finally {
            setIsAnalyzing(false);
        }
    };
    
    const handleSave = () => {
        if (!formData.name || !formData.description) {
            alert('Por favor, asigne un nombre y descripción al bot.');
            return;
        }
        onSave(formData as Bot);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4 transition-all font-sans">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-3xl flex flex-col max-h-[90vh] animate-in zoom-in-95 border border-slate-200 dark:border-slate-800">
                
                <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">{initialData ? 'Editar' : 'Nuevo'} Bot RPA</h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
                        <X className="w-5 h-5 text-slate-400" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">1. Describe la tarea a automatizar</label>
                        <textarea
                            value={naturalLanguagePrompt}
                            onChange={e => setNaturalLanguagePrompt(e.target.value)}
                            className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-slate-50 dark:bg-slate-800 focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 outline-none resize-none"
                            rows={3}
                            placeholder="Ej: Cada día a las 8 AM, revisa los nuevos correos con el asunto 'Factura' y guarda los PDFs adjuntos en la carpeta 'Facturas Proveedores'."
                        />
                        <button
                            onClick={handleAnalyze}
                            disabled={isAnalyzing || !naturalLanguagePrompt}
                            className="mt-2 flex items-center justify-center w-full px-4 py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                        >
                            {isAnalyzing ? <Loader2 className="w-5 h-5 animate-spin"/> : <Sparkles className="w-5 h-5 mr-2"/>}
                            {isAnalyzing ? 'Analizando...' : 'Analizar con IA para autocompletar'}
                        </button>
                    </div>

                    <div className="border-t border-dashed border-slate-300 dark:border-slate-700 my-6"></div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">2. Revisa la configuración del Bot</label>
                        <div className="space-y-4 bg-slate-50 dark:bg-slate-800/50 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Nombre del Bot</label>
                                    <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-2 border rounded-md" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Disparador (Trigger)</label>
                                    <input type="text" value={formData.schedule} onChange={e => setFormData({...formData, schedule: e.target.value})} className="w-full p-2 border rounded-md" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Descripción</label>
                                <input type="text" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full p-2 border rounded-md" />
                            </div>
                            {formData.actions && formData.actions.length > 0 && (
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Pasos a ejecutar</label>
                                    <div className="space-y-2">
                                        {formData.actions.map((action, index) => (
                                            <div key={index} className="flex items-center p-2 bg-white dark:bg-slate-700 rounded-md border border-slate-200 dark:border-slate-600">
                                                <ChevronRight className="w-4 h-4 mr-2 text-indigo-500" />
                                                <span className="text-sm text-slate-700 dark:text-slate-300">{action}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="px-6 py-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
                    <button onClick={onClose} className="px-6 py-2 text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">Cancelar</button>
                    <button onClick={handleSave} className="px-8 py-2 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200/50 dark:shadow-none flex items-center transition-all active:scale-95">
                        <Save className="w-4 h-4 mr-2" /> Guardar Bot
                    </button>
                </div>
            </div>
        </div>
    );
};
