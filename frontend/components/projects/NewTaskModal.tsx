
import React, { useState, useEffect } from 'react';
import { X, Save, CheckSquare, User, Calendar, Tag, AlignLeft } from 'lucide-react';
import { Task, Project } from '../../types';

interface NewTaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (task: Partial<Task>) => void;
    initialStatus?: string;
    projects: Project[];
}

export const NewTaskModal: React.FC<NewTaskModalProps> = ({ isOpen, onClose, onSave, initialStatus, projects }) => {
    const [formData, setFormData] = useState<Partial<Task>>({
        title: '',
        assignee: '',
        status: 'todo',
        priority: 'medium',
        dueDate: new Date().toISOString().split('T')[0],
        project: '',
        tag: ''
    });

    useEffect(() => {
        if (isOpen) {
            setFormData(prev => ({
                ...prev,
                status: (initialStatus as any) || 'todo',
                project: projects[0]?.id || ''
            }));
        }
    }, [isOpen, initialStatus, projects]);

    if (!isOpen) return null;

    const handleSubmit = () => {
        if (!formData.title || !formData.assignee) {
            alert('Por favor complete el título y el responsable.');
            return;
        }
        onSave(formData);
        onClose();
        setFormData({
            title: '',
            assignee: '',
            status: 'todo',
            priority: 'medium',
            dueDate: new Date().toISOString().split('T')[0],
            project: '',
            tag: ''
        });
    };

    return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-lg flex flex-col animate-in zoom-in-95 border border-slate-200 dark:border-slate-800">
                <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center">
                        <CheckSquare className="w-5 h-5 mr-2 text-indigo-600 dark:text-indigo-400" /> Nueva Tarea
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
                        <X className="w-5 h-5 text-slate-400" />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Título de la Tarea</label>
                        <input 
                            type="text" 
                            className="w-full p-3 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none bg-white dark:bg-slate-800 dark:text-white"
                            placeholder="Ej. Revisar documentación"
                            value={formData.title}
                            onChange={e => setFormData({...formData, title: e.target.value})}
                            autoFocus
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Proyecto</label>
                            <select 
                                className="w-full p-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 dark:text-white focus:border-indigo-500 outline-none text-sm"
                                value={formData.project}
                                onChange={e => setFormData({...formData, project: e.target.value})}
                            >
                                <option value="">Seleccionar...</option>
                                {projects.map(p => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Estado</label>
                            <select 
                                className="w-full p-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 dark:text-white focus:border-indigo-500 outline-none text-sm"
                                value={formData.status}
                                onChange={e => setFormData({...formData, status: e.target.value as any})}
                            >
                                <option value="todo">Por Hacer</option>
                                <option value="in-progress">En Curso</option>
                                <option value="review">Revisión</option>
                                <option value="done">Completado</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Asignado a</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input 
                                    type="text" 
                                    className="w-full pl-9 p-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 dark:text-white focus:border-indigo-500 outline-none text-sm"
                                    placeholder="Nombre"
                                    value={formData.assignee}
                                    onChange={e => setFormData({...formData, assignee: e.target.value})}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Prioridad</label>
                            <select 
                                className="w-full p-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 dark:text-white focus:border-indigo-500 outline-none text-sm"
                                value={formData.priority}
                                onChange={e => setFormData({...formData, priority: e.target.value as any})}
                            >
                                <option value="low">Baja</option>
                                <option value="medium">Media</option>
                                <option value="high">Alta</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Fecha Límite</label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input 
                                type="date" 
                                className="w-full pl-9 p-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 dark:text-white focus:border-indigo-500 outline-none text-sm"
                                value={formData.dueDate}
                                onChange={e => setFormData({...formData, dueDate: e.target.value})}
                            />
                        </div>
                    </div>
                </div>

                <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3 rounded-b-xl">
                    <button onClick={onClose} className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 font-medium transition-colors">
                        Cancelar
                    </button>
                    <button onClick={handleSubmit} className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 shadow-sm flex items-center transition-all">
                        <Save className="w-4 h-4 mr-2" /> Guardar Tarea
                    </button>
                </div>
            </div>
        </div>
    );
};
