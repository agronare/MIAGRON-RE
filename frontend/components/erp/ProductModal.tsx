
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
    X, Box, RefreshCw, Scale, FileText, Check, Plus, 
    DollarSign, ImageIcon, Link, Landmark, Tag, Info, 
    ChevronDown, Upload, Package, Barcode, Briefcase, 
    FlaskConical, Layers, Percent, ArrowRight, AlertCircle,
    Save, TrendingDown
} from 'lucide-react';
import { SatKeySearch } from './SatKeySearch';
import { SatUnitSearch } from './SatUnitSearch';
import { SALES_UNITS, PURCHASE_UNITS } from '../../constants';
import { saveImage, getImage } from '../../services/dbService';

const defaultData = { 
    name: '', sku: '', price: 0, cost: 0, autoCost: false, ivaRate: 0.16, iepsRate: 0,
    satKey: '', satUnitKey: '', taxObject: '02', retentionIva: false, retentionIsr: false,
    bulkConfig: { baseUnit: 'KG', salesUnit: 'SACO', conversionFactor: 1 },
    isBulk: false,
    imageKey: '',
    description: '',
    category: '',
    manufacturer: '',
    activeIngredient: '',
    iaPercent: 0,
    techSheetUrl: '',
    applicationGuideUrl: '',
    minStock: 0,
};


const SectionHeader = ({ icon: Icon, title, color = 'text-indigo-600', bg = 'bg-indigo-50' }: any) => (
    <div className="flex items-center gap-3 mb-4 border-b border-slate-100/80 dark:border-slate-700/80 pb-4">
        <div className={`p-2.5 rounded-xl ${bg} ${color} shadow-sm dark:bg-opacity-20`}>
            <Icon className="w-5 h-5" />
        </div>
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">{title}</h3>
    </div>
);

const Label = ({ children, required }: any) => (
    <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 ml-1">
        {children} {required && <span className="text-rose-500 ml-0.5">*</span>}
    </label>
);

const inputBaseClasses = "w-full p-3 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none bg-white dark:bg-slate-800 dark:text-white transition-all duration-200 shadow-sm";

export const ProductModal = ({ isOpen, onClose, initialData, onSave }: any) => {
    const [formData, setFormData] = useState<any>(defaultData);
    const [isBulk, setIsBulk] = useState(false);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [factorError, setFactorError] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        let currentPreviewUrl: string | null = null;
        if (isOpen) {
            const data = initialData ? { ...defaultData, ...initialData } : { ...defaultData };

            // Saneamiento: asegura que campos no queden `null` o `undefined` porque
            // eso provoca warnings de React al cambiar inputs controlados a no controlados.
            const keysToEnsure = Object.keys(defaultData) as (keyof typeof defaultData)[];
            for (const k of keysToEnsure) {
                // @ts-ignore
                if (data[k] === null || data[k] === undefined) {
                    // @ts-ignore
                    data[k] = defaultData[k];
                }
            }
            // Asegurar estructura de bulkConfig
            data.bulkConfig = { ...(defaultData.bulkConfig || {}), ...(data.bulkConfig || {}) };
            if (data.bulkConfig.conversionFactor === null || data.bulkConfig.conversionFactor === undefined) {
                data.bulkConfig.conversionFactor = defaultData.bulkConfig.conversionFactor;
            }

            // Normalizar campos numéricos/strings para inputs
            data.price = typeof data.price === 'number' ? data.price : 0;
            data.cost = typeof data.cost === 'number' ? data.cost : 0;
            data.minStock = typeof data.minStock === 'number' ? data.minStock : 0;
            data.ivaRate = data.ivaRate === null || data.ivaRate === undefined ? defaultData.ivaRate : data.ivaRate;
            data.iepsRate = typeof data.iepsRate === 'number' ? data.iepsRate : 0;
            data.iaPercent = typeof data.iaPercent === 'number' ? data.iaPercent : 0;

            setFormData(data);
            setIsBulk(!!data.isBulk);
            setFactorError('');
            setImageFile(null);
            setImagePreview(null);
            
            const loadPreview = async (key: string) => {
                try {
                    const blob = await getImage(key);
                    if (blob) {
                        currentPreviewUrl = URL.createObjectURL(blob);
                        setImagePreview(currentPreviewUrl);
                    }
                } catch (e) {
                    console.error("Failed to load preview image", e);
                }
            };

            if (data.imageKey) {
                loadPreview(data.imageKey);
            }
        }

        return () => {
            if (currentPreviewUrl) {
                URL.revokeObjectURL(currentPreviewUrl);
            }
        }
    }, [initialData, isOpen]);
    
    const equivalenceText = useMemo(() => {
        const { salesUnit, baseUnit, conversionFactor } = formData.bulkConfig || {};
        if (isBulk && salesUnit && baseUnit && conversionFactor > 0 && !factorError) {
          return `Equivalencia: 1 ${salesUnit} = ${conversionFactor} ${baseUnit}`;
        }
        return null;
    }, [isBulk, formData.bulkConfig, factorError]);


    if (!isOpen) return null;

    const handleGenerateSKU = () => {
        const random = Math.random().toString(36).substring(2, 8).toUpperCase();
        setFormData({ ...formData, sku: `PROD-${random}` });
    };
    
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && (file.type === 'image/png' || file.type === 'image/jpeg')) {
            setImageFile(file);
            if (imagePreview) {
                URL.revokeObjectURL(imagePreview);
            }
            const previewUrl = URL.createObjectURL(file);
            setImagePreview(previewUrl);
        }
    };

    const handleFactorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value === '' ? '' : Number(e.target.value);
        if (value !== '' && value <= 0) {
            setFactorError('El factor debe ser mayor a 0.');
        } else {
            setFactorError('');
        }
        setFormData({ ...formData, bulkConfig: { ...(formData.bulkConfig || {}), conversionFactor: value } });
    };

    const handleSaveClick = async () => {
        if (!formData.name || !formData.sku) {
            alert("Nombre y SKU son obligatorios.");
            return;
        }

        let finalData = { ...formData, isBulk };

        if (imageFile) {
            try {
                await saveImage(formData.sku, imageFile);
                finalData.imageKey = formData.sku;
            } catch (error) {
                console.error("Failed to save image to IndexedDB", error);
                alert("Hubo un error al guardar la imagen. Por favor, intente de nuevo.");
                return;
            }
        }
        
        onSave(finalData);
    };

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4 transition-all font-sans">
            <div className="bg-[#f8fafc] dark:bg-slate-950 rounded-[1.5rem] shadow-2xl w-full max-w-5xl flex flex-col overflow-hidden animate-in zoom-in-95 border border-white/40 dark:border-slate-800 h-auto max-h-[95vh]">
                
                {/* Header */}
                <div className="px-8 py-5 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex justify-between items-center shrink-0 z-20 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="bg-indigo-600 p-2.5 rounded-xl shadow-lg shadow-indigo-200 dark:shadow-none">
                            <Box className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Alta de Producto</h2>
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5 flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                Catálogo sincronizado en tiempo real
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="group p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                        <X className="w-6 h-6 text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 lg:p-8 custom-scrollbar bg-slate-100/50 dark:bg-slate-950/50">
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                        
                        {/* Left Column (Operational Data) */}
                        <div className="lg:col-span-3 space-y-8">
                            
                            {/* Card: Basic Identification */}
                            <div className="bg-white dark:bg-slate-900 p-7 rounded-2xl shadow-lg border-l-4 border-l-indigo-500 border-y border-r border-slate-200 dark:border-slate-800 hover:shadow-2xl transition-all duration-300 group relative">
                                <SectionHeader icon={Package} title="Identificación del Producto" color="text-indigo-600 dark:text-indigo-400" bg="bg-indigo-100 dark:bg-indigo-900/30" />
                                
                                <div className="flex flex-col sm:flex-row gap-8 mt-6">
                                    {/* Image Uploader */}
                                    <div 
                                        onClick={() => fileInputRef.current?.click()}
                                        className="w-full sm:w-48 h-48 shrink-0 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 hover:bg-white dark:hover:bg-slate-700 hover:border-indigo-500 dark:hover:border-indigo-400 hover:shadow-md cursor-pointer flex flex-col items-center justify-center transition-all duration-300 overflow-hidden group/upload relative"
                                    >
                                        {imagePreview ? (
                                            <>
                                                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                                <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[1px] flex items-center justify-center opacity-0 group-hover/upload:opacity-100 transition-opacity duration-200">
                                                    <Upload className="w-8 h-8 text-white drop-shadow-md" />
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <div className="p-4 rounded-full bg-white dark:bg-slate-700 shadow-sm mb-3 group-hover/upload:scale-110 transition-transform duration-300 group-hover/upload:text-indigo-600 dark:group-hover/upload:text-indigo-400">
                                                    <ImageIcon className="w-7 h-7 text-slate-400 dark:text-slate-500 group-hover/upload:text-indigo-500 dark:group-hover/upload:text-indigo-400" />
                                                </div>
                                                <span className="text-[11px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500 group-hover/upload:text-indigo-600 dark:group-hover/upload:text-indigo-400">Subir Imagen</span>
                                            </>
                                        )}
                                        <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
                                    </div>

                                    {/* Name & Desc */}
                                    <div className="flex-1 space-y-6">
                                        <div className="group/input">
                                            <Label required>Nombre Comercial</Label>
                                            <div className="relative">
                                                <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                                <input 
                                                    type="text" 
                                                    className={`${inputBaseClasses} pl-12 text-lg font-semibold`} 
                                                    placeholder="Ej: Fertilizante Premium 50kg"
                                                    value={formData.name || ''} 
                                                    onChange={e => setFormData({...formData, name: e.target.value})} 
                                                    autoFocus
                                                    autoComplete="off"
                                                    autoCorrect="off"
                                                    spellCheck={false}
                                                />
                                            </div>
                                        </div>
                                        
                                        <div>
                                            <Label>Descripción Detallada (Factura)</Label>
                                            <textarea 
                                                className={`${inputBaseClasses} min-h-[90px] py-3 px-4 text-sm resize-none`}
                                                rows={3} 
                                                placeholder="Descripción que aparecerá en el XML y reportes..."
                                                value={formData.description || ''} 
                                                onChange={e => setFormData({...formData, description: e.target.value})}
                                            ></textarea>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Card: Classification & Pricing */}
                            <div className="bg-white dark:bg-slate-900 p-7 rounded-2xl shadow-lg border-l-4 border-l-violet-500 border-y border-r border-slate-200 dark:border-slate-800 hover:shadow-2xl transition-all duration-300 relative">
                                <SectionHeader icon={Layers} title="Clasificación y Precios" color="text-violet-600 dark:text-violet-400" bg="bg-violet-100 dark:bg-violet-900/30" />
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6 mt-6">
                                    
                                    <div>
                                        <Label required>SKU / Código Interno</Label>
                                        <div className="flex items-center gap-2">
                                            <div className="relative flex-1">
                                                <Barcode className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                                <input 
                                                    type="text" 
                                                    className={`${inputBaseClasses} pl-12 font-mono tracking-wider`}
                                                    placeholder="PROD-00000"
                                                    value={formData.sku || ''} 
                                                    onChange={e => setFormData({...formData, sku: e.target.value})} 
                                                />
                                            </div>
                                            <button 
                                                onClick={handleGenerateSKU}
                                                className="p-3 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-violet-50 dark:hover:bg-violet-900/30 hover:text-violet-600 dark:hover:text-violet-400 hover:border-violet-200 dark:hover:border-violet-700 transition-all active:scale-95 shadow-sm"
                                                title="Generar Automático"
                                            >
                                                <RefreshCw className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <Label>Categoría</Label>
                                        <div className="relative">
                                            <Layers className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                            <input 
                                                type="text" 
                                                className={`${inputBaseClasses} pl-12`}
                                                placeholder="Buscar categoría..."
                                                value={formData.category || ''} 
                                                onChange={e => setFormData({...formData, category: e.target.value})} 
                                            />
                                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                        </div>
                                    </div>
                                    
                                    <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
                                        <div>
                                            <Label>Precio Base de Venta</Label>
                                            <div className="relative">
                                                <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                                <input 
                                                    type="number" 
                                                    className={`${inputBaseClasses} pl-12 pr-24 text-right`}
                                                    placeholder="0.00"
                                                    value={formData.price ?? ''} 
                                                    onChange={e => setFormData({...formData, price: e.target.value === '' ? 0 : Number(e.target.value)})} 
                                                />
                                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-400 dark:text-slate-500 pointer-events-none">
                                                    MXN + IVA
                                                </span>
                                            </div>
                                        </div>
                                        
                                        <div>
                                            <Label>Stock Mínimo (Alerta)</Label>
                                            <div className="relative">
                                                <TrendingDown className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                                <input 
                                                    type="number" 
                                                    className={`${inputBaseClasses} pl-12`}
                                                    placeholder="0"
                                                    value={formData.minStock || ''} 
                                                    onChange={e => setFormData({...formData, minStock: Number(e.target.value)})} 
                                                />
                                            </div>
                                        </div>

                                        <div className="sm:col-span-2">
                                            <Label>Fabricante / Marca</Label>
                                            <div className="relative">
                                                <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                                <input 
                                                    type="text" 
                                                    className={`${inputBaseClasses} pl-12`}
                                                    placeholder="Opcional"
                                                    value={formData.manufacturer || ''} 
                                                    onChange={e => setFormData({...formData, manufacturer: e.target.value})} 
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Card: Bulk Sales */}
                            <div className="bg-white dark:bg-slate-900 p-7 rounded-2xl shadow-lg border-l-4 border-l-amber-500 border-y border-r border-slate-200 dark:border-slate-800 hover:shadow-2xl transition-all duration-300 relative">
                               <div className="flex justify-between items-center mb-4">
                                    <SectionHeader icon={Scale} title="Venta a Granel" color="text-amber-600 dark:text-amber-400" bg="bg-amber-100 dark:bg-amber-900/30" />
                                    <div className="flex items-center gap-3 shrink-0 mb-4">
                                        <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Habilitar</span>
                                        <button 
                                            onClick={() => setIsBulk(!isBulk)}
                                            className={`w-12 h-6 rounded-full p-1 transition-colors ${isBulk ? 'bg-amber-500' : 'bg-slate-200 dark:bg-slate-700'}`}
                                        >
                                            <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${isBulk ? 'translate-x-6' : 'translate-x-0'}`}></div>
                                        </button>
                                    </div>
                                </div>
                                {isBulk ? (
                                    <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                                        <div className="grid grid-cols-3 items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                                            <div className="text-center">
                                                <Label>Unidad de Venta</Label>
                                                <select
                                                    value={formData.bulkConfig?.salesUnit ?? ''}
                                                    onChange={e => {
                                                        const val = e.target.value;
                                                        setFormData({
                                                            ...formData,
                                                            bulkConfig: {
                                                                ...(formData.bulkConfig || {}),
                                                                salesUnit: val === '' ? undefined : val
                                                            }
                                                        })
                                                    }}
                                                    className={`${inputBaseClasses} font-bold text-center`}
                                                >
                                                    <option value="">— Seleccionar —</option>
                                                    {SALES_UNITS.map(u => <option key={u}>{u}</option>)}
                                                </select>
                                            </div>
                                            <div className="text-center font-bold text-slate-400 text-2xl pt-6">=</div>
                                            <div className="text-center">
                                                <Label>Unidad Base (Inventario)</Label>
                                                <select
                                                    value={formData.bulkConfig?.baseUnit ?? ''}
                                                    onChange={e => {
                                                        const val = e.target.value;
                                                        setFormData({
                                                            ...formData,
                                                            bulkConfig: {
                                                                ...(formData.bulkConfig || {}),
                                                                baseUnit: val === '' ? undefined : val
                                                            }
                                                        })
                                                    }}
                                                    className={`${inputBaseClasses} font-bold text-center`}
                                                >
                                                    <option value="">— Seleccionar —</option>
                                                    {PURCHASE_UNITS.map(u => <option key={u}>{u}</option>)}
                                                </select>
                                            </div>
                                        </div>
                                        <div>
                                            <Label>Factor de Conversión</Label>
                                            <input 
                                                type="number" 
                                                value={formData.bulkConfig?.conversionFactor ?? ''} 
                                                onChange={handleFactorChange}
                                                className={`${inputBaseClasses} text-center font-bold text-lg ${factorError ? 'border-rose-500 ring-rose-500/20' : ''}`}
                                            />
                                            {factorError ? (
                                                <p className="text-xs text-rose-500 mt-1 flex items-center"><AlertCircle className="w-3 h-3 mr-1"/> {factorError}</p>
                                            ) : equivalenceText ? (
                                                <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-2 font-bold text-center">{equivalenceText}</p>
                                            ) : null}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="h-20 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-center bg-slate-50/50 dark:bg-slate-800/30">
                                        <p className="text-sm text-slate-400 dark:text-slate-500">Deshabilitado</p>
                                    </div>
                                )}
                            </div>
                            
                            {/* Card: Agronomic */}
                            <div className="bg-white dark:bg-slate-900 p-7 rounded-2xl shadow-lg border-l-4 border-l-emerald-500 border-y border-r border-slate-200 dark:border-slate-800 hover:shadow-2xl transition-all duration-300 relative">
                                <SectionHeader icon={FlaskConical} title="Clasificación Agronómica" color="text-emerald-600 dark:text-emerald-400" bg="bg-emerald-100 dark:bg-emerald-900/30" />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                                    <div>
                                        <Label>Ingrediente Activo</Label>
                                        <input type="text" value={formData.activeIngredient || ''} onChange={e => setFormData({...formData, activeIngredient: e.target.value})} className={inputBaseClasses} placeholder="Ej. Glifosato" />
                                    </div>
                                    <div>
                                        <Label>Porcentaje de I.A.</Label>
                                        <div className="relative">
                                            <input type="number" value={formData.iaPercent || 0} onChange={e => setFormData({...formData, iaPercent: Number(e.target.value)})} className={`${inputBaseClasses} pr-10`} placeholder="Ej. 35.6" />
                                            <Percent className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                             {/* Card: Documentation */}
                            <div className="bg-white dark:bg-slate-900 p-7 rounded-2xl shadow-lg border-l-4 border-l-sky-500 border-y border-r border-slate-200 dark:border-slate-800 hover:shadow-2xl transition-all duration-300 relative">
                               <SectionHeader icon={FileText} title="Documentación" color="text-sky-600 dark:text-sky-400" bg="bg-sky-100 dark:bg-sky-900/30" />
                               <div className="space-y-4 mt-6">
                                    <div>
                                        <Label>Ficha Técnica (URL)</Label>
                                        <div className="relative">
                                            <Link className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <input type="url" value={formData.techSheetUrl || ''} onChange={e => setFormData({...formData, techSheetUrl: e.target.value})} className={`${inputBaseClasses} pl-10`} placeholder="https://..." />
                                        </div>
                                    </div>
                                    <div>
                                        <Label>Guía de Aplicación (URL)</Label>
                                         <div className="relative">
                                            <Link className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <input type="url" value={formData.applicationGuideUrl || ''} onChange={e => setFormData({...formData, applicationGuideUrl: e.target.value})} className={`${inputBaseClasses} pl-10`} placeholder="https://..." />
                                        </div>
                                    </div>
                               </div>
                            </div>

                        </div>
                        
                        {/* Right Column (Fiscal Data) */}
                        <div className="lg:col-span-2 space-y-8">
                             {/* Card: Fiscal SAT */}
                             <div className="bg-white dark:bg-slate-900 p-7 rounded-2xl shadow-lg border-l-4 border-l-rose-500 border-y border-r border-slate-200 dark:border-slate-800 hover:shadow-2xl transition-all duration-300 relative">
                                <SectionHeader icon={Landmark} title="Clasificación Fiscal (SAT 4.0)" color="text-rose-600 dark:text-rose-400" bg="bg-rose-100 dark:bg-rose-900/30" />
                                <div className="space-y-5 mt-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <Label>Clave Producto/Servicio</Label>
                                            <SatKeySearch onSelect={(item: any) => setFormData({...formData, satKey: item.code})} initialValue={formData.satKey}/>
                                        </div>
                                         <div>
                                            <Label>Clave de Unidad</Label>
                                            <SatUnitSearch onSelect={(item: any) => setFormData({...formData, satUnitKey: item.code})} initialValue={formData.satUnitKey}/>
                                        </div>
                                    </div>
                                    <div>
                                        <Label>Objeto de Impuesto</Label>
                                        <select
                                            value={formData.taxObject ?? ''}
                                            onChange={e => {
                                                const val = e.target.value;
                                                setFormData({
                                                    ...formData,
                                                    taxObject: val === '' ? null : val
                                                });
                                            }}
                                            className={inputBaseClasses}
                                        >
                                            <option value="">— Seleccionar —</option>
                                            <option value="01">01 - No objeto de impuesto.</option>
                                            <option value="02">02 - Sí objeto de impuesto.</option>
                                            <option value="03">03 - Sí objeto del impuesto y no obligado al desglose.</option>
                                            <option value="04">04 - Sí objeto del impuesto y no causa impuesto.</option>
                                        </select>
                                    </div>
                                     <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label>Tasa de IVA</Label>
                                            <select
                                                value={formData.ivaRate ?? ''}
                                                onChange={e => {
                                                    const val = e.target.value;
                                                    if (val === '') {
                                                        setFormData({ ...formData, ivaRate: null });
                                                    } else {
                                                        setFormData({ ...formData, ivaRate: Number(val) });
                                                    }
                                                }}
                                                className={inputBaseClasses}
                                            >
                                                <option value="">— Seleccionar —</option>
                                                <option value="0.16">16% General</option>
                                                <option value="0.08">8% Fronterizo</option>
                                                <option value="0">0% Tasa Cero</option>
                                                <option value="-1">Exento</option>
                                            </select>
                                        </div>
                                         <div>
                                            <Label>Tasa de IEPS</Label>
                                            <input type="number" step="0.01" value={formData.iepsRate ?? ''} onChange={e => setFormData({...formData, iepsRate: e.target.value === '' ? 0 : Number(e.target.value)})} className={inputBaseClasses} />
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6 pt-2">
                                        <label className="flex items-center cursor-pointer">
                                            <input type="checkbox" checked={formData.retentionIva} onChange={e => setFormData({...formData, retentionIva: e.target.checked})} className="h-4 w-4 rounded text-indigo-600" />
                                            <span className="ml-2 text-sm text-slate-700 dark:text-slate-300">Aplica Retención de IVA</span>
                                        </label>
                                         <label className="flex items-center cursor-pointer">
                                            <input type="checkbox" checked={formData.retentionIsr} onChange={e => setFormData({...formData, retentionIsr: e.target.checked})} className="h-4 w-4 rounded text-indigo-600" />
                                            <span className="ml-2 text-sm text-slate-700 dark:text-slate-300">Aplica Retención de ISR</span>
                                        </label>
                                    </div>
                                </div>
                             </div>
                        </div>

                    </div>
                </div>

                {/* Footer */}
                <div className="px-8 py-5 bg-white dark:bg-slate-900 border-t border-slate-200 flex justify-end gap-3 shrink-0 z-10 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.05)]">
                    <button onClick={onClose} className="px-6 py-2.5 text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">Cancelar</button>
                    <button onClick={handleSaveClick} className="px-8 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 dark:shadow-none flex items-center transition-all active:scale-95">
                        <Save className="w-4 h-4 mr-2" /> Guardar Producto
                    </button>
                </div>
            </div>
        </div>
    );
};