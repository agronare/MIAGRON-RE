
import React, { useState } from 'react';
import { X, Save, Briefcase, User, Calendar, DollarSign, Activity, AlignLeft } from 'lucide-react';
import { Project } from '../../types';

interface NewProjectModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (project: Partial<Project>) => void;
}

export const NewProjectModal: React.FC<NewProjectModalProps> = ({ isOpen, onClose, onSave }) => {
    const [formData, setFormData] = useState<Partial<Project>>({
        name: '',
        manager: '',
        status: 'Planificación',
        health: 'On Track',
        startDate: '',
        endDate: '',
        budget: 0,
        progress: 0,
        description: '',
        teamSize: 1
    });

    if (!isOpen) return null;

    const handleSubmit = () => {
        if (!formData.name || !formData.manager || !formData.startDate) {
            alert('Por favor complete los campos obligatorios.');
            return;
        }
        onSave(formData);
        onClose();
        // Reset form
        setFormData({
            name: '',
            manager: '',
            status: 'Planificación',
            health: 'On Track',
            startDate: '',
            endDate: '',
            budget: 0,
            progress: 0,
            description: '',
            teamSize: 1
        });
    };

    return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95 border border-slate-200 dark:border-slate-800">
                <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center">
                        <Briefcase className="w-5 h-5 mr-2 text-indigo-600 dark:text-indigo-400" /> Nuevo Proyecto
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
                        <X className="w-5 h-5 text-slate-400" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Nombre del Proyecto</label>
                            <input 
                                type="text" 
                                className="w-full p-3 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none bg-white dark:bg-slate-800 dark:text-white"
                                placeholder="Ej. Expansión de Bodega Norte"
                                value={formData.name}
                                onChange={e => setFormData({...formData, name: e.target.value})}
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Project Manager</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input 
                                    type="text" 
                                    className="w-full pl-10 p-3 border border-slate-200 dark:border-slate-700 rounded-lg focus:border-indigo-500 outline-none bg-white dark:bg-slate-800 dark:text-white"
                                    placeholder="Responsable"
                                    value={formData.manager}
                                    onChange={e => setFormData({...formData, manager: e.target.value})}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Presupuesto ($)</label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input 
                                    type="number" 
                                    className="w-full pl-10 p-3 border border-slate-200 dark:border-slate-700 rounded-lg focus:border-indigo-500 outline-none bg-white dark:bg-slate-800 dark:text-white"
                                    placeholder="0.00"
                                    value={formData.budget}
                                    onChange={e => setFormData({...formData, budget: Number(e.target.value)})}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Fecha Inicio</label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input 
                                    type="date" 
                                    className="w-full pl-10 p-3 border border-slate-200 dark:border-slate-700 rounded-lg focus:border-indigo-500 outline-none bg-white dark:bg-slate-800 dark:text-white"
                                    value={formData.startDate}
                                    onChange={e => setFormData({...formData, startDate: e.target.value})}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Fecha Fin Estimada</label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input 
                                    type="date" 
                                    className="w-full pl-10 p-3 border border-slate-200 dark:border-slate-700 rounded-lg focus:border-indigo-500 outline-none bg-white dark:bg-slate-800 dark:text-white"
                                    value={formData.endDate}
                                    onChange={e => setFormData({...formData, endDate: e.target.value})}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Estado Inicial</label>
                            <select 
                                className="w-full p-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 dark:text-white focus:border-indigo-500 outline-none"
                                value={formData.status}
                                onChange={e => setFormData({...formData, status: e.target.value as any})}
                            >
                                <option>Planificación</option>
                                <option>En Curso</option>
                                <option>Pausado</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Salud del Proyecto</label>
                            <div className="relative">
                                <Activity className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <select 
                                    className="w-full pl-10 p-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 dark:text-white focus:border-indigo-500 outline-none"
                                    value={formData.health}
                                    onChange={e => setFormData({...formData, health: e.target.value as any})}
                                >
                                    <option value="On Track">🟢 En Tiempo (On Track)</option>
                                    <option value="At Risk">🟡 En Riesgo (At Risk)</option>
                                    <option value="Delayed">🔴 Retrasado (Delayed)</option>
                                </select>
                            </div>
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Descripción / Alcance</label>
                            <div className="relative">
                                <AlignLeft className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                                <textarea 
                                    className="w-full pl-10 p-3 border border-slate-200 dark:border-slate-700 rounded-lg focus:border-indigo-500 outline-none resize-none bg-white dark:bg-slate-800 dark:text-white"
                                    rows={3}
                                    placeholder="Objetivos principales del proyecto..."
                                    value={formData.description}
                                    onChange={e => setFormData({...formData, description: e.target.value})}
                                ></textarea>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3 rounded-b-xl">
                    <button
                        onClick={onClose}
                        className="button button-secondary"
                        aria-label="Cancelar creación de proyecto"
                        title="Cancelar"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="button"
                        aria-label="Guardar proyecto"
                        title="Guardar"
                    >
                        <Save className="w-4 h-4 mr-2" /> Guardar
                    </button>
                </div>
            </div>
        </div>
    );
};
