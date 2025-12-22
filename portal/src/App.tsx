import { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { portalApi } from './services/portalApi';
import type { Venta } from './types';
import InvoiceViewer from './components/InvoiceViewer';
import ErrorMessage from './components/ErrorMessage';

export default function App() {
  const [folio, setFolio] = useState('');
  const [invoice, setInvoice] = useState<Venta | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!folio.trim()) {
      setError('Por favor ingrese un número de ticket');
      return;
    }

    setLoading(true);
    setError('');
    setInvoice(null);

    const response = await portalApi.getInvoiceByFolio(folio.trim());

    if (!response.success || !response.data) {
      setError(response.error || 'No se encontró el ticket. Verifique el número.');
    } else {
      setInvoice(response.data);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-slate-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-slate-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-emerald-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">A</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">AGRONARE</h1>
              <p className="text-sm text-slate-600">Portal de Facturación</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-slate-900 mb-3">
            Consulta tu Factura
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Ingresa tu número de ticket para descargar tu comprobante de compra o solicitar tu factura fiscal (CFDI)
          </p>
        </div>

        {/* Search */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <form onSubmit={handleSearch}>
              <label htmlFor="folio" className="block text-sm font-medium text-slate-700 mb-2">
                Número de Ticket
              </label>
              <div className="flex gap-3">
                <input
                  id="folio"
                  type="text"
                  value={folio}
                  onChange={(e) => setFolio(e.target.value)}
                  placeholder="Ej: VENTA-1234"
                  className="flex-1 px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  disabled={loading}
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Buscando...
                    </>
                  ) : (
                    <>
                      <Search className="w-5 h-5" />
                      Buscar
                    </>
                  )}
                </button>
              </div>
            </form>

            <div className="mt-4 text-sm text-slate-500">
              <p>Tip: El número de ticket se encuentra en la parte superior de tu comprobante de compra.</p>
            </div>
          </div>
        </div>

        {/* Results */}
        {error && <ErrorMessage message={error} onClose={() => setError('')} />}
        {invoice && <InvoiceViewer invoice={invoice} />}

        {/* Info Section */}
        {!invoice && !error && (
          <div className="max-w-4xl mx-auto mt-16">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-2xl">📄</span>
                </div>
                <h3 className="font-semibold text-lg mb-2 text-slate-900">Ticket Simple</h3>
                <p className="text-slate-600 text-sm">
                  Descarga inmediata de tu comprobante de compra en formato PDF.
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-2xl">🧾</span>
                </div>
                <h3 className="font-semibold text-lg mb-2 text-slate-900">CFDI Fiscal</h3>
                <p className="text-slate-600 text-sm">
                  Solicita tu factura electrónica timbrada, válida ante el SAT.
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-2xl">⚡</span>
                </div>
                <h3 className="font-semibold text-lg mb-2 text-slate-900">Proceso Rápido</h3>
                <p className="text-slate-600 text-sm">
                  Sin necesidad de crear cuenta. Solo con tu número de ticket.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-16">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center text-sm text-slate-600">
            <p>&copy; 2025 AGRONARE S.A. DE C.V. Todos los derechos reservados.</p>
            <p className="mt-1">RFC: AGR010101ABC</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
