import { useState } from 'react';
import { Download, FileText, File, Loader2, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { portalApi } from '../services/portalApi';
import type { Venta } from '../types';

interface DownloadButtonsProps {
  invoice: Venta;
  onRequestCFDI: () => void;
}

export default function DownloadButtons({ invoice, onRequestCFDI }: DownloadButtonsProps) {
  const [downloading, setDownloading] = useState(false);

  const handleDownloadTicket = async () => {
    setDownloading(true);
    try {
      await portalApi.downloadTicketPDF(invoice.folio);
    } catch (error) {
      alert('Error al descargar el ticket. Intente nuevamente.');
    } finally {
      setDownloading(false);
    }
  };

  const handleDownloadCFDIPDF = async () => {
    try {
      await portalApi.downloadCFDIPDF(invoice.folio);
    } catch (error) {
      alert('Error al descargar el CFDI PDF.');
    }
  };

  const handleDownloadCFDIXML = async () => {
    try {
      await portalApi.downloadCFDIXML(invoice.folio);
    } catch (error) {
      alert('Error al descargar el CFDI XML.');
    }
  };

  const renderCFDIStatus = () => {
    switch (invoice.cfdiEstatus) {
      case 'sin_solicitar':
        return (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <FileText className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-medium text-blue-900 mb-1">CFDI Fiscal Disponible</h4>
                <p className="text-sm text-blue-700 mb-3">
                  Puede solicitar su factura electrónica timbrada, válida ante el SAT.
                </p>
                <button
                  onClick={onRequestCFDI}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  Solicitar CFDI
                </button>
              </div>
            </div>
          </div>
        );

      case 'solicitado':
        return (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5 animate-pulse" />
              <div className="flex-1">
                <h4 className="font-medium text-yellow-900 mb-1">CFDI en Proceso</h4>
                <p className="text-sm text-yellow-700">
                  Su solicitud de factura está siendo procesada. Le notificaremos por email cuando esté lista.
                  Tiempo estimado: 24-48 horas.
                </p>
              </div>
            </div>
          </div>
        );

      case 'timbrado':
        return (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-medium text-green-900 mb-1">CFDI Disponible</h4>
                <p className="text-sm text-green-700 mb-3">
                  Su factura fiscal ha sido timbrada exitosamente.
                </p>
                {invoice.cfdiUuid && (
                  <p className="text-xs text-green-600 mb-3 font-mono">
                    UUID: {invoice.cfdiUuid}
                  </p>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={handleDownloadCFDIPDF}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Descargar PDF
                  </button>
                  <button
                    onClick={handleDownloadCFDIXML}
                    className="px-4 py-2 bg-white border border-green-600 text-green-700 rounded-lg hover:bg-green-50 transition-colors text-sm font-medium flex items-center gap-2"
                  >
                    <File className="w-4 h-4" />
                    Descargar XML
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case 'error':
        return (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-medium text-red-900 mb-1">Error en Timbrado</h4>
                <p className="text-sm text-red-700 mb-3">
                  Hubo un error al procesar su factura. Por favor contacte a soporte.
                </p>
                <button
                  onClick={onRequestCFDI}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                >
                  Reintentar Solicitud
                </button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {/* Ticket Download */}
      <div className="border border-slate-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h4 className="font-medium text-slate-900 mb-1 flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-600" />
              Ticket de Compra
            </h4>
            <p className="text-sm text-slate-600">
              Comprobante simple de su compra (no válido fiscalmente)
            </p>
          </div>
          <button
            onClick={handleDownloadTicket}
            disabled={downloading}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {downloading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Descargando...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Descargar PDF
              </>
            )}
          </button>
        </div>
      </div>

      {/* CFDI Status */}
      {renderCFDIStatus()}
    </div>
  );
}
