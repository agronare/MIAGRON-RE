
import React from 'react';
import { X, User, Mail, Phone, MapPin, Briefcase, Calendar, FileText, Download, History, Shield, Printer, Edit, ArrowLeft } from 'lucide-react';
import { Employee } from '../../types';

interface EmployeeProfileProps {
    employee: Employee;
    onClose: () => void;
    onEdit: (employee: Employee) => void;
}

export const EmployeeProfile: React.FC<EmployeeProfileProps> = ({ employee, onClose, onEdit }) => {
    
    const statusColors: Record<string, string> = {
        'Activo': 'bg-emerald-100 text-emerald-700',
        'Inactivo': 'bg-slate-100 text-slate-700',
        'Vacaciones': 'bg-blue-100 text-blue-700',
        'Suspendido': 'bg-amber-100 text-amber-700',
        'Baja': 'bg-red-100 text-red-700'
    };

    const InfoRow = ({ icon: Icon, label, value }: any) => (
        <div className="flex items-center py-3 border-b border-slate-100 last:border-0 break-inside-avoid">
            <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center mr-4 text-slate-400 shrink-0 print:border print:border-slate-200">
                <Icon className="w-4 h-4" />
            </div>
            <div>
                <p className="text-xs text-slate-500 uppercase font-bold">{label}</p>
                <p className="text-sm text-slate-900 font-medium">{value || 'N/A'}</p>
            </div>
        </div>
    );

    const handlePrint = () => {
        window.print();
    };

    // Normalizar arrays potencialmente indefinidos para evitar errores de acceso a length/map
    const documents = Array.isArray((employee as any).documents) ? (employee as any).documents : [];
    const history = Array.isArray((employee as any).history) ? (employee as any).history : [];

    return (
        <div className="fixed inset-0 z-[75] flex justify-end bg-black/40 backdrop-blur-sm transition-opacity print:bg-white print:static print:h-auto print:w-full print:block" onClick={onClose}>
            {/* Print Styles */}
            <style>{`
                @media print {
                    @page { margin: 0; size: auto; }
                    body * {
                        visibility: hidden;
                    }
                    #employee-profile-card, #employee-profile-card * {
                        visibility: visible;
                    }
                    #employee-profile-card {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        height: auto;
                        margin: 0;
                        padding: 0;
                        overflow: visible;
                        background: white;
                        z-index: 9999;
                        box-shadow: none !important;
                        border-radius: 0 !important;
                    }
                    .no-print {
                        display: none !important;
                    }
                    /* Ensure background colors print */
                    * {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                }
            `}</style>

            <div 
                id="employee-profile-card"
                className="w-full max-w-3xl bg-white h-full shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col" 
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="h-48 bg-gradient-to-r from-indigo-600 to-purple-700 relative shrink-0 print:bg-white print:h-auto print:border-b print:border-slate-300 print:pb-6 print:pt-8">
                    <button onClick={onClose} className="absolute top-4 left-4 p-2 bg-white/20 hover:bg-white/30 text-white rounded-full backdrop-blur-sm transition-colors no-print">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="absolute -bottom-12 left-8 flex items-end print:static print:flex-row print:items-center print:px-8">
                        <div className="w-24 h-24 rounded-full border-4 border-white bg-slate-200 overflow-hidden shadow-md flex items-center justify-center print:w-20 print:h-20 print:border-none print:shadow-none">
                            {employee.avatar ? (
                                <img src={employee.avatar} alt="" className="w-full h-full object-cover" />
                            ) : (
                                <User className="w-12 h-12 text-slate-400" />
                            )}
                        </div>
                        <div className="mb-14 ml-4 text-white print:text-slate-900 print:mb-0">
                            <h2 className="text-2xl font-bold print:text-slate-900">{employee.firstName} {employee.lastName}</h2>
                            <p className="opacity-90 print:text-slate-500 print:opacity-100">{employee.role}</p>
                        </div>
                    </div>
                    <div className="absolute bottom-4 right-4 flex gap-2 no-print">
                        <button onClick={() => onEdit(employee)} className="px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-lg text-sm font-medium flex items-center transition-colors">
                            <Edit className="w-4 h-4 mr-2" /> Editar
                        </button>
                        <button onClick={handlePrint} className="p-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-lg transition-colors">
                            <Printer className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto pt-16 px-8 pb-8 bg-slate-50 print:pt-8 print:bg-white print:overflow-visible">
                    
                    <div className="flex gap-2 mb-6 print:mb-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${statusColors[employee.status] || 'bg-slate-100'} print:border print:border-slate-300 print:bg-white print:text-slate-800`}>
                            {employee.status}
                        </span>
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-white border text-slate-600">
                            ID: {employee.id}
                        </span>
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-white border text-slate-600">
                            {employee.branch}
                        </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:grid-cols-2 print:gap-8">
                        {/* Personal Info */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 print:border-none print:shadow-none print:p-0 break-inside-avoid">
                            <h3 className="font-bold text-slate-900 mb-4 flex items-center"><User className="w-4 h-4 mr-2 text-indigo-600 print:text-slate-900"/> Datos Personales</h3>
                            <div className="space-y-1">
                                <InfoRow icon={Mail} label="Email" value={employee.email} />
                                <InfoRow icon={Phone} label="Teléfono" value={employee.phone} />
                                <InfoRow icon={MapPin} label="Dirección" value={employee.address} />
                                <InfoRow icon={Shield} label="RFC" value={employee.rfc} />
                                <InfoRow icon={Shield} label="CURP" value={employee.curp} />
                                <InfoRow icon={Shield} label="NSS" value={employee.nss} />
                            </div>
                        </div>

                        {/* Labor Info */}
                        <div className="space-y-6 print:space-y-8">
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 print:border-none print:shadow-none print:p-0 break-inside-avoid">
                                <h3 className="font-bold text-slate-900 mb-4 flex items-center"><Briefcase className="w-4 h-4 mr-2 text-indigo-600 print:text-slate-900"/> Datos Laborales</h3>
                                <div className="space-y-1">
                                    <InfoRow icon={Briefcase} label="Departamento" value={employee.department} />
                                    <InfoRow icon={Calendar} label="Fecha Ingreso" value={employee.joinDate} />
                                    <InfoRow icon={FileText} label="Tipo Contrato" value={employee.contractType} />
                                    <InfoRow icon={Shield} label="Salario" value={`$${employee.salary?.toLocaleString()} / ${employee.paymentFrequency}`} />
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 no-print">
                                <h3 className="font-bold text-slate-900 mb-4 flex items-center"><FileText className="w-4 h-4 mr-2 text-indigo-600"/> Documentación</h3>
                                {documents.length > 0 ? (
                                    <div className="space-y-2">
                                        {documents.map((doc, idx) => (
                                            <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100 hover:border-indigo-200 transition-colors">
                                                <div className="flex items-center">
                                                    <div className="w-8 h-8 bg-red-100 text-red-600 rounded flex items-center justify-center mr-3"><FileText className="w-4 h-4" /></div>
                                                    <div className="text-sm font-medium text-slate-700">{doc.name}</div>
                                                </div>
                                                <button className="text-slate-400 hover:text-indigo-600 no-print"><Download className="w-4 h-4" /></button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-6 border-2 border-dashed border-slate-200 rounded-lg">
                                        <p className="text-sm text-slate-400">Sin documentos cargados</p>
                                        <button className="text-xs text-indigo-600 font-bold mt-2 hover:underline no-print">Subir Documento</button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 bg-white p-6 rounded-xl shadow-sm border border-slate-200 print:border-none print:shadow-none print:p-0 break-inside-avoid">
                        <h3 className="font-bold text-slate-900 mb-4 flex items-center"><History className="w-4 h-4 mr-2 text-indigo-600 print:text-slate-900"/> Historial</h3>
                        <div className="space-y-4">
                            {history.length > 0 ? history.map((evt, idx) => (
                                <div key={idx} className="flex gap-4">
                                    <div className="flex flex-col items-center">
                                        <div className="w-2 h-2 rounded-full bg-indigo-600 print:bg-slate-800"></div>
                                        <div className="w-px h-full bg-slate-200 my-1 print:bg-slate-300"></div>
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-800">{evt.type}</p>
                                        <p className="text-xs text-slate-500">{evt.description} • {evt.date}</p>
                                    </div>
                                </div>
                            )) : (
                                <p className="text-sm text-slate-400 italic">No hay historial registrado.</p>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};
