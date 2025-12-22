
import React, { useState, useMemo } from 'react';
import { Client, Supplier, Sale, PurchaseOrder, PaymentRecord } from '../../types';
import { DollarSign, TrendingUp, Users, Plus, ArrowDown, ArrowUp } from 'lucide-react';
import { PaymentModal } from './PaymentModal';

interface PaymentsViewProps {
    clients: Client[];
    suppliers: Supplier[];
    sales: Sale[];
    purchases: PurchaseOrder[];
    payments: PaymentRecord[];
    onSavePayment: (payment: Omit<PaymentRecord, 'id'>) => void;
}

type ActiveTab = 'receivables' | 'payables';

const KPICard = ({ title, value, icon: Icon }: { title: string, value: string, icon: React.FC<any> }) => (
    <div className="card">
        <div className="flex justify-between items-start mb-2">
            <div className="p-2 bg-slate-100 text-slate-600 rounded-lg"><Icon className="w-5 h-5" /></div>
        </div>
        <p className="text-sm text-slate-500 font-medium">{title}</p>
        <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
    </div>
);

export const PaymentsView: React.FC<PaymentsViewProps> = ({ clients = [], suppliers = [], sales = [], purchases = [], payments = [], onSavePayment }) => {
    const [activeTab, setActiveTab] = useState<ActiveTab>('receivables');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedEntity, setSelectedEntity] = useState<{ type: ActiveTab, id: string } | null>(null);

    // --- Calculations ---
    const receivables = useMemo(() => {
        const creditSales = (sales || []).filter(s => s.method === 'Crédito');
        const totalOwed = creditSales.reduce((sum, s) => sum + s.total, 0);
        const totalPaid = (payments || []).filter(p => p.type === 'receivable').reduce((sum, p) => sum + p.amount, 0);
        return {
            total: totalOwed - totalPaid,
            paidThisMonth: (payments || []).filter(p => p.type === 'receivable' && new Date(p.date).getMonth() === new Date().getMonth()).reduce((sum, p) => sum + p.amount, 0),
        };
    }, [sales, payments]);
    
    const payables = useMemo(() => {
        const creditPurchases = (purchases || []).filter(p => p.paymentMethod === 'Crédito');
        const totalToPay = creditPurchases.reduce((sum, p) => sum + p.total, 0);
        const totalPaid = (payments || []).filter(p => p.type === 'payable').reduce((sum, p) => sum + p.amount, 0);
        return {
            total: totalToPay - totalPaid,
            paidThisMonth: (payments || []).filter(p => p.type === 'payable' && new Date(p.date).getMonth() === new Date().getMonth()).reduce((sum, p) => sum + p.amount, 0),
        };
    }, [purchases, payments]);
    
    const clientsWithBalance = useMemo(() => {
        return (clients || []).map(client => {
            const clientSales = (sales || []).filter(s => s.clientId === client.id && s.method === 'Crédito');
            const totalBilled = clientSales.reduce((sum, s) => sum + s.total, 0);
            const totalPaid = (payments || []).filter(p => p.type === 'receivable' && p.entityId === client.id).reduce((sum, p) => sum + p.amount, 0);
            return { ...client, balance: totalBilled - totalPaid };
        }).filter(c => c.balance > 0);
    }, [clients, sales, payments]);

    const suppliersWithBalance = useMemo(() => {
        return (suppliers || []).map(supplier => {
            const supplierPurchases = (purchases || []).filter(p => p.supplierId === supplier.id && p.paymentMethod === 'Crédito');
            const totalPurchased = supplierPurchases.reduce((sum, p) => sum + p.total, 0);
            const totalPaid = (payments || []).filter(p => p.type === 'payable' && p.entityId === supplier.id).reduce((sum, p) => sum + p.amount, 0);
            return { ...supplier, balance: totalPurchased - totalPaid };
        }).filter(s => s.balance > 0);
    }, [suppliers, purchases, payments]);


    const handleOpenModal = (type: ActiveTab, entityId?: string) => {
        setSelectedEntity(entityId ? { type, id: entityId } : { type, id: '' });
        setIsModalOpen(true);
    };

    return (
        <div className="animate-fadeIn space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold glow-title">Gestión de Abonos</h1>
                <button onClick={() => handleOpenModal(activeTab)} className="button" aria-label="Registrar abono" title="Registrar abono">
                    <Plus className="w-4 h-4 mr-2"/> Registrar Abono
                </button>
            </div>
            
            <div className="card w-fit p-1 flex gap-2">
                <button onClick={() => setActiveTab('receivables')} className={`button text-sm ${activeTab === 'receivables' ? 'ring-1 ring-indigo-400' : ''}`} aria-label="Ver cuentas por cobrar" title="Ver cuentas por cobrar">Cuentas por Cobrar</button>
                <button onClick={() => setActiveTab('payables')} className={`button text-sm ${activeTab === 'payables' ? 'ring-1 ring-indigo-400' : ''}`} aria-label="Ver cuentas por pagar" title="Ver cuentas por pagar">Cuentas por Pagar</button>
            </div>

            {activeTab === 'receivables' ? (
                <div className="space-y-4 animate-fadeIn">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <KPICard title="Total por Cobrar" value={`$${receivables.total.toLocaleString()}`} icon={TrendingUp} />
                        <KPICard title="Ingresos del Mes" value={`$${receivables.paidThisMonth.toLocaleString()}`} icon={DollarSign} />
                        <KPICard title="Clientes con Saldo" value={clientsWithBalance.length.toString()} icon={Users} />
                    </div>
                    <div className="card">
                        <table className="w-full">
                           <thead className="bg-slate-50 border-b"><tr><th className="p-3 text-left text-xs font-semibold uppercase">Cliente</th><th className="p-3 text-right text-xs font-semibold uppercase">Saldo Pendiente</th><th className="p-3 text-right text-xs font-semibold uppercase">Acciones</th></tr></thead>
                            <tbody>
                                {clientsWithBalance.length === 0 ? (
                                    <tr>
                                        <td colSpan={3} className="p-10 text-center">
                                            <div className="flex flex-col items-center justify-center text-slate-500">
                                                <ArrowDown className="w-8 h-8 mb-2 opacity-40" />
                                                <p className="text-sm">No hay clientes con saldo por cobrar en este periodo.</p>
                                                <button onClick={() => handleOpenModal('receivables')} className="button mt-3" aria-label="Registrar un nuevo cobro" title="Registrar cobro">Registrar un Cobro</button>
                                            </div>
                                        </td>
                                    </tr>
                                ) : clientsWithBalance.map(c => (
                                    <tr key={c.id} className="border-b hover:bg-slate-50">
                                        <td className="p-3 font-medium">{c.name}</td>
                                        <td className="p-3 text-right font-bold">${c.balance.toLocaleString()}</td>
                                        <td className="p-3 text-right"><button onClick={() => handleOpenModal('receivables', c.id)} className="button text-sm" aria-label="Registrar pago a cliente">Registrar Pago</button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="space-y-4 animate-fadeIn">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <KPICard title="Total por Pagar" value={`$${payables.total.toLocaleString()}`} icon={TrendingUp} />
                        <KPICard title="Egresos del Mes" value={`$${payables.paidThisMonth.toLocaleString()}`} icon={DollarSign} />
                        <KPICard title="Proveedores con Saldo" value={suppliersWithBalance.length.toString()} icon={Users} />
                    </div>
                    <div className="card">
                        <table className="w-full">
                           <thead className="bg-slate-50 border-b"><tr><th className="p-3 text-left text-xs font-semibold uppercase">Proveedor</th><th className="p-3 text-right text-xs font-semibold uppercase">Saldo Pendiente</th><th className="p-3 text-right text-xs font-semibold uppercase">Acciones</th></tr></thead>
                            <tbody>
                                {suppliersWithBalance.length === 0 ? (
                                    <tr>
                                        <td colSpan={3} className="p-10 text-center">
                                            <div className="flex flex-col items-center justify-center text-slate-500">
                                                <ArrowUp className="w-8 h-8 mb-2 opacity-40" />
                                                <p className="text-sm">No hay proveedores con saldo por pagar en este periodo.</p>
                                                <button onClick={() => handleOpenModal('payables')} className="button mt-3" aria-label="Registrar un nuevo pago" title="Registrar pago">Registrar un Pago</button>
                                            </div>
                                        </td>
                                    </tr>
                                ) : suppliersWithBalance.map(s => (
                                    <tr key={s.id} className="border-b hover:bg-slate-50">
                                        <td className="p-3 font-medium">{s.companyName}</td>
                                        <td className="p-3 text-right font-bold">${s.balance.toLocaleString()}</td>
                                        <td className="p-3 text-right"><button onClick={() => handleOpenModal('payables', s.id)} className="button text-sm" aria-label="Registrar pago a proveedor">Registrar Pago</button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
            
            <PaymentModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={onSavePayment}
                selectedEntity={selectedEntity}
                clients={clients}
                suppliers={suppliers}
                sales={sales}
                purchases={purchases}
            />
        </div>
    );
};
