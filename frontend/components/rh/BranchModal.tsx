
import React, { useState, useEffect } from 'react';
import { X, Save, Building2, MapPin, Phone, Mail, User, Clock, Sparkles } from 'lucide-react';
import { Branch } from '../../types';

interface BranchModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (branch: Branch) => void;
    initialData?: Branch | null;
}

const INITIAL_STATE: Partial<Branch> = {
    name: '',
    code: '',
    status: 'Activa',
    manager: '',
    phone: '',
    email: '',
    schedule: '',
    street: '',
    colony: '',
    city: '',
    state: '',
    zipCode: ''
};

export const BranchModal: React.FC<BranchModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
    const [formData, setFormData] = useState<Partial<Branch>>(INITIAL_STATE);

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setFormData({
                    name: initialData.name ?? INITIAL_STATE.name,
                    code: initialData.code ?? INITIAL_STATE.code,
                    status: initialData.status ?? INITIAL_STATE.status,
                    manager: initialData.manager ?? INITIAL_STATE.manager,
                    phone: initialData.phone ?? INITIAL_STATE.phone,
                    email: initialData.email ?? INITIAL_STATE.email,
                    schedule: initialData.schedule ?? INITIAL_STATE.schedule,
                    street: initialData.street ?? INITIAL_STATE.street,
                    colony: initialData.colony ?? INITIAL_STATE.colony,
                    city: initialData.city ?? INITIAL_STATE.city,
                    state: initialData.state ?? INITIAL_STATE.state,
                    zipCode: initialData.zipCode ?? INITIAL_STATE.zipCode,
                });
            } else {
                setFormData(INITIAL_STATE);
            }
        }
    }, [isOpen, initialData]);

    if (!isOpen) return null;

    const handleChange = (field: keyof Branch, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleGenerateCode = () => {
        if (!formData.name) return;
        const code = formData.name.substring(0, 3).toUpperCase() + '-' + Math.floor(100 + Math.random() * 900);
        handleChange('code', code);
    };

    const handleSave = () => {
        if (!formData.name || !formData.street || !formData.city) {
            alert('Por favor complete los campos obligatorios (Nombre, Calle, Ciudad).');
            return;
        }
        
        const fullAddress = `${formData.street}, ${formData.colony}, ${formData.city}, ${formData.state} ${formData.zipCode}`;
        
        const branch: Branch = {
            ...formData as Branch,
            id: initialData?.id || `BR-${Date.now()}`,
            address: fullAddress
        };
        onSave(branch);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl flex flex-col max-h-[90vh] animate-in zoom-in-95">
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-white rounded-t-xl">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">{initialData ? 'Editar Sucursal' : 'Nueva Sucursal'}</h2>
                        <p className="text-sm text-slate-500">Gestión de centros de trabajo y puntos de venta</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full"><X className="w-5 h-5 text-slate-400" /></button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        
                        {/* General Info */}
                        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                            <h3 className="text-sm font-bold text-indigo-900 flex items-center uppercase tracking-wide mb-2">
                                <Building2 className="w-4 h-4 mr-2" /> Información General
                            </h3>
                            
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nombre de la Sucursal *</label>
                                <input 
                                    type="text" 
                                    value={formData.name} 
                                    onChange={e => handleChange('name', e.target.value)} 
                                    className="w-full p-2.5 border border-slate-200 rounded-lg focus:border-indigo-500 outline-none font-medium"
                                    placeholder="Ej. Sucursal Centro"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Código Interno</label>
                                    <div className="relative">
                                        <input 
                                            type="text" 
                                            value={formData.code} 
                                            onChange={e => handleChange('code', e.target.value)} 
                                            className="w-full p-2.5 border border-slate-200 rounded-lg focus:border-indigo-500 outline-none font-mono uppercase"
                                            placeholder="SUC-001"
                                        />
                                        {!formData.code && (
                                            <button 
                                                onClick={handleGenerateCode}
                                                className="absolute right-2 top-1/2 -translate-y-1/2 text-indigo-600 hover:bg-indigo-50 p-1 rounded"
                                                title="Generar código"
                                            >
                                                <Sparkles className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Estatus</label>
                                    <select 
                                        value={formData.status} 
                                        onChange={e => handleChange('status', e.target.value)} 
                                        className="w-full p-2.5 border border-slate-200 rounded-lg bg-white"
                                    >
                                        <option value="Activa">Activa</option>
                                        <option value="Inactiva">Inactiva</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Responsable / Gerente</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input 
                                        type="text" 
                                        value={formData.manager} 
                                        onChange={e => handleChange('manager', e.target.value)} 
                                        className="w-full pl-9 p-2.5 border border-slate-200 rounded-lg focus:border-indigo-500 outline-none"
                                        placeholder="Nombre del encargado"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Contact Info */}
                        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                            <h3 className="text-sm font-bold text-indigo-900 flex items-center uppercase tracking-wide mb-2">
                                <Phone className="w-4 h-4 mr-2" /> Contacto y Horario
                            </h3>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Teléfono</label>
                                    <input 
                                        type="tel" 
                                        value={formData.phone} 
                                        onChange={e => handleChange('phone', e.target.value)} 
                                        className="w-full p-2.5 border border-slate-200 rounded-lg focus:border-indigo-500 outline-none"
                                        placeholder="443-000-0000"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email</label>
                                    <input 
                                        type="email" 
                                        value={formData.email} 
                                        onChange={e => handleChange('email', e.target.value)} 
                                        className="w-full p-2.5 border border-slate-200 rounded-lg focus:border-indigo-500 outline-none"
                                        placeholder="sucursal@empresa.com"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Horario de Atención</label>
                                <div className="relative">
                                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input 
                                        type="text" 
                                        value={formData.schedule} 
                                        onChange={e => handleChange('schedule', e.target.value)} 
                                        className="w-full pl-9 p-2.5 border border-slate-200 rounded-lg focus:border-indigo-500 outline-none"
                                        placeholder="Lunes a Viernes 9:00 - 18:00"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Location Info - Full Width */}
                        <div className="md:col-span-2 bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                            <h3 className="text-sm font-bold text-indigo-900 flex items-center uppercase tracking-wide mb-2">
                                <MapPin className="w-4 h-4 mr-2" /> Ubicación
                            </h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Calle y Número *</label>
                                    <input 
                                        type="text" 
                                        value={formData.street} 
                                        onChange={e => handleChange('street', e.target.value)} 
                                        className="w-full p-2.5 border border-slate-200 rounded-lg focus:border-indigo-500 outline-none"
                                        placeholder="Av. Principal #123"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Colonia</label>
                                    <input 
                                        type="text" 
                                        value={formData.colony} 
                                        onChange={e => handleChange('colony', e.target.value)} 
                                        className="w-full p-2.5 border border-slate-200 rounded-lg focus:border-indigo-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Municipio / Ciudad *</label>
                                    <input 
                                        type="text" 
                                        value={formData.city} 
                                        onChange={e => handleChange('city', e.target.value)} 
                                        className="w-full p-2.5 border border-slate-200 rounded-lg focus:border-indigo-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Estado</label>
                                    <input 
                                        type="text" 
                                        value={formData.state} 
                                        onChange={e => handleChange('state', e.target.value)} 
                                        className="w-full p-2.5 border border-slate-200 rounded-lg focus:border-indigo-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Código Postal</label>
                                    <input 
                                        type="text" 
                                        value={formData.zipCode} 
                                        onChange={e => handleChange('zipCode', e.target.value)} 
                                        className="w-full p-2.5 border border-slate-200 rounded-lg focus:border-indigo-500 outline-none"
                                        placeholder="00000"
                                    />
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-white border-t border-slate-200 flex justify-end gap-3 rounded-b-xl">
                    <button onClick={onClose} className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 font-medium hover:bg-slate-50 transition-colors">Cancelar</button>
                    <button onClick={handleSave} className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition-colors flex items-center">
                        <Save className="w-4 h-4 mr-2" /> Guardar Sucursal
                    </button>
                </div>
            </div>
        </div>
    );
};
