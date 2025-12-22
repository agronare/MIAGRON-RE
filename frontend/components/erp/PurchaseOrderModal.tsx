
import React, { useState, useEffect, useMemo } from 'react';
import { X, Plus, Trash2, Search } from 'lucide-react';
import { Supplier, Product, PurchaseOrder, PurchaseOrderItem, Quote, Branch } from '../../types';

interface PurchaseOrderModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (order: PurchaseOrder) => void;
    initialData: PurchaseOrder | null;
    suppliers: Supplier[];
    quotes: Quote[];
    products: Product[];
    branches: Branch[];
}

export const PurchaseOrderModal: React.FC<PurchaseOrderModalProps> = ({ isOpen, onClose, onSave, initialData, suppliers, quotes, products, branches }) => {
    const [formData, setFormData] = useState<any>({ items: [] });
    const [activeSearchRow, setActiveSearchRow] = useState<number | null>(null);

    useEffect(() => {
        if (isOpen) {
            const defaultItems = initialData?.items?.length ? [] : [{ id: `new-${Date.now()}`, name: '', sku: '', quantity: 1, cost: 0, lote: `LOTE-${Math.random().toString(36).substring(2, 9).toUpperCase()}` }];
            const data = initialData 
                ? { ...initialData, date: new Date(initialData.date).toISOString().split('T')[0] }
                : {
                    date: new Date().toISOString().split('T')[0],
                    supplierId: '',
                    destinationBranch: (branches && branches.length > 0) ? (branches[0].code || branches[0].name) : '',
                    status: 'Pendiente',
                    paymentMethod: 'Efectivo',
                    items: defaultItems,
                    notes: '',
                    campaign: ''
                  };
            setFormData(data);
        }
    }, [isOpen, initialData, branches]);

    const handleLoadFromQuote = (quoteId: string) => {
        const quote = quotes.find(q => q.id === quoteId);
        if (quote) {
            setFormData({
                ...formData,
                supplierId: quote.supplierId,
                campaign: quote.campaign,
                items: quote.items.map(item => ({
                    ...item,
                    lote: `LOTE-${Math.random().toString(36).substring(2, 9).toUpperCase()}`
                })),
                quoteId: quote.id
            });
        }
    };
    
    const handleAddRow = () => {
        const newItem: Partial<PurchaseOrderItem> = {
            id: `new-${Date.now()}`,
            name: '',
            sku: '',
            quantity: 1,
            cost: 0,
            lote: `LOTE-${Math.random().toString(36).substring(2, 9).toUpperCase()}`
        };
        setFormData((prev: any) => ({ ...prev, items: [...(prev.items || []), newItem] }));
    };

    const handleUpdateItem = (index: number, field: keyof PurchaseOrderItem | 'name', value: any) => {
        const newItems = [...formData.items];
        newItems[index] = { ...newItems[index], [field]: value };
        
        if (field === 'name') {
            newItems[index].id = `new-${Date.now()}`; // Reset ID to indicate it's not a saved product
        }
        
        setFormData({ ...formData, items: newItems });
    };

    const handleSelectProduct = (index: number, product: Product) => {
        const newItems = [...formData.items];
        newItems[index] = {
            ...newItems[index],
            id: product.id,
            name: product.name,
            sku: product.sku,
            cost: product.cost || 0,
        };
        setFormData({ ...formData, items: newItems });
        setActiveSearchRow(null);
    };

    const handleRemoveItem = (index: number) => {
        const newItems = formData.items.filter((_: any, i: number) => i !== index);
        setFormData({ ...formData, items: newItems });
    };
    
    const totals = useMemo(() => {
        return (formData.items || []).reduce((acc: any, item: PurchaseOrderItem) => {
            const itemTotal = item.quantity * item.cost;
            const productInfo = products.find(p => p.id === item.id);
            const itemIva = productInfo?.ivaExempt ? 0 : itemTotal * (productInfo?.ivaRate ?? 0.16);
            return {
                subtotal: acc.subtotal + itemTotal,
                iva: acc.iva + itemIva,
                total: acc.total + itemTotal + itemIva,
            };
        }, { subtotal: 0, iva: 0, total: 0 });
    }, [formData.items, products]);
    
    const handleSaveOrder = () => {
        const selectedSupplier = suppliers.find(s => s.id === formData.supplierId);
        const validItems = (formData.items || []).filter((item: any) => item.id && !item.id.startsWith('new-'));
        onSave({
            ...formData,
            items: validItems,
            supplierName: selectedSupplier?.companyName,
            subtotal: totals.subtotal,
            iva: totals.iva,
            total: totals.total,
        });
    };
    
    const availableQuotes = quotes.filter(q => q.status === 'Aprobada');

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <div className="bg-slate-50 rounded-xl shadow-2xl w-full max-w-5xl flex flex-col max-h-[90vh]">
                <div className="p-6 border-b flex justify-between items-center bg-white rounded-t-xl">
                    <h2 className="text-xl font-bold text-slate-900">{initialData ? 'Editar' : 'Nueva'} Orden de Compra</h2>
                    <button onClick={onClose}><X /></button>
                </div>
                <div className="flex-1 overflow-y-auto p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div><label className="text-sm font-medium text-slate-600">Cargar desde Cotización</label><select onChange={e => handleLoadFromQuote(e.target.value)} className="w-full p-2 border rounded mt-1 bg-white"><option value="">Seleccionar...</option>{availableQuotes.map(q => <option key={q.id} value={q.id}>{q.quoteNo} - {q.supplierName}</option>)}</select></div>
                            <div><label className="text-sm font-medium text-slate-600">Proveedor</label><select value={formData.supplierId} onChange={e => setFormData({...formData, supplierId: e.target.value})} className="w-full p-2 border rounded mt-1 bg-white"><option value="">Seleccionar...</option>{suppliers.map(s => <option key={s.id} value={s.id}>{s.companyName}</option>)}</select></div>
                            <div>
                                <label className="text-sm font-medium text-slate-600">Sucursal de Destino</label>
                                <select 
                                    value={formData.destinationBranch} 
                                    onChange={e => setFormData({...formData, destinationBranch: e.target.value})} 
                                    className="w-full p-2 border rounded mt-1 bg-white"
                                >
                                    {branches && branches.length > 0 ? (
                                        branches.map(b => (
                                            <option key={b.id} value={b.code || b.name}>{b.code ? `${b.name} (${b.code})` : b.name}</option>
                                        ))
                                    ) : (
                                        <option value="">Sin sucursales disponibles</option>
                                    )}
                                </select>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div><label className="text-sm font-medium text-slate-600">Fecha</label><input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full p-2 border rounded mt-1 bg-white" /></div>
                            <div><label className="text-sm font-medium text-slate-600">Estado</label><select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full p-2 border rounded mt-1 bg-white"><option>Pendiente</option><option>Completado</option><option>Cancelado</option></select></div>
                            <div><label className="text-sm font-medium text-slate-600">Campaña Agrícola (ID Recepción)</label><input type="text" value={formData.campaign} onChange={e => setFormData({...formData, campaign: e.target.value})} className="w-full p-2 border rounded mt-1 bg-white" /></div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div><label className="text-sm font-medium text-slate-600">Método de Pago</label><select value={formData.paymentMethod} onChange={e => setFormData({...formData, paymentMethod: e.target.value})} className="w-full p-2 border rounded mt-1 bg-white"><option>Efectivo</option><option>Transferencia</option><option>Crédito</option></select></div>
                             <div><label className="text-sm font-medium text-slate-600">Notas</label><input type="text" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="w-full p-2 border rounded mt-1 bg-white" /></div>
                        </div>

                        <div onBlur={() => setTimeout(() => setActiveSearchRow(null), 150)}>
                            <h3 className="font-bold mb-2 text-slate-800">Productos</h3>
                            <div className="space-y-3 max-h-60 overflow-auto pr-2 border-t border-slate-200 pt-4">
                                {(formData.items || []).length > 0 && (
                                    <div className="grid grid-cols-[1fr,80px,90px,110px,auto] gap-2 items-center text-xs px-2 mb-2 text-slate-500 font-bold">
                                        <span>Producto</span>
                                        <span className="text-center">Cant.</span>
                                        <span className="text-center">Costo</span>
                                        <span className="text-center">Lote</span>
                                        <span></span>
                                    </div>
                                )}
                                {(formData.items || []).map((item: any, index: number) => {
                                    const searchResults = item.name
                                        ? products.filter(p => p.name.toLowerCase().includes(item.name.toLowerCase()) && !formData.items.some((fi: any) => fi.id === p.id && fi.id !== item.id))
                                        : [];

                                    return (
                                        <div key={item.id} className="grid grid-cols-[1fr,80px,90px,110px,auto] gap-2 items-center text-sm p-2 bg-white border border-slate-200 rounded-lg shadow-sm">
                                            <div className="relative">
                                                <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                                <input 
                                                    type="text" 
                                                    placeholder="Seleccionar producto..." 
                                                    value={item.name}
                                                    onFocus={() => setActiveSearchRow(index)}
                                                    onChange={e => handleUpdateItem(index, 'name', e.target.value)}
                                                    className="w-full pl-8 p-1 border-b-2 border-transparent focus:border-indigo-500 outline-none bg-transparent" 
                                                />
                                                {activeSearchRow === index && searchResults.length > 0 && (
                                                    <div className="absolute z-10 w-full bg-white border shadow-lg rounded mt-1 max-h-48 overflow-auto">
                                                        {searchResults.map(p => 
                                                            <div key={p.id} onMouseDown={() => handleSelectProduct(index, p)} className="p-2 hover:bg-slate-100 cursor-pointer">{p.name}</div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                            <input type="number" value={item.quantity} onChange={e => handleUpdateItem(index, 'quantity', e.target.value)} className="w-full p-1 border rounded text-center" />
                                            <input type="number" value={item.cost} onChange={e => handleUpdateItem(index, 'cost', e.target.value)} className="w-full p-1 border rounded text-center" />
                                            <input type="text" value={item.lote} onChange={e => handleUpdateItem(index, 'lote', e.target.value)} className="w-full p-1 border rounded text-center text-xs" />
                                            <button onClick={() => handleRemoveItem(index)}><Trash2 size={16} className="text-red-400 hover:text-red-600" /></button>
                                        </div>
                                    );
                                })}
                            </div>
                             <button onClick={handleAddRow} className="text-sm text-slate-800 font-bold mt-4 flex items-center bg-yellow-400 rounded-lg px-4 py-2 hover:bg-yellow-500 transition-colors shadow">
                                <Plus size={16} className="mr-2"/> Agregar Producto
                            </button>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl p-6 border border-slate-200 h-fit shadow-sm">
                        <h3 className="font-bold text-lg border-b pb-2 mb-4">Resumen</h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between text-slate-600"><span>Subtotal</span><span>${totals.subtotal.toFixed(2)}</span></div>
                            <div className="flex justify-between text-slate-600"><span>Impuestos (IVA)</span><span>${totals.iva.toFixed(2)}</span></div>
                            <div className="flex justify-between font-bold text-xl border-t-2 border-dashed pt-3 mt-3"><span>Total</span><span>${totals.total.toFixed(2)}</span></div>
                        </div>
                    </div>
                </div>
                 <div className="p-4 bg-white border-t flex justify-end gap-3 rounded-b-xl">
                    <button onClick={onClose} className="button button-secondary" aria-label="Cancelar" title="Cancelar">Cancelar</button>
                    <button onClick={handleSaveOrder} className="button" aria-label="Guardar" title="Guardar">Guardar</button>
                </div>
            </div>
        </div>
    );
};
