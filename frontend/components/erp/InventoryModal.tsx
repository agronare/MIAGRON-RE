
import React, { useState, useEffect, useMemo } from 'react';

interface InventoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: any) => void;
    initialData: any;
    products: any[];
    branches: Array<{ value: string; label: string }>;
    branchesRaw?: Array<{ id: string; name: string; code?: string }>;
}

export const InventoryModal: React.FC<InventoryModalProps> = ({ isOpen, onClose, onSave, initialData, products, branches, branchesRaw = [] }) => {
    const safeBranchesInput = Array.isArray(branches) ? branches : [];
    const fallbackFromRaw = useMemo(() => {
        const opts: Array<{ value: string; label: string }> = [];
        const seen = new Set<string>();
        (branchesRaw || []).forEach(b => {
            if (!b?.name) return;
            const value = b.code || b.name;
            if (seen.has(value)) return;
            const label = b.code ? `${b.name} (${b.code})` : b.name;
            opts.push({ value, label });
            seen.add(value);
        });
        return opts;
    }, [branchesRaw]);
    const safeBranches = safeBranchesInput.length > 0 ? safeBranchesInput : fallbackFromRaw;
    const defaultBranch = useMemo(() => safeBranches[0]?.value || '', [safeBranches]);
    const baseData = useMemo(() => ({
        productId: '',
        productName: '',
        sku: '',
        batch: '',
        quantity: 0,
        unitPrice: 0,
        branch: defaultBranch
    }), [defaultBranch]);

    const [formData, setFormData] = useState<any>(baseData);

    useEffect(() => { 
        if (isOpen) {
            const branchValue = initialData?.branch || defaultBranch;
            setFormData(initialData ? { ...baseData, ...initialData, branch: branchValue } : { ...baseData, branch: branchValue });
        }
    }, [initialData, isOpen, baseData, defaultBranch]);
    
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg p-6 animate-in zoom-in-95 border border-slate-200 dark:border-slate-800">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">{initialData ? 'Editar Lote' : 'Nuevo Lote'}</h2>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Producto</label>
                        <select className="w-full border dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg px-3 py-2 outline-none focus:border-blue-500 dark:focus:border-blue-500" value={formData.productName} onChange={e => { const prod = products.find((p: any) => p.name === e.target.value); setFormData({...formData, productName: e.target.value, productId: prod?.id || '', sku: prod?.sku || ''}); }}>
                            <option value="">Seleccionar...</option>
                            {products.map((p: any) => <option key={p.id} value={p.name}>{p.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Lote</label>
                        <input type="text" className="w-full border dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg px-3 py-2 outline-none focus:border-blue-500 dark:focus:border-blue-500" value={formData.batch} onChange={e => setFormData({...formData, batch: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Sucursal</label>
                        <select className="w-full border dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg px-3 py-2 outline-none focus:border-blue-500 dark:focus:border-blue-500" value={formData.branch} onChange={e => setFormData({...formData, branch: e.target.value})}>
                            {safeBranches.length === 0 && <option value="">Sin sucursales</option>}
                            {safeBranches.map(option => (
                                <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                            {formData.branch && !safeBranches.find(option => option.value === formData.branch) && (
                                <option value={formData.branch}>{formData.branch}</option>
                            )}
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                         <div>
                            <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Cantidad</label>
                            <input type="number" className="w-full border dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg px-3 py-2 outline-none focus:border-blue-500 dark:focus:border-blue-500" value={formData.quantity} onChange={e => setFormData({...formData, quantity: Number(e.target.value)})} />
                        </div>
                         <div>
                            <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Costo Unit.</label>
                            <input type="number" className="w-full border dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg px-3 py-2 outline-none focus:border-blue-500 dark:focus:border-blue-500" value={formData.unitPrice} onChange={e => setFormData({...formData, unitPrice: Number(e.target.value)})} />
                        </div>
                    </div>
                </div>
                <div className="mt-6 flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">Cancelar</button>
                    <button onClick={() => onSave(formData)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm">Guardar</button>
                </div>
            </div>
        </div>
    );
};
