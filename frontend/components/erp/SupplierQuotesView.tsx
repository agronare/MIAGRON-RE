
import React, { useState, useMemo, useEffect } from 'react';
import { 
    FileText, Plus, Search, ArrowLeft, Save, Trash2, 
    CheckCircle, ExternalLink, ShoppingCart, Calendar, 
    User, Hash, DollarSign, Box, ChevronRight, Send, Printer,
    PackagePlus, X, Users
} from 'lucide-react';
import { Quote, Supplier, Product, PurchaseOrder, QuoteItem, Client, InventoryItem } from '../../types';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { SalesQuotesView } from './SalesQuotesView';

// Número de WhatsApp del encargado de aprobar cotizaciones
const WHATSAPP_APPROVAL_NUMBER = '524432270901'; // Formato: código país + número
const APP_URL = 'https://potential-system-v679776jvq49f6qqq-3000.app.github.dev';

// Función para enviar notificación por WhatsApp
const sendWhatsAppNotification = (type: 'proveedor' | 'cliente', quoteNo: string, entityName: string, total: number) => {
    const typeLabel = type === 'proveedor' ? 'Proveedor' : 'Cliente';
    const icon = type === 'proveedor' ? '🏭' : '🛒';
    const date = new Date();
    const formattedDate = date.toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const formattedTime = date.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
    
    const message = 
`━━━━━━━━━━━━━━━━━━━━━━
${icon} *AGRONARE - Sistema ERP*
━━━━━━━━━━━━━━━━━━━━━━

📋 *SOLICITUD DE APROBACIÓN*
_Cotización de ${typeLabel}_

▸ *Folio:* ${quoteNo}
▸ *${typeLabel}:* ${entityName}
▸ *Monto Total:* $${total.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
▸ *Fecha:* ${formattedDate}
▸ *Hora:* ${formattedTime}

━━━━━━━━━━━━━━━━━━━━━━

✅ *Acciones requeridas:*
• Revisar detalles de la cotización
• Aprobar o rechazar según corresponda

🔗 *Acceder al sistema:*
${APP_URL}

━━━━━━━━━━━━━━━━━━━━━━
_Mensaje automático generado por AGRONARE ERP_`;
    
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${WHATSAPP_APPROVAL_NUMBER}?text=${encodedMessage}`;
    
    // Abrir WhatsApp en nueva pestaña
    window.open(whatsappUrl, '_blank');
};

interface SupplierQuotesViewProps {
    quotes: Quote[];
    setQuotes: React.Dispatch<React.SetStateAction<Quote[]>>;
    suppliers: Supplier[];
    products: Product[];
    setPurchaseOrders: React.Dispatch<React.SetStateAction<PurchaseOrder[]>>;
    clients?: Client[];
    inventory?: InventoryItem[];
}

// --- INITIAL STATE ---
const EMPTY_QUOTE: Quote = {
    id: '',
    quoteNo: '',
    supplierId: '',
    supplierName: '',
    date: new Date().toISOString().split('T')[0],
    validUntil: '',
    campaign: '',
    items: [],
    notes: '',
    subtotal: 0,
    iva: 0,
    total: 0,
    status: 'Pendiente'
};

export const SupplierQuotesView: React.FC<SupplierQuotesViewProps> = ({ quotes, setQuotes, suppliers, products, setPurchaseOrders, clients = [], inventory = [] }) => {
    // View Management: 'list' shows the table, 'editor' shows the full screen form, 'sales' shows sales quotes
    const [view, setView] = useState<'list' | 'editor' | 'sales'>('list');
    const [quoteType, setQuoteType] = useState<'proveedor' | 'cliente'>('proveedor');
    
    // Editor State
    const [activeQuote, setActiveQuote] = useState<Quote>(EMPTY_QUOTE);
    const [isProductPanelOpen, setIsProductPanelOpen] = useState(false);
    const [productSearchTerm, setProductSearchTerm] = useState('');
    const [listSearchTerm, setListSearchTerm] = useState('');

    // --- CALCULATIONS ---
    
    // Auto-calculate totals whenever items change
    useEffect(() => {
        if (view === 'editor') {
            const subtotal = activeQuote.items.reduce((sum, item) => sum + (item.quantity * item.cost), 0);
            const iva = activeQuote.items.reduce((sum, item) => sum + (item.quantity * item.cost * (item.ivaRate || 0)), 0);
            const total = subtotal + iva;
            
            // Only update if numbers actually changed to prevent loops
            if (Math.abs(activeQuote.total - total) > 0.01) {
                setActiveQuote(prev => ({ ...prev, subtotal, iva, total }));
            }
        }
    }, [activeQuote.items, view]);

    // --- ACTIONS ---

    const handleCreateNew = () => {
        const nextId = (quotes || []).length + 1;
        setActiveQuote({
            ...EMPTY_QUOTE,
            id: `qt-${Date.now()}`,
            quoteNo: `COT-2025-${nextId.toString().padStart(3, '0')}`,
            date: new Date().toISOString().split('T')[0],
            status: 'Pendiente',
            items: []
        });
        setView('editor');
    };

    const handleEdit = (quote: Quote) => {
        if (quote.status === 'Convertida') {
            alert("No se puede editar una cotización ya convertida.");
            return;
        }
        // Deep copy to avoid mutating state directly
        setActiveQuote(JSON.parse(JSON.stringify(quote)));
        setView('editor');
    };

    const handleDelete = (id: string) => {
        if (window.confirm("¿Estás seguro de eliminar esta cotización?")) {
            setQuotes(prev => prev.filter(q => q.id !== id));
            if (activeQuote.id === id) setView('list');
        }
    };

    const handleSave = () => {
        if (!activeQuote.supplierId) return alert("Debes seleccionar un proveedor.");
        if (activeQuote.items.length === 0) return alert("Agrega al menos un producto.");

        const supplier = (suppliers || []).find(s => s.id === activeQuote.supplierId);
        const quoteToSave = {
            ...activeQuote,
            supplierName: supplier?.companyName || 'Proveedor Desconocido'
        };

        setQuotes(prev => {
            const exists = prev.findIndex(q => q.id === quoteToSave.id);
            if (exists >= 0) {
                const updated = [...prev];
                updated[exists] = quoteToSave;
                return updated;
            }
            return [quoteToSave, ...prev];
        });

        // Enviar notificación por WhatsApp
        if (window.confirm('¿Deseas enviar notificación por WhatsApp al encargado de aprobaciones?')) {
            sendWhatsAppNotification(
                'proveedor',
                quoteToSave.quoteNo,
                quoteToSave.supplierName,
                quoteToSave.total
            );
        }

        setView('list');
    };

    const handleConvertToPO = (quote: Quote) => {
         if (window.confirm(`¿Generar Orden de Compra basada en la cotización ${quote.quoteNo}?`)) {
            const orderNo = `OC-AUTO-${Date.now().toString().slice(-6)}`;
            const newPO: PurchaseOrder = {
                id: `po-${Date.now()}`,
                orderNo: orderNo,
                qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=40x40&data=${orderNo}`,
                supplierId: quote.supplierId,
                supplierName: quote.supplierName,
                date: new Date().toISOString(),
                campaign: quote.campaign,
                items: quote.items.map(item => ({ ...item, lote: '', receivedQuantity: 0 })),
                subtotal: quote.subtotal,
                iva: quote.iva,
                total: quote.total,
                status: 'Pendiente',
                logisticsStatus: 'N/A',
                destinationBranch: 'Bodega Central',
                paymentMethod: 'Crédito',
                quoteId: quote.id
            };

            setPurchaseOrders(prev => [newPO, ...prev]);
            setQuotes(prev => prev.map(q => q.id === quote.id ? { ...q, status: 'Convertida', purchaseOrderId: newPO.id } : q));
            alert("Orden de Compra generada exitosamente.");
        }
    };

    // --- ITEM MANAGEMENT ---

    const addItemToQuote = (product: Product) => {
        setActiveQuote(prev => {
            const exists = prev.items.find(i => i.id === product.id);
            if (exists) {
                return {
                    ...prev,
                    items: prev.items.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i)
                };
            }
            const newItem: QuoteItem = {
                id: product.id,
                name: product.name,
                sku: product.sku,
                quantity: 1,
                cost: product.cost || 0,
                ivaRate: product.ivaRate ?? 0.16
            };
            return { ...prev, items: [...prev.items, newItem] };
        });
    };

    const updateItemQuantity = (idx: number, qty: number) => {
        if (qty < 1) return;
        const newItems = [...activeQuote.items];
        newItems[idx].quantity = qty;
        setActiveQuote({ ...activeQuote, items: newItems });
    };

    const updateItemCost = (idx: number, cost: number) => {
        const newItems = [...activeQuote.items];
        newItems[idx].cost = cost;
        setActiveQuote({ ...activeQuote, items: newItems });
    };

    const removeItem = (idx: number) => {
        const newItems = activeQuote.items.filter((_, i) => i !== idx);
        setActiveQuote({ ...activeQuote, items: newItems });
    };

    // --- PDF GENERATION ---
    const handlePrint = () => {
        const doc = new jsPDF();
        doc.setFontSize(18);
        doc.text(`Cotización ${activeQuote.quoteNo}`, 14, 20);
        
        doc.setFontSize(10);
        doc.text(`Proveedor: ${activeQuote.supplierName}`, 14, 30);
        doc.text(`Fecha: ${activeQuote.date}`, 14, 35);
        doc.text(`Válida hasta: ${activeQuote.validUntil || 'N/A'}`, 14, 40);

        autoTable(doc, {
            startY: 50,
            head: [['Producto', 'SKU', 'Cant.', 'Costo U.', 'Total']],
            body: activeQuote.items.map(item => [
                item.name,
                item.sku,
                item.quantity,
                `$${item.cost.toFixed(2)}`,
                `$${(item.quantity * item.cost).toFixed(2)}`
            ]),
            foot: [['', '', '', 'Total:', `$${activeQuote.total.toFixed(2)}`]]
        });
        doc.save(`Cotizacion_${activeQuote.quoteNo}.pdf`);
    };

    // --- SUB-COMPONENTS ---

    // 0. SALES VIEW - Cotizaciones para Clientes
    if (view === 'sales') {
        return (
            <div className="animate-fadeIn space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setView('list')} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-500 transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div>
                            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded mb-1 inline-block">Cotización Venta</span>
                            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Nueva Cotización para Cliente</h1>
                            <p className="text-slate-500 dark:text-slate-400 text-sm">Genera cotizaciones de venta con precios y disponibilidad.</p>
                        </div>
                    </div>
                </div>
                <SalesQuotesView clients={clients} products={products} inventory={inventory} />
            </div>
        );
    }

    // 1. LIST VIEW
    if (view === 'list') {
        const filteredQuotes = (quotes || []).filter(q => 
            q.quoteNo.toLowerCase().includes(listSearchTerm.toLowerCase()) || 
            q.supplierName.toLowerCase().includes(listSearchTerm.toLowerCase())
        );

        return (
            <div className="animate-fadeIn space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <div>
                        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Gestión de Cotizaciones</h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">Compara precios con proveedores o genera cotizaciones para clientes.</p>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={() => setView('sales')} className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-emerald-200 dark:shadow-none flex items-center transition-all">
                            <ShoppingCart className="w-5 h-5 mr-2" /> Cotizar a Cliente
                        </button>
                        <button onClick={handleCreateNew} className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-indigo-200 dark:shadow-none flex items-center transition-all">
                            <Users className="w-5 h-5 mr-2" /> Cotizar a Proveedor
                        </button>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex gap-4 bg-slate-50 dark:bg-slate-800/50">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                            <input 
                                type="text" 
                                placeholder="Buscar por folio o proveedor..." 
                                className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none bg-white dark:bg-slate-800 dark:text-white"
                                value={listSearchTerm}
                                onChange={e => setListSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                    
                    {filteredQuotes.length > 0 ? (
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase border-b border-slate-200 dark:border-slate-700">
                                <tr>
                                    <th className="p-4 text-left">Folio</th>
                                    <th className="p-4 text-left">Proveedor</th>
                                    <th className="p-4 text-left">Fecha</th>
                                    <th className="p-4 text-right">Monto Total</th>
                                    <th className="p-4 text-center">Estado</th>
                                    <th className="p-4 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {filteredQuotes.map(quote => (
                                    <tr key={quote.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                                        <td className="p-4 font-mono font-medium text-indigo-600 dark:text-indigo-400">{quote.quoteNo}</td>
                                        <td className="p-4 font-medium text-slate-800 dark:text-white">{quote.supplierName}</td>
                                        <td className="p-4 text-slate-500 dark:text-slate-400">{new Date(quote.date).toLocaleDateString()}</td>
                                        <td className="p-4 text-right font-bold text-slate-800 dark:text-white">${quote.total.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                                        <td className="p-4 text-center">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                                                quote.status === 'Aprobada' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                                quote.status === 'Convertida' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                quote.status === 'Rechazada' ? 'bg-red-50 text-red-700 border-red-200' :
                                                'bg-amber-50 text-amber-700 border-amber-200'
                                            }`}>
                                                {quote.status}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {quote.status === 'Aprobada' && (
                                                    <button onClick={() => handleConvertToPO(quote)} className="p-1.5 text-emerald-600 bg-emerald-50 rounded hover:bg-emerald-100" title="Generar Orden de Compra">
                                                        <CheckCircle className="w-4 h-4" />
                                                    </button>
                                                )}
                                                <button onClick={() => handleEdit(quote)} className="p-1.5 text-slate-500 bg-slate-100 rounded hover:bg-slate-200" title="Ver / Editar">
                                                    <ExternalLink className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => handleDelete(quote.id)} className="p-1.5 text-red-500 bg-red-50 rounded hover:bg-red-100" title="Eliminar">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="p-12 text-center text-slate-400">
                            <FileText className="w-12 h-12 mx-auto mb-3 opacity-20" />
                            <p>No se encontraron cotizaciones.</p>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // 2. EDITOR VIEW (WORKSPACE)
    return (
        <div className="flex h-[calc(100vh-140px)] gap-6 animate-in slide-in-from-right duration-300">
            {/* Main Form Area */}
            <div className="flex-1 flex flex-col bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                {/* Editor Header */}
                <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-800">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setView('list')} className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-full text-slate-500 transition-colors" title="Volver a lista de cotizaciones">
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div>
                            <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded mb-1 inline-block">Cotización Proveedor</span>
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                {activeQuote.quoteNo}
                                <span className={`text-xs px-2 py-0.5 rounded border ${
                                    activeQuote.status === 'Pendiente' ? 'bg-amber-100 border-amber-200 text-amber-700' : 
                                    activeQuote.status === 'Aprobada' ? 'bg-emerald-100 border-emerald-200 text-emerald-700' : 'bg-slate-100 border-slate-200 text-slate-600'
                                }`}>
                                    {activeQuote.status}
                                </span>
                            </h2>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={handlePrint} className="p-2 text-slate-500 hover:bg-white dark:hover:bg-slate-700 rounded-lg border border-transparent hover:border-slate-200 dark:hover:border-slate-600 transition-colors" title="Imprimir PDF">
                            <Printer className="w-5 h-5" />
                        </button>
                        <button onClick={handleSave} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 flex items-center shadow-sm transition-colors">
                            <Save className="w-4 h-4 mr-2" /> Guardar
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* General Info Cards */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                            <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Proveedor</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <select 
                                    className="w-full pl-9 p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none focus:border-indigo-500"
                                    value={activeQuote.supplierId}
                                    onChange={e => setActiveQuote({...activeQuote, supplierId: e.target.value})}
                                >
                                    <option value="">Seleccionar...</option>
                                    {(suppliers || []).map(s => <option key={s.id} value={s.id}>{s.companyName}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                            <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Fecha Emisión</label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input 
                                    type="date" 
                                    className="w-full pl-9 p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none focus:border-indigo-500"
                                    value={activeQuote.date}
                                    onChange={e => setActiveQuote({...activeQuote, date: e.target.value})}
                                />
                            </div>
                        </div>
                        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                            <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Campaña / Ref</label>
                            <div className="relative">
                                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input 
                                    type="text" 
                                    className="w-full pl-9 p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none focus:border-indigo-500"
                                    placeholder="Opcional"
                                    value={activeQuote.campaign || ''}
                                    onChange={e => setActiveQuote({...activeQuote, campaign: e.target.value})}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Items Table */}
                    <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                        <div className="bg-slate-50 dark:bg-slate-800 p-3 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                            <h3 className="font-bold text-slate-700 dark:text-slate-300 text-sm flex items-center">
                                <ShoppingCart className="w-4 h-4 mr-2" /> Productos
                            </h3>
                            <button 
                                onClick={() => setIsProductPanelOpen(true)}
                                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-colors border border-indigo-100 dark:border-indigo-800 flex items-center"
                            >
                                <Plus className="w-3 h-3 mr-1" /> Agregar Producto
                            </button>
                        </div>
                        
                        <table className="w-full text-sm">
                            <thead className="bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
                                <tr>
                                    <th className="p-3 text-left font-medium">Descripción</th>
                                    <th className="p-3 text-center font-medium w-24">Cantidad</th>
                                    <th className="p-3 text-right font-medium w-32">Costo Unit.</th>
                                    <th className="p-3 text-right font-medium w-32">Total</th>
                                    <th className="p-3 w-10"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                                {activeQuote.items.map((item, idx) => (
                                    <tr key={idx} className="group hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                        <td className="p-3">
                                            <p className="font-medium text-slate-900 dark:text-white">{item.name}</p>
                                            <p className="text-xs text-slate-400">{item.sku}</p>
                                        </td>
                                        <td className="p-3">
                                            <input 
                                                type="number" 
                                                min="1"
                                                className="w-full p-1 text-center border border-slate-200 dark:border-slate-600 rounded bg-white dark:bg-slate-800 dark:text-white focus:border-indigo-500 outline-none"
                                                value={item.quantity}
                                                onChange={e => updateItemQuantity(idx, Number(e.target.value))}
                                            />
                                        </td>
                                        <td className="p-3 text-right">
                                            <div className="relative">
                                                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-xs">$</span>
                                                <input 
                                                    type="number" 
                                                    min="0"
                                                    step="0.01"
                                                    className="w-full pl-5 pr-1 py-1 text-right border border-slate-200 dark:border-slate-600 rounded bg-white dark:bg-slate-800 dark:text-white focus:border-indigo-500 outline-none"
                                                    value={item.cost}
                                                    onChange={e => updateItemCost(idx, Number(e.target.value))}
                                                />
                                            </div>
                                        </td>
                                        <td className="p-3 text-right font-bold text-slate-700 dark:text-slate-300">
                                            ${(item.quantity * item.cost).toLocaleString(undefined, {minimumFractionDigits: 2})}
                                        </td>
                                        <td className="p-3 text-center">
                                            <button onClick={() => removeItem(idx)} className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {activeQuote.items.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="p-8 text-center text-slate-400 italic">
                                            Tu cotización está vacía. Abre el panel de productos para agregar.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Footer Summary */}
                    <div className="flex flex-col sm:flex-row gap-6">
                        <div className="flex-1">
                            <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Notas Adicionales</label>
                            <textarea 
                                className="w-full p-3 border border-slate-200 dark:border-slate-700 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 focus:border-indigo-500 outline-none resize-none h-24"
                                placeholder="Condiciones de pago, entrega, observaciones..."
                                value={activeQuote.notes}
                                onChange={e => setActiveQuote({...activeQuote, notes: e.target.value})}
                            ></textarea>
                        </div>
                        <div className="w-full sm:w-72 bg-slate-50 dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 h-fit">
                            <div className="space-y-2 text-sm mb-4">
                                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                                    <span>Subtotal</span>
                                    <span>${activeQuote.subtotal.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                                </div>
                                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                                    <span>IVA (16%)</span>
                                    <span>${activeQuote.iva.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                                </div>
                            </div>
                            <div className="border-t border-slate-200 dark:border-slate-700 pt-3 flex justify-between items-center">
                                <span className="font-bold text-slate-900 dark:text-white">Total</span>
                                <span className="font-bold text-indigo-600 dark:text-indigo-400 text-xl">
                                    ${activeQuote.total.toLocaleString(undefined, {minimumFractionDigits: 2})}
                                </span>
                            </div>
                            
                            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Estado</label>
                                <select 
                                    className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded bg-white dark:bg-slate-900 text-sm font-medium"
                                    value={activeQuote.status}
                                    onChange={e => setActiveQuote({...activeQuote, status: e.target.value as any})}
                                >
                                    <option value="Pendiente">Pendiente</option>
                                    <option value="Aprobada">Aprobada</option>
                                    <option value="Rechazada">Rechazada</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* RIGHT SIDE PANEL: PRODUCT PICKER (Always visible or toggleable in mobile) */}
            <div className={`w-80 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-700 flex flex-col transition-all duration-300 absolute right-0 h-[calc(100vh-140px)] shadow-xl z-10 lg:static lg:shadow-none ${isProductPanelOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0 lg:w-80 hidden lg:flex'}`}>
                <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex justify-between items-center">
                    <h3 className="font-bold text-slate-800 dark:text-white text-sm">Catálogo</h3>
                    <button onClick={() => setIsProductPanelOpen(false)} className="lg:hidden text-slate-400"><X className="w-5 h-5" /></button>
                </div>
                
                <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input 
                            type="text" 
                            placeholder="Buscar..." 
                            className="w-full pl-9 pr-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none bg-white dark:bg-slate-800 dark:text-white"
                            value={productSearchTerm}
                            onChange={e => setProductSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
                    {(products || []).filter(p => p.name.toLowerCase().includes(productSearchTerm.toLowerCase())).map(product => (
                        <div 
                            key={product.id} 
                            className="p-3 border border-slate-100 dark:border-slate-800 rounded-lg hover:border-indigo-200 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 cursor-pointer group transition-all"
                            onClick={() => addItemToQuote(product)}
                        >
                            <div className="flex justify-between items-start mb-1">
                                <p className="text-xs font-bold text-slate-700 dark:text-slate-200 line-clamp-2">{product.name}</p>
                                <Plus className="w-4 h-4 text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] font-mono text-slate-400">{product.sku}</span>
                                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-1.5 py-0.5 rounded">
                                    ${product.cost?.toFixed(2)}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
