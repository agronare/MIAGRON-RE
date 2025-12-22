
import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { SAT_CATALOG } from '../../constants';

export const SatKeySearch = ({ onSelect, initialValue }: { onSelect: (item: any) => void, initialValue?: string }) => {
    const [query, setQuery] = useState(initialValue || '');
    const [isOpen, setIsOpen] = useState(false);
    const [filteredData, setFilteredData] = useState(SAT_CATALOG);
    
    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const text = e.target.value; setQuery(text); setIsOpen(true);
        setFilteredData(SAT_CATALOG.filter(item => item.code.includes(text) || item.description.toLowerCase().includes(text.toLowerCase())));
    };

    return (
        <div className="relative">
            <input type="text" value={query} onChange={handleSearch} onFocus={() => setIsOpen(true)} onBlur={() => setTimeout(() => setIsOpen(false), 200)}
                className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-slate-200 text-sm outline-none focus:border-indigo-500" placeholder="Buscar código o descripción" />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            {isOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white rounded-xl shadow-xl border border-slate-200 max-h-40 overflow-y-auto">
                    <ul>{filteredData.map((item) => (
                        <li key={item.code} onMouseDown={() => { onSelect(item); setQuery(`${item.code} - ${item.description}`); setIsOpen(false); }} className="px-4 py-2 hover:bg-indigo-50 cursor-pointer border-b border-slate-50 text-xs">
                            <span className="font-bold text-indigo-700">{item.code}</span> - {item.description}
                        </li>
                    ))}</ul>
                </div>
            )}
        </div>
    );
};
