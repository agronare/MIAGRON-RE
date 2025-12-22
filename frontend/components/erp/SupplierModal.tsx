import React, { useState, useEffect } from 'react';
import { X, Save, Building, User, Phone, Mail, Hash, Truck, CreditCard, ToggleLeft, ToggleRight } from 'lucide-react';
import { Supplier } from '../../types';

interface SupplierModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (supplier: Supplier) => void;
    initialData: Supplier | null;
}

const defaultSupplier: Partial<Supplier> = {
    companyName: '',
    contactName: '',
    phone: '',
    mobile: '',
    email: '',
    rfc: '',
    mileage: 0,
    hasCredit: false,
    creditLimit: 0,
};

export const SupplierModal: React.FC<SupplierModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
    const [formData, setFormData] = useState<Partial<Supplier>>(defaultSupplier);

    useEffect(() => {
        if (isOpen) {
            setFormData(initialData ? { ...defaultSupplier, ...initialData } : defaultSupplier);
        }
    }, [initialData, isOpen]);

    if (!isOpen) return null;

    const handleSave = () => {
        onSave(formData as Supplier);
    };

    const handleChange = (field: keyof Supplier, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh]">
                <div className="p-6 border-b flex justify-between items-center">
                    <h2 className="text-xl font-bold text-slate-900">{initialData ? 'Editar' : 'Nuevo'} Proveedor</h2>
                    <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-full"><X className="w-5 h-5 text-slate-500" /></button>
                </div>
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    <div>
                        <label className="text-sm font-medium">Nombre de la Empresa</label>
                        <div className="relative mt-1">
                            <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input type="text" value={formData.companyName || ''} onChange={e => handleChange('companyName', e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-lg" />
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium">Nombre del Contacto</label>
                            <div className="relative mt-1">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input type="text" value={formData.contactName || ''} onChange={e => handleChange('contactName', e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-lg" />
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-medium">Teléfono Fijo</label>
                            <div className="relative mt-1">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input type="tel" value={formData.phone || ''} onChange={e => handleChange('phone', e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-lg" />
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-medium">Número Móvil</label>
                            <div className="relative mt-1">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input type="tel" value={formData.mobile || ''} onChange={e => handleChange('mobile', e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-lg" />
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-medium">Correo Electrónico</label>
                            <div className="relative mt-1">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input type="email" value={formData.email || ''} onChange={e => handleChange('email', e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-lg" />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium">RFC (Opcional)</label>
                            <div className="relative mt-1">
                                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input type="text" value={formData.rfc || ''} onChange={e => handleChange('rfc', e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-lg" />
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-medium">Kilometraje Ida y Vuelta</label>
                             <div className="relative mt-1">
                                <Truck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input type="number" value={formData.mileage || ''} onChange={e => handleChange('mileage', Number(e.target.value))} className="w-full pl-10 pr-4 py-2 border rounded-lg" />
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-slate-50 p-4 rounded-lg border">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center">
                                <CreditCard className="w-4 h-4 mr-2 text-indigo-600" />
                                <label className="text-sm font-medium">Ofrece Crédito</label>
                            </div>
                            <button onClick={() => handleChange('hasCredit', !formData.hasCredit)}>
                                {formData.hasCredit ? <ToggleRight className="w-8 h-8 text-emerald-500" /> : <ToggleLeft className="w-8 h-8 text-slate-300" />}
                            </button>
                        </div>
                        {formData.hasCredit && (
                            <div className="mt-4 animate-in fade-in">
                                <label className="text-sm font-medium">Límite de Crédito</label>
                                <input type="number" value={formData.creditLimit || ''} onChange={e => handleChange('creditLimit', Number(e.target.value))} className="w-full p-2 border rounded-lg mt-1" placeholder="0.00" />
                            </div>
                        )}
                    </div>
                </div>

                <div className="p-4 bg-slate-50 border-t flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 border rounded-lg hover:bg-slate-100">Cancelar</button>
                    <button onClick={handleSave} className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center">
                        <Save className="w-4 h-4 mr-2" /> Guardar
                    </button>
                </div>
            </div>
        </div>
    );
};