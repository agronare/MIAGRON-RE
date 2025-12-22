

import React, { useState, useEffect, useMemo } from 'react';
import { X, Save, Factory, DollarSign, TrendingDown, Book } from 'lucide-react';
import { FixedAsset, Branch } from '../../types';

interface FixedAssetModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (asset: FixedAsset) => void;
    initialData: FixedAsset | null;
    branches: Branch[];
}

const defaultAsset: Partial<FixedAsset> = {
    name: '',
    assetId: '',
    category: 'Maquinaria',
    description: '',
    status: 'Activo',
    acquisitionCost: 0,
    acquisitionDate: new Date().toISOString().split('T')[0],
    usefulLife: 5,
    branch: '',
    depreciationMethod: 'Lineal',
    salvageValue: 0,
};

export const FixedAssetModal: React.FC<FixedAssetModalProps> = ({ isOpen, onClose, onSave, initialData, branches }) => {
    const [formData, setFormData] = useState<Partial<FixedAsset>>(defaultAsset);

    useEffect(() => {
        if (isOpen) {
            const data = initialData 
                ? { ...initialData, acquisitionDate: new Date(initialData.acquisitionDate).toISOString().split('T')[0] } 
                : { 
                    ...defaultAsset, 
                    assetId: `ACT-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
                    // Default to first branch if available
                    branch: (branches && branches.length > 0) ? branches[0].name : '' 
                  };
            setFormData(data);
        }
    }, [initialData, isOpen, branches]);
    
    const financials = useMemo(() => {
        const cost = Number(formData.acquisitionCost) || 0;
        const life = Number(formData.usefulLife) || 1;
        const salvage = Number(formData.salvageValue) || 0;
        const method = formData.depreciationMethod || 'Lineal';
        const date = formData.acquisitionDate ? new Date(formData.acquisitionDate) : new Date();

        if (cost <= 0 || life <= 0 || cost < salvage) {
            return { annualDepreciation: 0, currentValue: cost };
        }
        
        const depreciableBase = cost - salvage;
        
        const now = new Date();
        const yearsElapsed = (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
        const effectiveYears = Math.min(Math.max(0, yearsElapsed), life);

        let annualDepreciation = 0;
        let accumulatedDepreciation = 0;
        
        if (method === 'Lineal') {
            annualDepreciation = depreciableBase / life;
            accumulatedDepreciation = annualDepreciation * effectiveYears;
        } else { // Saldo Decreciente Doble
            const rate = 2 / life;
            // First year's depreciation for display
            annualDepreciation = cost * rate;
            
            // Calculate accumulated depreciation up to the current date
            let tempBookValue = cost;
            const fullYears = Math.floor(effectiveYears);

            for (let i = 0; i < fullYears; i++) {
                const yearlyDepreciation = Math.min(tempBookValue * rate, tempBookValue - salvage);
                if (tempBookValue - yearlyDepreciation < salvage) {
                    accumulatedDepreciation += tempBookValue - salvage;
                    break;
                }
                accumulatedDepreciation += yearlyDepreciation;
                tempBookValue -= yearlyDepreciation;
            }
            // Fractional part of the year
            const partialYear = effectiveYears - fullYears;
            if (partialYear > 0 && tempBookValue > salvage) {
                const partialDepreciation = Math.min(tempBookValue * rate * partialYear, tempBookValue - salvage);
                accumulatedDepreciation += partialDepreciation;
            }
        }
        
        const currentValue = Math.max(salvage, cost - accumulatedDepreciation);

        return { annualDepreciation, currentValue };
    }, [formData.acquisitionCost, formData.acquisitionDate, formData.usefulLife, formData.salvageValue, formData.depreciationMethod]);

    if (!isOpen) return null;

    const handleSave = () => {
        onSave(formData as FixedAsset);
    };

    const handleChange = (field: keyof FixedAsset, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl flex flex-col max-h-[90vh]">
                <div className="p-6 border-b flex justify-between items-center">
                    <h2 className="text-xl font-bold text-slate-900 flex items-center">
                        <Factory className="w-5 h-5 mr-3 text-indigo-600" />
                        {initialData ? 'Editar' : 'Nuevo'} Activo Fijo
                    </h2>
                    <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-full"><X className="w-5 h-5 text-slate-500" /></button>
                </div>
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><label className="text-sm font-medium">Nombre del Activo</label><input type="text" value={formData.name || ''} onChange={e => handleChange('name', e.target.value)} className="w-full p-2 border rounded-lg mt-1" /></div>
                        <div><label className="text-sm font-medium">ID del Activo</label><input type="text" value={formData.assetId || ''} onChange={e => handleChange('assetId', e.target.value)} className="w-full p-2 border rounded-lg mt-1 bg-slate-50" readOnly /></div>
                    </div>
                    <div><label className="text-sm font-medium">Descripción</label><textarea value={formData.description || ''} onChange={e => handleChange('description', e.target.value)} className="w-full p-2 border rounded-lg mt-1" rows={2}></textarea></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><label className="text-sm font-medium">Categoría</label><select value={formData.category} onChange={e => handleChange('category', e.target.value)} className="w-full p-2 border rounded-lg mt-1 bg-white"><option>Maquinaria</option><option>Vehículo</option><option>Equipo de Cómputo</option><option>Mobiliario</option><option>Edificios</option></select></div>
                        <div>
                            <label className="text-sm font-medium">Sucursal</label>
                            <select 
                                value={formData.branch} 
                                onChange={e => handleChange('branch', e.target.value)} 
                                className="w-full p-2 border rounded-lg mt-1 bg-white"
                            >
                                {branches && branches.length > 0 ? (
                                    branches.map(b => <option key={b.id} value={b.name}>{b.name}</option>)
                                ) : (
                                    <option value="">Sin sucursales disponibles</option>
                                )}
                            </select>
                        </div>
                    </div>
                     <div className="p-4 rounded-lg border bg-slate-50 space-y-4">
                         <h3 className="font-bold text-sm text-slate-600">Información Financiera</h3>
                         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div><label className="text-sm font-medium">Costo de Adquisición</label><input type="number" value={formData.acquisitionCost || ''} onChange={e => handleChange('acquisitionCost', Number(e.target.value))} className="w-full p-2 border rounded-lg mt-1" /></div>
                            <div><label className="text-sm font-medium">Fecha de Adquisición</label><input type="date" value={formData.acquisitionDate || ''} onChange={e => handleChange('acquisitionDate', e.target.value)} className="w-full p-2 border rounded-lg mt-1 bg-white" /></div>
                             <div><label className="text-sm font-medium">Vida Útil (años)</label><input type="number" value={formData.usefulLife || ''} onChange={e => handleChange('usefulLife', Number(e.target.value))} className="w-full p-2 border rounded-lg mt-1" /></div>
                         </div>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div>
                                 <label className="text-sm font-medium">Método de Depreciación</label>
                                 <select value={formData.depreciationMethod} onChange={e => handleChange('depreciationMethod', e.target.value)} className="w-full p-2 border rounded-lg mt-1 bg-white">
                                     <option value="Lineal">Lineal</option>
                                     <option value="Saldo Decreciente">Saldo Decreciente Doble</option>
                                 </select>
                             </div>
                             <div>
                                 <label className="text-sm font-medium">Valor de Rescate (MXN)</label>
                                 <input type="number" value={formData.salvageValue || ''} onChange={e => handleChange('salvageValue', Number(e.target.value))} className="w-full p-2 border rounded-lg mt-1" />
                             </div>
                         </div>
                    </div>
                    
                    <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200 mt-4 space-y-3">
                        <div className="flex justify-between items-center">
                            <label className="text-sm font-medium text-slate-600 flex items-center"><TrendingDown className="w-4 h-4 mr-2 text-amber-500" />Depreciación Anual (MXN)</label>
                            <p className="font-bold text-amber-600 bg-white px-3 py-1 rounded-md border border-slate-200">${financials.annualDepreciation.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                        </div>
                        <div className="flex justify-between items-center">
                            <label className="text-sm font-medium text-slate-600 flex items-center"><Book className="w-4 h-4 mr-2 text-emerald-500"/>Valor en Libros Actual (MXN)</label>
                            <p className="font-bold text-emerald-600 text-lg bg-white px-3 py-1 rounded-md border border-slate-200">${financials.currentValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                        </div>
                    </div>

                    <div>
                        <label className="text-sm font-medium">Estado</label>
                        <select value={formData.status} onChange={e => handleChange('status', e.target.value)} className="w-full p-2 border rounded-lg mt-1 bg-white">
                            <option>Activo</option>
                            <option>En Mantenimiento</option>
                            <option>Dado de Baja</option>
                        </select>
                    </div>
                </div>
                <div className="p-4 bg-slate-50 border-t flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 border rounded-lg hover:bg-slate-100">Cancelar</button>
                    <button onClick={handleSave} className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center">
                        <Save className="w-4 h-4 mr-2" /> Guardar Activo
                    </button>
                </div>
            </div>
        </div>
    );
};