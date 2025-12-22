import { useState } from 'react';
import { X, Loader2, CheckCircle } from 'lucide-react';
import { portalApi } from '../services/portalApi';

interface CFDIRequestFormProps {
  folio: string;
  onClose: () => void;
}

export default function CFDIRequestForm({ folio, onClose }: CFDIRequestFormProps) {
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [nota, setNota] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    if (!email.trim()) {
      setError('El correo electrónico es requerido');
      setSubmitting(false);
      return;
    }

    const response = await portalApi.requestCFDI({
      folio,
      clienteEmail: email.trim(),
      clienteTelefono: telefono.trim() || undefined,
      notaCliente: nota.trim() || undefined,
    });

    if (response.success) {
      setSuccess(true);
      setTimeout(() => {
        onClose();
        window.location.reload(); // Reload to show updated status
      }, 3000);
    } else {
      setError(response.error || 'Error al solicitar CFDI. Intente nuevamente.');
    }

    setSubmitting(false);
  };

  if (success) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              Solicitud Enviada
            </h3>
            <p className="text-slate-600 mb-4">
              Su solicitud de CFDI ha sido recibida. Le notificaremos por email cuando esté lista.
            </p>
            <p className="text-sm text-slate-500">
              Tiempo estimado: 24-48 horas
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h3 className="text-xl font-bold text-slate-900">
            Solicitar Factura Fiscal (CFDI)
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-4">
            <label htmlFor="folio" className="block text-sm font-medium text-slate-700 mb-2">
              Número de Ticket
            </label>
            <input
              id="folio"
              type="text"
              value={folio}
              disabled
              className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-600"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
              Correo Electrónico <span className="text-red-500">*</span>
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="correo@ejemplo.com"
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
            <p className="text-xs text-slate-500 mt-1">
              Le notificaremos a este correo cuando su factura esté lista
            </p>
          </div>

          <div className="mb-4">
            <label htmlFor="telefono" className="block text-sm font-medium text-slate-700 mb-2">
              Teléfono (opcional)
            </label>
            <input
              id="telefono"
              type="tel"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              placeholder="55 1234 5678"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>

          <div className="mb-6">
            <label htmlFor="nota" className="block text-sm font-medium text-slate-700 mb-2">
              Notas adicionales (opcional)
            </label>
            <textarea
              id="nota"
              value={nota}
              onChange={(e) => setNota(e.target.value)}
              placeholder="Ej: Requiero cambiar el uso de CFDI a G02..."
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
            />
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                'Solicitar Factura'
              )}
            </button>
          </div>
        </form>

        {/* Info */}
        <div className="px-6 pb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Importante:</strong> Una vez procesada, recibirá su factura fiscal en formato PDF y XML válida ante el SAT.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
