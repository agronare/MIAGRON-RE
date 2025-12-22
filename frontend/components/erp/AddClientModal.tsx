
import React, { useState } from 'react';
import { X, User, Save } from 'lucide-react';

interface AddClientModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (clientData: { name: string; rfc: string; contactName: string }) => void;
}

export const AddClientModal: React.FC<AddClientModalProps> = ({ isOpen, onClose, onSave }) => {
    const [name, setName] = useState('');
    const [rfc, setRfc] = useState('');
    const [contactName, setContactName] = useState('');

    const handleSave = () => {
        if (name.trim()) {
            onSave({ name, rfc, contactName });
            // Clear form for next time
            setName('');
            setRfc('');
            setContactName('');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in zoom-in-95">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-slate-900 flex items-center">
                        <User className="w-5 h-5 mr-2 text-indigo-600" />
                        Creación Rápida de Cliente
                    </h2>
                    <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-full">
                        <X className="w-5 h-5 text-slate-400" />
                    </button>
                </div>
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Nombre Completo o Razón Social</label>
                        <input 
                            type="text" 
                            value={name} 
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                            placeholder="Ej. Juan Pérez"
                            autoFocus
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">RFC (Opcional)</label>
                        <input 
                            type="text" 
                            value={rfc}
                            onChange={(e) => setRfc(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                            placeholder="XAXX010101000"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Nombre de Contacto (Opcional)</label>
                        <input 
                            type="text" 
                            value={contactName}
                            onChange={(e) => setContactName(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                            placeholder="Ej. Maria Lopez"
                        />
                    </div>
                </div>

                <div className="mt-8 flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 border rounded-lg text-slate-700 hover:bg-slate-50">
                        Cancelar
                    </button>
                    <button 
                        onClick={handleSave} 
                        disabled={!name.trim()}
                        className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center disabled:opacity-50"
                    >
                        <Save className="w-4 h-4 mr-2" />
                        Guardar Cliente
                    </button>
                </div>
            </div>
        </div>
    );
};
