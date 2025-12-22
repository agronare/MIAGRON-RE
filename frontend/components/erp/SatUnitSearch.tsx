
import React, { useState } from 'react';
import { Search, Box } from 'lucide-react';
import { SAT_UNIT_CATALOG } from '../../constants';

export const SatUnitSearch = ({ onSelect, initialValue }: { onSelect: (item: any) => void, initialValue?: string }) => {
    const [query, setQuery] = useState(initialValue || '');
    const [isOpen, setIsOpen] = useState(false);
    const [filteredData, setFilteredData] = useState(SAT_UNIT_CATALOG);
    
    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const text = e.target.value; 
        setQuery(text); 
        setIsOpen(true);
        setFilteredData(SAT_UNIT_CATALOG.filter(item => 
            item.code.toLowerCase().includes(text.toLowerCase()) || 
            item.name.toLowerCase().includes(text.toLowerCase())
        ));
    };

    return (
        <div className="relative w-full">
            <div className="relative">
                 <Box className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                    type="text" 
                    value={query} 
                    onChange={handleSearch} 
                    onFocus={() => setIsOpen(true)} 
                    onBlur={() => setTimeout(() => setIsOpen(false), 200)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all bg-white" 
                    placeholder="Ej: H87, KGM, LTR" 
                />
            </div>
            {isOpen && filteredData.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white rounded-xl shadow-xl border border-slate-200 max-h-60 overflow-y-auto">
                    <ul>
                        {filteredData.map((item) => (
                            <li 
                                key={item.code} 
                                onMouseDown={() => { 
                                    onSelect(item); 
                                    setQuery(`${item.code} - ${item.name}`); 
                                    setIsOpen(false); 
                                }} 
                                className="px-4 py-2.5 hover:bg-indigo-50 cursor-pointer border-b border-slate-50 last:border-0"
                            >
                                <div className="flex justify-between items-center">
                                    <span className="font-bold text-indigo-700 text-xs bg-indigo-50 px-1.5 py-0.5 rounded">{item.code}</span>
                                    <span className="text-xs text-slate-600">{item.name}</span>
                                </div>
                                <p className="text-[10px] text-slate-400 mt-0.5 truncate">{item.description}</p>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};
