
import React, { useState, useMemo, useEffect } from 'react';
import { Product, InventoryItem, Sale, Client, PaymentRecord, Supplier, Quote, PurchaseOrder, FixedAsset, Branch } from '../../types';
import { useData } from '../../context';
import { 
    Search, Plus, Pencil, Trash2, FileDown, Package, ShoppingCart, Box, 
    Users, FileText, CreditCard, Wrench, Leaf, BarChart3, Factory, Wallet,
    ArrowRightLeft, AlertTriangle, Building2, CheckCircle, XCircle,
    ChevronLeft, Lock, UploadCloud, Upload
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ProductModal } from './ProductModal';
import { InventoryModal } from './InventoryModal';
import { SalesView } from './SalesView';
import { TransferModal } from './TransferModal';
import { SupplierModal } from './SupplierModal';
import { SupplierQuotesView } from './SupplierQuotesView';
import { PurchasesView } from './PurchasesView';
import { FixedAssetsView } from './FixedAssetsView';
import { SalesQuotesView } from './SalesQuotesView';
import { QuotesContainer } from './QuotesContainer';
import { FixedAssetModal } from './FixedAssetModal';
import { PaymentsView } from './PaymentsView';
import { ReportsView } from '../ReportsView';
import { MaintenanceView } from '../MaintenanceView';
import { saveImage } from '../../services/dbService';
import { ProductImage } from '../ProductImage';
import api from '../../services/api';
import { pushProducts } from '../../services/productService';
import { erpService, InventarioDB } from '../../services/erpService';
import { useNotification } from '../../context/NotificationContext';

type ERPViewType = 'productos' | 'inventario' | 'ventas' | 'proveedores' | 'cotizaciones' | 'compras' | 'activos' | 'abonos' | 'reportes' | 'mantenimiento';

interface ERPViewProps {
    permissions?: string[];
}


// --- MAIN COMPONENT ---

export const ERPView: React.FC<ERPViewProps> = ({ permissions = [] }) => {
    // Use centralized DataContext as single source of truth
    const data = useData();

    // Destructure data from DataContext - no local copies needed
    const {
        products,
        suppliers,
        inventory,
        quotes,
        purchaseOrders,
        fixedAssets,
        clients,
        salesHistory,
        payments,
        branches
    } = data;

    // LAZY LOADING: Load base ERP data when component mounts
    useEffect(() => {
        const loadBaseData = async () => {
            // Load base data needed for all ERP views
            await Promise.all([
                data.loadProducts(),
                data.loadSuppliers(),
                data.loadBranches(),
                data.loadClients() // Needed for sales
            ]);
        };
        loadBaseData();
    }, []); // Run only once on mount

  // Menu items configuration map
  const ALL_MENU_ITEMS = useMemo(() => [
    { icon: Package, label: 'Productos', id: 'productos', perm: 'erp_productos' },
    { icon: Box, label: 'Inventario', id: 'inventario', perm: 'erp_inventario' },
    { icon: ShoppingCart, label: 'Ventas', id: 'ventas', perm: 'erp_ventas' },
    { icon: Users, label: 'Proveedores', id: 'proveedores', perm: 'erp_proveedores' },
    { icon: FileText, label: 'Cotizaciones', id: 'cotizaciones', perm: 'erp_cotizaciones' },
    { icon: CreditCard, label: 'Compras', id: 'compras', perm: 'erp_compras' },
    { icon: Factory, label: 'Activos Fijos', id: 'activos', perm: 'erp_activos' },
    { icon: Wallet, label: 'Abonos', id: 'abonos', perm: 'erp_abonos' },
    { icon: BarChart3, label: 'Reportes', id: 'reportes', perm: 'erp_reportes' },
    { icon: Wrench, label: 'Mantenimiento', id: 'mantenimiento', perm: 'erp_mantenimiento' }
  ], []);

  // Filter menu items based on permissions
  const allowedMenuItems = useMemo(() => {
      return permissions.length > 0 
        ? ALL_MENU_ITEMS.filter(item => permissions.includes(item.perm)) 
        : ALL_MENU_ITEMS;
  }, [permissions, ALL_MENU_ITEMS]);

  const [activeTab, setActiveTab] = useState<ERPViewType>(
      allowedMenuItems.length > 0 ? (allowedMenuItems[0].id as ERPViewType) : 'productos'
  );

  useEffect(() => {
      if (allowedMenuItems.length > 0 && !allowedMenuItems.find(i => i.id === activeTab)) {
          setActiveTab(allowedMenuItems[0].id as ERPViewType);
      }
  }, [allowedMenuItems, activeTab]);

  // LAZY LOADING: Load tab-specific data when switching tabs
  useEffect(() => {
      const loadTabData = async () => {
          switch (activeTab) {
              case 'inventario':
                  await data.loadInventory();
                  break;
              case 'ventas':
                  await data.loadSales();
                  break;
              case 'cotizaciones':
                  await data.loadQuotes();
                  break;
              case 'compras':
                  await data.loadPurchaseOrders();
                  break;
              case 'activos':
                  await data.loadFixedAssets();
                  break;
              case 'abonos':
                  await data.loadPayments();
                  break;
          }
      };
      loadTabData();
  }, [activeTab, data]);

  const [isCollapsed, setIsCollapsed] = useState(true);
  
  // Modals State
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | Partial<Product> | null>(null);
  const [isInventoryModalOpen, setIsInventoryModalOpen] = useState(false);
  const [editingInventory, setEditingInventory] = useState<InventoryItem | null>(null);
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [isFixedAssetModalOpen, setIsFixedAssetModalOpen] = useState(false);
  const [editingFixedAsset, setEditingFixedAsset] = useState<FixedAsset | null>(null);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [transferItem, setTransferItem] = useState<InventoryItem | null>(null);
  
  // Filters
  const [productSearch, setProductSearch] = useState('');
  const [inventorySearch, setInventorySearch] = useState('');
  const [branchFilter, setBranchFilter] = useState('Todas');
  const [supplierSearch, setSupplierSearch] = useState('');
    const [isImporting, setIsImporting] = useState(false);
    const { addNotification } = useNotification();

  // --- CALCULATIONS ---
  const toLowerSafe = (value?: string) => (value || '').toLowerCase();

  const filteredProducts = useMemo(() => {
      const search = toLowerSafe(productSearch).trim();
            // Filtrar por término y deduplicar por SKU/Código/ID
            const seen = new Set<string>();
            const filtered = (products || [])
                .filter(p => 
          toLowerSafe(p.name).includes(search) ||
          toLowerSafe(p.sku).includes(search) ||
          toLowerSafe(p.category).includes(search) ||
          toLowerSafe(p.activeIngredient).includes(search)
                )
                .filter(p => {
                    const key = String(p.sku || (p as any).code || p.id);
                    if (seen.has(key)) return false;
                    seen.add(key);
                    return true;
                });
      
      // Robust sorting: A-Z by Name
      return filtered.sort((a, b) => {
          const nameA = (a.name || '').trim();
          const nameB = (b.name || '').trim();
          return nameA.localeCompare(nameB, 'es', { sensitivity: 'base', numeric: true });
      });
  }, [products, productSearch]);

  const filteredInventory = useMemo(() => {
      const normalize = (s: string) => (s || '').toLowerCase().trim().replace(/\s+/g, ' ');
      const search = toLowerSafe(inventorySearch);
      return (inventory || []).filter(item => {
          const matchesSearch = toLowerSafe(item.productName).includes(search) ||
                                toLowerSafe(item.sku).includes(search) ||
                                toLowerSafe(item.batch).includes(search);
          const itemBranchValue = item.branchCode || item.branch;
          const matchesBranch = branchFilter === 'Todas' || normalize(itemBranchValue) === normalize(branchFilter);
          return matchesSearch && matchesBranch;
      });
  }, [inventory, inventorySearch, branchFilter]);

  const inventoryStats = useMemo(() => {
      const totalValue = filteredInventory.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);
      const totalUnits = filteredInventory.reduce((acc, item) => acc + item.quantity, 0);
      // Obtener umbral por producto desde catálogo (minStock)
      const productMinMap = new Map<string, number>();
      (products || []).forEach(p => {
          const id = String(p.id);
          const min = Number((p as any).minStock ?? 0);
          productMinMap.set(id, Number.isFinite(min) ? min : 0);
      });
      const lowStockCount = filteredInventory.filter(item => {
          const threshold = productMinMap.get(String((item as any).productId)) ?? 0;
          return item.quantity < threshold;
      }).length;
      return { totalValue, totalUnits, lowStockCount };
  }, [filteredInventory, products]);
  
    const filteredSuppliers = useMemo(() => {
        const search = toLowerSafe(supplierSearch);
        return (suppliers || []).filter(s => 
                toLowerSafe(s.companyName).includes(search) ||
                toLowerSafe(s.contactName).includes(search) ||
                toLowerSafe(s.rfc).includes(search)
        );
    }, [suppliers, supplierSearch]);

  const branchOptions = useMemo(() => {
      const options: Array<{ value: string; label: string }> = [];
      const seen = new Set<string>();
      (branches || []).forEach(branch => {
          if (!branch?.name) return;
          const value = branch.code || branch.name;
          if (seen.has(value)) return;
          const label = branch.code ? `${branch.name} (${branch.code})` : branch.name;
          options.push({ value, label });
          seen.add(value);
      });
      return options;
  }, [branches]);

  const branchLabelMap = useMemo(() => {
      const map = new Map<string, string>();
      branchOptions.forEach(option => map.set(option.value, option.label));
      return map;
  }, [branchOptions]);

  useEffect(() => {
      if (branchFilter !== 'Todas' && !branchLabelMap.has(branchFilter)) {
          setBranchFilter('Todas');
      }
  }, [branchFilter, branchLabelMap]);
  // --- ACTIONS ---
    const handleSaveProduct = async (prod: Product) => {
            try {
                if ((editingProduct && 'id' in editingProduct) || prod.id) {
                    const id = prod.id as string;
                    await data.updateProduct(id, prod as any);
                } else {
                    await data.createProduct(prod as any);
                }
                await data.refreshModule('erp');
            } catch (err) {
                console.error('Error saving product', err);
                addNotification('Error', 'No se pudo guardar el producto en el backend', 'error', 'ERP');
            } finally {
                setIsProductModalOpen(false);
                setEditingProduct(null);
            }
    };
    const handleDeleteInventory = (id: string) => { 
            if(!window.confirm('¿Estás seguro de eliminar este lote de inventario?')) return;
            (async () => {
                try {
                    await erpService.inventario.delete(id as any);
                } catch (e) {
                    console.warn('Error deleting inventory item', e);
                    addNotification('Error', 'No se pudo eliminar el lote en el backend', 'error', 'ERP');
                } finally {
                    await data.refreshModule('erp');
                }
            })();
    };

    const handleDeleteProduct = async (id: string) => {
            if (!window.confirm('¿Estás seguro de eliminar este producto?')) return;
            try {
                await data.deleteProduct(id);
                await data.refreshModule('erp');
            } catch (err) {
                console.error('Error deleting product', err);
                addNotification('Error', 'No se pudo eliminar el producto en el backend', 'error', 'ERP');
            }
    };
  
  const handleOpenNewProductModal = (initialData: Partial<Product> | null = null) => {
    setEditingProduct(initialData);
    setIsProductModalOpen(true);
  };

        const handleSaveInventory = (inventoryData: InventoryItem) => {
            const resolveBranch = (value: string) => {
                    const byCode = (branches || []).find(b => b.code && b.code === value);
                    if (byCode) return { id: byCode.id, name: byCode.name, code: byCode.code };
                    const byName = (branches || []).find(b => b.name === value);
                    if (byName) return { id: byName.id, name: byName.name, code: byName.code };
                    return { id: undefined, name: value, code: undefined };
            };

            const resolveProductId = () => {
                    if ((inventoryData as any).productId) return Number((inventoryData as any).productId);
                    const byName = (products || []).find(p => p.name === (inventoryData as any).productName);
                    if (byName) return Number(byName.id);
                    const bySku = (products || []).find(p => p.sku === (inventoryData as any).sku);
                    if (bySku) return Number(bySku.id);
                    return NaN;
            };

            const resolvedBranch = resolveBranch((inventoryData as any).branch);
            const productId = resolveProductId();

            if (!productId || Number.isNaN(productId)) {
                    addNotification('Error', 'Selecciona un producto válido para crear inventario.', 'error', 'ERP');
                    return;
            }

            const withResolved: InventoryItem = { 
                    ...inventoryData, 
                    productId: String(productId),
                    branch: resolvedBranch.name, 
                    branchCode: resolvedBranch.code 
            } as InventoryItem;

            const sucursalId = resolvedBranch.id ? Number(resolvedBranch.id) : undefined;

            // Update via API then refresh
            (async () => {
                try {
                    if (editingInventory) {
                              await erpService.inventario.update(parseInt(editingInventory.id), {
                                  cantidad: withResolved.quantity,
                                  lote: withResolved.batch,
                                  costoUnit: withResolved.unitPrice,
                              } as any);
                    } else {
                              await erpService.inventario.create({
                                  productoId: productId,
                                  sucursalId: sucursalId,
                                  cantidad: withResolved.quantity,
                                  lote: withResolved.batch,
                                  costoUnit: withResolved.unitPrice,
                                  fechaIngreso: new Date().toISOString(),
                              } as any);
                    }
                    await data.refreshModule('erp');
                } catch (e) {
                    console.warn('Sync inventory failed', e);
                    addNotification('Error', 'No se pudo sincronizar inventario con el backend', 'error', 'ERP');
                } finally {
                    setIsInventoryModalOpen(false);
                    setEditingInventory(null);
                }
            })();
        };
  
     const handleSaveSupplier = async (sup: Supplier) => {
            try {
                if (editingSupplier || sup.id) {
                    await data.updateSupplier(sup.id!, sup as any);
                } else {
                    await data.createSupplier(sup as any);
                }
                await data.refreshModule('erp');
            } catch (e) {
                console.error('Error saving supplier', e);
                addNotification('Error', 'No se pudo guardar el proveedor en el backend', 'error', 'ERP');
            } finally {
                setIsSupplierModalOpen(false);
                setEditingSupplier(null);
            }
    };

    const handleDeleteSupplier = async (id: string) => {
            if (!window.confirm('¿Estás seguro de eliminar este proveedor? Esto no se puede deshacer.')) return;
            try {
                await data.deleteSupplier(id);
                await data.refreshModule('erp');
            } catch (e) {
                console.error('Error deleting supplier', e);
                addNotification('Error', 'No se pudo eliminar el proveedor en el backend', 'error', 'ERP');
            }
    };

  const handleImageFolderUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;
      if (!files || files.length === 0) return;

      let updatedCount = 0;
    const normalize = (str: string = '') => str.toLowerCase().trim().replace(/\s+/g, '');

      for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
          const normalizedFileName = normalize(nameWithoutExt);

          // Find matching product by Name or SKU
          const product = (products || []).find(p =>
              normalize(p?.name) === normalizedFileName ||
              normalize(p?.sku) === normalizedFileName ||
              (normalizedFileName.length > 4 && normalize(p?.name).includes(normalizedFileName))
          );

          if (product) {
              const imageKey = `prod_img_${product.id}_${Date.now()}`;

              try {
                  await saveImage(imageKey, file);
                  await data.updateProduct(product.id, { ...product, imageKey } as any);
                  updatedCount++;
              } catch (err) {
                  console.error(`Error saving image for ${product.name}`, err);
              }
          }
      }

      if (updatedCount > 0) {
          await data.refreshModule('erp');
          addNotification('Imágenes actualizadas', `Se actualizaron las imágenes de ${updatedCount} productos.`, 'success', 'ERP');
      } else {
          addNotification('Sin coincidencias', 'No se encontraron coincidencias entre los nombres de archivo y los productos.', 'warning', 'ERP');
      }

      event.target.value = '';
  };

  const handleTransferStock = React.useCallback(async (sourceId: string, destinationBranchValue: string, qty: number) => {
      try {
          const src = (inventory || []).find(i => i.id === sourceId);
          if (!src) return;
          if (qty <= 0 || qty > src.quantity) {
              addNotification('Cantidad inválida', 'La cantidad debe ser > 0 y <= disponible.', 'warning', 'ERP');
              return;
          }

          const srcBranch = (branches || []).find(b => b.name === src.branch || b.code === src.branchCode);
          const destBranch = (branches || []).find(b => b.code === destinationBranchValue || b.name === destinationBranchValue);
          const srcSucursalId = srcBranch ? Number(srcBranch.id) : undefined;
          const destSucursalId = destBranch ? Number(destBranch.id) : undefined;

          if (!srcSucursalId || !destSucursalId || srcSucursalId === destSucursalId) {
              addNotification('Sucursal inválida', 'Selecciona una sucursal de destino diferente.', 'warning', 'ERP');
              return;
          }

          const res = await erpService.inventario.transfer({
              origenInventarioId: Number(src.id),
              productoId: Number(src.productId),
              origenSucursalId: srcSucursalId,
              destinoSucursalId: destSucursalId,
              cantidad: qty,
              costoUnit: src.unitPrice,
              lote: src.batch || null,
              referencia: `Transfer ${src.batch || ''}`,
          });
          if (!res.success) {
              throw new Error(res.error || 'Transferencia fallida');
          }

          await data.refreshModule('erp');
          const salidaId = res.data?.movimientos?.salidaId;
          const entradaId = res.data?.movimientos?.entradaId;
          const transferId = res.data?.transferId;
          const msg = salidaId && entradaId && transferId
              ? `Transferencia #${transferId}. Movimientos: salida #${salidaId}, entrada #${entradaId}.`
              : 'El stock ha sido transferido correctamente.';
          addNotification('Transferencia exitosa', msg, 'success', 'ERP');
      } catch (e) {
          console.error('Transfer failed', e);
          addNotification('Error en transferencia', 'No se pudo completar la transferencia', 'error', 'ERP');
      }
  }, [branches, inventory, data]);
  
  // Placeholder handlers for child components - will be refactored in future tasks
  // These are temporary stubs until child components are refactored to use DataContext
  const handleAddSale = async (_newSale: Sale) => {
    await data.refreshModule('crm');
  };

  const handleConvertToPO = async (_quoteId: string) => {
    await data.refreshModule('erp');
    setActiveTab('compras');
  };

  const handleSaveFixedAsset = async (_assetData: FixedAsset) => {
    await data.refreshModule('erp');
    setIsFixedAssetModalOpen(false);
    setEditingFixedAsset(null);
  };

  const handleDeleteFixedAsset = async (_id: string) => {
      if(window.confirm('¿Estás seguro de eliminar este activo fijo?')) {
          await data.refreshModule('erp');
      }
  };

  const handleOpenFixedAssetModal = (asset: FixedAsset | null) => {
      setEditingFixedAsset(asset);
      setIsFixedAssetModalOpen(true);
  };

  const handleSavePayment = async (_paymentData: Omit<PaymentRecord, 'id'>) => {
    await data.refreshModule('finance');
  };

  // Placeholder setters for child components that haven't been refactored yet
  const placeholderSetter = async () => {
    await data.refreshModule('erp');
  };

    // Actualiza inventario tras una venta: recarga desde backend
    const handleStockUpdate = async (_updatedInventory: any) => {
        // Recarga inventario para reflejar los movimientos SALIDA creados en POS
        await data.loadInventory(true);
        try {
            addNotification('Inventario actualizado', 'Se descontó el stock vendido en la sucursal.', 'success', 'ERP');
        } catch (e) {
            // en caso de que el sistema de notificaciones no esté disponible
            console.warn('Notificación de inventario no disponible:', e);
        }
    };

  // PDF Generators
  const generateProductsPDF = () => {
      const doc = new jsPDF(); 
      doc.setFontSize(18);
      doc.text("Listado de Productos", 14, 15);
      doc.setFontSize(10);
      doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 14, 22);

      autoTable(doc, { 
          head: [['Nombre', 'SKU', 'Categoría', 'Precio', 'Stock Global']], 
          body: filteredProducts.map(p => [
            p.name, 
            p.sku, 
            p.category || '-', 
            `$${p.price.toFixed(2)}`, 
            inventory.filter(i => i.sku === p.sku).reduce((sum, i) => sum + i.quantity, 0)
          ]), 
          startY: 30,
          theme: 'grid',
          headStyles: { fillColor: [63, 81, 181] }
      });
      doc.save('productos_agronare.pdf');
  };

  const generateInventoryPDF = () => {
      const doc = new jsPDF(); 
      const totalValue = filteredInventory.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);

      doc.setFontSize(18);
      doc.text("Inventario Valuado", 14, 15);
      doc.setFontSize(10);
      doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 14, 22);
      doc.text(`Valor Total en Libros: $${totalValue.toLocaleString(undefined, {minimumFractionDigits: 2})}`, 14, 27);

      autoTable(doc, { 
          head: [['Producto', 'SKU', 'Lote', 'Sucursal', 'Cant.', 'Costo U.', 'Valor Total']], 
          body: filteredInventory.map(i => [
            i.productName, 
            i.sku, 
            i.batch, 
            i.branch, 
            i.quantity, 
            `$${i.unitPrice.toFixed(2)}`,
            `$${(i.quantity * i.unitPrice).toLocaleString(undefined, {minimumFractionDigits: 2})}`
          ]), 
          startY: 35,
          theme: 'grid',
          headStyles: { fillColor: [22, 163, 74] } 
      });
      doc.save('inventario_agronare.pdf');
  };

  const renderContent = () => {
      switch(activeTab) {
          case 'productos': return (
              <div className="animate-fadeIn">
                  <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Catálogo de Productos</h1>
                      
                      <div className="flex gap-4 w-full sm:w-auto">
                        <div className="relative flex-1 sm:w-80">
                            <label htmlFor="product-search" className="sr-only">Buscar producto</label>
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                            <input
                                id="product-search"
                                type="text"
                                placeholder="Buscar producto, SKU, ingrediente o categoría..."
                                className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-800 dark:text-white focus:border-indigo-500 outline-none"
                                value={productSearch}
                                onChange={(e) => setProductSearch(e.target.value)}
                            />
                        </div>
                        
                        <div className="flex gap-2">
                                                        <button
                                                            onClick={async () => {
                                                                try {
                                                                    setIsImporting(true);
                                                                      const { inserted } = await pushProducts(products);
                                                                    addNotification('Importación de productos', `Se importaron ${inserted} productos al backend`, 'success', 'ERP');
                                                                      // Disparar resincronización global
                                                                      window.dispatchEvent(new CustomEvent('manual-resync', { detail: { source: 'products-import' } }));
                                                                } catch (e) {
                                                                    addNotification('Error al importar productos', 'No se pudieron importar productos al backend', 'error', 'ERP');
                                                                    console.error(e);
                                                                } finally {
                                                                    setIsImporting(false);
                                                                }
                                                            }}
                                                            disabled={isImporting}
                                                            className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center shadow-sm transition-colors disabled:opacity-60"
                                                        >
                                                            <Upload className="mr-2 w-4 h-4"/> {isImporting ? 'Importando...' : 'Importar al Backend'}
                                                        </button>
                            <input
                                type="file"
                                id="folder-upload"
                                webkitdirectory=""
                                directory=""
                                multiple
                                className="hidden"
                                onChange={handleImageFolderUpload}
                                // @ts-ignore - webkitdirectory is not standard yet but supported
                            />
                            <button onClick={() => document.getElementById('folder-upload')?.click()} className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center shadow-sm transition-colors">
                                <UploadCloud className="mr-2 w-4 h-4"/> Subir Carpeta
                            </button>
                            <button onClick={generateProductsPDF} className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center shadow-sm transition-colors">
                                <FileDown className="mr-2 w-4 h-4"/> Exportar
                            </button>
                            <button onClick={() => handleOpenNewProductModal()} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 flex items-center shadow-sm transition-colors">
                                <Plus className="mr-2 w-4 h-4"/> Nuevo
                            </button>
                        </div>
                      </div>
                  </div>
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm overflow-hidden">
                      <table className="w-full">
                          <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                              <tr>
                                  <th className="p-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-16">Img</th>
                                  <th className="p-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Producto</th>
                                  <th className="p-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">SKU</th>
                                  <th className="p-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Precio Venta</th>
                                  <th className="p-4 text-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Stock Global</th>
                                  <th className="p-4 text-right text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Acciones</th>
                              </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                              {filteredProducts.map(p => (
                                  <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                      <td className="p-4">
                                          <ProductImage imageKey={p.imageKey} productName={p.name} sku={p.sku} className="w-10 h-10 rounded-md object-cover bg-slate-100 dark:bg-slate-800" />
                                      </td>
                                      <td className="p-4">
                                          <div className="font-medium text-slate-900 dark:text-white">{p.name}</div>
                                          <div className="text-xs text-slate-500 dark:text-slate-400">
                                              {p.category || 'Sin categoría'}
                                              {p.activeIngredient && ` • ${p.activeIngredient}`}
                                          </div>
                                      </td>
                                      <td className="p-4 text-sm text-slate-600 dark:text-slate-300 font-mono">{p.sku}</td>
                                      <td className="p-4 text-sm font-medium text-emerald-600 dark:text-emerald-400">${p.price.toFixed(2)}</td>
                                      <td className="p-4 text-center">
                                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                                            {inventory.filter(item => item.sku === p.sku).reduce((sum, item) => sum + item.quantity, 0)}
                                          </span>
                                      </td>
                                      <td className="p-4 text-right">
                                          <div className="flex justify-end items-center gap-2">
                                              <button onClick={() => { setEditingProduct(p); setIsProductModalOpen(true); }} className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/50 rounded transition-colors">
                                                  <Pencil className="w-4 h-4"/>
                                              </button>
                                              <button onClick={() => handleDeleteProduct(p.id)} className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/50 rounded transition-colors">
                                                  <Trash2 className="w-4 h-4"/>
                                              </button>
                                          </div>
                                      </td>
                                  </tr>
                              ))}
                              {filteredProducts.length === 0 && (
                                  <tr>
                                      <td colSpan={5} className="py-12 text-center text-slate-500 dark:text-slate-400">
                                          No se encontraron productos que coincidan con tu búsqueda.
                                      </td>
                                  </tr>
                              )}
                          </tbody>
                      </table>
                  </div>
              </div>
          );
          case 'inventario': return (
              <div className="animate-fadeIn space-y-6">
                  {/* Header & Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between">
                          <div>
                              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Valor Total Inventario</p>
                              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">${inventoryStats.totalValue.toLocaleString()}</h3>
                          </div>
                          <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg">
                              <Wallet className="w-6 h-6" />
                          </div>
                      </div>
                      <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between">
                          <div>
                              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Unidades</p>
                              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{inventoryStats.totalUnits}</h3>
                          </div>
                          <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
                              <Package className="w-6 h-6" />
                          </div>
                      </div>
                      <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between">
                          <div>
                              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Alertas de Stock</p>
                              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{inventoryStats.lowStockCount} <span className="text-sm font-medium text-slate-400">Lotes Bajos</span></h3>
                          </div>
                          <div className="p-3 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-lg">
                              <AlertTriangle className="w-6 h-6" />
                          </div>
                      </div>
                  </div>

                  {/* Toolbar */}
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                      <div className="flex gap-4 w-full sm:w-auto">
                          <div className="relative flex-1 sm:w-64">
                              <label htmlFor="inventory-search" className="sr-only">Buscar inventario</label>
                              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                              <input
                                id="inventory-search"
                                type="text"
                                placeholder="Buscar producto, lote, SKU..."
                                className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:border-indigo-500 transition-colors bg-white dark:bg-slate-800 dark:text-white"
                                value={inventorySearch}
                                onChange={(e) => setInventorySearch(e.target.value)}
                              />
                          </div>
                          <div className="relative w-full sm:w-48">
                              <label htmlFor="branch-filter" className="sr-only">Filtrar por sucursal</label>
                              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                              <select
                                  id="branch-filter"
                                  className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:border-indigo-500 appearance-none bg-white dark:bg-slate-800 dark:text-white cursor-pointer transition-colors"
                                  value={branchFilter}
                                  onChange={(e) => setBranchFilter(e.target.value)}
                              >
                                  <option value="Todas">Todas las Sucursales</option>
                                  {branchOptions.map(option => (
                                      <option key={option.value} value={option.value}>{option.label}</option>
                                  ))}
                              </select>
                          </div>
                      </div>
                      <div className="flex gap-2 w-full sm:w-auto justify-end">
                                                    <button
                                                        onClick={async () => {
                                                            try {
                                                                setIsImporting(true);
                                                                // Fetch product and branch maps
                                                                const [prodResp, sucResp] = await Promise.all([
                                                                    erpService.products.getAll(),
                                                                    erpService.sucursales.getAll(),
                                                                ]);
                                                                const productMap = new Map<string, number>();
                                                                (prodResp.data || []).forEach(p => {
                                                                    if (p.sku) productMap.set(p.sku, p.id);
                                                                    productMap.set(p.codigo, p.id);
                                                                    productMap.set(p.nombre, p.id);
                                                                });
                                                                const branchMap = new Map<string, number>();
                                                                (sucResp.data || []).forEach(s => {
                                                                    branchMap.set((s.nombre || '').toUpperCase(), s.id);
                                                                });
                                                                const items = filteredInventory.map(i => {
                                                                    const productoId = productMap.get(i.sku || i.productName) || Number((i as any).productoId ?? 0);
                                                                    const sucKey = (i.branchCode || i.branch || '').toUpperCase();
                                                                    const sucursalId = branchMap.get(sucKey) || Number((i as any).sucursalId ?? 0);
                                                                    return {
                                                                        productoId,
                                                                        sucursalId,
                                                                        cantidad: Number(i.quantity ?? 0),
                                                                        lote: i.batch,
                                                                        ubicacion: i.location,
                                                                        costoUnit: Number(i.unitPrice ?? 0),
                                                                        metodoCosto: 'PEPS'
                                                                    };
                                                                }).filter(x => x.productoId && x.sucursalId);
                                                                if (items.length === 0) {
                                                                    addNotification('Importación inventario', 'No se pudo mapear productos/sucursales para importación', 'warning', 'ERP');
                                                                } else {
                                                                    const resp = await erpService.inventario.bulkImport(items);
                                                                      const inserted = resp.data?.inserted ?? 0;
                                                                    addNotification('Inventario importado', `Se importaron ${inserted} lotes al backend`, 'success', 'ERP');
                                                                      window.dispatchEvent(new CustomEvent('manual-resync', { detail: { source: 'inventory-import' } }));
                                                                }
                                                            } catch (e) {
                                                                addNotification('Error al importar inventario', 'No se pudieron importar lotes al backend', 'error', 'ERP');
                                                                console.error(e);
                                                            } finally {
                                                                setIsImporting(false);
                                                            }
                                                        }}
                                                        disabled={isImporting}
                                                        className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center transition-colors disabled:opacity-60"
                                                    >
                                                        <Upload className="mr-2 w-4 h-4"/> {isImporting ? 'Importando...' : 'Importar Inventario'}
                                                    </button>
                          <button onClick={generateInventoryPDF} className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center transition-colors">
                              <FileDown className="mr-2 w-4 h-4"/> PDF
                          </button>
                          <button onClick={() => { setEditingInventory(null); setIsInventoryModalOpen(true); }} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 flex items-center shadow-sm transition-colors">
                              <Plus className="mr-2 w-4 h-4"/> Nuevo Lote
                          </button>
                      </div>
                  </div>

                  {/* Table */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm overflow-hidden">
                      <table className="w-full">
                          <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                              <tr>
                                  <th className="p-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Producto / Lote</th>
                                  <th className="p-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Ubicación</th>
                                  <th className="p-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Estado</th>
                                  <th className="p-4 text-right text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Cantidad</th>
                                  <th className="p-4 text-right text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Valor Total</th>
                                  <th className="p-4 text-right text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Acciones</th>
                              </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                              {filteredInventory.map(i => (
                                  <tr key={i.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                                      <td className="p-4">
                                          <div className="font-bold text-slate-900 dark:text-white">{i.productName}</div>
                                          <div className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5 flex items-center gap-2">
                                              <span className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">{i.batch}</span>
                                              <span>•</span>
                                              <span>{i.sku}</span>
                                          </div>
                                      </td>
                                      <td className="p-4">
                                          <div className="flex items-center text-sm text-slate-600 dark:text-slate-300">
                                              <Building2 className="w-4 h-4 mr-2 text-slate-400" />
                                              {branchLabelMap.get(i.branchCode || i.branch) || i.branch || 'Sin sucursal'}
                                          </div>
                                      </td>
                                      <td className="p-4">
                                          {(() => {
                                              const prod = (products || []).find(p => String(p.id) === String((i as any).productId));
                                              const threshold = Number((prod as any)?.minStock ?? 0);
                                              const isLow = i.quantity < (Number.isFinite(threshold) ? threshold : 0);
                                              return isLow ? (
                                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800">
                                                  Bajo Stock
                                              </span>
                                          ) : (
                                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                                                  Óptimo
                                              </span>
                                          );
                                          })()}
                                      </td>
                                      <td className="p-4 text-right">
                                          <span className="font-bold text-slate-800 dark:text-slate-200">{i.quantity}</span>
                                          <span className="text-xs text-slate-400 ml-1">unid.</span>
                                      </td>
                                      <td className="p-4 text-right">
                                          <div className="font-medium text-slate-900 dark:text-white">${(i.quantity * i.unitPrice).toLocaleString(undefined, {minimumFractionDigits: 2})}</div>
                                          <div className="text-xs text-slate-400">Unit: ${i.unitPrice}</div>
                                      </td>
                                      <td className="p-4 text-right">
                                          <div className="flex justify-end items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                              <button 
                                                onClick={() => { setTransferItem(i); setIsTransferModalOpen(true); }} 
                                                className="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/50 rounded transition-colors" 
                                                title="Transferir a otra sucursal"
                                              >
                                                  <ArrowRightLeft className="w-4 h-4"/>
                                              </button>
                                              <button onClick={() => { setEditingInventory(i); setIsInventoryModalOpen(true); }} className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/50 rounded transition-colors" title="Editar">
                                                  <Pencil className="w-4 h-4"/>
                                              </button>
                                              <button onClick={() => handleDeleteInventory(i.id)} className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/50 rounded transition-colors" title="Eliminar">
                                                  <Trash2 className="w-4 h-4"/>
                                              </button>
                                          </div>
                                      </td>
                                  </tr>
                              ))}
                              {filteredInventory.length === 0 && (
                                  <tr>
                                      <td colSpan={6} className="py-12 text-center text-slate-500 dark:text-slate-400">
                                          No se encontraron registros que coincidan con tu búsqueda.
                                      </td>
                                  </tr>
                              )}
                          </tbody>
                      </table>
                  </div>
              </div>
          );
          case 'ventas': return <SalesView products={products} clients={clients} setClients={placeholderSetter as any} inventory={inventory} branches={branches} onStockUpdate={handleStockUpdate as any} salesHistory={salesHistory} onAddSale={handleAddSale} />;
          case 'proveedores': return (
              <div className="animate-fadeIn">
                   <div className="flex justify-between items-center mb-6">
                       <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Proveedores</h1>
                       <div className="flex items-center gap-4">
                            <div className="relative w-72">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                <input 
                                    type="text"
                                    placeholder="Buscar proveedor..."
                                    className="w-full pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-800 dark:text-white focus:border-indigo-500 outline-none"
                                    value={supplierSearch}
                                    onChange={(e) => setSupplierSearch(e.target.value)}
                                />
                            </div>
                            <button 
                                onClick={() => { setEditingSupplier(null); setIsSupplierModalOpen(true); }}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 flex items-center shadow-sm">
                                <Plus className="mr-2 w-4 h-4"/> Nuevo Proveedor
                            </button>
                       </div>
                   </div>
                   <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm overflow-hidden">
                       <table className="w-full">
                           <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                               <tr>
                                   <th className="p-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Empresa</th>
                                   <th className="p-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Contacto</th>
                                   <th className="p-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Crédito</th>
                                   <th className="p-3 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Acciones</th>
                               </tr>
                           </thead>
                           <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                               {filteredSuppliers.map(s => (
                                   <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                       <td className="p-3">
                                            <p className="text-sm font-medium text-slate-900 dark:text-white">{s.companyName}</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">{s.rfc}</p>
                                       </td>
                                       <td className="p-3">
                                            <p className="text-sm text-slate-600 dark:text-slate-300">{s.contactName}</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">{s.email}</p>
                                       </td>
                                       <td className="p-3">
                                            {s.hasCredit ? (
                                                <div className="flex items-center text-emerald-600 dark:text-emerald-400 text-sm">
                                                    <CheckCircle className="w-4 h-4 mr-2" />
                                                    <span>${s.creditLimit?.toLocaleString()}</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center text-slate-400 text-sm">
                                                    <XCircle className="w-4 h-4 mr-2" />
                                                    <span>No</span>
                                                </div>
                                            )}
                                       </td>
                                       <td className="p-3 text-right">
                                            <button onClick={() => { setEditingSupplier(s); setIsSupplierModalOpen(true); }} className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400"><Pencil className="w-4 h-4"/></button>
                                            <button onClick={() => handleDeleteSupplier(s.id)} className="ml-2 p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400"><Trash2 className="w-4 h-4"/></button>
                                       </td>
                                   </tr>
                               ))}
                           </tbody>
                       </table>
                   </div>
              </div>
          );
          case 'cotizaciones': return (
              <SupplierQuotesView
                quotes={quotes}
                setQuotes={placeholderSetter}
                suppliers={suppliers}
                products={products}
                setPurchaseOrders={placeholderSetter}
                clients={clients}
                inventory={inventory}
              />
          );
          case 'compras': return <PurchasesView purchaseOrders={purchaseOrders} setPurchaseOrders={placeholderSetter} suppliers={suppliers} quotes={quotes} products={products} branches={branches} />;
          case 'activos': return <FixedAssetsView assets={fixedAssets} onOpenModal={handleOpenFixedAssetModal} onDelete={handleDeleteFixedAsset} branches={branches} />;
          case 'abonos': return <PaymentsView clients={clients} suppliers={suppliers} sales={salesHistory} purchases={purchaseOrders} payments={payments} onSavePayment={handleSavePayment} />;
          case 'reportes': return <ReportsView inventory={inventory} products={products} salesHistory={salesHistory} clients={clients} payments={payments} />;
          case 'mantenimiento': return <MaintenanceView fixedAssets={fixedAssets} />;
          default: return null;
      }
  }

  if (allowedMenuItems.length === 0) {
      return (
        <div className="flex min-h-[calc(100vh-64px)] bg-[#f8fafc] dark:bg-slate-950 transition-colors duration-300 items-center justify-center">
            <div className="text-center p-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
                    <Leaf className="w-8 h-8 text-slate-400" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Acceso Limitado</h2>
                <p className="text-slate-500 dark:text-slate-400 mt-2">No tienes permisos para ver ninguna sección de este módulo.</p>
            </div>
        </div>
      );
  }

    return (
        <div className="flex min-h-[calc(100vh-64px)] bg-[#f8fafc] dark:bg-slate-950 transition-colors duration-300 w-screen relative left-[calc(50%-50vw)]">
      <div 
        onMouseEnter={() => setIsCollapsed(false)}
        onMouseLeave={() => setIsCollapsed(true)}
        className={`${isCollapsed ? 'w-20' : 'w-72'} bg-gradient-to-b from-white via-slate-50/50 to-white dark:from-slate-900 dark:via-slate-900/80 dark:to-slate-950 border-r border-slate-200/60 dark:border-slate-800/60 shadow-lg flex flex-col transition-all duration-300 ease-in-out z-40`}
      >
            {/* Logo Header */}
            <div className="flex items-center justify-center h-24 mb-4 transition-all duration-300">
                <div className={`flex items-center justify-center transition-all duration-300 ${isCollapsed ? 'w-14 h-14' : 'w-16 h-16 bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/30 dark:to-blue-800/20 rounded-2xl border border-blue-200/50 dark:border-blue-700/50 shadow-sm'}`}>
                    <img 
                        src="/logo-erp.png" 
                        alt="Logo ERP" 
                        className={`w-auto object-contain transition-all duration-300 ${isCollapsed ? 'h-10' : 'h-12'}`}
                    />
                </div>
            </div>

            {/* Navigation */}
            <nav className="space-y-1 flex-1 px-3">
                 {allowedMenuItems.map((item) => (
                    <div key={item.id} className="relative group">
                        <button 
                            onClick={() => setActiveTab(item.id as ERPViewType)} 
                            className={`relative w-full flex items-center rounded-xl transition-all duration-200 ease-in-out overflow-hidden
                                ${isCollapsed ? 'justify-center px-3 py-3' : 'justify-start px-4 py-3'}
                                ${activeTab === item.id 
                                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30 scale-[1.02]' 
                                    : 'text-slate-600 dark:text-slate-400 hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-50 dark:hover:from-slate-800 dark:hover:to-slate-800/80 hover:text-slate-900 dark:hover:text-white hover:shadow-md'}`}
                        >
                            {/* Barra de acento lateral para item activo */}
                            {activeTab === item.id && !isCollapsed && (
                                <span className="absolute left-0 top-2 bottom-2 w-1 bg-white rounded-r-full opacity-80" />
                            )}
                            
                            {/* Icono */}
                            <div className={`flex items-center justify-center transition-all duration-200 ${isCollapsed ? '' : 'ml-1'}`}>
                                <item.icon className={`w-5 h-5 shrink-0 transition-all duration-200 ${activeTab === item.id ? 'text-white' : 'text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200'}`} />
                            </div>
                            
                            {/* Label */}
                            <span className={`text-sm font-medium whitespace-nowrap overflow-hidden transition-all duration-200 ${isCollapsed ? 'w-0 opacity-0 ml-0' : 'w-auto opacity-100 ml-3'} ${activeTab === item.id ? 'font-semibold' : ''}`}>
                                {item.label}
                            </span>
                            
                            {/* Indicador de hover (solo cuando NO está activo y NO está colapsado) */}
                            {activeTab !== item.id && !isCollapsed && (
                                <span className="absolute right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                    <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </span>
                            )}
                        </button>
                        
                        {/* Tooltip cuando está colapsado */}
                        {isCollapsed && (
                            <div className="absolute left-full ml-3 px-3 py-2 bg-slate-900 dark:bg-slate-800 text-white text-xs font-medium rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap z-50 border border-slate-700/50">
                                {item.label}
                                <div className="absolute right-full top-1/2 -translate-y-1/2 border-[6px] border-transparent border-r-slate-900 dark:border-r-slate-800" />
                            </div>
                        )}
                    </div>
                 ))}
            </nav>

            {/* Footer decorativo */}
            {!isCollapsed && (
                <div className="mt-4 mb-4 px-4 py-3 mx-3 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-100 dark:border-blue-800/30 transition-all duration-300">
                    <p className="text-xs font-semibold text-blue-900 dark:text-blue-300">Sistema ERP</p>
                    <p className="text-[10px] text-blue-700/70 dark:text-blue-400/70 mt-0.5">Gestión integral</p>
                </div>
            )}
      </div>
      <div className="flex-1 p-8 overflow-x-auto"><div className="max-w-[1400px]">{renderContent()}</div></div>
      <ProductModal isOpen={isProductModalOpen} onClose={() => setIsProductModalOpen(false)} initialData={editingProduct} onSave={handleSaveProduct} />
    <InventoryModal isOpen={isInventoryModalOpen} onClose={() => setIsInventoryModalOpen(false)} initialData={editingInventory} onSave={handleSaveInventory} products={products} branches={branchOptions} branchesRaw={branches} />
      <SupplierModal isOpen={isSupplierModalOpen} onClose={() => setIsSupplierModalOpen(false)} initialData={editingSupplier} onSave={handleSaveSupplier} />
            <TransferModal 
        isOpen={isTransferModalOpen} 
        onClose={() => setIsTransferModalOpen(false)} 
        item={transferItem} 
                onTransfer={handleTransferStock} 
                branches={branchOptions}
      />
      <FixedAssetModal
        isOpen={isFixedAssetModalOpen}
        onClose={() => setIsFixedAssetModalOpen(false)}
        initialData={editingFixedAsset}
        onSave={handleSaveFixedAsset}
        branches={branches}
      />
    </div>
  );
};
