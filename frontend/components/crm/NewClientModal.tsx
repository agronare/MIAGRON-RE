
import React, { useState, useEffect } from 'react';
import { 
    X, Save, User, Sprout, CreditCard, MapPin, 
    Phone, Mail, FileText, CheckCircle2, ScanFace, 
    Tractor, Building2, Hash, Globe, Plus, Smartphone,
    AlignLeft, Fingerprint, ChevronDown, AlertCircle, Info,
    Map
} from 'lucide-react';
import { Client } from '../../types';

interface NewClientModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (client: Client) => void;
    initialData?: Client;
}

// --- SAT CATALOGS ---
const SAT_REGIMES = [
    { code: '601', description: 'General de Ley Personas Morales' },
    { code: '603', description: 'Personas Morales con Fines no Lucrativos' },
    { code: '605', description: 'Sueldos y Salarios e Ingresos Asimilados a Salarios' },
    { code: '606', description: 'Arrendamiento' },
    { code: '607', description: 'Régimen de Enajenación o Adquisición de Bienes' },
    { code: '608', description: 'Demás ingresos' },
    { code: '610', description: 'Residentes en el Extranjero sin Establecimiento Permanente en México' },
    { code: '611', description: 'Ingresos por Dividendos (socios y accionistas)' },
    { code: '612', description: 'Personas Físicas con Actividades Empresariales y Profesionales' },
    { code: '614', description: 'Ingresos por intereses' },
    { code: '615', description: 'Régimen de los ingresos por obtención de premios' },
    { code: '616', description: 'Sin obligaciones fiscales' },
    { code: '620', description: 'Sociedades Cooperativas de Producción que optan por diferir sus ingresos' },
    { code: '621', description: 'Incorporación Fiscal' },
    { code: '622', description: 'Actividades Agrícolas, Ganaderas, Silvícolas y Pesqueras' },
    { code: '623', description: 'Opcional para Grupos de Sociedades' },
    { code: '624', description: 'Coordinados' },
    { code: '625', description: 'Régimen de las Actividades Empresariales con ingresos a través de Plataformas Tecnológicas' },
    { code: '626', description: 'Régimen Simplificado de Confianza' }
];

const SAT_CFDI_USES = [
    { code: 'G01', description: 'Adquisición de mercancías' },
    { code: 'G02', description: 'Devoluciones, descuentos o bonificaciones' },
    { code: 'G03', description: 'Gastos en general' },
    { code: 'I01', description: 'Construcciones' },
    { code: 'I02', description: 'Mobiliario y equipo de oficina por inversiones' },
    { code: 'I03', description: 'Equipo de transporte' },
    { code: 'I04', description: 'Equipo de computo y accesorios' },
    { code: 'I05', description: 'Dados, troqueles, moldes, matrices y herramental' },
    { code: 'I06', description: 'Comunicaciones telefónicas' },
    { code: 'I07', description: 'Comunicaciones satelitales' },
    { code: 'I08', description: 'Otra maquinaria y equipo' },
    { code: 'D01', description: 'Honorarios médicos, dentales y gastos hospitalarios' },
    { code: 'D02', description: 'Gastos médicos por incapacidad o discapacidad' },
    { code: 'D03', description: 'Gastos funerales' },
    { code: 'D04', description: 'Donativos' },
    { code: 'D05', description: 'Intereses reales efectivamente pagados por créditos hipotecarios (casa habitación)' },
    { code: 'D06', description: 'Aportaciones voluntarias al SAR' },
    { code: 'D07', description: 'Primas por seguros de gastos médicos' },
    { code: 'D08', description: 'Gastos de transportación escolar obligatoria' },
    { code: 'D09', description: 'Depósitos en cuentas para el ahorro, primas que tengan como base planes de pensiones' },
    { code: 'D10', description: 'Pagos por servicios educativos (colegiaturas)' },
    { code: 'S01', description: 'Sin efectos fiscales' },
    { code: 'CP01', description: 'Pagos' },
    { code: 'CN01', description: 'Nómina' }
];

const INITIAL_STATE: Partial<Client> = {
    name: '',
    contactName: '',
    description: '',
    email: '',
    phone: '',
    mobile: '',
    rfc: '',
    status: 'Activo',
    creditLimit: 0,
    currentDebt: 0,
    isFarmer: false,
    hasCredit: false,
    mileage: 0,
    address: {
        street: '',
        exteriorNo: '',
        interiorNo: '',
        colony: '',
        zipCode: '',
        municipality: '',
        state: '',
        country: 'México'
    },
    coordinates: undefined // Start undefined
};

export const NewClientModal: React.FC<NewClientModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
    const [activeTab, setActiveTab] = useState<'general' | 'agricultural' | 'credit' | 'fiscal'>('general');
    const [formData, setFormData] = useState<Partial<Client>>(INITIAL_STATE);
    const [generatedId, setGeneratedId] = useState('');
    
    // Temp state for coordinates to make editing easier
    const [latInput, setLatInput] = useState('');
    const [lngInput, setLngInput] = useState('');

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setFormData({
                    name: initialData.name ?? INITIAL_STATE.name,
                    contactName: initialData.contactName ?? INITIAL_STATE.contactName,
                    description: initialData.description ?? INITIAL_STATE.description,
                    email: initialData.email ?? INITIAL_STATE.email,
                    phone: initialData.phone ?? INITIAL_STATE.phone,
                    mobile: initialData.mobile ?? INITIAL_STATE.mobile,
                    rfc: initialData.rfc ?? INITIAL_STATE.rfc,
                    status: initialData.status ?? INITIAL_STATE.status,
                    creditLimit: initialData.creditLimit ?? INITIAL_STATE.creditLimit,
                    currentDebt: initialData.currentDebt ?? INITIAL_STATE.currentDebt,
                    isFarmer: initialData.isFarmer ?? INITIAL_STATE.isFarmer,
                    hasCredit: initialData.hasCredit ?? INITIAL_STATE.hasCredit,
                    mileage: initialData.mileage ?? INITIAL_STATE.mileage,
                    address: {
                        street: initialData.address?.street ?? INITIAL_STATE.address!.street,
                        exteriorNo: initialData.address?.exteriorNo ?? INITIAL_STATE.address!.exteriorNo,
                        interiorNo: initialData.address?.interiorNo ?? INITIAL_STATE.address!.interiorNo,
                        colony: initialData.address?.colony ?? INITIAL_STATE.address!.colony,
                        zipCode: initialData.address?.zipCode ?? INITIAL_STATE.address!.zipCode,
                        municipality: initialData.address?.municipality ?? INITIAL_STATE.address!.municipality,
                        state: initialData.address?.state ?? INITIAL_STATE.address!.state,
                        country: initialData.address?.country ?? INITIAL_STATE.address!.country,
                    },
                    coordinates: initialData.coordinates ?? INITIAL_STATE.coordinates,
                });
                setGeneratedId(initialData.id);
                setLatInput(initialData.coordinates?.lat.toString() || '');
                setLngInput(initialData.coordinates?.lng.toString() || '');
            } else {
                setFormData(INITIAL_STATE);
                setGeneratedId(`AG-${Math.floor(Math.random() * 1000000)}`);
                setLatInput('');
                setLngInput('');
            }
            setActiveTab('general');
        }
    }, [isOpen, initialData]);

    if (!isOpen) return null;

    const handleSave = () => {
        if (!formData.name) {
            alert('El nombre comercial es obligatorio');
            return;
        }
        const newClient = { ...formData, id: generatedId } as Client;
        
        // Process coordinates
        if (latInput && lngInput) {
            newClient.coordinates = { lat: parseFloat(latInput), lng: parseFloat(lngInput) };
        } else {
            newClient.coordinates = undefined;
        }

        // Ensure currentDebt is preserved if editing, or 0 if new
        if (!initialData) {
            newClient.currentDebt = 0;
        }
        onSave(newClient);
        if (!initialData) {
            setFormData(INITIAL_STATE);
        }
        onClose();
    };

    const updateField = (field: keyof Client, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const updateAddress = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, address: { ...prev.address!, [field]: value } }));
    };

    const TabButton = ({ id, label, icon: Icon }: { id: string, label: string, icon: any }) => (
        <button
            onClick={() => setActiveTab(id as any)}
            className={`flex items-center px-6 py-4 text-sm font-medium transition-all border-b-2 ${
                activeTab === id 
                ? 'border-indigo-600 text-indigo-600 bg-indigo-50/30' 
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            }`}
        >
            <Icon className={`w-4 h-4 mr-2 ${activeTab === id ? 'text-indigo-600' : 'text-slate-400'}`} />
            {label}
        </button>
    );

    return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 transition-all">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl flex flex-col overflow-hidden animate-in zoom-in-95 max-h-[90vh]">
                
                {/* Header */}
                <div className="px-8 py-5 border-b border-slate-100 flex justify-between items-center bg-white">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">{initialData ? 'Editar Cliente' : 'Nuevo Cliente'}</h2>
                        <p className="text-sm text-slate-500">Complete la información para el alta en CRM y ERP.</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                        <X className="w-5 h-5 text-slate-400" />
                    </button>
                </div>

                {/* Horizontal Tabs */}
                <div className="flex border-b border-slate-200 bg-white px-2">
                    <TabButton id="general" label="General y Contacto" icon={User} />
                    <TabButton id="agricultural" label="Perfil Agrícola" icon={Sprout} />
                    <TabButton id="credit" label="Crédito y Verificación" icon={CreditCard} />
                    <TabButton id="fiscal" label="Datos Fiscales" icon={Building2} />
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50">
                    
                    {activeTab === 'general' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Nombre Comercial *</label>
                                    <input 
                                        type="text" 
                                        value={formData.name} 
                                        onChange={e => updateField('name', e.target.value)} 
                                        className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none bg-white font-medium text-slate-900"
                                        placeholder="Ej. Agroindustrias del Norte"
                                        autoFocus
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">ID de Cliente</label>
                                    <input 
                                        type="text" 
                                        value={generatedId} 
                                        readOnly
                                        className="w-full p-3 border border-slate-200 rounded-xl bg-slate-100 text-slate-500 cursor-not-allowed"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Descripción / Apodo (Opcional)</label>
                                    <input 
                                        type="text" 
                                        value={formData.description || ''} 
                                        onChange={e => updateField('description', e.target.value)} 
                                        className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none bg-white"
                                        placeholder="Ej. El Inge de los tomates"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Nombre de Contacto</label>
                                    <input 
                                        type="text" 
                                        value={formData.contactName} 
                                        onChange={e => updateField('contactName', e.target.value)} 
                                        className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none bg-white"
                                        placeholder="Nombre completo de la persona"
                                    />
                                </div>
                            </div>

                            <div className="border-t border-slate-200 my-6"></div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Teléfono</label>
                                    <div className="relative">
                                        <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input 
                                            type="tel" 
                                            value={formData.phone || ''} 
                                            onChange={e => updateField('phone', e.target.value)} 
                                            className="w-full pl-10 p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none bg-white"
                                            placeholder="55-1234-5678"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Número Móvil (Opcional)</label>
                                    <div className="relative">
                                        <Smartphone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input 
                                            type="tel" 
                                            value={formData.mobile || ''} 
                                            onChange={e => updateField('mobile', e.target.value)} 
                                            className="w-full pl-10 p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none bg-white"
                                            placeholder="WhatsApp preferido"
                                        />
                                    </div>
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Email</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input 
                                            type="email" 
                                            value={formData.email || ''} 
                                            onChange={e => updateField('email', e.target.value)} 
                                            className="w-full pl-10 p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none bg-white"
                                            placeholder="correo@cliente.com"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'agricultural' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                            {/* Agricultural Data Section */}
                            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-amber-100 p-2 rounded-lg text-amber-600">
                                            <Tractor className="w-5 h-5" />
                                        </div>
                                        <h3 className="font-bold text-slate-900 uppercase tracking-wide text-sm">Datos Agrícolas</h3>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm font-medium text-slate-700">¿Es cliente agricultor?</span>
                                        <button 
                                            onClick={() => updateField('isFarmer', !formData.isFarmer)}
                                            className={`w-12 h-6 rounded-full p-1 transition-colors ${formData.isFarmer ? 'bg-amber-500' : 'bg-slate-200'}`}
                                        >
                                            <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${formData.isFarmer ? 'translate-x-6' : 'translate-x-0'}`}></div>
                                        </button>
                                    </div>
                                </div>

                                {formData.isFarmer ? (
                                    <div className="space-y-6 animate-in fade-in slide-in-from-top-2">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Cultivo Principal</label>
                                                <input 
                                                    type="text" 
                                                    value={formData.mainCrop || ''} 
                                                    onChange={e => updateField('mainCrop', e.target.value)} 
                                                    placeholder="Ej. Maíz, Berries, Aguacate"
                                                    className="w-full p-3 border border-slate-200 rounded-xl focus:border-amber-500 outline-none bg-white"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Superficie (ha)</label>
                                                <input 
                                                    type="number" 
                                                    value={formData.cultivatedArea || 0} 
                                                    onChange={e => updateField('cultivatedArea', Number(e.target.value))} 
                                                    className="w-full p-3 border border-slate-200 rounded-xl focus:border-amber-500 outline-none bg-white"
                                                    placeholder="0"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Otros Cultivos</label>
                                            <div className="flex gap-2">
                                                <div className="relative flex-1">
                                                    <input 
                                                        type="text"
                                                        placeholder="Agregar cultivo..."
                                                        className="w-full p-3 border border-slate-200 rounded-xl focus:border-amber-500 outline-none bg-white"
                                                    />
                                                </div>
                                                <button className="bg-amber-500 hover:bg-amber-600 text-white p-3 rounded-xl transition-colors shadow-sm">
                                                    <Plus className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="h-24 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center bg-slate-50/50 text-slate-400 text-sm">
                                        Habilite la opción para ingresar datos de siembra.
                                    </div>
                                )}
                            </div>

                            {/* Logistics Section */}
                            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                                        <MapPin className="w-5 h-5" />
                                    </div>
                                    <h3 className="font-bold text-slate-900 uppercase tracking-wide text-sm">Logística y Ubicación</h3>
                                </div>
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Ubicación (Ciudad/Municipio)</label>
                                        <div className="relative">
                                            <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <input 
                                                type="text" 
                                                value={formData.location || ''} 
                                                onChange={e => updateField('location', e.target.value)} 
                                                placeholder="Ej: Uruapan, Queréndaro"
                                                className="w-full pl-10 p-3 border border-slate-200 rounded-xl focus:border-blue-500 outline-none bg-white"
                                            />
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Latitud (GPS)</label>
                                            <input 
                                                type="number" 
                                                value={latInput}
                                                onChange={e => setLatInput(e.target.value)} 
                                                className="w-full p-3 border border-slate-200 rounded-xl focus:border-blue-500 outline-none bg-white"
                                                placeholder="Ej: 19.4326"
                                                step="any"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Longitud (GPS)</label>
                                            <input 
                                                type="number" 
                                                value={lngInput}
                                                onChange={e => setLngInput(e.target.value)} 
                                                className="w-full p-3 border border-slate-200 rounded-xl focus:border-blue-500 outline-none bg-white"
                                                placeholder="Ej: -99.1332"
                                                step="any"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Kilometraje Manual (Ida y Vuelta)</label>
                                        <input 
                                            type="number" 
                                            value={formData.mileage || 0} 
                                            onChange={e => updateField('mileage', Number(e.target.value))} 
                                            className="w-full p-3 border border-slate-200 rounded-xl focus:border-blue-500 outline-none bg-white"
                                            placeholder="0"
                                        />
                                        <p className="text-xs text-slate-400 mt-1.5 ml-1">
                                            Opcional: Dejar en 0 para cálculo automático de distancia.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'credit' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                                <div className="flex justify-between items-center mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600">
                                            <CreditCard className="w-5 h-5" />
                                        </div>
                                        <h3 className="font-bold text-slate-900 uppercase tracking-wide text-sm">Crédito y Verificación</h3>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm font-medium text-slate-700">Habilitar Crédito</span>
                                        <button 
                                            onClick={() => updateField('hasCredit', !formData.hasCredit)}
                                            className={`w-12 h-6 rounded-full p-1 transition-colors ${formData.hasCredit ? 'bg-indigo-600' : 'bg-slate-200'}`}
                                        >
                                            <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${formData.hasCredit ? 'translate-x-6' : 'translate-x-0'}`}></div>
                                        </button>
                                    </div>
                                </div>

                                {formData.hasCredit && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-top-2 items-start">
                                        <div className="p-6 bg-slate-50 rounded-xl border border-slate-200 flex flex-col items-center justify-center text-center gap-3 h-full min-h-[120px]">
                                            <ScanFace className="w-8 h-8 text-slate-400" />
                                            <button className="px-4 py-2 bg-white border border-slate-300 text-slate-700 text-sm font-bold rounded-lg hover:bg-slate-50 hover:border-slate-400 transition-all shadow-sm flex items-center gap-2">
                                                <Fingerprint className="w-4 h-4" /> Verificar Identidad con INE
                                            </button>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Límite de Crédito ($)</label>
                                            <div className="relative">
                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                                                <input 
                                                    type="number" 
                                                    value={formData.creditLimit || ''} 
                                                    onChange={e => updateField('creditLimit', Number(e.target.value))} 
                                                    className="w-full pl-8 p-4 border border-slate-200 rounded-xl text-xl font-bold text-slate-800 focus:border-indigo-500 outline-none bg-white"
                                                    placeholder="0.00"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'fiscal' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                                <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center">
                                    <Building2 className="w-5 h-5 mr-2 text-indigo-600" /> Datos Fiscales (SAT 4.0)
                                </h3>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">RFC</label>
                                        <input 
                                            type="text" 
                                            value={formData.rfc || ''} 
                                            onChange={e => updateField('rfc', e.target.value.toUpperCase())} 
                                            className="w-full p-3 border border-slate-200 rounded-xl uppercase font-mono focus:border-indigo-500 outline-none"
                                            placeholder="XAXX010101000"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Razón Social (Sin Régimen)</label>
                                        <input 
                                            type="text" 
                                            value={formData.fiscalName || ''} 
                                            onChange={e => updateField('fiscalName', e.target.value.toUpperCase())} 
                                            className="w-full p-3 border border-slate-200 rounded-xl uppercase focus:border-indigo-500 outline-none"
                                            placeholder="TAL CUAL APARECE EN CONSTANCIA"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Régimen Fiscal</label>
                                        <div className="relative">
                                            <select 
                                                value={formData.fiscalRegime || ''} 
                                                onChange={e => updateField('fiscalRegime', e.target.value)} 
                                                className="w-full p-3 border border-slate-200 rounded-xl bg-white focus:border-indigo-500 outline-none text-sm appearance-none cursor-pointer"
                                            >
                                                <option value="">Seleccionar...</option>
                                                {SAT_REGIMES.map(reg => (
                                                    <option key={reg.code} value={reg.code}>{reg.code} - {reg.description}</option>
                                                ))}
                                            </select>
                                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Uso de CFDI</label>
                                        <div className="relative">
                                            <select 
                                                value={formData.cfdiUse || ''} 
                                                onChange={e => updateField('cfdiUse', e.target.value)} 
                                                className="w-full p-3 border border-slate-200 rounded-xl bg-white focus:border-indigo-500 outline-none text-sm appearance-none cursor-pointer"
                                            >
                                                <option value="">Seleccionar...</option>
                                                {SAT_CFDI_USES.map(use => (
                                                    <option key={use.code} value={use.code}>{use.code} - {use.description}</option>
                                                ))}
                                            </select>
                                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t border-slate-100 pt-6">
                                    <h4 className="font-bold text-slate-800 text-sm mb-4">Domicilio Fiscal</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Código Postal</label>
                                            <input type="text" value={formData.address?.zipCode || ''} onChange={e => updateAddress('zipCode', e.target.value)} className="w-full p-2.5 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none" />
                                        </div>
                                        <div className="md:col-span-3">
                                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Calle</label>
                                            <input type="text" value={formData.address?.street || ''} onChange={e => updateAddress('street', e.target.value)} className="w-full p-2.5 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none" />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">No. Exterior</label>
                                            <input type="text" value={formData.address?.exteriorNo || ''} onChange={e => updateAddress('exteriorNo', e.target.value)} className="w-full p-2.5 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none" />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">No. Interior</label>
                                            <input type="text" value={formData.address?.interiorNo || ''} onChange={e => updateAddress('interiorNo', e.target.value)} className="w-full p-2.5 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none" />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Colonia</label>
                                            <input type="text" value={formData.address?.colony || ''} onChange={e => updateAddress('colony', e.target.value)} className="w-full p-2.5 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none" />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Municipio</label>
                                            <input type="text" value={formData.address?.municipality || ''} onChange={e => updateAddress('municipality', e.target.value)} className="w-full p-2.5 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none" />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Estado</label>
                                            <input type="text" value={formData.address?.state || ''} onChange={e => updateAddress('state', e.target.value)} className="w-full p-2.5 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                </div>

                {/* Footer */}
                <div className="px-8 py-5 bg-white border-t border-slate-200 flex justify-end gap-3">
                    <button onClick={onClose} className="px-6 py-2.5 text-slate-600 font-medium hover:bg-slate-50 rounded-xl transition-colors">Cancelar</button>
                    <button onClick={handleSave} className="px-8 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 flex items-center transition-all active:scale-95">
                        <Save className="w-4 h-4 mr-2" /> Guardar Cliente
                    </button>
                </div>
            </div>
        </div>
    );
};
