
import React, { useState, useMemo } from 'react';
import { PurchaseOrder, Supplier, Quote, Product, Branch } from '../../types';
import { Search, Filter, Download, Plus, Box, CheckCircle, AlertTriangle, Truck as TruckIcon, FileText, Send, Pencil, Trash2 } from 'lucide-react';
import { PurchaseOrderModal } from './PurchaseOrderModal';
import { PurchaseOrderDetailsPanel } from './PurchaseOrderDetailsPanel';
import { PurchaseOrderReceivingModal } from './PurchaseOrderReceivingModal';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface PurchasesViewProps {
    purchaseOrders: PurchaseOrder[];
    setPurchaseOrders: React.Dispatch<React.SetStateAction<PurchaseOrder[]>>;
    suppliers: Supplier[];
    quotes: Quote[];
    products: Product[];
    branches: Branch[];
}

export const PurchasesView: React.FC<PurchasesViewProps> = ({ purchaseOrders = [], setPurchaseOrders, suppliers, quotes, products, branches }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('Todos');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingOrder, setEditingOrder] = useState<PurchaseOrder | null>(null);
    const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(null);
    const [receivingOrder, setReceivingOrder] = useState<PurchaseOrder | null>(null);

    const kpis = useMemo(() => {
        const total = (purchaseOrders || []).length;
        const completed = (purchaseOrders || []).filter(p => p.status === 'Completado').length;
        const pending = (purchaseOrders || []).filter(p => p.status === 'Pendiente').length;
        const uniqueSuppliers = new Set((purchaseOrders || []).map(p => p.supplierId)).size;
        return { total, completed, pending, uniqueSuppliers };
    }, [purchaseOrders]);

    const filteredOrders = useMemo(() => {
        return (purchaseOrders || []).filter(order => {
            const matchesSearch = order.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) || (order.campaign && order.campaign.toLowerCase().includes(searchTerm.toLowerCase()));
            const matchesStatus = statusFilter === 'Todos' || order.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [purchaseOrders, searchTerm, statusFilter]);

    const handleOpenModal = (order: PurchaseOrder | null = null) => {
        setEditingOrder(order);
        setIsModalOpen(true);
    };

    const handleSavePurchaseOrder = (orderData: PurchaseOrder) => {
        // Resolve destinationBranch to RH name when value is a code
        const resolveBranchName = (value: string) => {
            const byCode = branches.find(b => b.code === value);
            if (byCode) return byCode.name;
            const byName = branches.find(b => b.name === value);
            return byName ? byName.name : value;
        };
        const resolveBranchCode = (value: string) => {
            const byCode = branches.find(b => b.code === value);
            if (byCode) return byCode.code;
            const byName = branches.find(b => b.name === value);
            return byName?.code;
        };
        const normalizedOrder = { 
            ...orderData, 
            destinationBranch: resolveBranchName(orderData.destinationBranch),
            destinationBranchCode: resolveBranchCode(orderData.destinationBranch)
        } as PurchaseOrder;
        if (editingOrder) {
            setPurchaseOrders(prev => prev.map(o => o.id === normalizedOrder.id ? normalizedOrder : o));
        } else {
            const newOrderNo = `OC-2025-${(purchaseOrders.length + 1).toString().padStart(3, '0')}`;
            const newOrder: PurchaseOrder = {
                ...normalizedOrder,
                id: `po-${Date.now()}`,
                orderNo: newOrderNo,
                qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=40x40&data=${newOrderNo}`,
            };
            setPurchaseOrders(prev => [newOrder, ...prev]);
        }
        setIsModalOpen(false);
        setEditingOrder(null);
    };
    
    const handleRequestLogistics = (orderId: string) => {
        setPurchaseOrders(prev => prev.map(o => o.id === orderId ? { ...o, logisticsStatus: 'Solicitada' } : o));
    };

    const handleNotifyLogistics = (order: PurchaseOrder) => {
        const message = `Hola equipo de logística, por favor coordinar la recolección de la orden de compra ${order.orderNo} con el proveedor ${order.supplierName}. Gracias.`;
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
    };

    const handleDeleteOrder = (orderId: string) => {
        if (window.confirm('¿Confirmas eliminar esta orden de compra? Esta acción no se puede deshacer.')) {
            setPurchaseOrders(prev => prev.filter(o => o.id !== orderId));
        }
    };
    
    const handleConfirmReception = (updatedOrder: PurchaseOrder) => {
        setPurchaseOrders(prev => prev.map(o => o.id === updatedOrder.id ? { ...updatedOrder, status: 'Completado', logisticsStatus: 'Entregado' } : o));
        setReceivingOrder(null);
    };
    
    const handleExportPDF = () => {
        const doc = new jsPDF();
        doc.text("Listado de Órdenes de Compra", 14, 10);
        autoTable(doc, {
            head: [['Folio', 'Proveedor', 'Fecha', 'Total', 'Estado', 'Logística']],
            body: filteredOrders.map(order => [
                order.orderNo,
                order.supplierName,
                new Date(order.date).toLocaleDateString(),
                `$${order.total.toFixed(2)}`,
                order.status,
                order.logisticsStatus
            ]),
            startY: 20
        });
        doc.save(`ordenes_de_compra_${new Date().toISOString().split('T')[0]}.pdf`);
    };

    const statusConfig: { [key in PurchaseOrder['status']]: { color: string } } = {
        'Pendiente': { color: 'bg-blue-100 text-blue-800' },
        'Completado': { color: 'bg-emerald-100 text-emerald-800' },
        'Cancelado': { color: 'bg-red-100 text-red-800' },
    };

    const logisticsConfig: { [key in PurchaseOrder['logisticsStatus']]: { color: string } } = {
        'N/A': { color: 'bg-slate-100 text-slate-600' },
        'Solicitada': { color: 'bg-indigo-100 text-indigo-800' },
        'En camino': { color: 'bg-amber-100 text-amber-800' },
        'Entregado': { color: 'bg-emerald-100 text-emerald-800' },
    };

    return (
        <div className="animate-fadeIn space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard icon={Box} title="Total Órdenes" value={kpis.total.toString()} color="blue" />
                <KPICard icon={CheckCircle} title="Completadas" value={kpis.completed.toString()} color="emerald" />
                <KPICard icon={AlertTriangle} title="Pendientes" value={kpis.pending.toString()} color="amber" />
                <KPICard icon={TruckIcon} title="Proveedores" value={kpis.uniqueSuppliers.toString()} color="purple" />
            </div>

            <div className="card p-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="relative w-full sm:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Buscar por proveedor o campaña..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                        aria-label="Buscar órdenes de compra"
                    />
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-48">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <select
                            value={statusFilter}
                            onChange={e => setStatusFilter(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm bg-white appearance-none"
                            aria-label="Filtrar por estado"
                        >
                            <option value="Todos">Todos los estados</option>
                            <option value="Pendiente">Pendiente</option>
                            <option value="Completado">Completado</option>
                            <option value="Cancelado">Cancelado</option>
                        </select>
                    </div>
                    <button onClick={handleExportPDF} className="button text-sm font-medium flex items-center" aria-label="Exportar órdenes a PDF" title="Exportar"><Download size={16} className="mr-2" /> Exportar</button>
                    <button onClick={() => handleOpenModal()} className="button text-sm font-medium flex items-center" aria-label="Crear nueva orden" title="Crear orden"><Plus size={16} className="mr-2" /> Nueva Orden</button>
                </div>
            </div>

            <div className="card overflow-hidden">
                <table className="w-full">
                    <thead className="bg-slate-50 border-b">
                        <tr>
                            <th className="p-3 text-left text-xs font-semibold text-slate-500 uppercase">QR</th>
                            <th className="p-3 text-left text-xs font-semibold text-slate-500 uppercase">Proveedor</th>
                            <th className="p-3 text-left text-xs font-semibold text-slate-500 uppercase">Fecha</th>
                            <th className="p-3 text-right text-xs font-semibold text-slate-500 uppercase">Total</th>
                            <th className="p-3 text-center text-xs font-semibold text-slate-500 uppercase">Estado</th>
                            <th className="p-3 text-center text-xs font-semibold text-slate-500 uppercase">Logística</th>
                            <th className="p-3 text-right text-xs font-semibold text-slate-500 uppercase">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filteredOrders.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="p-10 text-center">
                                    <div className="flex flex-col items-center justify-center text-slate-500">
                                        <Box className="w-8 h-8 mb-2 opacity-40" />
                                        <p className="text-sm">No hay órdenes de compra que coincidan con tu búsqueda o filtros.</p>
                                        <button onClick={() => handleOpenModal()} className="button mt-3" aria-label="Crear orden de compra">Crear Orden de Compra</button>
                                    </div>
                                </td>
                            </tr>
                        ) : filteredOrders.map(order => {
                            const statusStyle = statusConfig[order.status];
                            const logisticsStyle = logisticsConfig[order.logisticsStatus];
                            return (
                                <tr key={order.id} className="hover:bg-slate-50">
                                    <td className="p-3">
                                        <img src={order.qrCodeUrl} alt="QR Code" className="w-10 h-10 cursor-pointer" onClick={() => setReceivingOrder(order)} />
                                    </td>
                                    <td className="p-3">
                                        <p className="font-medium text-slate-900">{order.supplierName}</p>
                                        <p className="text-xs text-slate-500">{order.campaign || order.orderNo}</p>
                                    </td>
                                    <td className="p-3 text-sm">{new Date(order.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                                    <td className="p-3 text-right font-bold text-sm">${order.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                                    <td className="p-3 text-center">
                                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${statusStyle.color}`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="p-3 text-center">
                                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${logisticsStyle.color}`}>
                                            {order.logisticsStatus}
                                        </span>
                                    </td>
                                    <td className="p-3 text-right">
                                        <div className="flex justify-end gap-1">
                                            {order.logisticsStatus === 'N/A' && 
                                                <button onClick={() => handleRequestLogistics(order.id)} title="Solicitar Recolección de Logística" aria-label="Solicitar recolección" className="p-1.5 rounded text-blue-500 hover:bg-blue-50"><TruckIcon size={16} /></button>
                                            }
                                            {order.logisticsStatus === 'Solicitada' &&
                                                <button onClick={() => handleNotifyLogistics(order)} title="Notificar a Logística por WhatsApp" aria-label="Notificar logística" className="p-1.5 rounded text-emerald-500 hover:bg-emerald-50"><Send size={16} /></button>
                                            }
                                            <button onClick={() => setSelectedOrder(order)} title="Ver Ticket" aria-label="Ver ticket" className="p-1.5 rounded text-slate-400 hover:bg-slate-100"><FileText size={16} /></button>
                                            <button onClick={() => handleOpenModal(order)} title="Editar" aria-label="Editar orden" className="p-1.5 rounded text-indigo-500 hover:bg-indigo-50"><Pencil size={16} /></button>
                                            <button onClick={() => handleDeleteOrder(order.id)} title="Eliminar" aria-label="Eliminar orden" className="p-1.5 rounded text-red-500 hover:bg-red-50"><Trash2 size={16} /></button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
            <PurchaseOrderModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSavePurchaseOrder}
                initialData={editingOrder}
                suppliers={suppliers}
                quotes={quotes}
                products={products}
                branches={branches}
            />
             <PurchaseOrderDetailsPanel
                order={selectedOrder}
                onClose={() => setSelectedOrder(null)}
            />
            <PurchaseOrderReceivingModal
                order={receivingOrder}
                onClose={() => setReceivingOrder(null)}
                onConfirm={handleConfirmReception}
            />
        </div>
    );
};

const KPICard = ({ icon: Icon, title, value, color }: { icon: React.FC<any>, title: string, value: string, color: string }) => {
    const colors: { [key: string]: string } = {
        blue: 'bg-blue-50 text-blue-600',
        emerald: 'bg-emerald-50 text-emerald-600',
        amber: 'bg-amber-50 text-amber-600',
        purple: 'bg-purple-50 text-purple-600',
    };
    return (
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className={`p-2 rounded-lg w-fit mb-2 ${colors[color]}`}><Icon size={20} /></div>
            <p className="text-sm text-slate-500 font-medium">{title}</p>
            <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
        </div>
    );
};
