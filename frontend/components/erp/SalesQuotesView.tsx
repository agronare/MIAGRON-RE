import React, { useMemo, useState } from 'react';
import { Client, Product, InventoryItem } from '../../types';
import { Search, FileDown, Percent, CheckCircle, XCircle, Send, ChevronDown, User } from 'lucide-react';
import jsPDF from 'jspdf';

// Número de WhatsApp del encargado de aprobar cotizaciones
const WHATSAPP_APPROVAL_NUMBER = '524432270901'; // Formato: código país + número
const APP_URL = 'https://potential-system-v679776jvq49f6qqq-3000.app.github.dev';

// Función para enviar notificación por WhatsApp
const sendWhatsAppNotification = (clientName: string, total: number, itemCount: number) => {
    const quoteNo = `COT-V-${Date.now().toString().slice(-6)}`;
    const date = new Date();
    const formattedDate = date.toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const formattedTime = date.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
    
    const message = 
`━━━━━━━━━━━━━━━━━━━━━━
🛒 *AGRONARE - Sistema ERP*
━━━━━━━━━━━━━━━━━━━━━━

📋 *SOLICITUD DE APROBACIÓN*
_Cotización de Venta_

▸ *Folio:* ${quoteNo}
▸ *Cliente:* ${clientName}
▸ *Productos:* ${itemCount} artículo(s)
▸ *Monto Total:* $${total.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
▸ *Fecha:* ${formattedDate}
▸ *Hora:* ${formattedTime}

━━━━━━━━━━━━━━━━━━━━━━

✅ *Acciones requeridas:*
• Revisar detalles de la cotización
• Verificar disponibilidad de stock
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

interface SalesQuotesViewProps {
  clients: Client[];
  products: Product[];
  inventory: InventoryItem[];
}

type Row = {
  id: string;
  name: string;
  sku: string;
  qty: number;
  price: number;
  discount: number; // %
  ivaRate?: number; // e.g. 0.16
};

export const SalesQuotesView: React.FC<SalesQuotesViewProps> = ({ clients = [], products = [], inventory = [] }) => {
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [isClientDropdownOpen, setIsClientDropdownOpen] = useState(false);
  const [clientSearchTerm, setClientSearchTerm] = useState('');
  const [rows, setRows] = useState<Row[]>([]);
  const [search, setSearch] = useState('');

  const clientSummary = useMemo(() => {
    const c = clients.find(cl => cl.id === selectedClientId);
    if (!c) return { name: '', creditLimit: 0, pending: 0 };
    return { name: c.name, creditLimit: c.creditLimit || 0, pending: c.currentDebt || 0 };
  }, [clients, selectedClientId]);

  const selectedClient = clients.find(c => c.id === selectedClientId);

  const filteredClients = useMemo(() => {
    return clients.filter(c => 
      c.name.toLowerCase().includes(clientSearchTerm.toLowerCase()) ||
      (c.contactName && c.contactName.toLowerCase().includes(clientSearchTerm.toLowerCase()))
    );
  }, [clients, clientSearchTerm]);

  const productMatches = useMemo(() => {
    const s = search.toLowerCase();
    return products.filter(p => p.name.toLowerCase().includes(s) || p.sku.toLowerCase().includes(s)).slice(0, 10);
  }, [products, search]);

  const stockBySku = useMemo(() => {
    const map = new Map<string, number>();
    inventory.forEach(i => {
      map.set(i.sku, (map.get(i.sku) || 0) + i.quantity);
    });
    return map;
  }, [inventory]);

  const totals = useMemo(() => {
    let subtotal = 0;
    let taxes = 0;
    rows.forEach(r => {
      const lineBase = r.qty * r.price * (1 - (r.discount || 0) / 100);
      subtotal += lineBase;
      const iva = (r.ivaRate ?? 0) * lineBase;
      taxes += iva;
    });
    const total = subtotal + taxes;
    return { subtotal, taxes, total };
  }, [rows]);

  const addProduct = (p: Product) => {
    setRows(prev => [
      ...prev,
      {
        id: p.id,
        name: p.name,
        sku: p.sku,
        qty: 1,
        price: p.price,
        discount: 0,
        ivaRate: p.ivaRate ?? 0.16,
      },
    ]);
  };

  const updateRow = (idx: number, patch: Partial<Row>) => {
    setRows(prev => prev.map((r, i) => (i === idx ? { ...r, ...patch } : r)));
  };

  const removeRow = (idx: number) => {
    setRows(prev => prev.filter((_, i) => i !== idx));
  };

  const generatePDF = () => {
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });

    // Header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('AGRONARE', 40, 50);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(['Agronare S.A. de C.V.', 'RFC: DEMO000000', 'Copándaro de Galeana, Mich.'], 380, 40);

    doc.setLineWidth(0.5);
    doc.line(40, 70, 555, 70);

    // Quote info
    doc.setFontSize(12);
    doc.text(`Cotización para: ${clientSummary.name || 'Cliente'}`, 40, 95);
    doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 40, 115);

    // Table header (minimalist, no vertical borders)
    const startY = 140;
    const colX = [40, 270, 340, 400, 460, 520];
    doc.setFont('helvetica', 'bold');
    doc.text('Producto', colX[0], startY);
    doc.text('SKU', colX[1], startY);
    doc.text('Cant.', colX[2], startY);
    doc.text('Precio', colX[3], startY);
    doc.text('%Desc', colX[4], startY);
    doc.text('IVA', colX[5], startY);
    doc.line(40, startY + 6, 555, startY + 6);

    // Rows with zebra striping
    doc.setFont('helvetica', 'normal');
    let y = startY + 24;
    rows.forEach((r, idx) => {
      if (idx % 2 === 1) {
        doc.setFillColor(245, 247, 250);
        doc.rect(40, y - 12, 515, 20, 'F');
      }
      const ivaPct = Math.round((r.ivaRate ?? 0) * 100);
      const name = String(r.name || '');
      const sku = String(r.sku || '');
      const qty = String(r.qty ?? 0);
      const price = `$${(r.price ?? 0).toFixed(2)}`;
      const discount = `${(r.discount ?? 0).toFixed(0)}%`;
      const iva = `${ivaPct}%`;
      
      doc.text(name, colX[0], y);
      doc.text(sku, colX[1], y);
      doc.text(qty, colX[2], y, { align: 'right' });
      doc.text(price, colX[3], y, { align: 'right' });
      doc.text(discount, colX[4], y, { align: 'right' });
      doc.text(iva, colX[5], y, { align: 'right' });
      y += 22;
    });

    // Totals box
    doc.line(380, y + 6, 555, y + 6);
    doc.setFont('helvetica', 'bold');
    doc.text('Subtotal:', 400, y + 22);
    doc.text('IVA:', 400, y + 40);
    doc.text('Total:', 400, y + 58);
    doc.setFont('helvetica', 'normal');
    const subtotalStr = `$${(totals?.subtotal ?? 0).toFixed(2)}`;
    const taxesStr = `$${(totals?.taxes ?? 0).toFixed(2)}`;
    const totalStr = `$${(totals?.total ?? 0).toFixed(2)}`;
    doc.text(subtotalStr, 555, y + 22, { align: 'right' });
    doc.text(taxesStr, 555, y + 40, { align: 'right' });
    doc.setFont('helvetica', 'bold');
    doc.text(totalStr, 555, y + 58, { align: 'right' });

    // Bank details & QR placeholder
    doc.setFont('helvetica', 'bold');
    doc.text('Datos Bancarios (BBVA)', 40, y + 90);
    doc.setFont('helvetica', 'normal');
    const bankDetails = ['Cuenta: 0123456789', 'CLABE: 012345678901234567', 'Titular: Agronare S.A. de C.V.'];
    doc.text(bankDetails, 40, y + 108);
    doc.rect(450, y + 88, 105, 105); // QR placeholder
    doc.text('QR Validación', 470, y + 140);

    // Terms
    doc.setFont('helvetica', 'bold');
    doc.text('Términos y Condiciones', 40, y + 210);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(
      'Precios sujetos a cambio sin previo aviso. Validez de cotización 7 días. Entrega sujeta a disponibilidad de stock. Pago contra factura.',
      40,
      y + 226,
      { maxWidth: 515 }
    );

    doc.save(`cotizacion_venta_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  // Función para guardar y enviar notificación por WhatsApp
  const handleSaveAndNotify = () => {
    if (!selectedClientId) {
      alert('Por favor selecciona un cliente.');
      return;
    }
    if (rows.length === 0) {
      alert('Agrega al menos un producto a la cotización.');
      return;
    }

    // Generar PDF
    generatePDF();

    // Enviar notificación por WhatsApp
    if (window.confirm('¿Deseas enviar notificación por WhatsApp al encargado de aprobaciones?')) {
      sendWhatsAppNotification(
        clientSummary.name || 'Cliente',
        totals.total,
        rows.length
      );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div>
          <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded mb-1 inline-block">Cotización Venta</span>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Nueva Cotización de Venta</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Genera cotizaciones para clientes con precios y disponibilidad</p>
        </div>
        <div className="flex gap-2">
          <button onClick={generatePDF} className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center transition-colors"><FileDown className="w-4 h-4 mr-2"/> Exportar PDF</button>
          <button onClick={handleSaveAndNotify} className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 flex items-center shadow-sm transition-colors"><Send className="w-4 h-4 mr-2"/> Guardar y Notificar</button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <User className="w-4 h-4" /> Cliente
              <span className="text-xs text-slate-400">({clients.length} disponibles)</span>
            </label>
          </div>
          <div className="relative">
            <button 
              onClick={() => setIsClientDropdownOpen(!isClientDropdownOpen)} 
              className="w-full text-left p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 flex justify-between items-center hover:border-indigo-400 transition-colors"
            >
              <span className="font-medium text-slate-700 dark:text-slate-200">
                {selectedClient ? selectedClient.name : 'Seleccionar cliente...'}
              </span>
              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isClientDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            {isClientDropdownOpen && (
              <div className="absolute top-full mt-1 w-full bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-xl z-20 p-2">
                <input 
                  type="text" 
                  placeholder="Buscar cliente..." 
                  value={clientSearchTerm} 
                  onChange={e => setClientSearchTerm(e.target.value)}
                  className="w-full p-2 border-b border-slate-200 dark:border-slate-700 mb-1 bg-transparent text-slate-900 dark:text-white outline-none text-sm"
                  autoFocus
                />
                <ul className="max-h-48 overflow-y-auto">
                  <li 
                    onClick={() => { setSelectedClientId(''); setIsClientDropdownOpen(false); setClientSearchTerm(''); }} 
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer text-sm text-slate-500 dark:text-slate-400 rounded"
                  >
                    Sin cliente seleccionado
                  </li>
                  {filteredClients.length === 0 ? (
                    <li className="p-3 text-center text-sm text-slate-400">
                      No se encontraron clientes
                    </li>
                  ) : (
                    filteredClients.map(c => (
                      <li 
                        key={c.id} 
                        onClick={() => { setSelectedClientId(c.id); setIsClientDropdownOpen(false); setClientSearchTerm(''); }} 
                        className="p-2 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 cursor-pointer text-sm text-slate-700 dark:text-slate-300 rounded border-b border-slate-100 dark:border-slate-700/50 last:border-0"
                      >
                        <p className="font-medium">{c.name}</p>
                        {c.contactName && <p className="text-xs text-slate-500 dark:text-slate-400">Contacto: {c.contactName}</p>}
                        {c.creditLimit > 0 && (
                          <p className="text-xs text-emerald-600 dark:text-emerald-400">
                            Crédito Disp: ${(c.creditLimit - (c.currentDebt || 0)).toLocaleString()}
                          </p>
                        )}
                      </li>
                    ))
                  )}
                </ul>
              </div>
            )}
          </div>
        </div>
        <div className="md:col-span-2">
          <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3 border border-slate-200 dark:border-slate-700 h-full flex flex-col justify-center">
            <p className="text-sm text-slate-700 dark:text-slate-300"><span className="font-bold">Límite de Crédito:</span> ${clientSummary.creditLimit.toLocaleString()}</p>
            <p className="text-sm text-slate-700 dark:text-slate-300"><span className="font-bold">Saldo Pendiente:</span> ${clientSummary.pending.toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="card p-4">
        <div className="flex gap-3 items-center mb-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input className="w-full pl-9 pr-3 py-2 border rounded" placeholder="Buscar producto o SKU..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <button className="button button-secondary text-sm" onClick={() => setRows([])}>Limpiar</button>
        </div>

        {productMatches.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 mb-4">
            {productMatches.map(p => (
              <button key={p.id} onClick={() => addProduct(p)} className="text-left p-3 rounded border hover:bg-slate-50">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{p.name}</span>
                  <span className="text-xs text-slate-500">{p.sku}</span>
                </div>
                <div className="text-xs text-slate-500">${p.price.toFixed(2)}</div>
              </button>
            ))}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="p-2 text-left text-xs font-semibold text-slate-500">Producto</th>
                <th className="p-2 text-left text-xs font-semibold text-slate-500">SKU</th>
                <th className="p-2 text-center text-xs font-semibold text-slate-500">Stock</th>
                <th className="p-2 text-center text-xs font-semibold text-slate-500">Cant.</th>
                <th className="p-2 text-right text-xs font-semibold text-slate-500">Precio</th>
                <th className="p-2 text-right text-xs font-semibold text-slate-500"><Percent className="w-3 h-3 inline"/> Desc</th>
                <th className="p-2 text-center text-xs font-semibold text-slate-500">IVA</th>
                <th className="p-2 text-right text-xs font-semibold text-slate-500">Total</th>
                <th className="p-2 text-right text-xs font-semibold text-slate-500">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {rows.map((r, idx) => {
                const stock = stockBySku.get(r.sku) || 0;
                const lineBase = r.qty * r.price * (1 - (r.discount || 0) / 100);
                const iva = (r.ivaRate ?? 0) * lineBase;
                const lineTotal = lineBase + iva;
                const inStock = stock > 0;
                return (
                  <tr key={`${r.sku}-${idx}`}>
                    <td className="p-2">{r.name}</td>
                    <td className="p-2 text-xs text-slate-600">{r.sku}</td>
                    <td className="p-2 text-center">{inStock ? <CheckCircle className="w-4 h-4 text-emerald-500 mx-auto"/> : <XCircle className="w-4 h-4 text-red-500 mx-auto"/>}</td>
                    <td className="p-2 text-center"><input type="number" className="w-20 text-center border rounded" value={r.qty} onChange={e => updateRow(idx, { qty: Number(e.target.value) })} /></td>
                    <td className="p-2 text-right">${r.price.toFixed(2)}</td>
                    <td className="p-2 text-right"><input type="number" className="w-16 text-right border rounded" value={r.discount} onChange={e => updateRow(idx, { discount: Number(e.target.value) })} /></td>
                    <td className="p-2 text-center">{Math.round((r.ivaRate ?? 0) * 100)}%</td>
                    <td className="p-2 text-right font-bold">${lineTotal.toFixed(2)}</td>
                    <td className="p-2 text-right"><button className="text-red-600 text-sm" onClick={() => removeRow(idx)}>Quitar</button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end mt-4">
          <div className="bg-slate-50 rounded p-3 border text-sm min-w-[280px]">
            <div className="flex justify-between"><span>Subtotal</span><span className="font-bold">${totals.subtotal.toFixed(2)}</span></div>
            <div className="flex justify-between"><span>Impuestos</span><span className="font-bold">${totals.taxes.toFixed(2)}</span></div>
            <div className="flex justify-between border-t mt-2 pt-2"><span>Total</span><span className="font-bold">${totals.total.toFixed(2)}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
};
