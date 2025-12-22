import React, { useState, useMemo } from 'react';
import { FixedAsset, Branch } from '../../types';
import { Search, Plus, Pencil, Trash2, FileDown, DollarSign, TrendingDown, BookOpen, Filter } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface FixedAssetsViewProps {
    assets: FixedAsset[];
    onOpenModal: (asset: FixedAsset | null) => void;
    onDelete: (id: string) => void;
    branches: Branch[];
}

const calculateDepreciation = (asset: FixedAsset) => {
    const acquisitionDate = new Date(asset.acquisitionDate);
    const now = new Date();
    
    const monthsElapsed = (now.getFullYear() - acquisitionDate.getFullYear()) * 12 + (now.getMonth() - acquisitionDate.getMonth());
    const totalMonths = asset.usefulLife * 12;

    if (monthsElapsed <= 0) {
        return { monthlyDepreciation: asset.acquisitionCost / totalMonths, currentValue: asset.acquisitionCost, accumulatedDepreciation: 0 };
    }

    const effectiveMonths = Math.min(monthsElapsed, totalMonths);
    const monthlyDepreciation = asset.acquisitionCost / totalMonths;
    const accumulatedDepreciation = monthlyDepreciation * effectiveMonths;
    const currentValue = asset.acquisitionCost - accumulatedDepreciation;

    return { monthlyDepreciation, currentValue, accumulatedDepreciation };
};

export const FixedAssetsView: React.FC<FixedAssetsViewProps> = ({ assets, onOpenModal, onDelete, branches }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('Todos');

    const processedAssets = useMemo(() => {
        return assets.map(asset => ({
            ...asset,
            ...calculateDepreciation(asset)
        }));
    }, [assets]);
    
    const filteredAssets = useMemo(() => {
        return processedAssets.filter(asset => {
            const matchesSearch = asset.name.toLowerCase().includes(searchTerm.toLowerCase()) || asset.assetId.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = categoryFilter === 'Todos' || asset.category === categoryFilter;
            return matchesSearch && matchesCategory;
        });
    }, [processedAssets, searchTerm, categoryFilter]);
    
    const kpis = useMemo(() => {
        const totalValue = processedAssets.reduce((sum, a) => sum + a.acquisitionCost, 0);
        const totalAccumulatedDepreciation = processedAssets.reduce((sum, a) => sum + a.accumulatedDepreciation, 0);
        const currentBookValue = totalValue - totalAccumulatedDepreciation;
        return { totalValue, totalAccumulatedDepreciation, currentBookValue };
    }, [processedAssets]);
    
    const handleExportPDF = () => {
        const doc = new jsPDF();
        doc.text("Listado de Activos Fijos", 14, 10);
        autoTable(doc, {
            head: [['ID', 'Nombre', 'Categoría', 'Costo Adq.', 'Valor en Libros']],
            body: filteredAssets.map(a => [
                a.assetId,
                a.name,
                a.category,
                `$${a.acquisitionCost.toLocaleString()}`,
                `$${a.currentValue.toLocaleString()}`
            ]),
            startY: 20
        });
        doc.save(`activos_fijos_${new Date().toISOString().split('T')[0]}.pdf`);
    };

    const statusConfig: { [key in FixedAsset['status']]: { color: string } } = {
        'Activo': { color: 'bg-emerald-100 text-emerald-800' },
        'En Mantenimiento': { color: 'bg-amber-100 text-amber-800' },
        'Dado de Baja': { color: 'bg-red-100 text-red-800' },
    };

    return (
        <div className="animate-fadeIn space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <KPICard icon={DollarSign} title="Valor Total de Activos" value={`$${kpis.totalValue.toLocaleString()}`} color="blue" />
                <KPICard icon={TrendingDown} title="Depreciación Acumulada" value={`$${kpis.totalAccumulatedDepreciation.toLocaleString()}`} color="amber" />
                <KPICard icon={BookOpen} title="Valor en Libros Actual" value={`$${kpis.currentBookValue.toLocaleString()}`} color="emerald" />
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
                 <div className="relative w-full sm:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input type="text" placeholder="Buscar por nombre o ID..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm" />
                </div>
                 <div className="flex gap-2 w-full sm:w-auto">
                     <div className="relative flex-1 sm:w-48">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm bg-white appearance-none">
                            <option>Todos</option>
                            <option>Maquinaria</option>
                            <option>Vehículo</option>
                            <option>Equipo de Cómputo</option>
                            <option>Mobiliario</option>
                            <option>Edificios</option>
                        </select>
                    </div>
                    <button onClick={handleExportPDF} className="px-4 py-2 border rounded-lg text-sm font-medium flex items-center"><FileDown size={16} className="mr-2" /> Exportar</button>
                    <button onClick={() => onOpenModal(null)} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium flex items-center"><Plus size={16} className="mr-2" /> Nuevo Activo</button>
                </div>
            </div>

            <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
                <table className="w-full">
                    <thead className="bg-slate-50 border-b">
                        <tr>
                            <th className="p-3 text-left text-xs font-semibold text-slate-500 uppercase">Activo</th>
                            <th className="p-3 text-left text-xs font-semibold text-slate-500 uppercase">Categoría</th>
                            <th className="p-3 text-right text-xs font-semibold text-slate-500 uppercase">Costo Adquisición</th>
                            <th className="p-3 text-right text-xs font-semibold text-slate-500 uppercase">Valor en Libros</th>
                            <th className="p-3 text-center text-xs font-semibold text-slate-500 uppercase">Estado</th>
                            <th className="p-3 text-right text-xs font-semibold text-slate-500 uppercase">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filteredAssets.map(asset => (
                            <tr key={asset.id} className="hover:bg-slate-50">
                                <td className="p-3"><p className="font-medium text-slate-900">{asset.name}</p><p className="text-xs text-slate-500 font-mono">{asset.assetId}</p></td>
                                <td className="p-3 text-sm">{asset.category}</td>
                                <td className="p-3 text-right text-sm">${asset.acquisitionCost.toLocaleString()}</td>
                                <td className="p-3 text-right font-bold text-sm text-emerald-700">${asset.currentValue.toLocaleString()}</td>
                                <td className="p-3 text-center">
                                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${statusConfig[asset.status].color}`}>
                                        {asset.status}
                                    </span>
                                </td>
                                <td className="p-3 text-right">
                                    <button onClick={() => onOpenModal(asset)} className="p-1.5 rounded text-indigo-500 hover:bg-indigo-50"><Pencil size={16} /></button>
                                    <button onClick={() => onDelete(asset.id)} className="p-1.5 rounded text-red-500 hover:bg-red-50 ml-2"><Trash2 size={16} /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const KPICard = ({ icon: Icon, title, value, color }: { icon: React.FC<any>, title: string, value: string, color: string }) => {
    const colors: { [key: string]: string } = {
        blue: 'bg-blue-50 text-blue-600',
        emerald: 'bg-emerald-50 text-emerald-600',
        amber: 'bg-amber-50 text-amber-600',
    };
    return (
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className={`p-2 rounded-lg w-fit mb-2 ${colors[color]}`}><Icon size={20} /></div>
            <p className="text-sm text-slate-500 font-medium">{title}</p>
            <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
        </div>
    );
};