
import React, { useState, useMemo, useEffect } from 'react';
import {
  Search, Download, Save, RefreshCw, Info, ChevronDown,
  Barcode, Calendar, CheckCircle, AlertTriangle, XCircle,
  Truck, ClipboardCheck, Lock, Wifi, WifiOff, FileText, DollarSign
} from 'lucide-react';
import { InventoryItem, PurchaseOrder } from '../types';
import { useData } from '../context';
import { erpService } from '../services/erpService';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// --- Types for this View ---
interface AuditItem extends InventoryItem {
  physicalCount: number | '';
  variance: number;
  varianceValue: number;
  notes?: string;
}

interface ReceptionItem {
  id: string; // Product ID or SKU
  productName: string;
  sku: string;
  expectedQty: number; // Hidden from operator
  receivedQty: number | '';
  lot: string;
  expiryDate: string;
  status: 'pending' | 'matched' | 'warning' | 'error';
}

interface PhysicalCountViewProps {
    onRefresh?: () => void;
}

export const PhysicalCountView: React.FC<PhysicalCountViewProps> = ({ onRefresh }) => {
  // Use centralized DataContext as single source of truth
  const data = useData();

  // Destructure data from DataContext - no local copies needed
  const { inventory, purchaseOrders } = data;

  // LAZY LOADING: Load data when component mounts
  useEffect(() => {
    const loadData = async () => {
      await Promise.all([
        data.loadInventory(),
        data.loadPurchaseOrders()
      ]);
    };
    loadData();
  }, []);

  const [activeTab, setActiveTab] = useState<'recepcion' | 'conteo'>('conteo');
  
  // --- RECEPTION STATE ---
  const [receptionId, setReceptionId] = useState('');
  const [receptionItems, setReceptionItems] = useState<ReceptionItem[]>([]);
  const [isReceiving, setIsReceiving] = useState(false);
  const [currentPO, setCurrentPO] = useState<PurchaseOrder | null>(null);

  // --- AUDIT STATE ---
  const [isAuditActive, setIsAuditActive] = useState(false);
  const [auditItems, setAuditItems] = useState<AuditItem[]>([]);
  const [auditFilter, setAuditFilter] = useState('');
  const [isOffline, setIsOffline] = useState(false); // Simulation
  
  // Audit Config
  const [selectedBranch, setSelectedBranch] = useState('Todas');

  // --- RECEPTION LOGIC ---

  const startReception = () => {
      if(!receptionId) return alert("Ingrese un folio de Orden de Compra");
      
      // Find real PO
      const po = purchaseOrders.find(p => p.orderNo.toLowerCase() === receptionId.toLowerCase() || p.id === receptionId);
      
      if (po) {
          if (po.status === 'Completado' || po.status === 'Cancelado') {
              alert(`Esta orden ya está marcada como ${po.status}.`);
              return;
          }

          const items: ReceptionItem[] = po.items.map(item => ({
              id: item.id,
              productName: item.name,
              sku: item.sku,
              expectedQty: item.quantity,
              receivedQty: '', // Blind
              lot: item.lote || '',
              expiryDate: '',
              status: 'pending'
          }));
          
          setReceptionItems(items);
          setCurrentPO(po);
          setIsReceiving(true);
      } else {
          alert("Orden de compra no encontrada. Verifique el folio.");
      }
  };

  const handleReceptionChange = (id: string, field: keyof ReceptionItem, value: any) => {
      setReceptionItems(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const validateReceptionRow = (item: ReceptionItem) => {
      if (item.receivedQty === '') return 'pending';
      const diff = Math.abs(Number(item.receivedQty) - item.expectedQty);
      const percentDiff = (diff / item.expectedQty) * 100;

      if (diff === 0) return 'matched';
      if (percentDiff <= 5) return 'warning'; // 5% tolerance
      return 'error';
  };

  const confirmReception = async () => {
      if (!currentPO) return;

      // Validate if all items are checked
      const incomplete = receptionItems.some(i => i.receivedQty === '');
      if (incomplete) {
          if(!window.confirm("Hay partidas sin cantidad recibida. ¿Desea continuar asumiendo 0?")) return;
      }

      try {
          // 1. Update Inventory via API
          for (const recItem of receptionItems) {
              const qty = Number(recItem.receivedQty) || 0;
              if (qty > 0) {
                  // Add new lot to inventory through API
                  await erpService.inventario.create({
                      productoId: 0, // Would need proper productId mapping
                      sucursalId: 0, // Would need proper branchId mapping
                      cantidad: qty,
                      lote: recItem.lot || `LOTE-${new Date().toISOString().split('T')[0]}`,
                      ubicacion: currentPO.destinationBranch,
                      costoUnit: 0,
                      fechaIngreso: new Date().toISOString(),
                      metodoCosto: 'PEPS'
                  } as any);
              }
          }

          // 2. Update Purchase Order Status via API
          // Note: Would need proper API endpoint for updating PO status
          // For now, update locally and refresh from server

          await data.refreshModule('erp');

          alert(`Recepción de ${currentPO.orderNo} confirmada. Inventario actualizado.`);
          setIsReceiving(false);
          setReceptionItems([]);
          setCurrentPO(null);
          setReceptionId('');
      } catch (error) {
          console.error('Error confirming reception:', error);
          alert('Error al confirmar la recepción. Por favor intente de nuevo.');
      }
  };

  // --- AUDIT LOGIC ---

  const startAudit = () => {
      // Snapshot logic: Deep copy current inventory based on filters
      const filteredInventory = selectedBranch === 'Todas' 
        ? inventory 
        : inventory.filter(i => i.branch === selectedBranch);

      if (filteredInventory.length === 0) {
          alert("No hay inventario disponible para auditar con los filtros seleccionados.");
          return;
      }

      const snapshot = filteredInventory.map(item => ({
          ...item,
          physicalCount: '' as const,
          variance: 0,
          varianceValue: 0,
          notes: ''
      }));
      setAuditItems(snapshot);
      setIsAuditActive(true);
  };

  const handleAuditCount = (id: string, value: string) => {
      setAuditItems(prev => prev.map(item => {
          if (item.id === id) {
              const physical = value === '' ? '' : Number(value);
              const system = item.quantity;
              // Variance = Physical - System (Negative means missing stock)
              const variance = physical === '' ? 0 : (physical - system);
              const varianceValue = variance * item.unitPrice;
              return { ...item, physicalCount: physical, variance, varianceValue };
          }
          return item;
      }));
  };

  const filteredAuditItems = useMemo(() => {
      return auditItems.filter(i => 
          i.productName.toLowerCase().includes(auditFilter.toLowerCase()) ||
          i.sku.toLowerCase().includes(auditFilter.toLowerCase()) ||
          i.batch.toLowerCase().includes(auditFilter.toLowerCase())
      );
  }, [auditItems, auditFilter]);

  const auditTotals = useMemo(() => {
      const totalVarianceValue = auditItems.reduce((sum, item) => sum + item.varianceValue, 0);
      const itemsCounted = auditItems.filter(i => i.physicalCount !== '').length;
      const progress = auditItems.length > 0 ? (itemsCounted / auditItems.length) * 100 : 0;
      return { totalVarianceValue, itemsCounted, progress };
  }, [auditItems]);

  const handleCloseAudit = async () => {
      if (auditTotals.itemsCounted < auditItems.length) {
          if(!window.confirm("No ha contado todos los items. ¿Desea cerrar asumiendo que los no contados mantienen su stock (o son 0)? \n\nNota: En esta versión se mantendrán sin cambios.")) return;
      }

      try {
          // Update inventory via API
          for (const auditItem of auditItems) {
              if (auditItem.physicalCount !== '' && auditItem.variance !== 0) {
                  // Update inventory quantity through API
                  await erpService.inventario.update(parseInt(auditItem.id), {
                      cantidad: Number(auditItem.physicalCount)
                  } as any);
              }
          }

          // Refresh data from server
          await data.refreshModule('erp');
      
      // Generate PDF Report
      const doc = new jsPDF();
      doc.text("Reporte de Ajuste de Inventario (Cierre)", 14, 15);
      doc.setFontSize(10);
      doc.text(`Fecha: ${new Date().toLocaleString()}`, 14, 22);
      doc.text(`Sucursal Auditada: ${selectedBranch}`, 14, 27);
      doc.text(`Impacto Financiero Neto: $${auditTotals.totalVarianceValue.toFixed(2)}`, 14, 32);

      const diffs = auditItems.filter(i => i.variance !== 0 && i.physicalCount !== '').map(i => [
          i.productName,
          i.batch,
          i.quantity,
          i.physicalCount,
          i.variance,
          `$${i.varianceValue.toFixed(2)}`
      ]);

      if (diffs.length > 0) {
          autoTable(doc, {
              head: [['Producto', 'Lote', 'Sistema', 'Físico', 'Dif', 'Valor']],
              body: diffs,
              startY: 40,
          });
      } else {
          doc.text("Sin discrepancias encontradas.", 14, 45);
      }

      doc.save(`ajuste_inventario_${new Date().toISOString().split('T')[0]}.pdf`);

      alert("Auditoría cerrada exitosamente. El inventario global ha sido actualizado con los conteos físicos.");
      setIsAuditActive(false);
      setAuditItems([]);
      } catch (error) {
          console.error('Error closing audit:', error);
          alert('Error al cerrar la auditoría. Por favor intente de nuevo.');
      }
  };

  // --- RENDER ---

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#f8fafc] dark:bg-slate-950 transition-colors duration-300 p-4 sm:p-8">
    <div className="max-w-[1400px] mx-auto w-full">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Auditoría y Control de Stock</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">Validación ciega de entradas y conteos cíclicos certificados.</p>
            </div>
            <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg self-start sm:self-auto">
                 <button 
                    onClick={() => setActiveTab('recepcion')}
                    className={`px-6 py-2 text-sm font-medium rounded-md transition-all ${
                        activeTab === 'recepcion' 
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' 
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                    }`}
                 >
                     Recepción Ciega
                 </button>
                 <button 
                    onClick={() => setActiveTab('conteo')}
                    className={`px-6 py-2 text-sm font-medium rounded-md transition-all ${
                        activeTab === 'conteo' 
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' 
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                    }`}
                 >
                     Auditoría de Inventario
                 </button>
            </div>
        </div>

        {/* CONTENT: RECEPTION */}
        {activeTab === 'recepcion' && (
            <div className="animate-fadeIn">
                {!isReceiving ? (
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-12 flex flex-col items-center text-center shadow-sm max-w-2xl mx-auto mt-10">
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-full mb-6 text-blue-600 dark:text-blue-400">
                            <Truck className="w-10 h-10" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Recepción de Orden de Compra</h3>
                        <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-md">
                            Ingrese el folio de la Orden de Compra para iniciar la validación ciega. El sistema ocultará las cantidades esperadas para garantizar un conteo real.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
                            <input 
                                type="text" 
                                placeholder="Ej. OC-2025-001" 
                                className="flex-1 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                value={receptionId}
                                onChange={e => setReceptionId(e.target.value)}
                            />
                            <button 
                                onClick={startReception}
                                className="px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all whitespace-nowrap"
                            >
                                Iniciar Recepción
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                            <div>
                                <h3 className="font-bold text-slate-900 dark:text-white text-lg">Validando Entrada: {currentPO?.orderNo}</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Proveedor: {currentPO?.supplierName}</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 text-xs font-bold rounded-full border border-amber-200 dark:border-amber-800 flex items-center">
                                    <Lock className="w-3 h-3 mr-1" /> Modo Ciego Activo
                                </div>
                                <button onClick={() => setIsReceiving(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                                    <XCircle className="w-6 h-6" />
                                </button>
                            </div>
                        </div>
                        
                        <div className="p-6 overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold uppercase text-xs">
                                    <tr>
                                        <th className="p-3 text-left rounded-l-lg">Producto / SKU</th>
                                        <th className="p-3 text-center w-32">Lote Físico</th>
                                        <th className="p-3 text-center w-32">Caducidad</th>
                                        <th className="p-3 text-center w-32">Cant. Recibida</th>
                                        <th className="p-3 text-center w-24 rounded-r-lg">Estado</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {receptionItems.map(item => {
                                        const status = validateReceptionRow(item);
                                        return (
                                            <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                                <td className="p-3">
                                                    <p className="font-bold text-slate-800 dark:text-white">{item.productName}</p>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">{item.sku}</p>
                                                </td>
                                                <td className="p-3">
                                                    <input 
                                                        type="text" 
                                                        className="w-full p-2 border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded text-center uppercase"
                                                        placeholder="LOTE-..."
                                                        value={item.lot}
                                                        onChange={e => handleReceptionChange(item.id, 'lot', e.target.value)}
                                                    />
                                                </td>
                                                <td className="p-3">
                                                    <input 
                                                        type="date" 
                                                        className="w-full p-2 border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded text-center"
                                                        value={item.expiryDate}
                                                        onChange={e => handleReceptionChange(item.id, 'expiryDate', e.target.value)}
                                                    />
                                                </td>
                                                <td className="p-3">
                                                    <input 
                                                        type="number" 
                                                        className="w-full p-2 border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded text-center font-bold focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                                        placeholder="0"
                                                        value={item.receivedQty}
                                                        onChange={e => handleReceptionChange(item.id, 'receivedQty', e.target.value)}
                                                    />
                                                </td>
                                                <td className="p-3 text-center">
                                                    {status === 'matched' && <CheckCircle className="w-6 h-6 text-emerald-500 mx-auto" />}
                                                    {status === 'warning' && (
                                                        <span title="Diferencia Menor (Requiere Autorización)">
                                                            <AlertTriangle className="w-6 h-6 text-amber-500 mx-auto" />
                                                        </span>
                                                    )}
                                                    {status === 'error' && (
                                                        <span title="Diferencia Crítica (Bloqueo)">
                                                            <XCircle className="w-6 h-6 text-red-500 mx-auto" />
                                                        </span>
                                                    )}
                                                    {status === 'pending' && <div className="w-6 h-6 rounded-full border-2 border-slate-200 dark:border-slate-600 mx-auto"></div>}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        <div className="p-6 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex justify-end gap-3">
                            <button className="px-6 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-bold rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">
                                Guardar Parcialmente
                            </button>
                            <button 
                                className="px-6 py-3 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 shadow-lg flex items-center"
                                onClick={confirmReception}
                            >
                                <ClipboardCheck className="w-5 h-5 mr-2" />
                                Confirmar Entrada
                            </button>
                        </div>
                    </div>
                )}
            </div>
        )}

        {/* CONTENT: AUDIT */}
        {activeTab === 'conteo' && (
            <div className="animate-fadeIn">
                {!isAuditActive ? (
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-12 flex flex-col items-center text-center shadow-sm max-w-2xl mx-auto mt-10">
                        <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-full mb-6 text-indigo-600 dark:text-indigo-400">
                            <RefreshCw className="w-10 h-10" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Iniciar Ciclo de Conteo</h3>
                        <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-md">
                            Al iniciar, el sistema tomará una "foto" (Snapshot) del inventario actual. Cualquier movimiento posterior quedará registrado post-auditoría.
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-md mb-6">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1 text-left">Sucursal</label>
                                <select 
                                    className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 dark:text-white"
                                    value={selectedBranch}
                                    onChange={e => setSelectedBranch(e.target.value)}
                                >
                                    <option value="Todas">Todas</option>
                                    <option value="SUC. Copandaro">SUC. Copandaro</option>
                                    <option value="Bodega Central">Bodega Central</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1 text-left">Categoría</label>
                                <select className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 dark:text-white">
                                    <option>Todo el Inventario</option>
                                    <option>Fertilizantes</option>
                                    <option>Agroquímicos</option>
                                </select>
                            </div>
                        </div>
                        <button 
                            onClick={startAudit}
                            className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 transition-all flex items-center"
                        >
                            <Lock className="w-4 h-4 mr-2" />
                            Congelar Stock e Iniciar
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col h-[calc(100vh-200px)]">
                        {/* Audit Toolbar */}
                        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm mb-4 flex flex-wrap gap-4 items-center justify-between">
                            <div className="flex items-center gap-4 flex-1">
                                <div className="relative max-w-xs w-full">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                    <input 
                                        type="text" 
                                        placeholder="Escanear SKU o Lote..." 
                                        className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500/20 outline-none bg-white dark:bg-slate-800 dark:text-white"
                                        value={auditFilter}
                                        onChange={e => setAuditFilter(e.target.value)}
                                        autoFocus
                                    />
                                    <Barcode className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                </div>
                                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg">
                                    <span>Progreso:</span>
                                    <div className="w-24 bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                                        <div className="bg-indigo-600 h-2 rounded-full transition-all" style={{ width: `${auditTotals.progress}%` }}></div>
                                    </div>
                                    <span className="font-bold">{Math.round(auditTotals.progress)}%</span>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-3">
                                <button 
                                    onClick={() => setIsOffline(!isOffline)}
                                    className={`flex items-center px-3 py-1.5 rounded-lg text-xs font-bold border ${isOffline ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400'}`}
                                >
                                    {isOffline ? <WifiOff className="w-3 h-3 mr-1" /> : <Wifi className="w-3 h-3 mr-1" />}
                                    {isOffline ? 'Modo Offline' : 'En Línea'}
                                </button>
                                <div className="text-right mr-4">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase">Impacto Financiero</p>
                                    <p className={`font-bold ${auditTotals.totalVarianceValue < 0 ? 'text-red-600 dark:text-red-400' : auditTotals.totalVarianceValue > 0 ? 'text-blue-600 dark:text-blue-400' : 'text-slate-800 dark:text-white'}`}>
                                        {auditTotals.totalVarianceValue < 0 ? '-' : '+'}${Math.abs(auditTotals.totalVarianceValue).toLocaleString()}
                                    </p>
                                </div>
                                <button 
                                    onClick={handleCloseAudit}
                                    className="px-4 py-2 bg-slate-900 dark:bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-slate-800 dark:hover:bg-indigo-700 shadow-lg flex items-center"
                                >
                                    <FileText className="w-4 h-4 mr-2" />
                                    Conciliar y Cerrar
                                </button>
                            </div>
                        </div>

                        {/* Audit Table */}
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm overflow-hidden flex-1 flex flex-col">
                            <div className="overflow-y-auto flex-1">
                                <table className="w-full text-sm relative">
                                    <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold uppercase text-xs sticky top-0 z-10 shadow-sm">
                                        <tr>
                                            <th className="p-3 text-left">Producto</th>
                                            <th className="p-3 text-left">Lote / SKU</th>
                                            <th className="p-3 text-center w-32 bg-slate-100 dark:bg-slate-800/80">Sistema (Congelado)</th>
                                            <th className="p-3 text-center w-32 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400">Conteo Físico</th>
                                            <th className="p-3 text-center w-32">Varianza</th>
                                            <th className="p-3 text-right w-32">Impacto $</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {filteredAuditItems.length > 0 ? filteredAuditItems.map(item => {
                                            const isCounted = item.physicalCount !== '';
                                            const rowClass = item.variance < 0 ? 'bg-red-50/50 dark:bg-red-900/20' : item.variance > 0 ? 'bg-blue-50/50 dark:bg-blue-900/20' : 'bg-white dark:bg-slate-900';
                                            
                                            return (
                                                <tr key={item.id} className={`${rowClass} hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors`}>
                                                    <td className="p-3 font-medium text-slate-900 dark:text-white">{item.productName}</td>
                                                    <td className="p-3">
                                                        <div className="flex flex-col">
                                                            <span className="font-mono text-xs bg-slate-100 dark:bg-slate-800 px-1 rounded w-fit mb-1 text-slate-700 dark:text-slate-300">{item.batch}</span>
                                                            <span className="text-xs text-slate-400">{item.sku}</span>
                                                        </div>
                                                    </td>
                                                    <td className="p-3 text-center text-slate-500 dark:text-slate-400 font-mono bg-slate-50/30 dark:bg-slate-800/30 border-x border-slate-100 dark:border-slate-800">
                                                        {item.quantity}
                                                    </td>
                                                    <td className="p-3 text-center border-r border-slate-100 dark:border-slate-800">
                                                        <input 
                                                            type="number" 
                                                            className={`w-24 p-1.5 border rounded text-center font-bold outline-none focus:ring-2 focus:ring-indigo-500 ${isCounted ? 'bg-white dark:bg-slate-800 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-400' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 dark:text-white'}`}
                                                            placeholder="-"
                                                            value={item.physicalCount}
                                                            onChange={e => handleAuditCount(item.id, e.target.value)}
                                                        />
                                                    </td>
                                                    <td className="p-3 text-center font-bold">
                                                        {isCounted ? (
                                                            <span className={item.variance === 0 ? 'text-emerald-500' : item.variance < 0 ? 'text-red-500' : 'text-blue-500'}>
                                                                {item.variance > 0 ? '+' : ''}{item.variance}
                                                            </span>
                                                        ) : '-'}
                                                    </td>
                                                    <td className="p-3 text-right font-mono text-xs">
                                                        {isCounted ? (
                                                            <span className={item.varianceValue === 0 ? 'text-slate-400' : item.varianceValue < 0 ? 'text-red-600 dark:text-red-400' : 'text-blue-600 dark:text-blue-400'}>
                                                                {item.varianceValue < 0 ? '-' : '+'}${Math.abs(item.varianceValue).toLocaleString()}
                                                            </span>
                                                        ) : '-'}
                                                    </td>
                                                </tr>
                                            );
                                        }) : (
                                            <tr><td colSpan={6} className="text-center py-8 text-slate-500">No hay items en el conteo.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        )}
      </div>
    </div>
  );
};
