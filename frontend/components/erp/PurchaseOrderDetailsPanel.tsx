import React from 'react';
import { X, Printer, Package, User, Calendar, Hash, Truck, CreditCard, CheckCircle, AlertTriangle } from 'lucide-react';
import { PurchaseOrder } from '../../types';

interface PurchaseOrderDetailsPanelProps {
    order: PurchaseOrder | null;
    onClose: () => void;
}

export const PurchaseOrderDetailsPanel: React.FC<PurchaseOrderDetailsPanelProps> = ({ order, onClose }) => {
    if (!order) return null;

    const statusConfig: { [key in PurchaseOrder['status']]: { color: string; icon: React.FC<any> } } = {
        'Pendiente': { color: 'bg-blue-100 text-blue-800 border-blue-200', icon: AlertTriangle },
        'Completado': { color: 'bg-emerald-100 text-emerald-800 border-emerald-200', icon: CheckCircle },
        'Cancelado': { color: 'bg-red-100 text-red-800 border-red-200', icon: X },
    };
    const currentStatus = statusConfig[order.status];

    const handlePrint = () => {
        window.print();
    }

    return (
        <div className="fixed inset-0 z-50 flex justify-end" onClick={onClose}>
            <div 
                className="w-full max-w-2xl bg-slate-50 h-full flex flex-col shadow-2xl animate-in slide-in-from-right-full duration-300" 
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-6 border-b bg-white flex justify-between items-start print:hidden">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900">{order.orderNo}</h2>
                        <p className="text-slate-500">Orden de Compra</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full"><X /></button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 space-y-6 print-content">
                    {/* Main Info */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <InfoCard icon={User} label="Proveedor" value={order.supplierName} />
                        <InfoCard icon={Calendar} label="Fecha" value={new Date(order.date).toLocaleDateString()} />
                        <InfoCard icon={Truck} label="Destino" value={order.destinationBranch} />
                        <InfoCard icon={CreditCard} label="Pago" value={order.paymentMethod} />
                    </div>
                    
                    <div className={`p-4 rounded-lg border flex items-center gap-3 ${currentStatus.color}`}>
                        <currentStatus.icon className="w-5 h-5" />
                        <span className="font-bold">Estado: {order.status}</span>
                    </div>

                    {/* Items Table */}
                    <div>
                        <h4 className="font-bold text-slate-800 mb-2">Productos</h4>
                        <div className="bg-white rounded-lg border divide-y">
                            <div className="grid grid-cols-6 gap-2 p-2 text-xs font-bold text-slate-500 bg-slate-50">
                                <div className="col-span-2">Producto</div>
                                <div>Lote</div>
                                <div className="text-center">Cant.</div>
                                <div className="text-right">Costo Unit.</div>
                                <div className="text-right">Importe</div>
                            </div>
                            {order.items.map(item => (
                                <div key={item.id} className="grid grid-cols-6 gap-2 p-3 text-sm">
                                    <div className="col-span-2 font-medium text-slate-800">{item.name}</div>
                                    <div className="font-mono text-slate-500 text-xs">{item.lote}</div>
                                    <div className="text-center">{item.quantity}</div>
                                    <div className="text-right">${item.cost.toFixed(2)}</div>
                                    <div className="text-right font-bold">${(item.quantity * item.cost).toFixed(2)}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    {/* Totals */}
                    <div className="flex justify-end">
                        <div className="w-full max-w-xs space-y-2 text-sm">
                            <div className="flex justify-between"><span>Subtotal</span><span>${order.subtotal.toFixed(2)}</span></div>
                            <div className="flex justify-between"><span>Impuestos (IVA)</span><span>${order.iva.toFixed(2)}</span></div>
                            <div className="flex justify-between font-bold text-xl border-t pt-2 mt-2"><span>Total</span><span>${order.total.toFixed(2)}</span></div>
                        </div>
                    </div>

                </div>
                {/* Footer */}
                <div className="p-4 border-t bg-white flex justify-end print:hidden">
                    <button onClick={handlePrint} className="px-4 py-2 bg-indigo-600 text-white rounded-lg flex items-center font-medium"><Printer size={16} className="mr-2"/> Imprimir</button>
                </div>
                 <style>{`
                    @media print {
                        body * { visibility: hidden; }
                        .print-content, .print-content * { visibility: visible; }
                        .print-content { position: absolute; left: 0; top: 0; width: 100%; }
                    }
                `}</style>
            </div>
        </div>
    );
};

const InfoCard = ({ icon: Icon, label, value }: { icon: React.FC<any>, label: string, value: string }) => (
    <div className="bg-white p-3 rounded-lg border">
        <div className="flex items-center gap-2">
            <Icon className="w-4 h-4 text-slate-400" />
            <p className="text-xs text-slate-500 font-medium">{label}</p>
        </div>
        <p className="font-bold text-slate-800 mt-1 truncate">{value}</p>
    </div>
);
