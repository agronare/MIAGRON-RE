import React, { useState, useMemo, useEffect } from 'react';
import { Product, CartItem, Client, Sale, InventoryItem, Branch } from '../../types';
import { Search, Filter, Package, ShoppingCart, User, CheckCircle, Download, Plus, Trash2, CreditCard, Wallet, Banknote, Receipt, X, Save, Percent, Calculator, ChevronDown, AlertCircle } from 'lucide-react';
import { TicketModal } from './TicketModal';
import { CashReconciliationModal } from './CashReconciliationModal';
import { AddClientModal } from './AddClientModal';
import { ProductImage } from '../ProductImage';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import erpService from '../../services/erpService';
import api from '../../services/api';
import { generateTicketPDFBase64 } from '../../utils/pdfGenerator';

const DiscountModal = ({ isOpen, onClose, onApply }: { isOpen: boolean, onClose: () => void, onApply: (discount: number) => void }) => {
    const [discount, setDiscount] = useState(0);
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 w-full max-w-sm border border-slate-200 dark:border-slate-700 shadow-2xl animate-in zoom-in-95">
                <h3 className="font-bold text-lg mb-4 text-slate-900 dark:text-white">Aplicar Descuento Global (%)</h3>
                <input type="number" value={discount} onChange={e => setDiscount(Number(e.target.value))} className="w-full border border-slate-200 dark:border-slate-600 rounded-lg p-2 text-center text-2xl font-bold text-slate-900 dark:text-white bg-transparent outline-none focus:border-indigo-500" autoFocus />
                <div className="flex justify-end gap-2 mt-4">
                    <button onClick={onClose} className="px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700">Cancelar</button>
                    <button onClick={() => { onApply(discount); onClose(); }} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Aplicar</button>
                </div>
            </div>
        </div>
    );
};

// Add type interface for props
interface SalesViewProps {
    products: Product[];
    clients: Client[];
    setClients: React.Dispatch<React.SetStateAction<Client[]>>;
    inventory: InventoryItem[];
    branches?: Branch[];
    onStockUpdate: React.Dispatch<React.SetStateAction<InventoryItem[]>>;
    salesHistory: Sale[];
    onAddSale: (sale: Sale) => void;
}

export const SalesView: React.FC<SalesViewProps> = ({ 
    products = [], 
    clients = [], 
    setClients, 
    inventory = [], 
    branches = [],
    onStockUpdate, 
    salesHistory = [], 
    onAddSale 
}) => {
    const [activeMode, setActiveMode] = useState<'pos' | 'history'>('pos');
    const initialBranchValue = branches[0]?.code || branches[0]?.name || 'SUC. Copandaro';
    const [selectedBranch, setSelectedBranch] = useState(initialBranchValue);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [selectedClientId, setSelectedClientId] = useState<string>('');
    const [isClientDropdownOpen, setIsClientDropdownOpen] = useState(false);
    const [clientSearchTerm, setClientSearchTerm] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [paymentMethod, setPaymentMethod] = useState<'Efectivo' | 'Tarjeta' | 'Transferencia' | 'Crédito'>('Efectivo');
    const [paymentReference, setPaymentReference] = useState('');
    const [requireInvoice, setRequireInvoice] = useState(false);
    const [isTicketOpen, setIsTicketOpen] = useState(false);
    const [lastSaleData, setLastSaleData] = useState<any>(null);
    const [lastInvoiceUuid, setLastInvoiceUuid] = useState<string | undefined>(undefined);
    const [historyDateFilter, setHistoryDateFilter] = useState('');
    const [isAddClientOpen, setIsAddClientOpen] = useState(false);
    const [globalDiscount, setGlobalDiscount] = useState({ type: 'percent' as 'percent' | 'fixed', value: 0 });
    const [isDiscountModalOpen, setIsDiscountModalOpen] = useState(false);
    const [amountReceived, setAmountReceived] = useState('');
    const [isCashReconciliationOpen, setIsCashReconciliationOpen] = useState(false);


    const selectedClient = clients.find((c: any) => c.id === selectedClientId);
    
    const selectedBranchName = useMemo(() => {
        const b = (branches || []).find(br => (br.code || br.name) === selectedBranch);
        return b?.name || selectedBranch;
    }, [branches, selectedBranch]);

    const getProductStock = (sku: string) => (inventory || [])
        .filter((i: any) => i.sku === sku && (
            i.branchCode === selectedBranch || i.branch === selectedBranchName
        ))
        .reduce((a: any, b: any) => a + b.quantity, 0);

    const getGlobalStock = (sku: string) => (inventory || [])
        .filter((i: any) => i.sku === sku)
        .reduce((a: any, b: any) => a + b.quantity, 0);

    // Asegura que la sucursal seleccionada exista en el inventario; si no, toma la primera disponible
    useEffect(() => {
        const availableValues = (branches || []).map(b => b.code || b.name).filter(Boolean) as string[];
        if (availableValues.length > 0 && !availableValues.includes(selectedBranch)) {
            setSelectedBranch(availableValues[0]);
        }
    }, [branches]);

    const branchOptions = useMemo(() => {
        const opts = [] as Array<{ value: string; label: string }>;
        (branches || []).forEach(b => {
            const value = b.code || b.name;
            const label = b.code ? `${b.name} (${b.code})` : b.name;
            opts.push({ value, label });
        });
        return opts;
    }, [branches]);

    // Helper puro para calcular totales del carrito (robusto a tipos/NaN)
    const computeTotals = (items: CartItem[], discount: { type: 'percent' | 'fixed'; value: number }) => {
        // Normalizadores seguros
        const toNum = (v: any): number => {
            const n = typeof v === 'string' ? parseFloat(v) : Number(v);
            return Number.isFinite(n) ? n : 0;
        };
        const normIvaRate = (rate: any, taxObject?: string): number => {
            // Exento si objeto impuesto 01
            if (taxObject === '01') return 0;
            // Si falta tasa, usar 16% por defecto (0.16)
            if (rate === null || rate === undefined) return 0.16;
            let r = typeof rate === 'string' ? parseFloat(rate) : Number(rate);
            if (!Number.isFinite(r)) return 0;
            // Si viene como porcentaje (ej. 16), convertir a 0.16
            if (r > 1) r = r / 100;
            // Negativos no son válidos
            if (r < 0) return 0;
            return r;
        };

        let subtotal = 0;
        let ivaAcumulado = 0;
        let descuentoAcumulado = 0;
        let retIvaAcumulado = 0; // calculado sobre IVA
        let retIsrAcumulado = 0; // calculado sobre base

        for (const item of items) {
            const qty = Math.max(0, toNum((item as any).quantity));
            const price = Math.max(0, toNum((item as any).overridePrice ?? (item as any).price));
            const discountPct = Math.max(0, toNum((item as any).discount));
            const ivaRate = normIvaRate((item as any).ivaRate, (item as any).taxObject);

            const bruto = price * qty;
            const descuentoLinea = bruto * (discountPct / 100);
            const neto = bruto - descuentoLinea;

            subtotal += neto;
            descuentoAcumulado += descuentoLinea;

            const ivaLinea = neto * ivaRate;
            ivaAcumulado += ivaLinea;

            if ((item as any).retentionIva) {
                retIvaAcumulado += ivaLinea * (2 / 3); // 10.6667% aprox cuando IVA 16%
            }
            if ((item as any).retentionIsr) {
                retIsrAcumulado += neto * 0.0125; // 1.25% RESICO
            }
        }

        // Descuento global (porcentaje o fijo)
        let descuentoGlobal = 0;
        if (discount?.value && discount.value > 0) {
            if (discount.type === 'percent') {
                descuentoGlobal = subtotal * (discount.value / 100);
            } else {
                descuentoGlobal = Math.min(subtotal, toNum(discount.value));
            }
        }
        const subtotalConDescuento = Math.max(0, subtotal - descuentoGlobal);

        // Ajustar impuestos y retenciones proporcionalmente al descuento global
        const factor = subtotal > 0 ? (subtotalConDescuento / subtotal) : 0;
        const ivaFinal = ivaAcumulado * factor;
        const retIvaFinal = retIvaAcumulado * factor;
        const retIsrFinal = retIsrAcumulado * factor;

        const total = subtotalConDescuento + ivaFinal - retIvaFinal - retIsrFinal;
        return {
            subtotal,
            totalDiscount: descuentoAcumulado + descuentoGlobal,
            totalIva: ivaFinal,
            retIva: retIvaFinal,
            retIsr: retIsrFinal,
            total
        };
    };

    // Calcular totales siempre en función del carrito y descuento
    const displayTotals = useMemo(() => computeTotals(cart, globalDiscount), [cart, globalDiscount]);
    
    const addToCart = (product: Product) => {
        const stock = getProductStock(product.sku);
        const existing = cart.find(i => i.id === product.id);
        const qtyInCart = existing ? existing.quantity : 0;
        
        if (qtyInCart + 1 > stock) { 
            alert(`Stock insuficiente en ${selectedBranch}. Solo hay ${stock} unidades disponibles.`); 
            return; 
        }
        
        if (existing) {
            setCart(cart.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i));
        } else {
            setCart([...cart, { ...product, quantity: 1, discount: 0 }]);
        }
    };

    const updateCartItem = (itemId: string, updates: Partial<CartItem>) => {
        const itemIndex = cart.findIndex(item => item.id === itemId);
        if (itemIndex === -1) return;
        
        const currentItem = cart[itemIndex];
        const newItem = { ...currentItem, ...updates };

        if (newItem.quantity !== undefined) {
             const product = products.find((p: Product) => p.id === itemId);
             if (!product) return;
             const stock = getProductStock(product.sku);
             if (newItem.quantity > stock) {
                alert(`Stock insuficiente. Solo hay ${stock} disponibles.`);
                newItem.quantity = stock;
             }
        }
       
        if (newItem.quantity !== undefined && newItem.quantity <= 0) {
            setCart(cart.filter(item => item.id !== itemId));
        } else {
            setCart(cart.map(item => item.id === itemId ? newItem : item));
        }
    };

    const handleClearCart = () => {
        if (window.confirm('¿Estás seguro de que quieres vaciar el carrito?')) {
            setCart([]);
            setGlobalDiscount({ type: 'percent', value: 0 });
        }
    };
    
    const handleAddClient = (newClientData: any) => {
        const newClient: Client = { 
            id: `cli-${Date.now()}`, 
            name: newClientData.name, 
            rfc: newClientData.rfc || 'XAXX010101000', 
            contactName: newClientData.contactName || newClientData.name, 
            creditLimit: 0, 
            currentDebt: 0, 
            status: 'Activo' 
        };
        setClients((prevClients: Client[]) => [...prevClients, newClient]); 
        setSelectedClientId(newClient.id);
        setIsAddClientOpen(false);
    };

    const handleCheckout = async () => {
        if (cart.length === 0) return;

        // Validaciones previas
        if (paymentMethod !== 'Efectivo' && paymentMethod !== 'Crédito' && !paymentReference.trim()) {
            alert('Por favor ingrese el número de referencia o autorización del pago.');
            return;
        }

        if (paymentMethod === 'Crédito') {
            if (!selectedClient) {
                alert('Debe seleccionar un cliente para una venta a crédito.');
                return;
            }
            const availableCredit = selectedClient.creditLimit - selectedClient.currentDebt;
            const currentTotals = computeTotals(cart, globalDiscount);
            if (currentTotals.total > availableCredit) {
                alert(`Crédito insuficiente. Límite disponible: $${availableCredit.toFixed(2)}`);
                return;
            }
        }

        // Preparar datos de venta
        const saleId = `VENTA-${Math.floor(Math.random() * 9000) + 1000}`;
        const received = parseFloat(amountReceived);
        const currentTotals = computeTotals(cart, globalDiscount);
        const change = (received > currentTotals.total) ? received - currentTotals.total : 0;
        const uuid = requireInvoice ? `550e8400-e29b-41d4-a716-${Math.random().toString(16).substring(2,12)}` : undefined;
        setLastInvoiceUuid(uuid);

        const ventaData = {
            folio: saleId,
            clienteId: selectedClient ? parseInt(selectedClient.id) : null,
            clienteNombre: selectedClient ? selectedClient.name : 'Público General',
            clienteRfc: selectedClient?.rfc || 'XAXX010101000',
            fecha: new Date().toISOString(),
            sucursal: selectedBranch,
            subtotal: currentTotals.subtotal,
            impuestos: currentTotals.totalIva,
            descuentoTotal: currentTotals.totalDiscount,
            total: currentTotals.total,
            metodoPago: paymentMethod,
            referenciaPago: paymentReference || null,
            montoRecibido: paymentMethod === 'Efectivo' ? received : null,
            cambioDevuelto: paymentMethod === 'Efectivo' ? change : null,
            montoPagado: paymentMethod !== 'Crédito' ? currentTotals.total : 0,
            estatus: paymentMethod === 'Crédito' ? 'Pendiente' : 'Pagado',
            requiereFactura: requireInvoice,
            regimenFiscal: selectedClient?.taxRegime || null,
            usoCfdi: requireInvoice ? 'G03' : null,
            items: cart.map(item => {
                const price = item.overridePrice ?? item.price;
                const grossAmount = price * item.quantity;
                const itemDiscountAmount = grossAmount * ((item.discount || 0) / 100);
                const netAmount = grossAmount - itemDiscountAmount;
                const isExempt = (item.taxObject === '01') || item.ivaRate === null || item.ivaRate === undefined || (typeof item.ivaRate === 'number' && item.ivaRate < 0);
                const ivaAmount = isExempt ? 0 : netAmount * (item.ivaRate as number);

                // Calcular cantidad en unidades base (para productos a granel)
                let cantidadBase = item.quantity;
                if (item.isBulk && item.bulkConfig?.conversionFactor) {
                    cantidadBase = item.quantity * item.bulkConfig.conversionFactor;
                }

                return {
                    productoId: parseInt(item.id),
                    sku: item.sku,
                    nombre: item.name,
                    cantidad: item.quantity,
                    cantidadBase: cantidadBase, // NUEVO: cantidad en unidades base para FIFO
                    unidad: 'PZA',
                    precioUnitario: price,
                    descuento: item.discount || 0,
                    subtotal: netAmount,
                    impuestoMonto: ivaAmount,
                    total: netAmount + ivaAmount,
                    tasaIva: isExempt ? 0 : (item.ivaRate as number),
                    claveProdServ: item.satKey || null,
                    claveUnidad: item.satUnitKey || null,
                    objetoImpuesto: item.taxObject || null,
                };
            }),
        };

        try {
            // LLAMAR AL NUEVO ENDPOINT ATÓMICO
            const response = await api.post<{ venta: any; inventarioActualizado: any[] }>(
                '/ventas/process-sale',
                ventaData
            );

            if (!response.success || !response.data) {
                throw new Error(response.error || 'Error al procesar venta');
            }

            const { venta, inventarioActualizado } = response.data;

            // ACTUALIZAR ESTADO LOCAL DEL INVENTARIO
            // Recargar inventario completo desde backend para sincronizar
            const inventarioResponse = await erpService.inventario.getAll();
            if (inventarioResponse.success && inventarioResponse.data) {
                // Mapear inventarioDB a InventoryItem (ajustar según tipos del frontend)
                const inventarioMapeado = inventarioResponse.data.map((inv: any) => ({
                    id: inv.id,
                    sku: (products || []).find(p => p.id === String(inv.productoId))?.sku || '',
                    quantity: inv.cantidad,
                    branch: (branches || []).find(b => b.id === String(inv.sucursalId))?.name || '',
                    branchCode: (branches || []).find(b => b.id === String(inv.sucursalId))?.code || '',
                    entryDate: inv.fechaIngreso,
                    unitPrice: inv.costoUnit || 0,
                }));

                onStockUpdate(inventarioMapeado);
            }

            // Generar PDF del ticket
            const pdfBase64 = await generateTicketPDFBase64({
                folio: saleId,
                fecha: new Date().toISOString(),
                clienteNombre: ventaData.clienteNombre,
                clienteRfc: ventaData.clienteRfc,
                sucursal: ventaData.sucursal,
                subtotal: currentTotals.subtotal,
                impuestos: currentTotals.totalIva,
                retencionIva: (currentTotals as any).retIva || 0,
                retencionIsr: (currentTotals as any).retIsr || 0,
                descuentoTotal: currentTotals.totalDiscount,
                total: currentTotals.total,
                metodoPago: paymentMethod,
                referenciaPago: paymentReference,
                montoRecibido: received,
                cambioDevuelto: change,
                items: cart.map(item => {
                    const price = item.overridePrice ?? item.price;
                    const grossAmount = price * item.quantity;
                    const itemDiscountAmount = grossAmount * ((item.discount || 0) / 100);
                    const netAmount = grossAmount - itemDiscountAmount;
                    const isExempt = (item.taxObject === '01') || !item.ivaRate;
                    const ivaAmount = isExempt ? 0 : netAmount * (item.ivaRate as number);

                    return {
                        sku: item.sku,
                        nombre: item.name,
                        cantidad: item.quantity,
                        precioUnitario: price,
                        descuento: item.discount || 0,
                        subtotal: netAmount,
                        impuestoMonto: ivaAmount,
                        total: netAmount + ivaAmount,
                    };
                }),
            });

            // Actualizar venta con PDF
            await api.patch('/ventas', venta.id, { ticketPdfBase64: pdfBase64 });

            // Crear objeto Sale para estado local
            const newSale: Sale = {
                id: saleId,
                date: new Date().toISOString(),
                client: ventaData.clienteNombre,
                clientId: selectedClient?.id,
                total: currentTotals.total,
                subtotal: currentTotals.subtotal,
                taxes: currentTotals.totalIva,
                discountTotal: currentTotals.totalDiscount,
                globalDiscount,
                items: cart.reduce((a, b) => a + b.quantity, 0),
                products: [...cart],
                method: paymentMethod,
                paymentReference: paymentReference,
                branch: selectedBranch,
                status: paymentMethod === 'Crédito' ? 'Pendiente' : 'Pagado',
                invoiceUuid: uuid,
                amountReceived: paymentMethod === 'Efectivo' ? received : undefined,
                changeGiven: paymentMethod === 'Efectivo' ? change : undefined,
                paidAmount: paymentMethod !== 'Crédito' ? currentTotals.total : 0,
            };

            onAddSale(newSale);
            setLastSaleData(newSale);
            setIsTicketOpen(true);

            console.log('✅ Venta procesada exitosamente con actualización de inventario');

        } catch (error: any) {
            console.error('❌ Error al procesar venta:', error);

            // Manejo específico de errores
            if (error.message?.includes('Stock insuficiente') || error.error?.includes('Stock insuficiente')) {
                alert(
                    `ERROR DE INVENTARIO\n\n${error.message || error.error}\n\n` +
                    'La venta ha sido cancelada completamente. ' +
                    'Por favor verifique el inventario disponible.'
                );
            } else {
                alert(
                    'Error al procesar la venta.\n\n' +
                    'La operación ha sido cancelada y no se realizaron cambios.\n\n' +
                    `Detalles: ${error.message || error.error || 'Error desconocido'}`
                );
            }

            // NO actualizar estado - todo fue revertido en backend
            return;
        }
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchTerm(value);
        if (value.length >= 8 && !isNaN(Number(value))) {
            const product = (products || []).find((p: Product) => p.barcode === value || p.sku === value);
            if (product) {
                addToCart(product);
                setTimeout(() => setSearchTerm(''), 50);
            }
        }
    };

    const filteredHistory = (salesHistory || []).filter((sale: Sale) => {
        if (!historyDateFilter) return true;
        const saleDate = new Date(sale.date);
        return saleDate.toISOString().split('T')[0] === historyDateFilter;
    });
    
    const generateHistoryPDF = () => {
      const doc = new jsPDF();
      doc.text("Historial de Ventas", 14, 10);
      autoTable(doc, {
          head: [['Folio', 'Fecha', 'Cliente', 'Método', 'Total', 'Factura']],
          body: filteredHistory.map((sale: Sale) => [
              sale.id, new Date(sale.date).toLocaleString(), sale.client, sale.method,
              `$${sale.total.toFixed(2)}`, sale.invoiceUuid ? 'Sí' : 'No'
          ]),
          startY: 20
      });
      doc.save(`historial_ventas_${new Date().toISOString().split('T')[0]}.pdf`);
    };

    const todaySales = (salesHistory || []).filter((s: Sale) => new Date(s.date).toDateString() === new Date().toDateString() && s.branch === selectedBranch);
    
    const availableCredit = selectedClient ? selectedClient.creditLimit - selectedClient.currentDebt : 0;
    const canUseCredit = paymentMethod === 'Crédito' && selectedClient && displayTotals.total <= availableCredit;

    useEffect(() => {
        console.log('Estado del carrito:', cart);
        console.log('Totales calculados:', displayTotals);
    }, [cart, displayTotals]);

    return (
        <div className="flex flex-col min-h-[calc(100vh-140px)]">
             <div className="mb-6 flex justify-between items-end shrink-0">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Punto de Venta (POS)</h1>
                    <p className="text-slate-500 dark:text-slate-400">Gestión estratégica de ventas y facturación.</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => setActiveMode('pos')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeMode === 'pos' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'}`}>Nueva Venta</button>
                    <button onClick={() => setActiveMode('history')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeMode === 'history' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'}`}>Historial</button>
                </div>
            </div>
            
            {activeMode === 'pos' ? (
                <div className="flex flex-col lg:flex-row gap-6 flex-1 overflow-auto">
                    {/* Left Panel: Products */}
                    <div className="flex-1 flex flex-col min-w-0 h-full">
                        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm mb-4 flex gap-3 shrink-0">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                                <input type="text" className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-transparent focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500 dark:focus:border-indigo-500 border rounded-lg text-sm outline-none transition-all dark:text-white"
                                    placeholder="Buscar o escanear producto..." value={searchTerm} onChange={handleSearchChange} />
                            </div>
                            <div className="relative w-64">
                                <label className="sr-only">Sucursal</label>
                                <select
                                    value={selectedBranch}
                                    onChange={(e) => setSelectedBranch(e.target.value)}
                                    className="w-full pl-3 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-transparent focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500 dark:focus:border-indigo-500 border rounded-lg text-sm outline-none transition-all dark:text-white cursor-pointer"
                                >
                                    {branchOptions.map((b) => (
                                        <option key={b.value} value={b.value}>{b.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto pr-2 pb-4">
                            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                               {(() => {
                                    const lower = (s?: string) => (s || '').toLowerCase();
                                    const term = lower(searchTerm);
                                    // Deduplicar por SKU (o id si no hay SKU)
                                    const seen = new Set<string>();
                                    const base = (products || [])
                                      .filter((p: any) => lower(p.name).includes(term) || lower(p.sku).includes(term))
                                      .filter((p: any) => {
                                          const key = String(p.sku || p.id);
                                          if (seen.has(key)) return false;
                                          seen.add(key);
                                          return true;
                                      });
                                    const sorted = base
                                      // Orden: primero productos con stock en la sucursal seleccionada
                                      .sort((a: any, b: any) => {
                                          const sa = getProductStock(a.sku);
                                          const sb = getProductStock(b.sku);
                                          if ((sa > 0) !== (sb > 0)) return sb > 0 ? 1 : -1; // true first
                                          // Si ambos tienen mismo estado, ordenar por stock descendente y luego nombre
                                          if (sb !== sa) return sb - sa;
                                          return lower(a.name).localeCompare(lower(b.name), 'es', { sensitivity: 'base' });
                                      });
                                    return sorted.map((product: any) => {
                                        const stock = getProductStock(product.sku);
                                        const globalStock = getGlobalStock(product.sku);
                                    return (
                                        <div key={product.id} onClick={() => stock > 0 && addToCart(product)}
                                            className={`bg-white dark:bg-slate-900 rounded-2xl p-3 border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-all cursor-pointer group relative ${stock === 0 ? 'opacity-60 grayscale cursor-not-allowed' : ''}`}>
                                            <div className="h-28 bg-slate-50 dark:bg-slate-800 rounded-xl relative flex items-center justify-center mb-3 group-hover:scale-105 transition-transform duration-300 overflow-hidden">
                                                <ProductImage imageKey={product.imageKey} productName={product.name} sku={product.sku} className="w-full h-full object-cover" />
                                                <span className="absolute top-2 right-2 bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded shadow-sm text-xs font-bold text-slate-700 dark:text-slate-200 border dark:border-slate-700">${product.price.toFixed(2)}</span>
                                                    <div className="absolute bottom-2 left-2 flex items-center gap-2">
                                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${stock > 0 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                                                            {stock > 0 ? `STOCK: ${stock}` : 'AGOTADO'}
                                                        </span>
                                                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 dark:bg-slate-900/60 dark:text-slate-200 border dark:border-slate-700">
                                                            GLOBAL: {globalStock}
                                                        </span>
                                                    </div>
                                            </div>
                                            <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm leading-tight mb-1 line-clamp-2 h-10">{product.name}</h3>
                                            <p className="text-[10px] text-slate-400 uppercase">{product.sku}</p>
                                        </div>
                                    );
                                    });
                               })()}
                            </div>
                        </div>
                    </div>

                    {/* Right Panel: Cart */}
                    <div className="w-full lg:w-[380px] bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col h-full shrink-0">
                        <div className="p-5 border-b border-slate-200 dark:border-slate-700 shrink-0">
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="font-bold text-slate-800 dark:text-white flex items-center"><User className="w-4 h-4 mr-2"/> Cliente</h3>
                                <button onClick={() => setIsAddClientOpen(true)} className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline flex items-center"><Plus className="w-3 h-3 mr-1"/> Nuevo Cliente</button>
                            </div>
                            <div className="relative">
                                <button onClick={() => setIsClientDropdownOpen(!isClientDropdownOpen)} className="w-full text-left p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 flex justify-between items-center">
                                    <span className="font-medium text-slate-700 dark:text-slate-200">{selectedClient ? selectedClient.name : 'Público General'}</span>
                                    <ChevronDown className="w-4 h-4 text-slate-400" />
                                </button>
                                {isClientDropdownOpen && (
                                    <div className="absolute top-full mt-1 w-full bg-white dark:bg-slate-800 rounded-lg border dark:border-slate-700 shadow-lg z-10 p-2">
                                        <input 
                                            type="text" 
                                            placeholder="Buscar cliente..." 
                                            value={clientSearchTerm} 
                                            onChange={e => setClientSearchTerm(e.target.value)}
                                            className="w-full p-2 border-b dark:border-slate-700 mb-1 bg-transparent text-slate-900 dark:text-white outline-none"
                                        />
                                        <ul className="max-h-40 overflow-y-auto">
                                            <li onClick={() => { setSelectedClientId(''); setIsClientDropdownOpen(false); }} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer text-sm text-slate-700 dark:text-slate-300">Público General</li>
                                            {(clients || []).filter((c: Client) => c.name.toLowerCase().includes(clientSearchTerm.toLowerCase())).map((c: Client) => (
                                                <li key={c.id} onClick={() => { setSelectedClientId(c.id); setIsClientDropdownOpen(false); }} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer text-sm text-slate-700 dark:text-slate-300 border-b dark:border-slate-700/50 last:border-0">
                                                    <p>{c.name}</p>
                                                    {c.creditLimit > 0 && <p className="text-xs text-emerald-600 dark:text-emerald-400">Crédito Disp: ${(c.creditLimit - c.currentDebt).toFixed(2)}</p>}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>
                         <div className="p-5 flex-1 flex flex-col overflow-hidden">
                            <div className="flex-1 overflow-y-auto pr-1 space-y-3 custom-scrollbar">
                               {cart.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
                                        <ShoppingCart className="w-12 h-12 mb-2 opacity-20" />
                                        <p className="text-sm">El carrito está vacío</p>
                                    </div>
                                ) : cart.map((item: CartItem) => (
                                    <div key={item.id} className="flex gap-3 p-3 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl shadow-sm">
                                        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center text-slate-300 dark:text-slate-500"><Package className="w-8 h-8" /></div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-xs font-bold text-slate-800 dark:text-white line-clamp-2 leading-tight">{item.name}</h4>
                                            <div className="flex items-end gap-2 mt-2">
                                                 <div>
                                                    <label className="text-[10px] font-medium text-slate-500 dark:text-slate-400 block text-center">Precio</label>
                                                    <input type="number" defaultValue={item.overridePrice ?? item.price} onBlur={e => updateCartItem(item.id, { overridePrice: parseFloat((e.target as HTMLInputElement).value) })} className="w-16 text-xs border dark:border-slate-600 rounded p-1 text-center bg-white dark:bg-slate-700 dark:text-white outline-none" />
                                                 </div>
                                                  <div>
                                                    <label className="text-[10px] font-medium text-slate-500 dark:text-slate-400 block text-center">Cantidad</label>
                                                    <input type="number" defaultValue={item.quantity} onBlur={e => updateCartItem(item.id, { quantity: parseInt((e.target as HTMLInputElement).value) })} className="w-12 text-xs border dark:border-slate-600 rounded p-1 text-center bg-white dark:bg-slate-700 dark:text-white outline-none" />
                                                 </div>
                                                 <div>
                                                    <label className="text-[10px] font-medium text-slate-500 dark:text-slate-400 block text-center">Desc %</label>
                                                    <input type="number" defaultValue={item.discount || 0} onBlur={e => updateCartItem(item.id, { discount: parseFloat((e.target as HTMLInputElement).value) })} className="w-12 text-xs border dark:border-slate-600 rounded p-1 text-center bg-white dark:bg-slate-700 dark:text-white outline-none" />
                                                 </div>
                                                 <button onClick={() => updateCartItem(item.id, { quantity: 0 })}><Trash2 className="w-4 h-4 text-red-400 hover:text-red-500" /></button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                             {cart.length > 0 && (
                                <button onClick={handleClearCart} className="text-xs text-red-500 mt-2 flex items-center justify-center gap-1 hover:text-red-600 transition-colors">
                                    <Trash2 className="w-3 h-3" /> Vaciar Carrito
                                </button>
                            )}
                        </div>
                        
                        {/* Totals & Payment */}
                         <div className="p-6 bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 shrink-0 rounded-b-xl">
                            <div className="flex justify-between items-center mb-2">
                                <button onClick={() => setIsDiscountModalOpen(true)} className="flex items-center text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline"><Percent className="w-3 h-3 mr-1" /> Agregar Descuento</button>
                                {globalDiscount.value > 0 && <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">{globalDiscount.value}% OFF</span>}
                            </div>
                            <div className="space-y-1.5 mb-4 text-sm">
                                <div className="flex justify-between text-slate-500 dark:text-slate-400"><span>Subtotal</span><span>${displayTotals.subtotal.toFixed(2)}</span></div>
                                {displayTotals.totalDiscount > 0 && <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-medium"><span>Descuentos</span><span>-${displayTotals.totalDiscount.toFixed(2)}</span></div>}
                                <div className="flex justify-between text-slate-500 dark:text-slate-400"><span>IVA</span><span>${displayTotals.totalIva.toFixed(2)}</span></div>
                                {displayTotals.retIva > 0 && <div className="flex justify-between text-slate-500 dark:text-slate-400"><span>Ret. IVA</span><span>-${displayTotals.retIva.toFixed(2)}</span></div>}
                                {displayTotals.retIsr > 0 && <div className="flex justify-between text-slate-500 dark:text-slate-400"><span>Ret. ISR</span><span>-${displayTotals.retIsr.toFixed(2)}</span></div>}
                                <div className="flex justify-between items-end pt-2 border-t border-slate-200 dark:border-slate-700 mt-2">
                                    <span className="text-lg font-bold text-slate-900 dark:text-white">Total</span>
                                    <span className="text-2xl font-bold text-slate-900 dark:text-white">${displayTotals.total.toFixed(2)}</span>
                                </div>
                            </div>
                             <div className="mb-4">
                                <p className="text-[10px] font-bold uppercase text-slate-400 mb-2 tracking-wider">Método de Pago</p>
                                <div className="grid grid-cols-4 gap-2">
                                    {[{id: 'Efectivo', icon: Banknote}, {id: 'Tarjeta', icon: CreditCard}, {id: 'Transferencia', icon: Wallet}, {id: 'Crédito', icon: Receipt}].map((m: any) => (
                                        <button key={m.id} onClick={() => setPaymentMethod(m.id)} disabled={m.id === 'Crédito' && !selectedClient} className={`flex flex-col items-center justify-center py-2 rounded-lg transition-all disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed ${paymentMethod === m.id ? 'bg-slate-800 dark:bg-indigo-600 text-white shadow-md' : 'bg-white dark:bg-slate-700 border dark:border-slate-600 text-slate-500 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600'}`}>
                                            <m.icon className="w-4 h-4 mb-1" /><span className="text-[10px] font-bold">{m.id.substring(0,4)}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                            
                            {paymentMethod === 'Efectivo' && (
                                <div className="grid grid-cols-2 gap-2 mt-2 mb-4 animate-in fade-in">
                                    <div>
                                        <label className="text-xs text-slate-500 dark:text-slate-400">Monto Recibido</label>
                                        <input type="number" value={amountReceived} onChange={e => setAmountReceived(e.target.value)} className="w-full border dark:border-slate-600 rounded-md p-2 bg-white dark:bg-slate-700 dark:text-white outline-none" placeholder="0.00" />
                                    </div>
                                    <div className="text-right">
                                        <label className="text-xs text-slate-500 dark:text-slate-400">Cambio a Devolver</label>
                                        <p className="font-bold text-lg text-emerald-600 dark:text-emerald-400">${(parseFloat(amountReceived || '0') - displayTotals.total > 0) ? (parseFloat(amountReceived) - displayTotals.total).toFixed(2) : '0.00'}</p>
                                    </div>
                                </div>
                            )}

                            {(paymentMethod === 'Tarjeta' || paymentMethod === 'Transferencia') && (
                                <div className="mt-2 mb-4 animate-in fade-in">
                                    <label className="text-xs text-slate-500 dark:text-slate-400">Referencia de Pago</label>
                                    <input type="text" value={paymentReference} onChange={e => setPaymentReference(e.target.value)} className="w-full border dark:border-slate-600 rounded-md p-2 bg-white dark:bg-slate-700 dark:text-white outline-none" placeholder="Últimos 4 dígitos, auth, etc." />
                                </div>
                            )}
                            
                            {paymentMethod === 'Crédito' && selectedClient && (
                                <div className={`p-3 rounded-lg border text-center mb-4 animate-in fade-in ${displayTotals.total > availableCredit ? 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800' : 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-800'}`}>
                                    <p className={`text-xs font-bold uppercase ${displayTotals.total > availableCredit ? 'text-red-700 dark:text-red-400' : 'text-emerald-700 dark:text-emerald-400'}`}>Crédito Disponible: ${availableCredit.toFixed(2)}</p>
                                    {displayTotals.total > availableCredit && <p className="text-xs text-red-600 dark:text-red-400 mt-1">El total excede el límite de crédito.</p>}
                                </div>
                            )}

                            <button onClick={handleCheckout} disabled={cart.length === 0 || (paymentMethod === 'Crédito' && (!selectedClient || displayTotals.total > availableCredit))} className="w-full bg-indigo-600 text-white py-3.5 rounded-xl font-bold text-lg hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:bg-slate-400 dark:disabled:bg-slate-700 flex items-center justify-center shadow-lg shadow-indigo-200 dark:shadow-none">
                                <CheckCircle className="w-5 h-5 mr-2" /> Cobrar ${displayTotals.total.toFixed(2)}
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden h-full flex flex-col">
                     <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex justify-between items-center">
                        <div className="flex gap-4">
                             <button onClick={() => setIsCashReconciliationOpen(true)} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold flex items-center shadow-sm hover:bg-indigo-700 transition-colors">
                                <Calculator className="w-4 h-4 mr-2" /> Realizar Corte de Caja
                            </button>
                        </div>
                        <div className="flex gap-2">
                            <input type="date" value={historyDateFilter} onChange={(e) => setHistoryDateFilter(e.target.value)} className="px-2 py-1.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-700 dark:text-white outline-none" />
                            <button onClick={generateHistoryPDF} className="p-1.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-500 dark:text-slate-300 transition-colors"><Download className="w-4 h-4" /></button>
                        </div>
                    </div>
                    <div className="flex-1 overflow-auto">
                        <table className="w-full">
                           <thead className="bg-white dark:bg-slate-900 border-b dark:border-slate-700 sticky top-0 z-10">
                               <tr>
                                   <th className="p-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Folio</th>
                                   <th className="p-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Fecha</th>
                                   <th className="p-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Cliente</th>
                                   <th className="p-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Total</th>
                                   <th className="p-3 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Acciones</th>
                               </tr>
                           </thead>
                            <tbody>
                               {filteredHistory.map((sale: Sale) => (
                                    <tr key={sale.id} className="border-b dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="p-3 text-sm font-mono text-slate-600 dark:text-slate-300">{sale.id}</td>
                                        <td className="p-3 text-sm text-slate-700 dark:text-slate-300">{new Date(sale.date).toLocaleString()}</td>
                                        <td className="p-3 text-sm font-medium text-slate-900 dark:text-white">{sale.client}</td>
                                        <td className="p-3 text-right text-sm font-bold text-slate-900 dark:text-white">${sale.total.toFixed(2)}</td>
                                        <td className="p-3 text-right text-sm"><button onClick={() => { setIsTicketOpen(true); setLastSaleData(sale); setCart(sale.products || []); setLastInvoiceUuid(sale.invoiceUuid); }} className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium text-xs hover:underline">Ver Ticket</button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
             <TicketModal 
                isOpen={isTicketOpen} 
                onClose={() => { 
                    setIsTicketOpen(false); 
                    if (activeMode === 'pos') { 
                        setCart([]); 
                        setPaymentReference(''); 
                        setRequireInvoice(false); 
                        setSelectedClientId(''); 
                        setClientSearchTerm('');
                        setGlobalDiscount({ type: 'percent', value: 0 }); 
                        setAmountReceived(''); 
                    } 
                    setLastInvoiceUuid(undefined); 
                }} 
                saleData={lastSaleData || {}} 
                     cart={lastSaleData?.products || []} 
                     totals={displayTotals} 
                client={(clients || []).find((c: Client) => c.id === lastSaleData?.clientId)} 
                invoiceUuid={lastInvoiceUuid} 
             />
             <CashReconciliationModal isOpen={isCashReconciliationOpen} onClose={() => setIsCashReconciliationOpen(false)} salesData={todaySales} branch={selectedBranch} />
             <DiscountModal isOpen={isDiscountModalOpen} onClose={() => setIsDiscountModalOpen(false)} onApply={(val) => setGlobalDiscount({ type: 'percent', value: val })} />
             <AddClientModal isOpen={isAddClientOpen} onClose={() => setIsAddClientOpen(false)} onSave={handleAddClient} />
        </div>
    );
};
