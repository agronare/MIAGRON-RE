
import React, { useState, useMemo } from 'react';
import { 
  FileText, BarChart3, PieChart, Calendar, Clock, Mail, 
  Download, Plus, Filter, Search, Settings, ChevronRight,
  ArrowRight, CheckCircle2, FileSpreadsheet, Printer, Share2,
  LayoutTemplate, RefreshCw, Users, Wrench, X, Package, LayoutDashboard,
  Trash2, Send, Save, Play, PauseCircle, Power
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, AreaChart, Area 
} from 'recharts';
import { SAVED_REPORTS, TEMPLATES, SCHEDULED_JOBS } from '../constants';
import { InventoryItem, Product, SavedReport, ScheduledJob, Sale, Client, PaymentRecord } from '../types';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { generateFinancialAnalysis } from '../services/geminiService';
import { useLocalStorage } from '../hooks/useLocalStorage';

// Mock Data for Chart Preview
const PREVIEW_DATA = [
  { name: 'Ene', valor: 4000 },
  { name: 'Feb', valor: 3000 },
  { name: 'Mar', valor: 2000 },
  { name: 'Abr', valor: 2780 },
  { name: 'May', valor: 1890 },
  { name: 'Jun', valor: 2390 },
];

type ReportTab = 'dashboard' | 'wizard' | 'scheduled';
type WizardStep = 1 | 2 | 3 | 4;

interface ReportsViewProps {
    inventory: InventoryItem[];
    products: Product[];
    salesHistory: Sale[];
    clients: Client[];
    payments: PaymentRecord[];
}

// --- HELPER FUNCTION FOR PDF GENERATION ---
const generateRealPDF = async (
    reportType: string, 
    data: any, 
    title: string, 
    aiAnalysis: boolean = false
) => {
    const doc = new jsPDF();
    const dateStr = new Date().toLocaleString();
    
    // --- Header ---
    doc.setFillColor(67, 56, 202); // Indigo 700
    doc.rect(0, 0, 210, 25, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.text("AGRONARE INTELLIGENCE", 14, 16);
    doc.setFontSize(10);
    doc.text("Reporte Ejecutivo", 170, 16, { align: 'right' });

    // --- Title & Metadata ---
    doc.setTextColor(40, 40, 40);
    doc.setFontSize(16);
    doc.text(title, 14, 40);
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Fecha de Generación: ${dateStr}`, 14, 46);
    doc.text(`Tipo: ${reportType}`, 14, 51);

    let startY = 60;

    // --- AI Analysis Section (Optional) ---
    if (aiAnalysis) {
        // Prepare summary for AI
        let summaryText = "";
        if (reportType === 'Ventas') {
            const total = data.reduce((sum: number, s: Sale) => sum + s.total, 0);
            summaryText = `Reporte de Ventas. Total: $${total}. Cantidad de transacciones: ${data.length}.`;
        } else if (reportType === 'Inventario') {
             const totalVal = data.reduce((sum: number, i: InventoryItem) => sum + (i.quantity * i.unitPrice), 0);
             summaryText = `Reporte de Inventario. Valor Total: $${totalVal}. Items: ${data.length}.`;
        }

        try {
            // Only call API if we have a key, otherwise use generic text
            const analysis = await generateFinancialAnalysis(summaryText); 
            
            doc.setFillColor(245, 247, 255);
            doc.setDrawColor(200, 200, 255);
            doc.roundedRect(14, 60, 180, 30, 3, 3, 'FD');
            
            doc.setTextColor(70, 70, 180);
            doc.setFontSize(11);
            doc.setFont("helvetica", "bold");
            doc.text("Análisis Inteligente (AI Insight):", 18, 68);
            
            doc.setTextColor(60, 60, 60);
            doc.setFont("helvetica", "normal");
            doc.setFontSize(9);
            
            // Word wrap
            const splitText = doc.splitTextToSize(analysis, 170);
            doc.text(splitText, 18, 75);
            
            startY = 100;
        } catch (e) {
            console.error("AI Analysis failed", e);
        }
    }

    // --- Table Generation ---
    let head: string[][] = [];
    let body: any[][] = [];

    if (reportType === 'Ventas') {
        head = [['Folio', 'Fecha', 'Cliente', 'Método', 'Total', 'Estatus']];
        body = data.map((s: Sale) => [
            s.id, 
            new Date(s.date).toLocaleDateString(),
            s.client, 
            s.method, 
            `$${s.total.toLocaleString(undefined, {minimumFractionDigits: 2})}`,
            s.status
        ]);
    } else if (reportType === 'Inventario') {
        head = [['Producto', 'SKU', 'Sucursal', 'Stock', 'Valor Unit.', 'Valor Total']];
        body = data.map((i: InventoryItem) => [
            i.productName,
            i.sku,
            i.branch,
            i.quantity,
            `$${i.unitPrice.toLocaleString()}`,
            `$${(i.quantity * i.unitPrice).toLocaleString()}`
        ]);
    } else if (reportType === 'Finanzas') {
        // Assume data is PaymentRecord[]
         head = [['Ref', 'Fecha', 'Entidad', 'Tipo', 'Método', 'Monto']];
         body = data.map((p: PaymentRecord) => [
             p.reference || '-',
             new Date(p.date).toLocaleDateString(),
             p.entityName,
             p.type === 'receivable' ? 'Ingreso' : 'Egreso',
             p.method,
             `$${p.amount.toLocaleString()}`
         ]);
    }

    autoTable(doc, {
        startY: startY,
        head: head,
        body: body,
        theme: 'grid',
        headStyles: { fillColor: [67, 56, 202], textColor: 255, fontStyle: 'bold' },
        styles: { fontSize: 8, cellPadding: 3 },
        alternateRowStyles: { fillColor: [248, 250, 252] },
    });

    // --- Footer ---
    const pageCount = (doc as any).internal.getNumberOfPages();
    for(let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(`Página ${i} de ${pageCount} - Generado por Agronare Platform`, 105, 285, { align: 'center' });
    }

    doc.save(`Agronare_${reportType}_${Date.now()}.pdf`);
};

// --- MODALS ---

const EmailReportModal = ({ isOpen, onClose, reportName }: { isOpen: boolean, onClose: () => void, reportName: string }) => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState(`Adjunto encontrarás el reporte: ${reportName}`);
    const [sending, setSending] = useState(false);

    if (!isOpen) return null;

    const handleSend = () => {
        if(!email) return alert("Ingresa un correo electrónico");
        setSending(true);
        // Simulate API call
        setTimeout(() => {
            setSending(false);
            alert(`Reporte enviado correctamente a ${email}`);
            setEmail('');
            onClose();
        }, 1500);
    };

    return (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in zoom-in-95 border border-slate-200 dark:border-slate-800">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center">
                        <Mail className="w-5 h-5 mr-2 text-indigo-600 dark:text-indigo-400" /> Compartir Reporte
                    </h2>
                    <button onClick={onClose} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full"><X className="w-5 h-5 text-slate-400" /></button>
                </div>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Destinatario(s)</label>
                        <input 
                            type="email" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="ejemplo@empresa.com" 
                            className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none bg-white dark:bg-slate-800 dark:text-white"
                            autoFocus
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Mensaje</label>
                        <textarea 
                            rows={3}
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none resize-none bg-white dark:bg-slate-800 dark:text-white"
                        ></textarea>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center">
                        <FileText className="w-8 h-8 text-red-500 mr-3" />
                        <div>
                            <p className="text-sm font-bold text-slate-800 dark:text-white">{reportName}.pdf</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">1.2 MB • Generado hace un momento</p>
                        </div>
                    </div>
                </div>
                <div className="mt-6 flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium text-sm">Cancelar</button>
                    <button 
                        onClick={handleSend} 
                        disabled={sending}
                        className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium text-sm flex items-center disabled:opacity-70"
                    >
                        {sending ? 'Enviando...' : <><Send className="w-4 h-4 mr-2" /> Enviar</>}
                    </button>
                </div>
            </div>
        </div>
    );
};

const ScheduleJobModal = ({ isOpen, onClose, onSave, reportName }: { isOpen: boolean, onClose: () => void, onSave: (job: Omit<ScheduledJob, 'id'>) => void, reportName?: string }) => {
    const [report, setReport] = useState(reportName || '');
    const [recipients, setRecipients] = useState('');
    const [frequency, setFrequency] = useState('Diario');
    const [time, setTime] = useState('09:00');

    if (!isOpen) return null;

    const handleSave = () => {
        if (!report || !recipients) return alert("Completa los campos requeridos");
        onSave({
            report,
            recipients,
            schedule: `${frequency}, ${time}`,
            status: 'Active'
        });
        
        // Reset form
        setReport('');
        setRecipients('');
        setFrequency('Diario');
        setTime('09:00');
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in zoom-in-95 border border-slate-200 dark:border-slate-800">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center">
                        <Clock className="w-5 h-5 mr-2 text-indigo-600 dark:text-indigo-400" /> Nueva Programación
                    </h2>
                    <button onClick={onClose} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full"><X className="w-5 h-5 text-slate-400" /></button>
                </div>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Reporte a Enviar</label>
                        <input 
                            type="text" 
                            value={report}
                            onChange={(e) => setReport(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none bg-white dark:bg-slate-800 dark:text-white"
                            placeholder="Nombre del reporte"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Destinatarios (separados por coma)</label>
                        <input 
                            type="text" 
                            value={recipients} 
                            onChange={(e) => setRecipients(e.target.value)}
                            placeholder="gerencia@agronare.com, finanzas@..." 
                            className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none bg-white dark:bg-slate-800 dark:text-white"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Frecuencia</label>
                            <select 
                                value={frequency} 
                                onChange={(e) => setFrequency(e.target.value)}
                                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 dark:text-white"
                            >
                                <option>Diario</option>
                                <option>Semanal (Lunes)</option>
                                <option>Mensual (Día 1)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Hora</label>
                            <input 
                                type="time" 
                                value={time} 
                                onChange={(e) => setTime(e.target.value)}
                                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 dark:text-white"
                            />
                        </div>
                    </div>
                </div>
                <div className="mt-6 flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium text-sm">Cancelar</button>
                    <button onClick={handleSave} className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium text-sm flex items-center">
                        <Save className="w-4 h-4 mr-2" /> Programar
                    </button>
                </div>
            </div>
        </div>
    );
};

const InventoryAgingModal = ({ isOpen, onClose, inventory }: { isOpen: boolean, onClose: () => void, inventory: InventoryItem[] }) => {
    
    const agingData = useMemo(() => {
        const now = new Date();
        const buckets = {
            '0-30': { value: 0, count: 0, items: [] },
            '31-60': { value: 0, count: 0, items: [] },
            '61-90': { value: 0, count: 0, items: [] },
            '91+': { value: 0, count: 0, items: [] },
        };

        inventory.forEach(item => {
            const entryDate = new Date(item.entryDate.split('/').reverse().join('-')); // Assuming DD/MM/YYYY or similar
            // Fallback if date is invalid
            const validEntryDate = isNaN(entryDate.getTime()) ? new Date() : entryDate;
            
            const daysDiff = (now.getTime() - validEntryDate.getTime()) / (1000 * 3600 * 24);
            const itemValue = item.quantity * item.unitPrice;
            
            let bucketKey: keyof typeof buckets;
            if (daysDiff <= 30) bucketKey = '0-30';
            else if (daysDiff <= 60) bucketKey = '31-60';
            else if (daysDiff <= 90) bucketKey = '61-90';
            else bucketKey = '91+';
            
            buckets[bucketKey].value += itemValue;
            buckets[bucketKey].count += item.quantity;
        });

        return Object.entries(buckets).map(([key, data]) => ({
            name: `${key} días`,
            Valor: data.value,
            Unidades: data.count,
        }));
    }, [inventory]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-4xl flex flex-col max-h-[90vh] animate-in zoom-in-95 border border-slate-200 dark:border-slate-800">
                <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center"><RefreshCw className="mr-3 text-orange-500"/>Reporte de Antigüedad de Inventario</h2>
                    <button onClick={onClose} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full"><X className="w-5 h-5 text-slate-500" /></button>
                </div>
                <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50 dark:bg-slate-950/50">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div>
                            <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-4">Valor de Inventario por Antigüedad</h3>
                            <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700 h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={agingData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#334155" opacity={0.3} />
                                        <XAxis type="number" tickFormatter={(val) => `$${(val as number / 1000).toFixed(0)}k`} tick={{fill: '#94a3b8'}} />
                                        <YAxis type="category" dataKey="name" width={80} tick={{fill: '#94a3b8'}} />
                                        <Tooltip formatter={(value) => `$${(value as number).toLocaleString()}`} contentStyle={{backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: 'white'}} />
                                        <Bar dataKey="Valor" fill="#f97316" radius={[0, 4, 4, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                         <div>
                            <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-4">Desglose de Datos</h3>
                            <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 divide-y divide-slate-100 dark:divide-slate-700">
                                {agingData.map(bucket => (
                                    <div key={bucket.name} className="p-3 flex justify-between items-center">
                                        <span className="font-medium text-sm text-slate-700 dark:text-slate-300">{bucket.name}</span>
                                        <div>
                                            <p className="font-bold text-slate-900 dark:text-white text-right">${bucket.Valor.toLocaleString()}</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 text-right">{bucket.Unidades} unidades</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300">Cerrar</button>
                </div>
            </div>
        </div>
    );
};

// --- TABS ---

const DashboardTab = ({ 
    setActiveTab, 
    onTemplateClick, 
    reports, 
    onDownload, 
    onEmail,
    onDelete
}: { 
    setActiveTab: (tab: ReportTab) => void, 
    onTemplateClick: (templateId: string) => void,
    reports: SavedReport[],
    onDownload: (report: SavedReport) => void,
    onEmail: (report: SavedReport) => void,
    onDelete: (id: number) => void
}) => (
    <div className="animate-fadeIn space-y-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
             <div className="lg:col-span-2 bg-gradient-to-br from-indigo-600 to-blue-700 rounded-2xl p-6 text-white shadow-lg flex flex-col justify-between">
                <div>
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-white/20 rounded-lg"><FileText className="w-6 h-6" /></div>
                        <span className="text-xs bg-white/20 px-2 py-1 rounded">Total</span>
                    </div>
                    <h3 className="text-4xl font-bold mb-1">{reports.length}</h3>
                    <p className="text-indigo-100 text-sm">Reportes Generados este mes</p>
                </div>
             </div>
             <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
                 <div className="flex justify-between items-start mb-4">
                     <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg"><Clock className="w-6 h-6" /></div>
                     <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-1 rounded">Activos</span>
                 </div>
                 <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">{SCHEDULED_JOBS.filter(j => j.status === 'Active').length}</h3>
                 <p className="text-slate-500 dark:text-slate-400 text-sm">Envíos programados automáticos</p>
             </div>
             <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-center items-center text-center cursor-pointer hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors group" onClick={() => setActiveTab('wizard')}>
                 <div className="p-4 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full mb-3 group-hover:scale-110 transition-transform">
                     <Plus className="w-6 h-6" />
                 </div>
                 <h3 className="font-bold text-slate-900 dark:text-white">Crear Nuevo Reporte</h3>
                 <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">Personalizado o desde plantilla</p>
             </div>
        </div>

        {/* Recent Reports List */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                <h3 className="font-bold text-slate-900 dark:text-white text-lg">Mis Reportes Recientes</h3>
                <div className="flex gap-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input 
                            type="text" 
                            placeholder="Buscar reporte..." 
                            className="pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:border-indigo-500 bg-white dark:bg-slate-800 dark:text-white" 
                        />
                    </div>
                </div>
            </div>
            <table className="w-full">
                <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                    <tr>
                        <th className="text-left py-4 px-6 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Nombre del Reporte</th>
                        <th className="text-left py-4 px-6 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Categoría</th>
                        <th className="text-left py-4 px-6 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Última Ejecución</th>
                        <th className="text-left py-4 px-6 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Frecuencia</th>
                        <th className="text-right py-4 px-6 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Acciones</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {reports.length > 0 ? reports.map((report) => (
                        <tr key={report.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                            <td className="py-4 px-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded text-slate-500 dark:text-slate-400">
                                        {report.format === 'PDF' ? <FileText className="w-4 h-4" /> : <FileSpreadsheet className="w-4 h-4" />}
                                    </div>
                                    <span className="font-medium text-slate-900 dark:text-white text-sm">{report.name}</span>
                                </div>
                            </td>
                            <td className="py-4 px-6">
                                <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded text-xs font-medium">{report.category}</span>
                            </td>
                            <td className="py-4 px-6 text-sm text-slate-600 dark:text-slate-300">{report.lastRun}</td>
                            <td className="py-4 px-6 text-sm text-slate-600 dark:text-slate-300">{report.frequency}</td>
                            <td className="py-4 px-6 text-right">
                                <div className="flex justify-end gap-2">
                                    <button onClick={() => onDownload(report)} className="p-1.5 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded transition-colors" title="Descargar">
                                        <Download className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => onEmail(report)} className="p-1.5 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded transition-colors" title="Enviar por Email">
                                        <Mail className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => onDelete(report.id)} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/30 text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded transition-colors" title="Eliminar">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    )) : (
                        <tr>
                            <td colSpan={5} className="py-12 text-center text-slate-500 dark:text-slate-400 text-sm">
                                No hay reportes guardados. Crea uno nuevo desde el asistente.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>

        {/* Templates Grid */}
        <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-4">Plantillas Recomendadas</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {TEMPLATES.map((template) => (
                    <div key={template.id} onClick={() => onTemplateClick(template.id)} className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all cursor-pointer group">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-4 ${template.color.replace('bg-', 'dark:bg-opacity-20 bg-')}`}>
                            <template.icon className="w-5 h-5" />
                        </div>
                        <h4 className="font-bold text-slate-900 dark:text-white mb-1">{template.name}</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{template.category}</p>
                        <div className="mt-4 flex items-center text-indigo-600 dark:text-indigo-400 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                            Usar Plantilla <ArrowRight className="w-3 h-3 ml-1" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

const WizardTab = ({ 
    wizardStep, setWizardStep, selectedSource, setSelectedSource, 
    chartType, setChartType, setActiveTab, onGenerateAndDownload, onSchedule
}: any) => {
    const [config, setConfig] = useState({
        metrics: [] as string[],
        startDate: '',
        endDate: ''
    });

    return (
        <div className="animate-fadeIn max-w-5xl mx-auto">
            {/* Wizard Stepper */}
            <div className="flex justify-center mb-12">
                <div className="flex items-center w-full max-w-3xl">
                    {[
                        { step: 1, label: 'Fuente de Datos' },
                        { step: 2, label: 'Configuración' },
                        { step: 3, label: 'Visualización' },
                        { step: 4, label: 'Finalizar' },
                    ].map((item, idx) => (
                        <React.Fragment key={item.step}>
                            <div className="relative flex flex-col items-center">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-colors
                                    ${wizardStep === item.step ? 'bg-indigo-600 text-white border-indigo-600' : 
                                    wizardStep > item.step ? 'bg-emerald-500 text-white border-emerald-500' : 
                                    'bg-white dark:bg-slate-800 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-700'}`}>
                                    {wizardStep > item.step ? <CheckCircle2 className="w-5 h-5" /> : item.step}
                                </div>
                                <span className={`absolute -bottom-6 text-xs font-medium whitespace-nowrap ${wizardStep === item.step ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400'}`}>
                                    {item.label}
                                </span>
                            </div>
                            {idx !== 3 && (
                                <div className={`flex-1 h-0.5 mx-4 ${wizardStep > item.step ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'}`}></div>
                            )}
                        </React.Fragment>
                    ))}
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-8 min-h-[400px]">
                {wizardStep === 1 && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Selecciona el origen de los datos</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {['Ventas', 'Inventario', 'Finanzas', 'RH'].map((source) => (
                                <button 
                                    key={source}
                                    onClick={() => setSelectedSource(source)}
                                    className={`p-6 rounded-xl border-2 text-left transition-all ${selectedSource === source ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20' : 'border-slate-100 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-700 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                                >
                                    <h3 className={`font-bold ${selectedSource === source ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-800 dark:text-white'}`}>{source}</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Tablas y métricas de {source.toLowerCase()}.</p>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {wizardStep === 2 && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Configura filtros y columnas</h2>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Rango de Fechas</label>
                                <div className="flex gap-2">
                                    <input 
                                        type="date" 
                                        className="flex-1 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500 bg-white dark:bg-slate-800 dark:text-white"
                                        value={config.startDate}
                                        onChange={(e) => setConfig({...config, startDate: e.target.value})}
                                    />
                                    <span className="self-center text-slate-400">-</span>
                                    <input 
                                        type="date" 
                                        className="flex-1 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500 bg-white dark:bg-slate-800 dark:text-white"
                                        value={config.endDate}
                                        onChange={(e) => setConfig({...config, endDate: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center">
                                <p className="text-slate-400 text-sm text-center">Selección de columnas automática basada en el módulo {selectedSource}.</p>
                            </div>
                        </div>
                    </div>
                )}

                {wizardStep === 3 && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Elige cómo visualizar los datos</h2>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="space-y-3">
                                <button 
                                    onClick={() => setChartType('bar')}
                                    className={`w-full flex items-center p-3 rounded-lg border transition-colors ${chartType === 'bar' ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-600 text-indigo-700 dark:text-indigo-300' : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'}`}
                                >
                                    <BarChart3 className="w-5 h-5 mr-3" /> Gráfico de Barras
                                </button>
                                <button 
                                    onClick={() => setChartType('line')}
                                    className={`w-full flex items-center p-3 rounded-lg border transition-colors ${chartType === 'line' ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-600 text-indigo-700 dark:text-indigo-300' : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'}`}
                                >
                                    <LayoutTemplate className="w-5 h-5 mr-3" /> Gráfico de Línea
                                </button>
                                <button 
                                    onClick={() => setChartType('table')}
                                    className={`w-full flex items-center p-3 rounded-lg border transition-colors ${chartType === 'table' ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-600 text-indigo-700 dark:text-indigo-300' : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'}`}
                                >
                                    <FileSpreadsheet className="w-5 h-5 mr-3" /> Tabla de Datos
                                </button>
                            </div>
                            <div className="lg:col-span-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 flex flex-col items-center justify-center text-slate-400 text-sm">
                                <BarChart3 className="w-12 h-12 mb-2 opacity-20" />
                                <p>Vista previa disponible al generar el reporte.</p>
                            </div>
                        </div>
                    </div>
                )}

                {wizardStep === 4 && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-300 text-center py-12">
                        <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 className="w-10 h-10" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">¡Reporte Configurado!</h2>
                        <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-8">
                            Reporte: {selectedSource} - {config.startDate || 'Inicio'} a {config.endDate || 'Fin'}.
                        </p>
                        
                        <div className="flex justify-center gap-4">
                            <button 
                                onClick={() => onSchedule(selectedSource)}
                                className="px-6 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center transition-colors"
                            >
                                <Clock className="w-4 h-4 mr-2" />
                                Programar Envío
                            </button>
                            <button 
                                onClick={() => onGenerateAndDownload(selectedSource)}
                                className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 flex items-center shadow-lg shadow-indigo-200 dark:shadow-none transition-colors"
                            >
                                <Download className="w-4 h-4 mr-2" />
                                Generar y Descargar
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Navigation Buttons */}
            {wizardStep < 4 && (
                <div className="flex justify-between mt-6">
                    <button 
                        onClick={() => setWizardStep(Math.max(1, wizardStep - 1) as WizardStep)}
                        disabled={wizardStep === 1}
                        className="px-6 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 font-medium transition-colors"
                    >
                        Atrás
                    </button>
                    <button 
                        onClick={() => setWizardStep(Math.min(4, wizardStep + 1) as WizardStep)}
                        disabled={wizardStep === 1 && !selectedSource}
                        className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium shadow-md flex items-center transition-colors disabled:opacity-50"
                    >
                        Siguiente <ChevronRight className="w-4 h-4 ml-1" />
                    </button>
                </div>
            )}
        </div>
    );
};

const SchedulerTab = ({ jobs, onAddJob, onToggleStatus, onDeleteJob }: { jobs: ScheduledJob[], onAddJob: () => void, onToggleStatus: (id: number) => void, onDeleteJob: (id: number) => void }) => (
    <div className="animate-fadeIn">
        <div className="flex justify-between items-center mb-6">
            <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Automatización de Reportes</h2>
                <p className="text-slate-500 dark:text-slate-400">Gestiona los envíos programados por correo electrónico.</p>
            </div>
            <button 
                onClick={onAddJob}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 flex items-center shadow-sm"
            >
                <Plus className="w-4 h-4 mr-2" />
                Nueva Programación
            </button>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <table className="w-full">
                <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                    <tr>
                        <th className="text-left py-4 px-6 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Reporte</th>
                        <th className="text-left py-4 px-6 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Destinatarios</th>
                        <th className="text-left py-4 px-6 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Frecuencia</th>
                        <th className="text-left py-4 px-6 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Estado</th>
                        <th className="text-right py-4 px-6 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Acciones</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {jobs.length > 0 ? jobs.map((job) => (
                        <tr key={job.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                            <td className="py-4 px-6 font-medium text-slate-900 dark:text-white">{job.report}</td>
                            <td className="py-4 px-6 text-sm text-slate-600 dark:text-slate-300">{job.recipients}</td>
                            <td className="py-4 px-6">
                                <div className="flex items-center text-sm text-slate-600 dark:text-slate-300">
                                    <Clock className="w-4 h-4 mr-2 text-indigo-500 dark:text-indigo-400" />
                                    {job.schedule}
                                </div>
                            </td>
                            <td className="py-4 px-6">
                                <span className={`px-2 py-1 text-xs rounded-full font-bold ${job.status === 'Active' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}>
                                    {job.status === 'Active' ? 'Active' : 'Inactive'}
                                </span>
                            </td>
                            <td className="py-4 px-6 text-right">
                                <div className="flex justify-end gap-3">
                                    <button 
                                        onClick={() => onToggleStatus(job.id)} 
                                        className={`text-sm font-medium transition-colors flex items-center border px-3 py-1.5 rounded-md ${
                                            job.status === 'Active' 
                                            ? 'border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20' 
                                            : 'border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'
                                        }`}
                                    >
                                        {job.status === 'Active' ? 'Desactivar' : 'Activar'}
                                    </button>
                                    <button 
                                        onClick={() => onDeleteJob(job.id)}
                                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                        title="Eliminar programación"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    )) : (
                        <tr>
                            <td colSpan={5} className="py-12 text-center text-slate-500 dark:text-slate-400 text-sm">
                                No hay tareas programadas.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    </div>
);


export const ReportsView: React.FC<ReportsViewProps> = ({ inventory, products, salesHistory, clients, payments }) => {
  const [activeTab, setActiveTab] = useState<ReportTab>('dashboard');
  const [wizardStep, setWizardStep] = useState<WizardStep>(1);
  const [selectedSource, setSelectedSource] = useState('');
  const [chartType, setChartType] = useState('bar');
  
  // Modals State
  const [isAgingModalOpen, setIsAgingModalOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [selectedReportForEmail, setSelectedReportForEmail] = useState<string>('');
  const [reportForSchedule, setReportForSchedule] = useState<string>('');

  // Data State - Persist locally
  const [reports, setReports] = useLocalStorage<SavedReport[]>('agronare_saved_reports', SAVED_REPORTS);
  const [jobs, setJobs] = useLocalStorage<ScheduledJob[]>('agronare_scheduled_jobs', SCHEDULED_JOBS);

  const handleTemplateClick = (templateId: string) => {
    if (templateId === 't2') { // Antigüedad de Inventario
      setIsAgingModalOpen(true);
    } else {
      setActiveTab('wizard');
    }
  };

  const handleDownloadReport = async (report: SavedReport) => {
      let dataToExport: any = [];
      let reportType = report.category || 'General';

      // Determine source based on report name or category
      if (report.category === 'Comercial' || report.name.includes('Ventas')) {
          dataToExport = salesHistory;
          reportType = 'Ventas';
      } else if (report.category === 'Logística' || report.name.includes('Inventario')) {
          dataToExport = inventory;
          reportType = 'Inventario';
      } else if (report.category === 'Finanzas') {
          dataToExport = payments;
          reportType = 'Finanzas';
      } else {
          // Default fallback mock data if no matching category found (e.g. created manually with generic name)
          dataToExport = []; 
      }

      await generateRealPDF(reportType, dataToExport, report.name, true); // Enable AI
  };

  const handleGenerateAndDownload = async (source: string) => {
      let dataToExport: any = [];
      if (source === 'Ventas') dataToExport = salesHistory;
      else if (source === 'Inventario') dataToExport = inventory;
      else if (source === 'Finanzas') dataToExport = payments;
      else if (source === 'RH') dataToExport = []; // Add RH logic later if needed
      
      const reportName = `Reporte ${source} - ${new Date().toLocaleDateString()}`;
      
      await generateRealPDF(source, dataToExport, reportName, true); // Generate with AI

      // Save to recent list
      const newReport: SavedReport = {
          id: Date.now(),
          name: reportName,
          category: source,
          lastRun: 'Ahora',
          format: 'PDF',
          frequency: 'Manual'
      };
      setReports([newReport, ...reports]);
      
      setWizardStep(1);
      setActiveTab('dashboard');
  };

  const handleScheduleFromWizard = (source: string) => {
      const reportName = `Reporte Automático ${source}`;
      
      // Create "Saved Report" entry first
      const newReport: SavedReport = {
          id: Date.now(),
          name: reportName,
          category: source,
          lastRun: 'Pendiente',
          format: 'PDF',
          frequency: 'Automático'
      };
      setReports([newReport, ...reports]);

      // Open schedule modal
      setReportForSchedule(reportName);
      setIsScheduleModalOpen(true);
  };


  const handleOpenEmailModal = (report: SavedReport) => {
      setSelectedReportForEmail(report.name);
      setIsEmailModalOpen(true);
  };

  const handleDeleteReport = (id: number) => {
      if (window.confirm("¿Estás seguro de eliminar este reporte?")) {
          setReports(prev => prev.filter(r => r.id !== id));
      }
  };

  const handleAddJob = (job: Omit<ScheduledJob, 'id'>) => {
      const newJob = { ...job, id: Date.now() };
      setJobs(prev => [newJob, ...prev]);
      setActiveTab('scheduled');
  };

  const handleToggleJobStatus = (id: number) => {
      setJobs(prev => prev.map(j => 
          j.id === id 
          ? { ...j, status: j.status === 'Active' ? 'Inactive' : 'Active' } 
          : j
      ));
  };

  const handleDeleteJob = (id: number) => {
      if (window.confirm("¿Estás seguro de eliminar permanentemente esta programación?")) {
          setJobs(prev => prev.filter(j => j.id !== id));
      }
  };


  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#f8fafc] dark:bg-slate-950 transition-colors duration-300 p-4 sm:p-8">
        <div className="max-w-[1400px] mx-auto w-full">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg text-white">
                        <BarChart3 className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="h1 text-2xl font-bold">Centro de Inteligencia (BI)</h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">Crea, programa y visualiza reportes estratégicos para la toma de decisiones.</p>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex overflow-x-auto no-scrollbar gap-2 p-2 card w-full md:w-fit mb-8">
                {[
                    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
                    { id: 'wizard', label: 'Crear Reporte', icon: Plus },
                    { id: 'scheduled', label: 'Automatización', icon: Clock },
                ].map((tab) => (
                    <button 
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as ReportTab)}
                        className={`button text-sm whitespace-nowrap ${activeTab === tab.id ? 'ring-1 ring-indigo-400' : ''}`}
                    >
                        <tab.icon className="w-4 h-4 mr-2" />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="min-h-[500px]">
                {activeTab === 'dashboard' && (
                    <DashboardTab 
                        setActiveTab={setActiveTab} 
                        onTemplateClick={handleTemplateClick} 
                        reports={reports}
                        onDownload={handleDownloadReport}
                        onEmail={handleOpenEmailModal}
                        onDelete={handleDeleteReport}
                    />
                )}
                {activeTab === 'wizard' && (
                    <WizardTab 
                        wizardStep={wizardStep}
                        setWizardStep={setWizardStep}
                        selectedSource={selectedSource}
                        setSelectedSource={setSelectedSource}
                        chartType={chartType}
                        setChartType={setChartType}
                        setActiveTab={setActiveTab}
                        onGenerateAndDownload={handleGenerateAndDownload}
                        onSchedule={handleScheduleFromWizard}
                    />
                )}
                {activeTab === 'scheduled' && (
                    <SchedulerTab 
                        jobs={jobs} 
                        onAddJob={() => setIsScheduleModalOpen(true)}
                        onToggleStatus={handleToggleJobStatus}
                        onDeleteJob={handleDeleteJob}
                    />
                )}
            </div>
        </div>

        {/* Modals */}
        <InventoryAgingModal 
            isOpen={isAgingModalOpen}
            onClose={() => setIsAgingModalOpen(false)}
            inventory={inventory}
        />
        <EmailReportModal 
            isOpen={isEmailModalOpen}
            onClose={() => setIsEmailModalOpen(false)}
            reportName={selectedReportForEmail}
        />
        <ScheduleJobModal 
            isOpen={isScheduleModalOpen}
            onClose={() => { setIsScheduleModalOpen(false); setReportForSchedule(''); }}
            onSave={handleAddJob}
            reportName={reportForSchedule}
        />
    </div>
  );
};
