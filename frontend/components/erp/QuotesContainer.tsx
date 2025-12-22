import React, { useState } from 'react';
import { FileText, Users, ShoppingCart } from 'lucide-react';
import { Quote, Supplier, Product, PurchaseOrder, Client, InventoryItem } from '../../types';
import { SupplierQuotesView } from './SupplierQuotesView';
import { SalesQuotesView } from './SalesQuotesView';

interface QuotesContainerProps {
  quotes: Quote[];
  setQuotes: React.Dispatch<React.SetStateAction<Quote[]>>;
  suppliers: Supplier[];
  products: Product[];
  setPurchaseOrders: React.Dispatch<React.SetStateAction<PurchaseOrder[]>>;
  clients: Client[];
  inventory: InventoryItem[];
}

type QuoteTab = 'proveedor' | 'venta';

export const QuotesContainer: React.FC<QuotesContainerProps> = ({
  quotes,
  setQuotes,
  suppliers,
  products,
  setPurchaseOrders,
  clients,
  inventory
}) => {
  const [activeTab, setActiveTab] = useState<QuoteTab>('proveedor');

  const tabs = [
    { id: 'proveedor' as QuoteTab, label: 'Cotizaciones Proveedor', icon: Users },
    { id: 'venta' as QuoteTab, label: 'Cotizaciones Venta', icon: ShoppingCart },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header con Tabs */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">Cotizaciones</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">Gestiona cotizaciones de proveedores y ventas a clientes</p>
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="flex bg-slate-50 dark:bg-slate-800/50">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 text-sm font-medium transition-all duration-200 border-b-2 ${isActive ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-900' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-500' : ''}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="transition-all duration-300">
        {activeTab === 'proveedor' ? (
          <SupplierQuotesView
            quotes={quotes}
            setQuotes={setQuotes}
            suppliers={suppliers}
            products={products}
            setPurchaseOrders={setPurchaseOrders}
          />
        ) : (
          <SalesQuotesView
            clients={clients}
            products={products}
            inventory={inventory}
          />
        )}
      </div>
    </div>
  );
};
