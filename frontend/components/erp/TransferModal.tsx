import React, { useEffect, useMemo, useState } from 'react';
import { ArrowRightLeft, Building2, AlertCircle } from 'lucide-react';
import { InventoryItem } from '../../types';

interface TransferModalProps {
    isOpen: boolean;
    onClose: () => void;
    onTransfer: (sourceId: string, destinationBranch: string, quantity: number) => void;
    item: InventoryItem | null;
    branches: Array<{ value: string; label: string }>;
}

export const TransferModal: React.FC<TransferModalProps> = ({ isOpen, onClose, onTransfer, item, branches }) => {
    const [quantity, setQuantity] = useState('');
    const [destination, setDestination] = useState('');

    const availableDestinations = useMemo(() => {
        if (!item) return [];
        const currentValue = item.branchCode || item.branch;
        return (branches || []).filter(option => option.value !== currentValue);
    }, [branches, item]);

    useEffect(() => {
        if (isOpen && item) {
            setQuantity('');
        }
    }, [isOpen, item]);

    useEffect(() => {
        if (!isOpen || !item) return;
        setDestination(prev => {
            if (availableDestinations.some(option => option.value === prev)) {
                return prev;
            }
            return availableDestinations[0]?.value || '';
        });
    }, [availableDestinations, isOpen, item]);

    if (!isOpen || !item) return null;

    const qtyNum = Number(quantity);
    const isValidQty = Number.isFinite(qtyNum) && qtyNum > 0 && qtyNum <= item.quantity;

    const handleConfirm = () => {
        if (!isValidQty || !destination) return;
        onTransfer(item.id, destination, qtyNum);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 transition-all">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95">
                <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="font-bold text-slate-800 flex items-center">
                        <div className="p-2 bg-blue-100 text-blue-600 rounded-lg mr-3">
                            <ArrowRightLeft className="w-5 h-5" />
                        </div>
                        Transferencia de Stock
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                        <span className="sr-only">Cerrar</span>
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100">
                        <h4 className="font-bold text-slate-800 text-sm mb-1">{item.productName}</h4>
                        <div className="flex gap-3 text-xs text-slate-500 font-mono mt-2">
                            <span className="bg-white px-2 py-1 rounded border border-blue-100">Lote: {item.batch}</span>
                            <span className="bg-white px-2 py-1 rounded border border-blue-100">SKU: {item.sku}</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
                        <div className="text-center">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Origen</p>
                            <div className="p-3 rounded-xl border border-slate-200 bg-slate-50">
                                <Building2 className="w-6 h-6 mx-auto text-slate-400 mb-1" />
                                <p className="text-xs font-bold text-slate-700 leading-tight">{item.branch}</p>
                                <p className="text-[10px] text-emerald-600 font-bold mt-1">Disp: {item.quantity}</p>
                            </div>
                        </div>
                        <div className="flex flex-col items-center justify-center pt-4 text-slate-300">
                            <div className="border-t-2 border-dashed border-slate-300 w-8"></div>
                            <ArrowRightLeft className="w-4 h-4 mt-1" />
                        </div>
                        <div className="text-center">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Destino</p>
                            <div className="relative">
                                <select
                                    className="w-full p-3 rounded-xl border-2 border-indigo-100 bg-white text-xs font-bold text-indigo-900 outline-none focus:border-indigo-500 appearance-none text-center cursor-pointer"
                                    value={destination}
                                    onChange={(e) => setDestination(e.target.value)}
                                >
                                    {availableDestinations.length === 0 && <option value="">Sin sucursales disponibles</option>}
                                    {availableDestinations.map(option => (
                                        <option key={option.value} value={option.value}>{option.label}</option>
                                    ))}
                                </select>
                                <div className="absolute inset-0 pointer-events-none border border-transparent"></div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label htmlFor="transfer-quantity" className="block text-sm font-bold text-slate-700 mb-2">Cantidad a Transferir</label>
                        <div className="relative">
                            <input
                                id="transfer-quantity"
                                type="number"
                                className={`w-full pl-4 pr-16 py-3 border-2 rounded-xl font-bold text-lg outline-none transition-all ${isValidQty ? 'border-slate-200 focus:border-blue-500' : 'border-red-200 focus:border-red-500 bg-red-50'}`}
                                placeholder="0.00"
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                                max={item.quantity}
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded">UNID.</span>
                        </div>
                        {!isValidQty && quantity !== '' && (
                            <p className="text-xs text-red-500 mt-2 flex items-center">
                                <AlertCircle className="w-3 h-3 mr-1" />
                                La cantidad debe ser mayor a 0 y menor o igual a {item.quantity}.
                            </p>
                        )}
                    </div>
                </div>

                <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 text-slate-600 text-sm font-medium hover:bg-slate-200 rounded-lg transition-colors">
                        Cancelar
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={!isValidQty || !destination}
                        className="px-6 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 shadow-lg shadow-blue-200 disabled:opacity-50 disabled:shadow-none transition-all transform active:scale-95"
                    >
                        Confirmar Transferencia
                    </button>
                </div>
            </div>
        </div>
    );
};
