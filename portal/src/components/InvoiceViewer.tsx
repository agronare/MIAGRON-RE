import { useState } from 'react';
import { FileText, Calendar, MapPin, CheckCircle } from 'lucide-react';
import type { Venta } from '../types';
import DownloadButtons from './DownloadButtons';
import CFDIRequestForm from './CFDIRequestForm';

interface InvoiceViewerProps {
  invoice: Venta;
}

export default function InvoiceViewer({ invoice }: InvoiceViewerProps) {
  const [showCFDIForm, setShowCFDIForm] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-6 h-6" />
                <h2 className="text-2xl font-bold">Comprobante de Compra</h2>
              </div>
              <p className="text-emerald-100">Ticket: {invoice.folio}</p>
            </div>
            <div className="text-right">
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${
                invoice.estatus === 'Pagado'
                  ? 'bg-emerald-500 bg-opacity-30'
                  : 'bg-yellow-500 bg-opacity-30'
              }`}>
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm font-medium">{invoice.estatus}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Invoice Details */}
        <div className="p-6">
          {/* Info Grid */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-600" />
                Información General
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Fecha:</span>
                  <span className="font-medium text-slate-900">{formatDate(invoice.fecha)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Cliente:</span>
                  <span className="font-medium text-slate-900">{invoice.clienteNombre}</span>
                </div>
                {invoice.clienteRfc && (
                  <div className="flex justify-between">
                    <span className="text-slate-600">RFC:</span>
                    <span className="font-medium text-slate-900">{invoice.clienteRfc}</span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-600" />
                Detalles de Venta
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Sucursal:</span>
                  <span className="font-medium text-slate-900">{invoice.sucursal}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Método de pago:</span>
                  <span className="font-medium text-slate-900">{invoice.metodoPago}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="mb-6">
            <h3 className="font-semibold text-slate-900 mb-3">Productos</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-2 px-3 font-medium text-slate-700">Producto</th>
                    <th className="text-center py-2 px-3 font-medium text-slate-700">Cant.</th>
                    <th className="text-right py-2 px-3 font-medium text-slate-700">P. Unit.</th>
                    <th className="text-right py-2 px-3 font-medium text-slate-700">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items.map((item, index) => (
                    <tr key={index} className="border-b border-slate-100">
                      <td className="py-3 px-3">
                        <div>
                          <div className="font-medium text-slate-900">{item.nombre}</div>
                          <div className="text-xs text-slate-500">SKU: {item.sku}</div>
                        </div>
                      </td>
                      <td className="text-center py-3 px-3 text-slate-700">
                        {item.cantidad} {item.unidad}
                      </td>
                      <td className="text-right py-3 px-3 text-slate-700">
                        {formatCurrency(item.precioUnitario)}
                      </td>
                      <td className="text-right py-3 px-3 font-medium text-slate-900">
                        {formatCurrency(item.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals */}
          <div className="bg-slate-50 rounded-lg p-4 mb-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Subtotal:</span>
                <span className="font-medium text-slate-900">{formatCurrency(invoice.subtotal)}</span>
              </div>
              {invoice.descuentoTotal > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Descuento:</span>
                  <span className="font-medium text-red-600">-{formatCurrency(invoice.descuentoTotal)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">IVA (16%):</span>
                <span className="font-medium text-slate-900">{formatCurrency(invoice.impuestos)}</span>
              </div>
              <div className="border-t border-slate-200 pt-2 mt-2">
                <div className="flex justify-between">
                  <span className="text-lg font-semibold text-slate-900">TOTAL:</span>
                  <span className="text-2xl font-bold text-emerald-600">{formatCurrency(invoice.total)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Download Section */}
          <DownloadButtons
            invoice={invoice}
            onRequestCFDI={() => setShowCFDIForm(true)}
          />
        </div>
      </div>

      {/* CFDI Request Modal */}
      {showCFDIForm && (
        <CFDIRequestForm
          folio={invoice.folio}
          onClose={() => setShowCFDIForm(false)}
        />
      )}
    </div>
  );
}
