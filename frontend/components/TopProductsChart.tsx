
import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { ProductData } from '../types';

interface TopProductsChartProps {
  data: ProductData[];
}

export const TopProductsChart: React.FC<TopProductsChartProps> = ({ data }) => {
  return (
    <div className="p-6 h-full flex flex-col" style={{ minHeight: '320px' }}>
      <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-6">Top 5 Productos (30d)</h3>
      <div className="flex-grow w-full" style={{ minHeight: '240px' }}>
        <ResponsiveContainer width="100%" height={240} minWidth={0}>
          <BarChart
            data={data}
            layout="horizontal"
            margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
            barSize={32}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--card-2)" />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false}
              tick={{ fill: 'var(--muted)', fontSize: 10 }}
              interval={0}
              dy={10}
            />
            <YAxis hide />
            <Tooltip 
              cursor={{fill: 'transparent'}}
              contentStyle={{ background: 'var(--card)', color: 'var(--text)', border: '1px solid rgba(99,102,241,0.25)', borderRadius: '8px' }}
            />
            <Bar dataKey="sales" radius={[4, 4, 0, 0]}>
               {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill="var(--brand)" />
                ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
