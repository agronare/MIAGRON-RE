
import React, { useState, useEffect, useMemo } from 'react';
import { X, DollarSign, Save } from 'lucide-react';
import { Client, Supplier, Sale, PurchaseOrder, PaymentApplication } from '../../types';

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (payment: any) => void;
    selectedEntity: { type: 'receivables' | 'payables', id: string } | null;
    clients: Client[];
    suppliers: Supplier[];
    sales: Sale[];
    purchases: PurchaseOrder[];
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, onSave, selectedEntity, clients, suppliers, sales, purchases }) => {
    const [entityId, setEntityId] = useState('');
    const [amount, setAmount] = useState('');
    const [method, setMethod] = useState<'Efectivo' | 'Transferencia' | 'Cheque' | 'Otro'>('Transferencia');
    const [reference, setReference] = useState('');
    const [applications, setApplications] = useState<Record<string, string>>({});

    const type = selectedEntity?.type || 'receivables';
    const entities = type === 'receivables' ? clients : suppliers;
    
    useEffect(() => {
        if (isOpen) {
            setEntityId(selectedEntity?.id || '');
            setAmount('');
            setMethod('Transferencia');
            setReference('');
            setApplications({});
        }
    }, [isOpen, selectedEntity]);

    const entityName = (entities.find(e => e.id === entityId) as any)?.name || (entities.find(e => e.id === entityId) as any)?.companyName;

    const pendingDocuments = useMemo(() => {
        if (!entityId) return [];
        const entityDocs = (type === 'receivables' ? sales : purchases).filter((doc: Sale | PurchaseOrder) => {
            if (type === 'receivables' && 'clientId' in doc) {
                return doc.clientId === entityId && doc.method === 'Crédito';
            } else if (type === 'payables' && 'supplierId' in doc) {
                return doc.supplierId === entityId && doc.paymentMethod === 'Crédito';
            }
            return false;
        });

        return entityDocs.map(doc => {
            const balance = doc.total - (doc.paidAmount || 0);
            return { ...doc, balance };
        }).filter(doc => doc.balance > 0.01);
    }, [entityId, sales, purchases, type]);

    const totalApplied = useMemo(() => 
        Object.values(applications).reduce((sum: number, val: string) => sum + (Number(val) || 0), 0),
    [applications]);
    
    const amountToApply = Number(amount) || 0;
    const remainingToApply = amountToApply - totalApplied;

    const handleSave = () => {
        const paymentApplications: PaymentApplication[] = Object.entries(applications)
            .filter(([, amount]) => Number(amount) > 0)
            .map(([docId, amount]) => ({ documentId: docId, amountApplied: Number(amount) }));
        
        onSave({
            type,
            entityId,
            entityName,
            amount: amountToApply,
            method,
            reference,
            applications: paymentApplications,
            date: new Date().toISOString(),
        });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh]">
                <div className="p-6 border-b flex justify-between items-center">
                    <h2 className="text-xl font-bold text-slate-900">Registrar Abono ({type === 'receivables' ? 'Cliente' : 'Proveedor'})</h2>
                    <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-full"><X className="w-5 h-5 text-slate-500" /></button>
                </div>
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium">
                                {type === 'receivables' ? 'Cliente' : 'Proveedor'}
                            </label>
                            <select value={entityId} onChange={e => setEntityId(e.target.value)} className="w-full p-2 border rounded-lg mt-1 bg-white">
                                <option value="">Seleccionar...</option>
                                {entities.map((e: any) => <option key={e.id} value={e.id}>{e.name || e.companyName}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-sm font-medium">Monto del Abono</label>
                            <input type="number" value={amount} onChange={e => setAmount(e.target.value)} className="w-full p-2 border rounded-lg mt-1" />
                        </div>
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium">Método de Pago</label>
                            <select value={method} onChange={e => setMethod(e.target.value as any)} className="w-full p-2 border rounded-lg mt-1 bg-white">
                                <option>Transferencia</option><option>Efectivo</option><option>Cheque</option><option>Otro</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-sm font-medium">Referencia</label>
                            <input type="text" value={reference} onChange={e => setReference(e.target.value)} className="w-full p-2 border rounded-lg mt-1" />
                        </div>
                    </div>

                    {entityId && (
                        <div className="pt-4">
                            <h3 className="font-bold mb-2">Aplicar a Documentos Pendientes</h3>
                            <div className="flex justify-between text-sm mb-2">
                                <span>Monto a aplicar: <span className="font-bold">${amountToApply.toFixed(2)}</span></span>
                                <span className={remainingToApply < 0 ? 'text-red-500 font-bold' : 'text-slate-500'}>
                                    Restante: ${remainingToApply.toFixed(2)}
                                </span>
                            </div>
                            <div className="space-y-2 max-h-60 overflow-y-auto border rounded-lg p-2 bg-slate-50">
                                {pendingDocuments.map(doc => (
                                    <div key={doc.id} className="grid grid-cols-3 gap-2 items-center text-sm p-2 bg-white rounded border">
                                        <div>
                                            <p className="font-medium">{'orderNo' in doc ? doc.orderNo : doc.id}</p>
                                            <p className="text-xs text-slate-400">{new Date(doc.date).toLocaleDateString()}</p>
                                        </div>
                                        <p className="text-center">Saldo: ${doc.balance.toFixed(2)}</p>
                                        <input 
                                            type="number" 
                                            placeholder="0.00"
                                            value={applications[doc.id] || ''}
                                            onChange={e => setApplications({...applications, [doc.id]: e.target.value})}
                                            className="w-full p-1 border rounded text-right" 
                                        />
                                    </div>
                                ))}
                                {pendingDocuments.length === 0 && <p className="text-center text-slate-400 p-4">No hay documentos pendientes.</p>}
                            </div>
                        </div>
                    )}
                </div>
                <div className="p-4 bg-slate-50 border-t flex justify-end gap-3">
                    <button onClick={onClose} className="button button-secondary" aria-label="Cancelar" title="Cancelar">Cancelar</button>
                    <button onClick={handleSave} disabled={!entityId || amountToApply <= 0 || remainingToApply < 0} className="button" aria-label="Guardar" title="Guardar">
                        <Save className="w-4 h-4 mr-2 inline" /> Guardar
                    </button>
                </div>
            </div>
        </div>
    );
};