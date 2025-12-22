
import React, { useRef, useEffect, useState } from 'react';
import { X, Receipt, Download, Printer, FileText } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { CartItem, Client, Sale } from '../../types';
import agronareLogo from '../../logoagronarelocal.png';

interface TicketModalProps {
    isOpen: boolean;
    onClose: () => void;
    saleData: Partial<Sale>;
    cart: CartItem[];
    totals: any; // Can be recalculated if needed
    client: Client | undefined;
    invoiceUuid?: string;
}

export const TicketModal: React.FC<TicketModalProps> = ({ isOpen, onClose, saleData, cart, totals, client, invoiceUuid }) => {
    const ticketRef = useRef<HTMLDivElement>(null);
    const [logoDataUrl, setLogoDataUrl] = useState<string | null>(null);
    const [uiLogoSrc, setUiLogoSrc] = useState<string | null>(null);

    // Pre-cargar logo como DataURL para uso en PDF
    useEffect(() => {
        if (!isOpen) return; // No cargar logo si el modal está cerrado
        const loadLogo = async () => {
            const publicPath = '/logoagronarelocal.png';
            try {
                // Intentar primero el logo desde /public
                const res = await fetch(publicPath);
                if (res.ok) {
                    const blob = await res.blob();
                    setUiLogoSrc(publicPath);
                    const reader = new FileReader();
                    reader.onload = () => setLogoDataUrl(reader.result as string);
                    reader.readAsDataURL(blob);
                    return;
                }
                throw new Error('Logo en /public no disponible');
            } catch {
                // Fallback: asset importado por Vite
                setUiLogoSrc(agronareLogo as unknown as string);
                try {
                    const res2 = await fetch(agronareLogo as unknown as string);
                    if (res2.ok) {
                        const blob2 = await res2.blob();
                        const reader2 = new FileReader();
                        reader2.onload = () => setLogoDataUrl(reader2.result as string);
                        reader2.readAsDataURL(blob2);
                    }
                } catch (e) {
                    console.warn('No se pudo cargar el logo de Agronare', e);
                }
            }
        };
        loadLogo();
    }, [isOpen]);

    // El return null debe estar DESPUÉS de todos los hooks para cumplir las reglas de React
    if (!isOpen) return null;

    const safeTotals = totals?.total > 0 ? totals : {
        subtotal: saleData.subtotal || 0,
        totalIva: saleData.taxes || 0,
        total: saleData.total || 0,
        totalDiscount: saleData.discountTotal || 0
    };
    
    const clientForTicket = client || { name: saleData.client || 'Público General', rfc: 'XAXX010101000' };

    const handlePrint = () => {
         if (ticketRef.current) {
            const content = ticketRef.current.innerHTML;
            const printWindow = window.open('', '', 'height=600,width=400');
            if (printWindow) {
                printWindow.document.write('<html><head><title>Ticket</title><style>body { font-family: monospace; font-size: 11px; margin: 0; padding: 10px; } .text-center { text-align: center; } .text-right { text-align: right; } .font-bold { font-weight: bold; } .flex { display: flex; } .justify-between { justify-content: space-between; } .border-b { border-bottom: 1px dashed #000; } .my-3 { margin-top: 10px; margin-bottom: 10px; } .mb-1 { margin-bottom: 4px; } .mb-2 { margin-bottom: 8px; } .mb-3 { margin-bottom: 12px; } .mt-1 { margin-top: 4px; } .mt-4 { margin-top: 16px; } .uppercase { text-transform: uppercase; } .text-xs { font-size: 10px; } .text-emerald-600 { color: #059669; } .text-red-600 { color: #dc2626; } </style></head><body>');
                printWindow.document.write(content);
                printWindow.document.write('</body></html>');
                printWindow.document.close();
                printWindow.focus();
                setTimeout(() => { printWindow.print(); printWindow.close(); }, 250);
            }
        }
    };
    
    const downloadTicketPDF = () => {
        const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: [80, 200] });

        // Logo centrado
        if (logoDataUrl) {
            try {
                doc.addImage(logoDataUrl, 'PNG', 29, 6, 22, 12); // centrado aprox en 80mm (x=40)
            } catch {}
        }

        const headerStartY = logoDataUrl ? 22 : 10;
        doc.setFontSize(12);
        doc.text('AGRONARE', 40, headerStartY, { align: 'center' });
        doc.setFontSize(8);
        doc.text('AGRONARE S.A. DE C.V.', 40, headerStartY + 5, { align: 'center' });
        doc.text(`Sucursal: ${saleData.branch || 'General'}`, 40, headerStartY + 10, { align: 'center' });
        doc.text(`RFC: AGR010101ABC`, 40, headerStartY + 15, { align: 'center' });

        doc.text('--------------------------------', 40, headerStartY + 20, { align: 'center' });

        doc.text(`Folio: ${saleData.id}`, 5, headerStartY + 25);
        doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 5, headerStartY + 30);
        doc.text(`Cliente: ${clientForTicket.name}`, 5, headerStartY + 35);

        doc.text('--------------------------------', 40, headerStartY + 40, { align: 'center' });

        let y = headerStartY + 45;
        (saleData.products || cart).forEach((item: any) => {
            doc.text(`${item.quantity} x ${item.name.substring(0, 15)}...`, 5, y);
            doc.text(`$${(item.quantity * (item.overridePrice ?? item.price)).toFixed(2)}`, 75, y, { align: 'right' });
            y += 5;
        });
        
        doc.text('--------------------------------', 40, y, { align: 'center' });
        y += 5;
        
        doc.text(`Subtotal:`, 40, y, { align: 'right' });
        doc.text(`$${safeTotals.subtotal.toFixed(2)}`, 75, y, { align: 'right' });
        y += 5;
        doc.text(`IVA:`, 40, y, { align: 'right' });
        doc.text(`$${safeTotals.totalIva.toFixed(2)}`, 75, y, { align: 'right' });
        y += 5;
        doc.setFontSize(10);
        doc.text(`TOTAL:`, 40, y, { align: 'right' });
        doc.text(`$${safeTotals.total.toFixed(2)}`, 75, y, { align: 'right' });
        
        doc.save(`Ticket_${saleData.id}.pdf`);
    };

    const downloadInvoicePDF = () => {
        const doc = new jsPDF();

        // Logo en encabezado (lado izquierdo)
        let headerStartY = 22;
        if (logoDataUrl) {
            try {
                doc.addImage(logoDataUrl, 'PNG', 14, 8, 30, 18);
                headerStartY = 34;
            } catch {}
        }

        // Header
        doc.setFontSize(20);
        doc.setTextColor(40, 40, 40);
        doc.text("FACTURA", 105, headerStartY, { align: 'center' });

        doc.setFontSize(10);
        doc.text(`Folio Fiscal: ${invoiceUuid || 'N/A'}`, 14, headerStartY + 8);
        doc.text(`Fecha de Emisión: ${new Date().toISOString()}`, 14, headerStartY + 13);

        // Emisor
        const emisorY = headerStartY + 25;
        doc.setFontSize(12);
        doc.text("AGRONARE S.A. DE C.V.", 14, emisorY);
        doc.setFontSize(10);
        doc.text("RFC: AGR010101ABC", 14, emisorY + 5);
        doc.text("Régimen Fiscal: 601 - General de Ley Personas Morales", 14, emisorY + 10);

        // Receptor
        doc.text("CLIENTE:", 120, emisorY);
        doc.text(clientForTicket.name, 120, emisorY + 5);
        doc.text(`RFC: ${clientForTicket.rfc}`, 120, emisorY + 10);
        doc.text("Uso CFDI: G03 - Gastos en general", 120, emisorY + 15);
        
        // Items
        const body = (saleData.products || cart).map((item: any) => [
            item.sku || 'GEN',
            item.quantity,
            item.unit || 'PZA',
            item.name,
            `$${(item.overridePrice ?? item.price).toFixed(2)}`,
            `$${(item.quantity * (item.overridePrice ?? item.price)).toFixed(2)}`
        ]);
        
        autoTable(doc, {
            startY: emisorY + 25,
            head: [['Clave', 'Cant', 'Unidad', 'Descripción', 'Precio U.', 'Importe']],
            body: body,
            theme: 'grid',
            headStyles: { fillColor: [63, 81, 181] }
        });
        
        // Totals
        const finalY = (doc as any).lastAutoTable.finalY + 10;
        doc.text(`Subtotal:`, 160, finalY, { align: 'right' });
        doc.text(`$${safeTotals.subtotal.toFixed(2)}`, 190, finalY, { align: 'right' });
        
        doc.text(`IVA (16%):`, 160, finalY + 7, { align: 'right' });
        doc.text(`$${safeTotals.totalIva.toFixed(2)}`, 190, finalY + 7, { align: 'right' });
        
        doc.setFontSize(12);
        doc.text(`TOTAL:`, 160, finalY + 15, { align: 'right' });
        doc.text(`$${safeTotals.total.toFixed(2)}`, 190, finalY + 15, { align: 'right' });
        
        doc.save(`Factura_${saleData.id}.pdf`);
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-md flex flex-col overflow-hidden animate-in zoom-in-95">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h3 className="font-bold text-slate-700 flex items-center"><Receipt className="w-4 h-4 mr-2" /> Ticket de Venta</h3>
                    <button onClick={onClose} className="p-1 hover:bg-slate-200 rounded-full"><X className="w-5 h-5 text-slate-400" /></button>
                </div>
                <div className="p-6 overflow-y-auto bg-slate-100/50 max-h-[70vh]">
                    <div ref={ticketRef} className="bg-white p-6 shadow-sm border border-slate-200 text-slate-900 font-mono text-xs leading-relaxed mx-auto max-w-[300px]">
                        <div className="text-center mb-4">
                            <img src={uiLogoSrc || (agronareLogo as unknown as string)} alt="Logo Agronare" className="w-12 h-12 object-contain mx-auto mb-2" />
                            <h2 className="font-bold text-sm uppercase tracking-widest text-slate-900">AGRONARE</h2>
                            <p className="font-bold mt-1">AGRONARE S.A. DE C.V.</p>
                            <p>{saleData.branch || 'SUC. Copandaro'}</p>
                            <p>RFC: AGR010101ABC</p>
                        </div>
                        <div className="border-b border-dashed border-slate-300 my-3"></div>
                        <div className="mb-3">
                            <p><span className="font-bold">Cliente:</span> {clientForTicket.name}</p>
                            <p><span className="font-bold">RFC:</span> {clientForTicket.rfc}</p>
                            <p><span className="font-bold">Fecha:</span> {saleData.date}</p>
                            <p><span className="font-bold">Folio:</span> {saleData.id}</p>
                            <p><span className="font-bold">Le Atendió:</span> Empleado Demo</p>
                        </div>
                        <div className="border-b border-dashed border-slate-300 my-3"></div>
                        
                        <div className="space-y-2">
                            {(saleData.products || cart).map((item: any, idx: number) => (
                                <div key={idx} className="border-b border-dashed border-slate-200 pb-2">
                                    <p className="font-bold uppercase">{item.name}</p>
                                    <div className="flex justify-between text-right">
                                        <span>{item.quantity} x @${(item.overridePrice ?? item.price).toFixed(2)}</span>
                                        <span>${(item.quantity * (item.overridePrice ?? item.price)).toFixed(2)}</span>
                                    </div>
                                    {item.discount > 0 && (
                                       <div className="flex justify-between text-right text-red-600">
                                          <span>Desc. ({item.discount}%)</span>
                                          <span>-${(item.quantity * (item.overridePrice ?? item.price) * (item.discount / 100)).toFixed(2)}</span>
                                       </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="border-b border-dashed border-slate-300 my-3"></div>
                        <div className="text-right space-y-1">
                            <p>Subtotal: ${safeTotals.subtotal.toFixed(2)}</p>
                            {safeTotals.totalDiscount > 0 && (
                                <p className="text-emerald-600 font-bold">Descuentos: -${safeTotals.totalDiscount.toFixed(2)}</p>
                            )}
                            <p>Impuestos (IVA): ${safeTotals.totalIva.toFixed(2)}</p>
                            <p className="text-sm font-bold border-t border-dashed border-slate-400 pt-1 mt-1">TOTAL: ${safeTotals.total.toFixed(2)}</p>
                            <div className="mt-2 text-[10px] text-left">
                               <p><span className="font-bold">Pago:</span> {saleData.method}</p>
                               {saleData.paymentReference && <p><span className="font-bold">Ref:</span> {saleData.paymentReference}</p>}
                               {saleData.method === 'Efectivo' && saleData.amountReceived && (
                                 <>
                                   <p><span className="font-bold">Recibido:</span> ${saleData.amountReceived.toFixed(2)}</p>
                                   <p><span className="font-bold">Cambio:</span> ${saleData.changeGiven?.toFixed(2)}</p>
                                 </>
                               )}
                            </div>
                        </div>
                        <div className="mt-6 text-center">
                            <p>¡Gracias por su compra!</p>
                            <img src="https://api.qrserver.com/v1/create-qr-code/?size=64x64&data=https://agronare.com" alt="QR Code" className="w-16 h-16 mx-auto mt-2" />
                        </div>
                    </div>
                </div>
                <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-between gap-3">
                    <div className="flex gap-2">
                        <button onClick={handlePrint} className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-100 flex items-center shadow-sm text-sm font-medium">
                            <Printer className="w-4 h-4 mr-2" /> Imprimir
                        </button>
                        <button onClick={downloadTicketPDF} className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-100 flex items-center shadow-sm text-sm font-medium">
                            <Download className="w-4 h-4 mr-2" /> PDF
                        </button>
                    </div>
                    {invoiceUuid && (
                        <button onClick={downloadInvoicePDF} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center shadow-sm text-sm font-medium">
                            <FileText className="w-4 h-4 mr-2" /> Factura PDF
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
