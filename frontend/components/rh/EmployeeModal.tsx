
import React, { useState, useEffect, useRef } from 'react';
import { X, Save, User, Briefcase, FileText, Upload, Sparkles, Calendar, CreditCard, Phone, MapPin, Shield, FileCheck } from 'lucide-react';
import { Employee } from '../../types';

interface EmployeeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (employee: Employee) => void;
    initialData?: Employee | null;
}

const INITIAL_STATE: Partial<Employee> = {
    firstName: '', lastName: '', email: '', phone: '',
    role: '', department: '', branch: 'SUC. Copandaro',
    status: 'Activo', joinDate: new Date().toISOString().split('T')[0],
    contractType: 'Indeterminado', salary: 0, paymentFrequency: 'Quincenal',
    rfc: '', curp: '', nss: '', address: '',
    emergencyContactName: '', emergencyContactPhone: '',
    documents: [], history: []
};

export const EmployeeModal: React.FC<EmployeeModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
    const [activeTab, setActiveTab] = useState<'general' | 'laboral' | 'personal'>('general');
    const [formData, setFormData] = useState<Partial<Employee>>(INITIAL_STATE);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setFormData({
                    firstName: initialData.firstName ?? INITIAL_STATE.firstName,
                    lastName: initialData.lastName ?? INITIAL_STATE.lastName,
                    email: initialData.email ?? INITIAL_STATE.email,
                    phone: initialData.phone ?? INITIAL_STATE.phone,
                    role: initialData.role ?? INITIAL_STATE.role,
                    department: initialData.department ?? INITIAL_STATE.department,
                    branch: initialData.branch ?? INITIAL_STATE.branch,
                    status: initialData.status ?? INITIAL_STATE.status,
                    joinDate: initialData.joinDate ?? INITIAL_STATE.joinDate,
                    contractType: initialData.contractType ?? INITIAL_STATE.contractType,
                    salary: initialData.salary ?? INITIAL_STATE.salary,
                    paymentFrequency: initialData.paymentFrequency ?? INITIAL_STATE.paymentFrequency,
                    rfc: initialData.rfc ?? INITIAL_STATE.rfc,
                    curp: initialData.curp ?? INITIAL_STATE.curp,
                    nss: initialData.nss ?? INITIAL_STATE.nss,
                    address: initialData.address ?? INITIAL_STATE.address,
                    emergencyContactName: initialData.emergencyContactName ?? INITIAL_STATE.emergencyContactName,
                    emergencyContactPhone: initialData.emergencyContactPhone ?? INITIAL_STATE.emergencyContactPhone,
                    documents: initialData.documents ?? INITIAL_STATE.documents,
                    history: initialData.history ?? INITIAL_STATE.history,
                    avatar: initialData.avatar ?? undefined,
                });
                setAvatarPreview(initialData?.avatar || null);
            } else {
                setFormData(INITIAL_STATE);
                setAvatarPreview(null);
            }
            setActiveTab('general');
        }
    }, [isOpen, initialData]);

    if (!isOpen) return null;

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result as string);
                setFormData(prev => ({ ...prev, avatar: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAutoFill = () => {
        // Mock AI Autofill
        setFormData(prev => ({
            ...prev,
            firstName: 'Juan', lastName: 'Perez Mock',
            rfc: 'PEMJ800101HDF', curp: 'PEMJ800101HDFR01',
            nss: '1122334455', email: 'juan.mock@agronare.com',
            phone: '5512345678'
        }));
    };

    const handleSave = () => {
        if (!formData.firstName || !formData.lastName || !formData.role) {
            alert('Por favor complete los campos obligatorios.');
            return;
        }
        const employee: Employee = {
            ...formData as Employee,
            id: initialData?.id || `EMP-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`
        };
        onSave(employee);
        onClose();
    };

    const TabButton = ({ id, label, icon: Icon }: any) => (
        <button
            onClick={() => setActiveTab(id)}
            className={`flex items-center px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === id ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            }`}
        >
            <Icon className="w-4 h-4 mr-2" /> {label}
        </button>
    );

    return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl flex flex-col max-h-[90vh] animate-in zoom-in-95">
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-white rounded-t-xl">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">{initialData ? 'Editar Empleado' : 'Nuevo Empleado'}</h2>
                        <p className="text-sm text-slate-500">Información completa del colaborador</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full"><X className="w-5 h-5 text-slate-400" /></button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-slate-200 px-2">
                    <TabButton id="general" label="Información General" icon={User} />
                    <TabButton id="laboral" label="Datos Laborales" icon={Briefcase} />
                    <TabButton id="personal" label="Datos Personales" icon={FileText} />
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50">
                    {activeTab === 'general' && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-in fade-in slide-in-from-right-4">
                            <div className="flex flex-col items-center">
                                <div 
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-40 h-40 rounded-full border-4 border-white shadow-lg bg-slate-200 flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity overflow-hidden relative group"
                                >
                                    {avatarPreview ? (
                                        <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <User className="w-16 h-16 text-slate-400" />
                                    )}
                                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Upload className="w-8 h-8 text-white" />
                                    </div>
                                </div>
                                <input type="file" ref={fileInputRef} onChange={handleImageChange} className="hidden" accept="image/*" />
                                <p className="text-xs text-slate-500 mt-3">Click para subir foto</p>
                                
                                {!initialData && (
                                    <button 
                                        onClick={handleAutoFill}
                                        className="mt-6 px-4 py-2 bg-purple-50 text-purple-700 rounded-lg text-xs font-bold flex items-center hover:bg-purple-100 transition-colors"
                                    >
                                        <Sparkles className="w-3 h-3 mr-2" /> Autocompletar con IA
                                    </button>
                                )}
                            </div>
                            <div className="md:col-span-2 space-y-5">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nombre(s) *</label>
                                        <input type="text" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} className="w-full p-2.5 border rounded-lg focus:border-indigo-500 outline-none" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Apellidos *</label>
                                        <input type="text" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} className="w-full p-2.5 border rounded-lg focus:border-indigo-500 outline-none" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Correo Electrónico</label>
                                    <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full p-2.5 border rounded-lg focus:border-indigo-500 outline-none" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Teléfono</label>
                                        <input type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full p-2.5 border rounded-lg focus:border-indigo-500 outline-none" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Estado</label>
                                        <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as any})} className="w-full p-2.5 border rounded-lg bg-white">
                                            <option>Activo</option>
                                            <option>Vacaciones</option>
                                            <option>Suspendido</option>
                                            <option>Baja</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'laboral' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Puesto / Cargo *</label>
                                    <input type="text" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full p-2.5 border rounded-lg focus:border-indigo-500 outline-none" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Departamento</label>
                                    <select value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} className="w-full p-2.5 border rounded-lg bg-white">
                                        <option value="">Seleccionar...</option>
                                        <option>Ventas</option>
                                        <option>Operaciones</option>
                                        <option>Recursos Humanos</option>
                                        <option>Logística</option>
                                        <option>Administración</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Sucursal</label>
                                    <select value={formData.branch} onChange={e => setFormData({...formData, branch: e.target.value})} className="w-full p-2.5 border rounded-lg bg-white">
                                        <option>SUC. Copandaro</option>
                                        <option>Bodega Central</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Fecha de Ingreso</label>
                                    <input type="date" value={formData.joinDate} onChange={e => setFormData({...formData, joinDate: e.target.value})} className="w-full p-2.5 border rounded-lg focus:border-indigo-500 outline-none" />
                                </div>
                            </div>
                            <div className="border-t border-slate-200 pt-4">
                                <h4 className="font-bold text-slate-700 mb-4 flex items-center"><CreditCard className="w-4 h-4 mr-2"/> Información Salarial</h4>
                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tipo Contrato</label>
                                        <select value={formData.contractType} onChange={e => setFormData({...formData, contractType: e.target.value as any})} className="w-full p-2.5 border rounded-lg bg-white">
                                            <option>Indeterminado</option>
                                            <option>Determinado</option>
                                            <option>Honorarios</option>
                                            <option>Prueba</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Salario Mensual</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                                            <input type="number" value={formData.salary} onChange={e => setFormData({...formData, salary: Number(e.target.value)})} className="w-full pl-8 p-2.5 border rounded-lg focus:border-indigo-500 outline-none" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Frecuencia Pago</label>
                                        <select value={formData.paymentFrequency} onChange={e => setFormData({...formData, paymentFrequency: e.target.value as any})} className="w-full p-2.5 border rounded-lg bg-white">
                                            <option>Semanal</option>
                                            <option>Quincenal</option>
                                            <option>Mensual</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'personal' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">RFC</label>
                                    <input type="text" value={formData.rfc} onChange={e => setFormData({...formData, rfc: e.target.value.toUpperCase()})} className="w-full p-2.5 border rounded-lg focus:border-indigo-500 outline-none uppercase" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">CURP</label>
                                    <input type="text" value={formData.curp} onChange={e => setFormData({...formData, curp: e.target.value.toUpperCase()})} className="w-full p-2.5 border rounded-lg focus:border-indigo-500 outline-none uppercase" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">NSS (IMSS)</label>
                                    <input type="text" value={formData.nss} onChange={e => setFormData({...formData, nss: e.target.value})} className="w-full p-2.5 border rounded-lg focus:border-indigo-500 outline-none" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Dirección Completa</label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                                    <textarea 
                                        value={formData.address} 
                                        onChange={e => setFormData({...formData, address: e.target.value})} 
                                        className="w-full pl-9 p-2.5 border rounded-lg focus:border-indigo-500 outline-none resize-none"
                                        rows={2}
                                    ></textarea>
                                </div>
                            </div>
                            <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                                <h4 className="font-bold text-red-800 text-sm mb-3 flex items-center"><Shield className="w-4 h-4 mr-2"/> Contacto de Emergencia</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-red-700 uppercase mb-1">Nombre</label>
                                        <input type="text" value={formData.emergencyContactName} onChange={e => setFormData({...formData, emergencyContactName: e.target.value})} className="w-full p-2.5 border border-red-200 rounded-lg bg-white focus:border-red-400 outline-none" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-red-700 uppercase mb-1">Teléfono</label>
                                        <input type="tel" value={formData.emergencyContactPhone} onChange={e => setFormData({...formData, emergencyContactPhone: e.target.value})} className="w-full p-2.5 border border-red-200 rounded-lg bg-white focus:border-red-400 outline-none" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-white border-t border-slate-200 flex justify-end gap-3 rounded-b-xl">
                    <button onClick={onClose} className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 font-medium hover:bg-slate-50 transition-colors">Cancelar</button>
                    <button onClick={handleSave} className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition-colors flex items-center">
                        <Save className="w-4 h-4 mr-2" /> Guardar Empleado
                    </button>
                </div>
            </div>
        </div>
    );
};
