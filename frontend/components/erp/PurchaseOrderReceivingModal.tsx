import React, { useState, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Package } from 'lucide-react';
import { PurchaseOrder, PurchaseOrderItem } from '../../types';

interface PurchaseOrderReceivingModalProps {
    order: PurchaseOrder | null;
    onClose: () => void;
    onConfirm: (updatedOrder: PurchaseOrder) => void;
}

export const PurchaseOrderReceivingModal: React.FC<PurchaseOrderReceivingModalProps> = ({ order, onClose, onConfirm }) => {
    const [receivedItems, setReceivedItems] = useState<PurchaseOrderItem[]>([]);

    useEffect(() => {
        if (order) {
            setReceivedItems(order.items.map(item => ({ ...item, receivedQuantity: item.receivedQuantity ?? item.quantity })));
        }
    }, [order]);

    if (!order) return null;

    const handleQuantityChange = (itemId: string, value: string) => {
        const newQty = Number(value);
        setReceivedItems(prev => prev.map(item => item.id === itemId ? { ...item, receivedQuantity: newQty } : item));
    };

    const handleConfirmReception = () => {
        onConfirm({ ...order, items: receivedItems });
    };

    const totalExpected = order.items.reduce((sum, item) => sum + item.quantity, 0);
    const totalReceived = receivedItems.reduce((sum, item) => sum + (item.receivedQuantity || 0), 0);

    return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 p-4">
            <div className="bg-white rounded-2xl w-full max-w-2xl flex flex-col max-h-[90vh]">
                <div className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-lg font-bold flex items-center"><Package className="mr-2"/> Portal de Recepción: {order.orderNo}</h2>
                    <button onClick={onClose}><X /></button>
                </div>
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    <p className="text-sm text-slate-600">Confirma la cantidad recibida para cada producto. El sistema resaltará cualquier discrepancia.</p>
                    <div className="space-y-3">
                        <div className="grid grid-cols-6 gap-4 px-2 py-1 text-xs font-bold text-slate-500 bg-slate-50 rounded">
                            <div className="col-span-3">Producto</div>
                            <div className="text-center">Esperado</div>
                            <div className="text-center">Recibido</div>
                            <div className="text-center">Diferencia</div>
                        </div>
                        {receivedItems.map(item => {
                            const difference = (item.receivedQuantity || 0) - item.quantity;
                            return (
                                <div key={item.id} className={`grid grid-cols-6 gap-4 items-center p-2 rounded-lg border ${difference !== 0 ? 'bg-amber-50 border-amber-200' : 'bg-white'}`}>
                                    <div className="col-span-3">
                                        <p className="font-medium text-sm text-slate-800">{item.name}</p>
                                        <p className="text-xs text-slate-500 font-mono">{item.lote}</p>
                                    </div>
                                    <p className="text-center font-bold text-slate-700">{item.quantity}</p>
                                    <div className="text-center">
                                        <input
                                            type="number"
                                            value={item.receivedQuantity || ''}
                                            onChange={e => handleQuantityChange(item.id, e.target.value)}
                                            className="w-20 p-1 border rounded text-center"
                                        />
                                    </div>
                                    <div className="text-center font-bold flex items-center justify-center gap-1">
                                        {difference === 0 ? <CheckCircle className="w-4 h-4 text-emerald-500" /> : <AlertCircle className="w-4 h-4 text-amber-500" />}
                                        <span className={difference !== 0 ? 'text-amber-700' : 'text-slate-500'}>
                                            {difference > 0 ? `+${difference}` : difference}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
                <div className="p-4 border-t bg-slate-50 flex justify-between items-center">
                    <div className="text-sm">
                        <p>Total Esperado: <span className="font-bold">{totalExpected}</span> unidades</p>
                        <p>Total Recibido: <span className="font-bold">{totalReceived}</span> unidades</p>
                    </div>
                    <button 
                        onClick={handleConfirmReception} 
                        className="px-6 py-3 bg-emerald-600 text-white rounded-lg font-bold flex items-center gap-2 hover:bg-emerald-700"
                    >
                        <CheckCircle /> Confirmar Recepción
                    </button>
                </div>
            </div>
        </div>
    );
};