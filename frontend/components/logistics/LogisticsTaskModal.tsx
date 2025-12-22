
import React, { useState } from 'react';
import { X, Save, MapPin, Calendar, FileText, User, Camera, PenTool, CheckCircle, ShoppingCart } from 'lucide-react';
import { LogisticsTask } from '../../types';

interface LogisticsTaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (task: LogisticsTask) => void;
    task?: LogisticsTask | null;
}

export const LogisticsTaskModal: React.FC<LogisticsTaskModalProps> = ({ isOpen, onClose, onSave, task }) => {
    const [formData, setFormData] = useState<Partial<LogisticsTask>>(
        task || {
            type: 'Visita Comercial',
            status: 'Pendiente',
            scheduledDate: new Date().toISOString().split('T')[0] + 'T09:00',
            coordinates: { lat: 0, lng: 0 }
        }
    );

    if (!isOpen) return null;

    const handleSave = () => {
        if (!formData.title || !formData.type) return alert('Complete los campos obligatorios');
        onSave({ ...formData, id: task?.id || `TASK-${Date.now()}` } as LogisticsTask);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95">
                <div className="p-6 border-b flex justify-between items-center">
                    <h2 className="text-xl font-bold text-slate-900 flex items-center">
                        {task ? 'Detalles de Tarea' : 'Nueva Tarea Logística'}
                    </h2>
                    <button onClick={onClose}><X className="w-5 h-5 text-slate-500 hover:text-slate-800"/></button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Type Selection */}
                    {!task && (
                        <div className="grid grid-cols-4 gap-2">
                            {['Visita Comercial', 'Asesoría Técnica', 'Entrega', 'Recolección'].map(type => (
                                <button 
                                    key={type}
                                    onClick={() => setFormData({...formData, type: type as any})}
                                    className={`p-2 text-xs font-bold rounded-lg border transition-all ${formData.type === type ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Cliente / Destino</label>
                            <input type="text" value={formData.title || ''} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full p-2 border rounded-lg" placeholder="Nombre del cliente o lugar" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Fecha Programada</label>
                            <input type="datetime-local" value={formData.scheduledDate || ''} onChange={e => setFormData({...formData, scheduledDate: e.target.value})} className="w-full p-2 border rounded-lg" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Dirección</label>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input type="text" value={formData.address || ''} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full pl-10 p-2 border rounded-lg" placeholder="Dirección completa" />
                        </div>
                    </div>

                    {/* Specific Fields based on Type */}
                    {(formData.type === 'Entrega' || formData.type === 'Recolección') && (
                        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                            <h4 className="font-bold text-sm text-slate-800 mb-3 flex items-center"><ShoppingCart className="w-4 h-4 mr-2"/> Detalle de Carga</h4>
                            <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1">Items / Descripción</label>
                                <textarea value={formData.items || ''} onChange={e => setFormData({...formData, items: e.target.value})} className="w-full p-2 border rounded-lg" rows={2} placeholder="Lista de productos, peso, etc."></textarea>
                            </div>
                        </div>
                    )}

                    {formData.type === 'Asesoría Técnica' && (
                        <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
                            <h4 className="font-bold text-sm text-emerald-900 mb-3 flex items-center"><FileText className="w-4 h-4 mr-2"/> Bitácora Técnica</h4>
                            <div>
                                <label className="block text-xs font-medium text-emerald-800 mb-1">Diagnóstico y Recomendaciones</label>
                                <textarea value={formData.diagnosticReport || ''} onChange={e => setFormData({...formData, diagnosticReport: e.target.value})} className="w-full p-2 border border-emerald-200 rounded-lg focus:border-emerald-500 outline-none" rows={3} placeholder="Estado del cultivo, plagas, productos sugeridos..."></textarea>
                            </div>
                        </div>
                    )}

                    {/* Evidence Section (Simulated) */}
                    <div className="border-t border-slate-100 pt-4">
                        <h4 className="font-bold text-sm text-slate-800 mb-3">Evidencia de Campo</h4>
                        <div className="flex gap-3">
                            <button className="flex-1 py-3 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center text-slate-400 hover:border-indigo-400 hover:text-indigo-500 hover:bg-indigo-50 transition-colors">
                                <Camera className="w-6 h-6 mb-1" />
                                <span className="text-xs font-medium">Tomar Foto</span>
                            </button>
                            <button className="flex-1 py-3 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center text-slate-400 hover:border-indigo-400 hover:text-indigo-500 hover:bg-indigo-50 transition-colors">
                                <PenTool className="w-6 h-6 mb-1" />
                                <span className="text-xs font-medium">Firma Digital</span>
                            </button>
                        </div>
                        {formData.proofOfDelivery && (
                            <div className="mt-2 flex items-center text-emerald-600 text-xs font-bold">
                                <CheckCircle className="w-3 h-3 mr-1" /> Evidencia adjunta
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Asignar A</label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input type="text" value={formData.assignedTo || ''} onChange={e => setFormData({...formData, assignedTo: e.target.value})} className="w-full pl-10 p-2 border rounded-lg" placeholder="Nombre del chofer o técnico" />
                        </div>
                    </div>
                </div>

                <div className="p-4 bg-slate-50 border-t flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 border rounded-lg hover:bg-slate-100">Cancelar</button>
                    <button onClick={handleSave} className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center font-bold">
                        <Save className="w-4 h-4 mr-2" /> Guardar Tarea
                    </button>
                </div>
            </div>
        </div>
    );
};
