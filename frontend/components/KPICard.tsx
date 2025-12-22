import React from 'react';
import { KPI } from '../types';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface KPICardProps {
  data: KPI;
}

export const KPICard: React.FC<KPICardProps> = ({ data }) => {
  const Icon = data.icon;
  
  return (
    <div className="card p-6 flex flex-col justify-between h-full hover:shadow-md transition-shadow duration-200">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-slate-300 text-sm font-medium truncate pr-2 h3">{data.title}</h3>
        <div className={`p-2 rounded-full ${data.iconBg}`}>
          <Icon className={`w-4 h-4 ${data.iconColor}`} />
        </div>
      </div>
      
      <div>
        <div className="flex items-baseline gap-2 mb-1">
            <span className="text-2xl font-bold">{data.value}</span>
            {data.valueLabel && (
                <span className="text-sm font-medium text-slate-400">{data.valueLabel}</span>
            )}
        </div>
        {data.change !== undefined && data.change !== 0 ? (
          <div className="flex items-center text-xs font-medium text-emerald-600 dark:text-emerald-500">
            <TrendingUp className="w-3 h-3 mr-1" />
            <span>+{data.change.toFixed(1)}%</span>
            <span className="text-slate-400 dark:text-slate-500 ml-1 font-normal">{data.changeLabel}</span>
          </div>
        ) : (
           <div className="h-4"></div> // Spacer to keep alignment if no change
        )}
      </div>
    </div>
  );
};