import React, { useState, useRef, useEffect } from 'react';
import { Bot } from '../../types';
import { Play, Clock, MoreVertical, Zap, AlertCircle, CheckCircle, XCircle, Pencil, Trash2, Power, PowerOff } from 'lucide-react';

interface BotCardProps {
    bot: Bot;
    onRun: () => void;
    onToggle: () => void;
    onEdit: () => void;
    onDelete: () => void;
}

export const BotCard: React.FC<BotCardProps> = ({ bot, onRun, onToggle, onEdit, onDelete }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);
    
    const statusConfig = {
        Activo: {
            bg: 'bg-emerald-50 dark:bg-emerald-900/20',
            text: 'text-emerald-700 dark:text-emerald-400',
            border: 'border-emerald-100 dark:border-emerald-800',
            icon: Play,
        },
        Inactivo: {
            bg: 'bg-slate-50 dark:bg-slate-800',
            text: 'text-slate-600 dark:text-slate-400',
            border: 'border-slate-100 dark:border-slate-700',
            icon: PowerOff,
        },
        Error: {
            bg: 'bg-red-50 dark:bg-red-900/20',
            text: 'text-red-700 dark:text-red-400',
            border: 'border-red-100 dark:border-red-800',
            icon: AlertCircle,
        },
    };

    const currentStatus = statusConfig[bot.status];
    const StatusIcon = currentStatus.icon;

    return (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-lg transition-all hover:border-blue-200 dark:hover:border-blue-800">
            <div className="flex justify-between items-start mb-4">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${currentStatus.bg} ${currentStatus.text} ${currentStatus.border}`}>
                    <StatusIcon className={`w-3 h-3 mr-1.5 ${bot.status === 'Activo' ? 'fill-current' : ''}`} />
                    {bot.status}
                </span>

                <div className="relative" ref={menuRef}>
                    <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
                        <MoreVertical className="w-5 h-5" />
                    </button>
                    {isMenuOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-100 dark:border-slate-700 z-10 animate-in fade-in zoom-in-95">
                            <div className="p-1">
                                <button onClick={onRun} className="w-full flex items-center px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded">
                                    <Play className="w-4 h-4 mr-2" /> Ejecutar ahora
                                </button>
                                <button onClick={onToggle} className="w-full flex items-center px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded">
                                    {bot.status === 'Activo' ? <PowerOff className="w-4 h-4 mr-2" /> : <Power className="w-4 h-4 mr-2" />}
                                    {bot.status === 'Activo' ? 'Desactivar' : 'Activar'}
                                </button>
                                <button onClick={onEdit} className="w-full flex items-center px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded">
                                    <Pencil className="w-4 h-4 mr-2" /> Editar
                                </button>
                                <div className="h-px bg-slate-100 dark:bg-slate-700 my-1"></div>
                                <button onClick={onDelete} className="w-full flex items-center px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded">
                                    <Trash2 className="w-4 h-4 mr-2" /> Eliminar
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{bot.name}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 line-clamp-2 h-10">{bot.description}</p>

            <div className="space-y-3 border-t border-slate-100 dark:border-slate-800 pt-4">
                <div className="flex items-center text-xs text-slate-500 dark:text-slate-400">
                     <Clock className="w-4 h-4 mr-2 text-slate-400 dark:text-slate-500" />
                     <span className="font-medium mr-1 text-slate-700 dark:text-slate-300">Programado:</span> {bot.schedule}
                </div>
                 <div className="flex items-center text-xs text-slate-500 dark:text-slate-400">
                     <span className="w-4 mr-2"></span>
                     <span className="font-medium mr-1 text-slate-700 dark:text-slate-300">Última ejecución:</span> {bot.lastRun}
                </div>
                 <div className="flex items-center text-xs text-slate-500 dark:text-slate-400">
                     <span className="w-4 mr-2"></span>
                     <span className="font-medium mr-1 text-slate-700 dark:text-slate-300">Próxima ejecución:</span> {bot.nextRun}
                </div>
            </div>

             {bot.type === 'Webhook' && (
                <div className="mt-4 flex items-center text-xs text-indigo-500 dark:text-indigo-400">
                    <Zap className="w-3 h-3 mr-1" /> Webhook Trigger
                </div>
            )}
        </div>
    );
};
