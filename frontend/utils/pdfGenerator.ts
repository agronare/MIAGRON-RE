import jsPDF from 'jspdf';
import 'jspdf-autotable';

// ────────────────────────────────────────────────────────────────────────────
// INTERFACES
// ────────────────────────────────────────────────────────────────────────────

interface VentaItem {
  sku: string;
  nombre: string;
  cantidad: number;
  precioUnitario: number;
  descuento?: number;
  subtotal: number;
  impuestoMonto: number;
  total: number;
}

interface Venta {
  folio: string;
  fecha: string | Date;
  clienteNombre: string;
  clienteRfc?: string;
  sucursal: string;
  subtotal: number;
  impuestos: number;
  retencionIva?: number;
  retencionIsr?: number;
  descuentoTotal: number;
  total: number;
  metodoPago: string;
  referenciaPago?: string;
  montoRecibido?: number;
  cambioDevuelto?: number;
  items: VentaItem[];
}

// ────────────────────────────────────────────────────────────────────────────
// GENERACIÓN DE TICKET TÉRMICO (80mm x variable)
// ────────────────────────────────────────────────────────────────────────────

export async function generateTicketPDFBase64(venta: Venta): Promise<string> {
  // Crear documento en formato ticket térmico (80mm de ancho)
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [80, 200] // 80mm ancho, altura variable
  });

  let yPos = 10;

  // ───── Encabezado ─────
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('AGRONARE', 40, yPos, { align: 'center' });
  yPos += 6;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('S.A. DE C.V.', 40, yPos, { align: 'center' });
  yPos += 5;

  doc.setFontSize(8);
  doc.text('RFC: AGR010101ABC', 40, yPos, { align: 'center' });
  yPos += 4;
  doc.text('Reg. Fiscal: 601', 40, yPos, { align: 'center' });
  yPos += 8;

  // ───── Línea separadora ─────
  doc.setLineWidth(0.3);
  doc.line(5, yPos, 75, yPos);
  yPos += 6;

  // ───── Información de la venta ─────
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(`TICKET: ${venta.folio}`, 5, yPos);
  yPos += 5;

  doc.setFont('helvetica', 'normal');
  const fechaFormateada = new Date(venta.fecha).toLocaleString('es-MX', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
  doc.text(`Fecha: ${fechaFormateada}`, 5, yPos);
  yPos += 4;

  doc.text(`Sucursal: ${venta.sucursal}`, 5, yPos);
  yPos += 4;

  doc.text(`Cliente: ${venta.clienteNombre}`, 5, yPos);
  yPos += 4;

  if (venta.clienteRfc) {
    doc.text(`RFC: ${venta.clienteRfc}`, 5, yPos);
    yPos += 4;
  }

  yPos += 4;

  // ───── Línea separadora ─────
  doc.line(5, yPos, 75, yPos);
  yPos += 6;

  // ───── Items ─────
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('PRODUCTO', 5, yPos);
  doc.text('CANT', 50, yPos);
  doc.text('TOTAL', 70, yPos, { align: 'right' });
  yPos += 1;
  doc.line(5, yPos, 75, yPos);
  yPos += 4;

  doc.setFont('helvetica', 'normal');

  venta.items.forEach(item => {
    // Nombre del producto (puede ocupar 2 líneas si es muy largo)
    const nombreLineas = doc.splitTextToSize(item.nombre, 42);
    doc.text(nombreLineas, 5, yPos);

    const alturaLineas = nombreLineas.length * 3.5;

    // Cantidad y total alineados a la primera línea del producto
    doc.text(item.cantidad.toString(), 50, yPos);
    doc.text(`$${item.total.toFixed(2)}`, 75, yPos, { align: 'right' });

    yPos += Math.max(alturaLineas, 4);

    // Precio unitario y descuento (si aplica)
    doc.setFontSize(7);
    doc.setTextColor(100);
    doc.text(`  $${item.precioUnitario.toFixed(2)} c/u`, 5, yPos);
    if (item.descuento && item.descuento > 0) {
      doc.text(`(${item.descuento}% desc)`, 30, yPos);
    }
    yPos += 4;
    doc.setFontSize(8);
    doc.setTextColor(0);
  });

  yPos += 2;

  // ───── Línea separadora ─────
  doc.line(5, yPos, 75, yPos);
  yPos += 5;

  // ───── Totales ─────
  doc.setFont('helvetica', 'normal');

  doc.text('Subtotal:', 40, yPos);
  doc.text(`$${venta.subtotal.toFixed(2)}`, 75, yPos, { align: 'right' });
  yPos += 4;

  if (venta.descuentoTotal > 0) {
    doc.text('Descuento:', 40, yPos);
    doc.text(`-$${venta.descuentoTotal.toFixed(2)}`, 75, yPos, { align: 'right' });
    yPos += 4;
  }

  doc.text('IVA:', 40, yPos);
  doc.text(`$${venta.impuestos.toFixed(2)}`, 75, yPos, { align: 'right' });
  yPos += 4;

  if (venta.retencionIva && venta.retencionIva > 0) {
    doc.text('Ret. IVA:', 40, yPos);
    doc.text(`-$${venta.retencionIva.toFixed(2)}`, 75, yPos, { align: 'right' });
    yPos += 4;
  }
  if (venta.retencionIsr && venta.retencionIsr > 0) {
    doc.text('Ret. ISR:', 40, yPos);
    doc.text(`-$${venta.retencionIsr.toFixed(2)}`, 75, yPos, { align: 'right' });
    yPos += 4;
  }
  yPos += 2;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('TOTAL:', 40, yPos);
  doc.text(`$${venta.total.toFixed(2)}`, 75, yPos, { align: 'right' });
  yPos += 7;

  // ───── Información de pago ─────
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(`Método de pago: ${venta.metodoPago}`, 5, yPos);
  yPos += 4;

  if (venta.referenciaPago) {
    doc.text(`Referencia: ${venta.referenciaPago}`, 5, yPos);
    yPos += 4;
  }

  if (venta.montoRecibido && venta.metodoPago === 'Efectivo') {
    doc.text(`Recibido: $${venta.montoRecibido.toFixed(2)}`, 5, yPos);
    yPos += 4;
    if (venta.cambioDevuelto) {
      doc.text(`Cambio: $${venta.cambioDevuelto.toFixed(2)}`, 5, yPos);
      yPos += 4;
    }
  }

  yPos += 4;

  // ───── Línea separadora ─────
  doc.line(5, yPos, 75, yPos);
  yPos += 6;

  // ───── Pie de página ─────
  doc.setFontSize(7);
  doc.setFont('helvetica', 'italic');
  doc.text('Gracias por su compra', 40, yPos, { align: 'center' });
  yPos += 4;
  doc.text('¡Vuelva pronto!', 40, yPos, { align: 'center' });
  yPos += 6;
  doc.setFontSize(6);
  doc.text('Este documento no es un comprobante fiscal', 40, yPos, { align: 'center' });
  yPos += 3;
  doc.text('Para factura fiscal, solicite su CFDI', 40, yPos, { align: 'center' });

  // Convertir a base64
  const pdfBlob = doc.output('blob');
  const base64 = await blobToBase64(pdfBlob);
  return base64;
}

// ────────────────────────────────────────────────────────────────────────────
// GENERACIÓN DE FACTURA FISCAL A4 (para visualización)
// ────────────────────────────────────────────────────────────────────────────

export async function generateInvoicePDF(venta: Venta): Promise<Blob> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  let yPos = 20;

  // ───── Encabezado empresa ─────
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('AGRONARE S.A. DE C.V.', 20, yPos);
  yPos += 8;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('RFC: AGR010101ABC', 20, yPos);
  yPos += 5;
  doc.text('Régimen Fiscal: 601 - General de Ley Personas Morales', 20, yPos);
  yPos += 10;

  // ───── Información de la factura ─────
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('FACTURA', 150, 20);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Folio: ${venta.folio}`, 150, 28);
  doc.text(`Fecha: ${new Date(venta.fecha).toLocaleDateString('es-MX')}`, 150, 34);

  // ───── Datos del cliente ─────
  yPos += 5;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('DATOS DEL RECEPTOR', 20, yPos);
  yPos += 6;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Nombre: ${venta.clienteNombre}`, 20, yPos);
  yPos += 5;
  if (venta.clienteRfc) {
    doc.text(`RFC: ${venta.clienteRfc}`, 20, yPos);
    yPos += 5;
  }

  yPos += 10;

  // ───── Tabla de items ─────
  const tableData = venta.items.map(item => [
    item.sku,
    item.nombre,
    item.cantidad.toString(),
    `$${item.precioUnitario.toFixed(2)}`,
    item.descuento ? `${item.descuento}%` : '-',
    `$${item.total.toFixed(2)}`
  ]);

  (doc as any).autoTable({
    startY: yPos,
    head: [['SKU', 'Descripción', 'Cantidad', 'Precio Unit.', 'Desc.', 'Total']],
    body: tableData,
    theme: 'striped',
    headStyles: { fillColor: [46, 125, 50] },
    styles: { fontSize: 9 },
    columnStyles: {
      0: { cellWidth: 25 },
      1: { cellWidth: 70 },
      2: { cellWidth: 20 },
      3: { cellWidth: 25 },
      4: { cellWidth: 15 },
      5: { cellWidth: 25 }
    }
  });

  yPos = (doc as any).lastAutoTable.finalY + 10;

  // ───── Totales ─────
  const xTotales = 130;
  doc.setFontSize(10);

  doc.text('Subtotal:', xTotales, yPos);
  doc.text(`$${venta.subtotal.toFixed(2)}`, 185, yPos, { align: 'right' });
  yPos += 6;

  if (venta.descuentoTotal > 0) {
    doc.text('Descuento:', xTotales, yPos);
    doc.text(`-$${venta.descuentoTotal.toFixed(2)}`, 185, yPos, { align: 'right' });
    yPos += 6;
  }

  doc.text('IVA:', xTotales, yPos);
  doc.text(`$${venta.impuestos.toFixed(2)}`, 185, yPos, { align: 'right' });
  yPos += 8;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('TOTAL:', xTotales, yPos);
  doc.text(`$${venta.total.toFixed(2)}`, 185, yPos, { align: 'right' });

  // ───── Pie de página ─────
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.text('Este documento es una representación impresa de un CFDI', 105, 270, { align: 'center' });

  return doc.output('blob');
}

// ────────────────────────────────────────────────────────────────────────────
// UTILIDADES
// ────────────────────────────────────────────────────────────────────────────

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to convert blob to base64'));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export function downloadPDF(blob: Blob, filename: string): void {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}
