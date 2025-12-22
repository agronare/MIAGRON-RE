
import React from 'react';
import { PipelineOpportunity } from '../../types';
import { DollarSign, MoreVertical } from 'lucide-react';

interface PipelineBoardProps {
  opportunities: PipelineOpportunity[];
}

const STAGES = [
    { id: 'prospecto', label: 'Prospecto' },
    { id: 'calificado', label: 'Calificado' },
    { id: 'negociacion', label: 'Negociación' },
    { id: 'ganada', label: 'Ganada' },
    { id: 'perdida', label: 'Perdida' }
];

export const PipelineBoard: React.FC<PipelineBoardProps> = ({ opportunities }) => {
    return (
        <div className="flex gap-6 overflow-x-auto pb-4 -mx-8 px-8" style={{ scrollbarWidth: 'thin' }}>
            {STAGES.map(stage => {
                const stageOpportunities = (opportunities || []).filter(o => o.stage === stage.id);
                const stageValue = stageOpportunities.reduce((sum, op) => sum + op.value, 0);

                return (
                    <div key={stage.id} className="w-80 bg-slate-50 dark:bg-slate-900/50 rounded-xl flex flex-col shrink-0 border border-slate-200 dark:border-slate-800 shadow-sm">
                        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <h3 className="font-bold text-sm uppercase text-slate-700 dark:text-slate-300 tracking-wider">{stage.label}</h3>
                                <span className="text-xs font-mono bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full">
                                    {stageOpportunities.length}
                                </span>
                            </div>
                            <span className="text-sm font-bold text-slate-500 dark:text-slate-400">${stageValue.toLocaleString()}</span>
                        </div>
                        <div className="p-4 space-y-3 overflow-y-auto flex-1">
                            {stageOpportunities.map(op => (
                                <div key={op.id} className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow cursor-grab group">
                                    <div className="flex justify-between items-start">
                                        <p className="font-bold text-sm text-slate-800 dark:text-white mb-1 pr-2">{op.title}</p>
                                        <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 -mt-1 -mr-1 opacity-0 group-hover:opacity-100 transition-opacity"><MoreVertical size={16}/></button>
                                    </div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">{op.client}</p>
                                    <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
                                        <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                                            <DollarSign size={14} />
                                            <span className="font-bold text-sm">${op.value.toLocaleString()}</span>
                                        </div>
                                        <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 flex items-center justify-center text-xs font-bold border border-indigo-200 dark:border-indigo-800" title={op.assignedTo}>
                                            {op.assignedTo ? op.assignedTo.split(' ').map(n=>n[0]).join('') : '?'}
                                        </div>
                                    </div>
                                </div>
                            ))}
                             {stageOpportunities.length === 0 && (
                                <div className="text-center py-10 text-xs text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg">
                                    Arrastra oportunidades aquí
                                </div>
                             )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
