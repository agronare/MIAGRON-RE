
import React, { useState, useEffect, useMemo } from 'react';
import { 
  BarChart3, RefreshCw, Download, Sparkles, Calculator, Save, 
  DollarSign, TrendingUp, PieChart, ArrowRightLeft, AlertCircle,
  Loader2, Scale, FileText, Banknote, Info, ArrowUpRight, ArrowDownRight,
  Target, Activity
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, ComposedChart, Area, Cell, Line
} from 'recharts';
import { generateFinancialAnalysis } from '../services/geminiService';
import { Sale, PurchaseOrder, InventoryItem, FixedAsset, PayrollPeriod, PaymentRecord } from '../types';

type FinanceTab = 'balance' | 'resultados' | 'flujo' | 'ratios' | 'comparativo';

interface FinanceViewProps {
    salesHistory: Sale[];
    purchaseOrders: PurchaseOrder[];
    inventory: InventoryItem[];
    fixedAssets: FixedAsset[];
    payrollPeriods: PayrollPeriod[];
    payments: PaymentRecord[];
    financialMovements?: any[];
    advisories?: any[];
}

export const FinanceView: React.FC<FinanceViewProps> = ({
    salesHistory = [],
    purchaseOrders = [],
    inventory = [],
    fixedAssets = [],
    payrollPeriods = [],
    payments = [],
    financialMovements = [],
    advisories = []
}) => {
  const [activeTab, setActiveTab] = useState<FinanceTab>('balance');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiInsight, setAiInsight] = useState<string | null>(null);

  // --- Real Financial Calculations ---

  // 1. Income Statement Data (Resultados)
  const incomeData = useMemo(() => {
      // Revenue: Total Sales
      const sales = (salesHistory || []).reduce((sum, s) => sum + s.total, 0);
      
      // Cost of Goods Sold (COGS): Sum of (quantity * cost) for items in sales
      // Fallback: If cost is missing in sale product, estimate at 70% of price
      const cogs = (salesHistory || []).reduce((sum, sale) => {
          if (sale.products) {
              return sum + sale.products.reduce((pSum, p) => pSum + (p.quantity * (p.cost || (p.price || 0) * 0.7)), 0);
          }
          return sum + (sale.total * 0.7);
      }, 0);

      // Operating Expenses: Payroll + Estimated Overhead
      const payrollCost = (payrollPeriods || []).reduce((sum, p) => sum + p.totalAmount, 0);
      // Simulating other expenses as 10% of sales for this demo if no expense module is fully linked
      const otherExpenses = sales * 0.10; 
      const totalExpenses = payrollCost + otherExpenses;

      // Financial Result (Interests/Commissions - Mocked or derived)
      const financialExpenses = sales * 0.01; // 1% est. bank fees
      const financialIncome = 5000; // Fixed interest income for demo

      const taxes = Math.max(0, (sales - cogs - totalExpenses - financialExpenses + financialIncome) * 0.30); // 30% ISR

      return {
          sales,
          cogs,
          expenses: { sales: otherExpenses * 0.4, admin: otherExpenses * 0.6 + payrollCost },
          financial: { income: financialIncome, expenses: financialExpenses },
          taxes
      };
  }, [salesHistory, payrollPeriods]);

  // 2. Balance Sheet Data (Balance General)
  const balanceData = useMemo(() => {
      // Assets
      // Cash Flow: Initial Seed + Payments In - Payments Out
      const initialCash = 50000; // Starting capital seed
      const totalInflow = (payments || []).filter(p => p.type === 'receivable').reduce((sum, p) => sum + p.amount, 0);
      const totalOutflow = (payments || []).filter(p => p.type === 'payable').reduce((sum, p) => sum + p.amount, 0);
      const cash = Math.max(0, initialCash + totalInflow - totalOutflow);
      
      const banks = cash * 0.8; // Assume 80% is in bank
      const cashOnHand = cash * 0.2; // 20% in hand

      // Receivables: Sales on Credit - Paid Receivables
      const totalCreditSales = (salesHistory || []).filter(s => s.method === 'Crédito').reduce((sum, s) => sum + s.total, 0);
      const receivables = Math.max(0, totalCreditSales - totalInflow);

      // Inventory Valuation
      const inventoryValue = (inventory || []).reduce((sum, i) => sum + (i.quantity * i.unitPrice), 0);

      // Fixed Assets (Net Book Value)
      const fixedAssetsValue = (fixedAssets || []).reduce((sum, asset) => {
            // Simple depreciation calc if not present in object
            // Assuming straight line 5 years for demo if currentValue missing
            return sum + (asset.acquisitionCost || 0); // Use acquisition cost or current value if available
      }, 0);

      // Liabilities
      // Payables: POs on Credit - Paid Payables
      const totalCreditPurchases = (purchaseOrders || []).filter(p => p.paymentMethod === 'Crédito').reduce((sum, p) => sum + p.total, 0);
      const payables = Math.max(0, totalCreditPurchases - totalOutflow);

      // Taxes Payable (From Income Statement)
      const taxesPayable = incomeData.taxes;

      // Equity
      const capital = 300000; // Static Capital Stock
      const reserves = 50000;
      const retainedEarnings = 60000; // Prior years
      // Current Result = Net Income
      const grossProfit = incomeData.sales - incomeData.cogs;
      const opProfit = grossProfit - (incomeData.expenses.sales + incomeData.expenses.admin);
      const currentResult = opProfit + incomeData.financial.income - incomeData.financial.expenses - incomeData.taxes;

      return {
          assets: {
              cash: cashOnHand, banks: banks, receivables, inventory: inventoryValue, otherCurrent: 5000,
              properties: fixedAssetsValue, intangible: 20000, otherNonCurrent: 10000
          },
          liabilities: {
              payables, shortTermLoans: 30000, labor: 15000, otherCurrent: taxesPayable,
              longTermDebt: 150000, otherNonCurrent: 0
          },
          equity: {
              capital, reserves, retainedEarnings, currentResult
          }
      };
  }, [salesHistory, purchaseOrders, inventory, fixedAssets, payments, incomeData]);

  // 3. Cash Flow Data (Flujo)
  const cashFlowData = useMemo(() => {
      const netIncome = balanceData.equity.currentResult;
      const depreciation = (fixedAssets || []).reduce((sum, a) => sum + (a.acquisitionCost / (a.usefulLife * 12)), 0) * 12; // Est. annual dep
      
      // Changes in Working Capital
      // (In a real app, compare vs previous period snapshot. Here we estimate based on current balances)
      
      return {
          operating: { netIncome, depreciation, receivables: -5000, inventory: -10000, payables: 8000 },
          investing: { capex: -50000, assetSales: 0 },
          financing: { debtIssued: 0, debtPaid: -20000 }
      };
  }, [balanceData, fixedAssets]);

  // 4. Historical Trend Data (Comparativo)
  const historicalTrendData = useMemo(() => {
      const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
      const data = months.map(m => ({ period: m, ventas: 0, costos: 0, utilidad: 0 }));
      
      (salesHistory || []).forEach(sale => {
          const d = new Date(sale.date);
          const monthIdx = d.getMonth();
          data[monthIdx].ventas += sale.total;
          
          // Estimate cost/profit for trend
          const estCost = sale.total * 0.6; // 60% cost ratio assumption for trend
          data[monthIdx].costos += estCost;
          data[monthIdx].utilidad += (sale.total - estCost);
      });
      
      // Filter out empty future months for cleaner chart if desired, or keep all
      return data;
  }, [salesHistory]);


  // --- Derived Calculations for Display ---
  const totalCurrentAssets = (Object.values(balanceData.assets) as number[]).slice(0, 5).reduce((a, b) => a + b, 0);
  const totalNonCurrentAssets = (Object.values(balanceData.assets) as number[]).slice(5).reduce((a, b) => a + b, 0);
  const totalAssets = totalCurrentAssets + totalNonCurrentAssets;

  const totalCurrentLiabilities = (Object.values(balanceData.liabilities) as number[]).slice(0, 4).reduce((a, b) => a + b, 0);
  const totalNonCurrentLiabilities = (Object.values(balanceData.liabilities) as number[]).slice(4).reduce((a, b) => a + b, 0);
  const totalLiabilities = totalCurrentLiabilities + totalNonCurrentLiabilities;

  const totalEquity = (Object.values(balanceData.equity) as number[]).reduce((a, b) => a + b, 0);
  
  const equationDiff = totalAssets - (totalLiabilities + totalEquity);
  const isBalanced = Math.abs(equationDiff) < 100; // Allow small float diff

  const grossProfit = incomeData.sales - incomeData.cogs;
  const totalOpExpenses = incomeData.expenses.sales + incomeData.expenses.admin;
  const operatingProfit = grossProfit - totalOpExpenses;
  const profitBeforeTax = operatingProfit + incomeData.financial.income - incomeData.financial.expenses;
  const netIncome = profitBeforeTax - incomeData.taxes;

  const totalOperatingFlow = (Object.values(cashFlowData.operating) as number[]).reduce((a, b) => a + b, 0);
  const totalInvestingFlow = cashFlowData.investing.assetSales + cashFlowData.investing.capex;
  const totalFinancingFlow = cashFlowData.financing.debtIssued + cashFlowData.financing.debtPaid;
  const netCashChange = totalOperatingFlow + totalInvestingFlow + totalFinancingFlow;

  // --- Ratio Calculations ---
  const liquidityRatio = totalCurrentLiabilities ? (totalCurrentAssets / totalCurrentLiabilities) : 0;
  const quickRatio = totalCurrentLiabilities ? ((totalCurrentAssets - balanceData.assets.inventory) / totalCurrentLiabilities) : 0;
  const debtRatio = totalAssets ? (totalLiabilities / totalAssets) : 0;
  const grossMargin = incomeData.sales ? ((grossProfit / incomeData.sales) * 100) : 0;
  const netMargin = incomeData.sales ? ((netIncome / incomeData.sales) * 100) : 0;
  const roe = totalEquity ? ((netIncome / totalEquity) * 100) : 0;


  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    try {
      const summary = `
        Balance General: Activos $${totalAssets.toFixed(2)}, Pasivos $${totalLiabilities.toFixed(2)}, Patrimonio $${totalEquity.toFixed(2)}.
        Estado de Resultados: Ventas $${incomeData.sales.toFixed(2)}, Costo Ventas $${incomeData.cogs.toFixed(2)}, Gastos Op $${totalOpExpenses.toFixed(2)}, Utilidad Neta $${netIncome.toFixed(2)}.
        Ratios Clave: Liquidez ${liquidityRatio.toFixed(2)}, Margen Neto ${netMargin.toFixed(2)}%, Endeudamiento ${(debtRatio*100).toFixed(2)}%.
      `;
      const insight = await generateFinancialAnalysis(summary);
      setAiInsight(insight);
    } catch (e) {
        console.error(e);
        setAiInsight("No se pudo generar el análisis en este momento.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // --- Sub-Views ---

  const BalanceSheetView = () => (
    <div className="animate-fadeIn">
        <div className="flex justify-end mb-4 gap-3">
             <button className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center shadow-sm">
                 <Calculator className="w-4 h-4 mr-2" />
                 Recalcular
             </button>
             <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center shadow-sm">
                 <Save className="w-4 h-4 mr-2" />
                 Guardar
             </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Assets */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <h3 className="flex items-center text-blue-600 dark:text-blue-400 font-bold mb-6">
                    <TrendingUp className="w-5 h-5 mr-2" /> ACTIVO
                </h3>
                
                <div className="mb-6">
                    <h4 className="text-xs font-bold text-blue-500 dark:text-blue-400 uppercase mb-3 flex items-center">
                        <FileText className="w-3 h-3 mr-1" /> Activo Corriente
                    </h4>
                    <div className="space-y-3">
                        {[
                            { label: 'Efectivo y Caja', key: 'cash' },
                            { label: 'Bancos', key: 'banks' },
                            { label: 'Cuentas por Cobrar', key: 'receivables' },
                            { label: 'Inventarios', key: 'inventory' },
                            { label: 'Otros Activos Corrientes', key: 'otherCurrent' },
                        ].map((item) => (
                            <div key={item.key} className="flex justify-between items-center">
                                <label className="text-sm text-slate-600 dark:text-slate-400">{item.label}</label>
                                <div className="relative w-32">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-xs">$</span>
                                    <input 
                                        type="number" 
                                        className="w-full pl-6 pr-3 py-1.5 text-right text-sm border border-slate-200 dark:border-slate-600 rounded-md focus:ring-1 focus:ring-blue-500 outline-none bg-white dark:bg-slate-800 dark:text-white"
                                        value={balanceData.assets[item.key as keyof typeof balanceData.assets]}
                                        readOnly
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div>
                    <h4 className="text-xs font-bold text-blue-500 dark:text-blue-400 uppercase mb-3 flex items-center">
                        <FileText className="w-3 h-3 mr-1" /> Activo No Corriente
                    </h4>
                    <div className="space-y-3">
                        {[
                            { label: 'Activos Fijos', key: 'properties' },
                            { label: 'Intangibles', key: 'intangible' },
                            { label: 'Otros Activos No Corrientes', key: 'otherNonCurrent' },
                        ].map((item) => (
                            <div key={item.key} className="flex justify-between items-center">
                                <label className="text-sm text-slate-600 dark:text-slate-400">{item.label}</label>
                                <div className="relative w-32">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-xs">$</span>
                                    <input 
                                        type="number" 
                                        className="w-full pl-6 pr-3 py-1.5 text-right text-sm border border-slate-200 dark:border-slate-600 rounded-md focus:ring-1 focus:ring-blue-500 outline-none bg-white dark:bg-slate-800 dark:text-white"
                                        value={balanceData.assets[item.key as keyof typeof balanceData.assets]}
                                        readOnly
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center">
                    <span className="font-bold text-slate-900 dark:text-white">Total Activo</span>
                    <span className="font-bold text-slate-900 dark:text-white text-lg">$ {totalAssets.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                </div>
            </div>

            {/* Liabilities */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <h3 className="flex items-center text-red-600 dark:text-red-400 font-bold mb-6">
                    <TrendingUp className="w-5 h-5 mr-2 rotate-180" /> PASIVO
                </h3>

                <div className="mb-6">
                    <h4 className="text-xs font-bold text-blue-500 dark:text-blue-400 uppercase mb-3 flex items-center">
                        <DollarSign className="w-3 h-3 mr-1" /> Pasivo Corriente
                    </h4>
                    <div className="space-y-3">
                        {[
                            { label: 'Cuentas por Pagar', key: 'payables' },
                            { label: 'Préstamos a Corto Plazo', key: 'shortTermLoans' },
                            { label: 'Pasivos Laborales', key: 'labor' },
                            { label: 'Impuestos por Pagar', key: 'otherCurrent' },
                        ].map((item) => (
                            <div key={item.key} className="flex justify-between items-center">
                                <label className="text-sm text-slate-600 dark:text-slate-400">{item.label}</label>
                                <div className="relative w-32">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-xs">$</span>
                                    <input 
                                        type="number" 
                                        className="w-full pl-6 pr-3 py-1.5 text-right text-sm border border-slate-200 dark:border-slate-600 rounded-md focus:ring-1 focus:ring-blue-500 outline-none bg-white dark:bg-slate-800 dark:text-white"
                                        value={balanceData.liabilities[item.key as keyof typeof balanceData.liabilities]}
                                        readOnly
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div>
                    <h4 className="text-xs font-bold text-blue-500 dark:text-blue-400 uppercase mb-3 flex items-center">
                        <DollarSign className="w-3 h-3 mr-1" /> Pasivo No Corriente
                    </h4>
                    <div className="space-y-3">
                        {[
                            { label: 'Deuda a Largo Plazo', key: 'longTermDebt' },
                            { label: 'Otros Pasivos No Corrientes', key: 'otherNonCurrent' },
                        ].map((item) => (
                            <div key={item.key} className="flex justify-between items-center">
                                <label className="text-sm text-slate-600 dark:text-slate-400">{item.label}</label>
                                <div className="relative w-32">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-xs">$</span>
                                    <input 
                                        type="number" 
                                        className="w-full pl-6 pr-3 py-1.5 text-right text-sm border border-slate-200 dark:border-slate-600 rounded-md focus:ring-1 focus:ring-blue-500 outline-none bg-white dark:bg-slate-800 dark:text-white"
                                        value={balanceData.liabilities[item.key as keyof typeof balanceData.liabilities]}
                                        readOnly
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                 <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center">
                    <span className="font-bold text-slate-900 dark:text-white">Total Pasivo</span>
                    <span className="font-bold text-slate-900 dark:text-white">$ {totalLiabilities.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                </div>
            </div>

            {/* Equity */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col">
                <h3 className="flex items-center text-emerald-600 dark:text-emerald-400 font-bold mb-6">
                    <PieChart className="w-5 h-5 mr-2" /> PATRIMONIO
                </h3>

                <div className="mb-6 flex-1">
                    <h4 className="text-xs font-bold text-blue-500 dark:text-blue-400 uppercase mb-3 flex items-center">
                        <Scale className="w-3 h-3 mr-1" /> Capital Social
                    </h4>
                    <div className="space-y-3">
                        {[
                            { label: 'Capital Social', key: 'capital' },
                            { label: 'Reservas', key: 'reserves' },
                        ].map((item) => (
                            <div key={item.key} className="flex justify-between items-center">
                                <label className="text-sm text-slate-600 dark:text-slate-400">{item.label}</label>
                                <div className="relative w-32">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-xs">$</span>
                                    <input 
                                        type="number" 
                                        className="w-full pl-6 pr-3 py-1.5 text-right text-sm border border-slate-200 dark:border-slate-600 rounded-md focus:ring-1 focus:ring-blue-500 outline-none bg-white dark:bg-slate-800 dark:text-white"
                                        value={balanceData.equity[item.key as keyof typeof balanceData.equity]}
                                        readOnly
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    <h4 className="text-xs font-bold text-blue-500 dark:text-blue-400 uppercase mb-3 mt-6 flex items-center">
                        <BarChart3 className="w-3 h-3 mr-1" /> Resultados Acumulados
                    </h4>
                     <div className="space-y-3">
                        {[
                            { label: 'Utilidades Retenidas', key: 'retainedEarnings' },
                            { label: 'Resultado del Ejercicio', key: 'currentResult' },
                        ].map((item) => (
                            <div key={item.key} className="flex justify-between items-center">
                                <label className="text-sm text-slate-600 dark:text-slate-400">{item.label}</label>
                                <div className="relative w-32">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-xs">$</span>
                                    <input 
                                        type="number" 
                                        className={`w-full pl-6 pr-3 py-1.5 text-right text-sm border border-slate-200 dark:border-slate-600 rounded-md focus:ring-1 focus:ring-blue-500 outline-none bg-white dark:bg-slate-800 dark:text-white ${item.key === 'currentResult' && balanceData.equity.currentResult < 0 ? 'text-red-600' : ''}`}
                                        value={balanceData.equity[item.key as keyof typeof balanceData.equity]}
                                        readOnly
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                 <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-700">
                     <div className="flex justify-between items-center mb-3">
                        <span className="font-bold text-slate-900 dark:text-white">Total Patrimonio</span>
                        <span className="font-bold text-slate-900 dark:text-white">$ {totalEquity.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                    </div>
                     <div className="flex justify-between items-center py-3 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 rounded px-3">
                        <span className="font-bold text-slate-900 dark:text-white">Total Pasivo y Patrimonio</span>
                        <span className={`font-bold text-slate-900 dark:text-white ${!isBalanced ? 'text-red-600' : ''}`}>$ {(totalLiabilities + totalEquity).toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                    </div>
                </div>
            </div>
        </div>

        {!isBalanced && (
            <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900 rounded-lg flex items-center justify-center text-red-600 dark:text-red-400 text-sm font-medium animate-pulse">
                <AlertCircle className="w-4 h-4 mr-2" />
                La ecuación no cuadra. Diferencia: ${Math.abs(equationDiff).toLocaleString(undefined, {minimumFractionDigits: 2})}
            </div>
        )}
    </div>
  );

  const IncomeStatementView = () => (
      <div className="animate-fadeIn max-w-4xl mx-auto">
        <div className="flex justify-end mb-6 gap-3">
             <button className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center shadow-sm">
                 <RefreshCw className="w-4 h-4 mr-2" />
                 Recalcular
             </button>
             <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center shadow-sm">
                 <Save className="w-4 h-4 mr-2" />
                 Guardar
             </button>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-8 space-y-6">
             {/* Revenues */}
             <div>
                 <h4 className="text-xs font-bold text-blue-500 dark:text-blue-400 uppercase mb-3 flex items-center"><TrendingUp className="w-3 h-3 mr-1" /> Ingresos</h4>
                 <div className="flex justify-between items-center py-2 border-b border-slate-50 dark:border-slate-800">
                     <label className="text-sm text-slate-700 dark:text-slate-300">Ventas Netas</label>
                     <div className="relative w-32">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-xs">$</span>
                        <input type="number" className="w-full pl-6 pr-3 py-1 text-right text-sm border border-slate-200 dark:border-slate-600 rounded bg-white dark:bg-slate-800 dark:text-white" value={incomeData.sales} readOnly />
                     </div>
                 </div>
             </div>

             {/* Cost of Sales */}
             <div>
                 <h4 className="text-xs font-bold text-blue-500 dark:text-blue-400 uppercase mb-3 flex items-center"><ArrowRightLeft className="w-3 h-3 mr-1" /> Costo de Ventas</h4>
                 <div className="flex justify-between items-center py-2 border-b border-slate-50 dark:border-slate-800">
                     <label className="text-sm text-slate-700 dark:text-slate-300">Costo de la Mercancía Vendida</label>
                     <div className="relative w-32">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-xs">$</span>
                        <input type="number" className="w-full pl-6 pr-3 py-1 text-right text-sm border border-slate-200 dark:border-slate-600 rounded bg-white dark:bg-slate-800 dark:text-white" value={incomeData.cogs} readOnly />
                     </div>
                 </div>
                 <div className="flex justify-between items-center mt-2 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                     <label className="text-sm font-bold text-slate-900 dark:text-white">Utilidad Bruta</label>
                     <span className="text-sm font-bold text-slate-900 dark:text-white">$ {grossProfit.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                 </div>
             </div>

             {/* Operating Expenses */}
              <div>
                 <h4 className="text-xs font-bold text-blue-500 dark:text-blue-400 uppercase mb-3 flex items-center"><Scale className="w-3 h-3 mr-1" /> Gastos de Operación</h4>
                 <div className="flex justify-between items-center py-2 border-b border-slate-50 dark:border-slate-800">
                     <label className="text-sm text-slate-700 dark:text-slate-300">Gastos de Venta y Distribución</label>
                     <div className="relative w-32">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-xs">$</span>
                        <input type="number" className="w-full pl-6 pr-3 py-1 text-right text-sm border border-slate-200 dark:border-slate-600 rounded bg-white dark:bg-slate-800 dark:text-white" value={incomeData.expenses.sales} readOnly />
                     </div>
                 </div>
                 <div className="flex justify-between items-center py-2 border-b border-slate-50 dark:border-slate-800">
                     <label className="text-sm text-slate-700 dark:text-slate-300">Gastos de Administración & Nómina</label>
                     <div className="relative w-32">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-xs">$</span>
                        <input type="number" className="w-full pl-6 pr-3 py-1 text-right text-sm border border-slate-200 dark:border-slate-600 rounded bg-white dark:bg-slate-800 dark:text-white" value={incomeData.expenses.admin} readOnly />
                     </div>
                 </div>
                 <div className="flex justify-between items-center mt-2 p-2">
                     <label className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold">Total Gastos de Operación</label>
                     <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">$ {totalOpExpenses.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                 </div>
                 <div className="flex justify-between items-center mt-1 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                     <label className="text-sm font-bold text-slate-900 dark:text-white">Utilidad de Operación</label>
                     <span className="text-sm font-bold text-slate-900 dark:text-white">$ {operatingProfit.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                 </div>
             </div>

             {/* RIF */}
             <div>
                 <h4 className="text-xs font-bold text-blue-500 dark:text-blue-400 uppercase mb-3 flex items-center"><DollarSign className="w-3 h-3 mr-1" /> Resultado Integral de Financiamiento</h4>
                 <div className="flex justify-between items-center py-2 border-b border-slate-50 dark:border-slate-800">
                     <label className="text-sm text-slate-700 dark:text-slate-300">Otros Ingresos</label>
                     <div className="relative w-32">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-xs">$</span>
                        <input type="number" className="w-full pl-6 pr-3 py-1 text-right text-sm border border-slate-200 dark:border-slate-600 rounded bg-white dark:bg-slate-800 dark:text-white" value={incomeData.financial.income} readOnly />
                     </div>
                 </div>
                 <div className="flex justify-between items-center py-2 border-b border-slate-50 dark:border-slate-800">
                     <label className="text-sm text-slate-700 dark:text-slate-300">Gastos Financieros</label>
                     <div className="relative w-32">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-xs">$</span>
                        <input type="number" className="w-full pl-6 pr-3 py-1 text-right text-sm border border-slate-200 dark:border-slate-600 rounded bg-white dark:bg-slate-800 dark:text-white" value={incomeData.financial.expenses} readOnly />
                     </div>
                 </div>
                 <div className="flex justify-between items-center mt-2 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                     <label className="text-sm font-bold text-slate-900 dark:text-white">Utilidad antes de Impuestos</label>
                     <span className="text-sm font-bold text-slate-900 dark:text-white">$ {profitBeforeTax.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                 </div>
             </div>

             {/* Taxes & Net */}
             <div>
                 <h4 className="text-xs font-bold text-blue-500 dark:text-blue-400 uppercase mb-3 flex items-center"><Banknote className="w-3 h-3 mr-1" /> Impuestos y Utilidad Neta</h4>
                 <div className="flex justify-between items-center py-2 border-b border-slate-50 dark:border-slate-800">
                     <label className="text-sm text-slate-700 dark:text-slate-300">Impuestos a la Utilidad (ISR - 30%)</label>
                     <div className="relative w-32">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-xs">$</span>
                        <input type="number" className="w-full pl-6 pr-3 py-1 text-right text-sm border border-slate-200 dark:border-slate-600 rounded bg-white dark:bg-slate-800 dark:text-white" value={incomeData.taxes} readOnly />
                     </div>
                 </div>
                 <div className="flex justify-between items-center mt-4 bg-slate-900 dark:bg-slate-800 text-white p-6 rounded-xl shadow-lg">
                     <label className="text-lg font-bold">Utilidad Neta del Ejercicio</label>
                     <span className="text-2xl font-bold">$ {netIncome.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                 </div>
             </div>
        </div>
      </div>
  );

  const CashFlowView = () => (
      <div className="animate-fadeIn">
         <div className="flex justify-end mb-6 gap-3">
             <button className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center shadow-sm">
                 <Calculator className="w-4 h-4 mr-2" />
                 Calcular Flujo
             </button>
             <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center shadow-sm">
                 <Save className="w-4 h-4 mr-2" />
                 Guardar
             </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-6">
                {/* Operating Activities */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <h3 className="flex items-center text-blue-600 dark:text-blue-400 font-bold mb-4 text-sm uppercase tracking-wider">
                        <TrendingUp className="w-4 h-4 mr-2" /> Actividades de Operación
                    </h3>
                    <div className="space-y-3">
                         <div className="flex justify-between items-center py-2 bg-slate-50 dark:bg-slate-800 rounded px-2">
                             <label className="text-sm font-medium text-slate-900 dark:text-white">Utilidad Neta</label>
                             <span className="text-sm font-bold text-slate-900 dark:text-white">$ {cashFlowData.operating.netIncome.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                         </div>
                         {[
                            { label: 'Depreciación y Amortización', key: 'depreciation' },
                            { label: 'Cuentas por Cobrar (cambio)', key: 'receivables' },
                            { label: 'Inventarios (cambio)', key: 'inventory' },
                            { label: 'Cuentas por Pagar (cambio)', key: 'payables' },
                        ].map((item) => (
                            <div key={item.key} className="flex justify-between items-center border-b border-slate-50 dark:border-slate-800 pb-2 last:border-0">
                                <label className="text-sm text-slate-600 dark:text-slate-400">{item.label}</label>
                                <div className="relative w-32">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-xs">$</span>
                                    <input 
                                        type="number" 
                                        className="w-full pl-6 pr-3 py-1.5 text-right text-sm border border-slate-200 dark:border-slate-600 rounded-md focus:ring-1 focus:ring-blue-500 outline-none bg-white dark:bg-slate-800 dark:text-white"
                                        value={cashFlowData.operating[item.key as keyof typeof cashFlowData.operating]}
                                        readOnly
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between items-center mt-4 bg-slate-50 dark:bg-slate-800 p-2 rounded">
                         <label className="text-sm font-bold text-slate-900 dark:text-white">Total Flujo de Operación</label>
                         <span className="text-sm font-bold text-slate-900 dark:text-white">$ {totalOperatingFlow.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                     </div>
                </div>
            </div>

            <div className="space-y-6">
                {/* Investing Activities */}
                 <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <h3 className="flex items-center text-indigo-600 dark:text-indigo-400 font-bold mb-4 text-sm uppercase tracking-wider">
                        <PieChart className="w-4 h-4 mr-2" /> Actividades de Inversión
                    </h3>
                    <div className="space-y-3">
                         {[
                            { label: 'Compra de Activos Fijos', key: 'capex' },
                            { label: 'Venta de Activos Fijos', key: 'assetSales' },
                        ].map((item) => (
                            <div key={item.key} className="flex justify-between items-center border-b border-slate-50 dark:border-slate-800 pb-2 last:border-0">
                                <label className="text-sm text-slate-600 dark:text-slate-400">{item.label}</label>
                                <div className="relative w-32">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-xs">$</span>
                                    <input 
                                        type="number" 
                                        className="w-full pl-6 pr-3 py-1.5 text-right text-sm border border-slate-200 dark:border-slate-600 rounded-md focus:ring-1 focus:ring-blue-500 outline-none bg-white dark:bg-slate-800 dark:text-white"
                                        value={cashFlowData.investing[item.key as keyof typeof cashFlowData.investing]}
                                        readOnly
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between items-center mt-4 bg-slate-50 dark:bg-slate-800 p-2 rounded">
                         <label className="text-sm font-bold text-slate-900 dark:text-white">Total Flujo de Inversión</label>
                         <span className="text-sm font-bold text-slate-900 dark:text-white">$ {totalInvestingFlow.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                     </div>
                </div>

                 {/* Financing Activities */}
                 <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <h3 className="flex items-center text-emerald-600 dark:text-emerald-400 font-bold mb-4 text-sm uppercase tracking-wider">
                        <RefreshCw className="w-4 h-4 mr-2" /> Actividades de Financiación
                    </h3>
                    <div className="space-y-3">
                         {[
                            { label: 'Emisión de Deuda', key: 'debtIssued' },
                            { label: 'Pago de Deuda', key: 'debtPaid' },
                        ].map((item) => (
                            <div key={item.key} className="flex justify-between items-center border-b border-slate-50 dark:border-slate-800 pb-2 last:border-0">
                                <label className="text-sm text-slate-600 dark:text-slate-400">{item.label}</label>
                                <div className="relative w-32">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-xs">$</span>
                                    <input 
                                        type="number" 
                                        className="w-full pl-6 pr-3 py-1.5 text-right text-sm border border-slate-200 dark:border-slate-600 rounded-md focus:ring-1 focus:ring-blue-500 outline-none bg-white dark:bg-slate-800 dark:text-white"
                                        value={cashFlowData.financing[item.key as keyof typeof cashFlowData.financing]}
                                        readOnly
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                     <div className="flex justify-between items-center mt-4 bg-slate-50 dark:bg-slate-800 p-2 rounded">
                         <label className="text-sm font-bold text-slate-900 dark:text-white">Total Flujo de Financiación</label>
                         <span className="text-sm font-bold text-slate-900 dark:text-white">$ {totalFinancingFlow.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                     </div>
                </div>
            </div>
        </div>

        <div className="mt-6 bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex justify-between items-center">
             <h3 className="text-lg font-bold text-slate-900 dark:text-white">CAMBIO NETO DE EFECTIVO (ESTIMADO)</h3>
             <span className={`text-2xl font-bold ${netCashChange >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                 ${netCashChange.toLocaleString(undefined, {minimumFractionDigits: 2})}
             </span>
        </div>
      </div>
  );

  const RatiosView = () => {
      const ratios = [
          {
              category: 'Liquidez',
              items: [
                  { 
                      name: 'Razón Corriente', 
                      value: liquidityRatio.toFixed(2), 
                      target: '> 1.5', 
                      desc: 'Capacidad para pagar deudas a corto plazo.',
                      status: liquidityRatio > 1.5 ? 'good' : liquidityRatio > 1 ? 'warning' : 'bad'
                  },
                  { 
                      name: 'Prueba Ácida', 
                      value: quickRatio.toFixed(2), 
                      target: '> 1.0', 
                      desc: 'Capacidad de pago sin depender del inventario.',
                      status: quickRatio > 1.0 ? 'good' : quickRatio > 0.8 ? 'warning' : 'bad'
                  }
              ]
          },
          {
              category: 'Rentabilidad',
              items: [
                  { 
                      name: 'Margen Bruto', 
                      value: `${grossMargin.toFixed(1)}%`, 
                      target: '> 40%', 
                      desc: 'Porcentaje de ventas que excede el costo de bienes.',
                      status: grossMargin > 40 ? 'good' : grossMargin > 20 ? 'warning' : 'bad'
                  },
                  { 
                      name: 'Margen Neto', 
                      value: `${netMargin.toFixed(1)}%`, 
                      target: '> 10%', 
                      desc: 'Beneficio real por cada peso vendido.',
                      status: netMargin > 10 ? 'good' : netMargin > 5 ? 'warning' : 'bad'
                  },
                   { 
                      name: 'ROE', 
                      value: `${roe.toFixed(1)}%`, 
                      target: '> 15%', 
                      desc: 'Retorno sobre el patrimonio de los accionistas.',
                      status: roe > 15 ? 'good' : roe > 8 ? 'warning' : 'bad'
                  }
              ]
          },
           {
              category: 'Solvencia',
              items: [
                  { 
                      name: 'Nivel de Endeudamiento', 
                      value: `${(debtRatio * 100).toFixed(1)}%`, 
                      target: '< 50%', 
                      desc: 'Porcentaje de activos financiados con deuda.',
                      status: debtRatio < 0.5 ? 'good' : debtRatio < 0.7 ? 'warning' : 'bad'
                  }
              ]
          }
      ];

      return (
          <div className="animate-fadeIn space-y-8">
              <div className="flex items-center justify-between">
                  <div>
                      <h2 className="text-xl font-bold text-slate-900 dark:text-white">Indicadores Financieros Clave</h2>
                      <p className="text-slate-500 dark:text-slate-400">Monitoriza la salud financiera de tu empresa en tiempo real.</p>
                  </div>
                  <button className="p-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                      <Info className="w-5 h-5" />
                  </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {ratios.map((group) => (
                      <div key={group.category} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col">
                          <div className="p-4 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-300 flex items-center">
                              <Target className="w-4 h-4 mr-2 text-blue-600 dark:text-blue-400" />
                              {group.category}
                          </div>
                          <div className="p-6 space-y-6 flex-1">
                              {group.items.map((ratio, idx) => (
                                  <div key={idx}>
                                      <div className="flex justify-between items-start mb-1">
                                          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{ratio.name}</span>
                                          <span className={`px-2 py-1 rounded text-xs font-bold 
                                              ${ratio.status === 'good' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' : 
                                                ratio.status === 'warning' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' : 
                                                'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'}`}>
                                              {ratio.value}
                                          </span>
                                      </div>
                                      <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 mb-2">
                                          <div className={`h-1.5 rounded-full ${
                                              ratio.status === 'good' ? 'bg-emerald-500' : 
                                              ratio.status === 'warning' ? 'bg-amber-500' : 'bg-red-500'
                                          }`} style={{width: '70%'}}></div>
                                      </div>
                                      <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400">
                                          <span>Meta: {ratio.target}</span>
                                          <span className="text-right max-w-[120px] truncate" title={ratio.desc}>{ratio.desc}</span>
                                      </div>
                                  </div>
                              ))}
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      );
  };

  const ComparativeView = () => {
      return (
          <div className="animate-fadeIn space-y-8">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                      <h2 className="text-xl font-bold text-slate-900 dark:text-white">Análisis Comparativo</h2>
                      <p className="text-slate-500 dark:text-slate-400">Tendencias históricas basadas en tus registros reales.</p>
                  </div>
                  <div className="flex gap-2">
                      <select className="px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-800 dark:text-white focus:outline-none focus:border-blue-500">
                          <option>Año Actual</option>
                      </select>
                      <button className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm">
                          Exportar Informe
                      </button>
                  </div>
              </div>

              {/* Trend Chart */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                  <h3 className="font-bold text-slate-800 dark:text-white mb-6 flex items-center">
                      <Activity className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
                      Tendencia Mensual (Ventas vs Costos vs Utilidad)
                  </h3>
                  <div className="h-[400px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                          <ComposedChart data={historicalTrendData} margin={{top: 20, right: 30, left: 20, bottom: 5}}>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                              <XAxis dataKey="period" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                              <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} tickFormatter={(val) => `$${val/1000}k`} />
                              <Tooltip 
                                  contentStyle={{backgroundColor: '#1e293b', borderRadius: '8px', border: '1px solid #334155', color: '#fff'}} 
                                  formatter={(value: number) => [`$${value.toLocaleString(undefined, {minimumFractionDigits: 0})}`, '']}
                              />
                              <Legend wrapperStyle={{paddingTop: '20px'}} />
                              <Bar dataKey="ventas" name="Ventas" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
                              <Bar dataKey="costos" name="Costos Total (Est)" fill="#cbd5e1" radius={[4, 4, 0, 0]} barSize={40} />
                              <Line type="monotone" dataKey="utilidad" name="Utilidad (Est)" stroke="#10b981" strokeWidth={3} dot={{r: 4, fill: '#10b981'}} />
                          </ComposedChart>
                      </ResponsiveContainer>
                  </div>
              </div>
          </div>
      );
  };

  return (
    <div className="flex min-h-[calc(100vh-64px)] bg-[#f8fafc] dark:bg-slate-950 transition-colors duration-300">
        <div className="flex-1 p-8 overflow-x-hidden">
            <div className="max-w-[1400px] mx-auto w-full">
                
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                     <div>
                         <div className="flex items-center gap-3 mb-1">
                            <BarChart3 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Panel Financiero Inteligente</h1>
                         </div>
                         <p className="text-slate-500 dark:text-slate-400 text-sm">Datos reales calculados desde operaciones.</p>
                     </div>
                     <div className="flex gap-3">
                         <button className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center shadow-sm">
                             <RefreshCw className="w-4 h-4 mr-2" />
                             Actualizar
                         </button>
                         <button className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center shadow-sm">
                             <Download className="w-4 h-4 mr-2" />
                             Exportar
                         </button>
                     </div>
                </div>

                {/* AI Assistant */}
                <div className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 border border-indigo-100 dark:border-indigo-800 rounded-xl p-6 mb-8">
                     <div className="flex justify-between items-start">
                        <div className="flex gap-4">
                            <div className="p-3 bg-white dark:bg-slate-800 rounded-xl shadow-sm text-indigo-600 dark:text-indigo-400">
                                <Sparkles className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Asistente de Análisis Financiero</h2>
                                <p className="text-slate-600 dark:text-slate-300 text-sm mt-1 max-w-2xl">
                                    Obtén un resumen ejecutivo y acciones recomendadas basadas en tus datos actuales.
                                </p>
                            </div>
                        </div>
                        <button 
                            onClick={handleAnalyze}
                            disabled={isAnalyzing}
                            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-all shadow-sm hover:shadow disabled:opacity-70 flex items-center"
                        >
                            {isAnalyzing ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Analizando...
                                </>
                            ) : (
                                "Analizar Ahora"
                            )}
                        </button>
                     </div>
                     
                     {aiInsight ? (
                         <div className="mt-6 p-4 bg-white dark:bg-slate-800 rounded-lg border border-indigo-100 dark:border-indigo-800 shadow-sm animate-fadeIn">
                             <p className="text-slate-800 dark:text-slate-200 text-sm leading-relaxed">{aiInsight}</p>
                         </div>
                     ) : (
                         <div className="mt-6 text-center py-4 text-slate-400 dark:text-slate-500 text-sm">
                             Haz clic en "Analizar Ahora" para obtener insights de la IA.
                         </div>
                     )}
                </div>

                                {/* Backend Data Summary */}
                                {(financialMovements?.length > 0 || advisories?.length > 0) && (
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 animate-fadeIn">
                                        {/* Movimientos Financieros */}
                                        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                                            <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center">
                                                <Banknote className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
                                                Movimientos Financieros (Backend)
                                                <span className="ml-2 text-xs px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                                    {financialMovements?.length || 0}
                                                </span>
                                            </h3>
                                            <div className="overflow-x-auto">
                                                <table className="min-w-full text-sm">
                                                    <thead>
                                                        <tr className="text-left text-slate-500 dark:text-slate-400">
                                                            <th className="py-2 pr-4">Fecha</th>
                                                            <th className="py-2 pr-4">Tipo</th>
                                                            <th className="py-2 pr-4">Monto</th>
                                                            <th className="py-2">Descripción</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {(financialMovements || []).slice(0, 8).map((m: any, idx: number) => (
                                                            <tr key={idx} className="border-t border-slate-100 dark:border-slate-800">
                                                                <td className="py-2 pr-4 text-slate-700 dark:text-slate-300">{m.date ? new Date(m.date).toLocaleDateString() : '-'}</td>
                                                                <td className="py-2 pr-4">
                                                                    <span className={`px-2 py-1 rounded text-xs font-medium ${m.type === 'income' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'}`}>
                                                                        {m.type || 'N/A'}
                                                                    </span>
                                                                </td>
                                                                <td className="py-2 pr-4 text-slate-700 dark:text-slate-300">${(m.amount ?? 0).toLocaleString()}</td>
                                                                <td className="py-2 text-slate-600 dark:text-slate-400 truncate" title={m.description || ''}>{m.description || '-'}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                            {(financialMovements || []).length > 8 && (
                                                <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">Mostrando 8 de {(financialMovements || []).length} registros</div>
                                            )}
                                        </div>

                                        {/* Avisos/Advisories */}
                                        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                                            <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center">
                                                <AlertCircle className="w-5 h-5 mr-2 text-amber-600 dark:text-amber-400" />
                                                Avisos Financieros (Backend)
                                                <span className="ml-2 text-xs px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                                    {advisories?.length || 0}
                                                </span>
                                            </h3>
                                            <div className="space-y-3">
                                                {(advisories || []).slice(0, 8).map((a: any, idx: number) => (
                                                    <div key={idx} className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40">
                                                        <div className="flex items-start justify-between">
                                                            <div>
                                                                <div className="text-sm font-medium text-slate-800 dark:text-white">
                                                                    {a.title || a.type || 'Aviso'}
                                                                </div>
                                                                <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                                                                    {a.message || a.description || 'Sin descripción'}
                                                                </div>
                                                            </div>
                                                            <span className="ml-4 px-2 py-1 rounded text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                                                {a.severity || 'info'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            {(advisories || []).length > 8 && (
                                                <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">Mostrando 8 de {(advisories || []).length} avisos</div>
                                            )}
                                        </div>
                                    </div>
                                )}

                {/* Tabs */}
                <div className="mb-6 border-b border-slate-200 dark:border-slate-700">
                    <div className="flex overflow-x-auto no-scrollbar">
                        {[
                            { id: 'balance', label: 'Balance General', icon: Scale },
                            { id: 'resultados', label: 'Estado de Resultados', icon: FileText },
                            { id: 'flujo', label: 'Flujo de Efectivo', icon: Banknote },
                            { id: 'ratios', label: 'Análisis de Ratios', icon: PieChart },
                            { id: 'comparativo', label: 'Comparativo', icon: ArrowRightLeft },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as FinanceTab)}
                                className={`flex items-center px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                                    activeTab === tab.id 
                                    ? 'border-slate-900 dark:border-white text-slate-900 dark:text-white' 
                                    : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600'
                                }`}
                            >
                                <tab.icon className={`w-4 h-4 mr-2 ${activeTab === tab.id ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`} />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Views */}
                <div className="min-h-[400px]">
                    {activeTab === 'balance' && <BalanceSheetView />}
                    {activeTab === 'resultados' && <IncomeStatementView />}
                    {activeTab === 'flujo' && <CashFlowView />}
                    {activeTab === 'ratios' && <RatiosView />}
                    {activeTab === 'comparativo' && <ComparativeView />}
                </div>

            </div>
        </div>
    </div>
  );
};
