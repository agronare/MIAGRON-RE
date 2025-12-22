import React, { useState, useMemo } from 'react';
import { X, Calculator, Download, AlertTriangle, CheckCircle, Wallet } from 'lucide-react';
import { Sale } from '../../types';
import jsPDF from 'jspdf';
import { financeService } from '../../services/financeService';
import { useNotification } from '../../context/NotificationContext';

const DENOMINATIONS = [1000, 500, 200, 100, 50, 20, 10, 5, 2, 1, 0.5];

export const CashReconciliationModal = ({ isOpen, onClose, salesData, branch }: { isOpen: boolean, onClose: () => void, salesData: Sale[], branch: string }) => {
    const [initialCash, setInitialCash] = useState('');
    const [cashOutflows, setCashOutflows] = useState('');
    const [counts, setCounts] = useState<Record<string, string>>({});
    const { addNotification } = useNotification();

    const expectedCashSales = useMemo(() => 
        salesData.filter(s => s.method === 'Efectivo').reduce((sum, s) => sum + s.total, 0),
    [salesData]);

    const physicalCashTotal = useMemo(() => 
        DENOMINATIONS.reduce((sum, d) => sum + (d * (Number(counts[d]) || 0)), 0),
    [counts]);
    
    const expectedTotalInDrawer = (Number(initialCash) || 0) + expectedCashSales - (Number(cashOutflows) || 0);
    const difference = physicalCashTotal - expectedTotalInDrawer;

    const formatCurrency = (value: number) => `$${value.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}`;

    const handleFinalizeCut = async () => {
        try {
            const now = new Date();
            const formattedDate = now.toLocaleString('es-MX', { dateStyle: 'long', timeStyle: 'short' });

            // Preparar datos del corte
            const corteData = {
                sucursal: branch,
                realizadoPor: 'Usuario Actual', // TODO: Obtener de contexto de autenticación
                fondoInicial: Number(initialCash) || 0,
                ventasEfectivo: expectedCashSales,
                salidasEfectivo: Number(cashOutflows) || 0,
                totalContado: physicalCashTotal,
                desgloseDenominaciones: counts,
                ventasFolios: salesData.map(s => s.id),
                observaciones: null,
                ipAddress: null, // TODO: Obtener IP del cliente si es necesario
            };

            // Crear corte en backend
            const response = await financeService.corteCaja.create(corteData);

            if (!response.success || !response.data) {
                throw new Error(response.error || 'Error al crear corte de caja');
            }

            const corte = response.data;

            // Verificar si requiere aprobación
            if (corte.requiereAprobacion) {
                addNotification(
                    'Corte requiere aprobación',
                    `Diferencia de $${Math.abs(corte.diferencia).toFixed(2)} requiere aprobación de supervisor`,
                    'warning',
                    'ERP'
                );

                alert(
                    `⚠️ ATENCIÓN: REQUIERE APROBACIÓN\n\n` +
                    `Diferencia detectada: ${corte.tipoDiferencia}\n` +
                    `Monto: $${Math.abs(corte.diferencia).toFixed(2)}\n\n` +
                    `Este corte ha sido registrado pero requiere aprobación de un supervisor ` +
                    `antes de ser cerrado definitivamente.\n\n` +
                    `Folio: ${corte.folio}`
                );
            } else {
                // Cerrar corte automáticamente si no requiere aprobación
                await financeService.corteCaja.cerrar(corte.id);

                addNotification(
                    'Corte de Caja registrado',
                    `${branch} • ${corte.tipoDiferencia} • Folio: ${corte.folio}`,
                    corte.tipoDiferencia === 'CUADRE_PERFECTO' ? 'success' : 'info',
                    'ERP'
                );
            }

            // Preparar mensaje de WhatsApp
            let resultText = "✅ *CUADRE PERFECTO*";
            if (difference > 0) {
                resultText = `⚠️ *SOBRANTE:* ${formatCurrency(difference)}`;
            } else if (difference < 0) {
                resultText = `🚨 *FALTANTE:* ${formatCurrency(difference)}`;
            }

            const countsDetail = DENOMINATIONS.map(d => `$${d} x ${counts[d] || 0}`).join('\n');

            const message = `
*Corte de Caja - Agronare* 📊

*Folio:* ${corte.folio}
*Sucursal:* ${branch}
*Fecha:* ${formattedDate}
*Realizado por:* ${corte.realizadoPor}

*RESUMEN DE CAJA*
💰 *Fondo Inicial:* ${formatCurrency(Number(initialCash) || 0)}
📈 *Ventas Efectivo (Sistema):* ${formatCurrency(expectedCashSales)}
📉 *Salidas de Efectivo:* ${formatCurrency(Number(cashOutflows) || 0)}
💻 *TOTAL ESPERADO:* ${formatCurrency(expectedTotalInDrawer)}

*CONTEO FÍSICO*
💵 *TOTAL CONTADO:* ${formatCurrency(physicalCashTotal)}

*RESULTADO*
⚖️ *DIFERENCIA:* ${resultText}

${corte.requiereAprobacion ? '⚠️ *REQUIERE APROBACIÓN DE SUPERVISOR*\n' : ''}
${countsDetail}
            `.trim();

            // Enviar por WhatsApp
            const phoneNumber = '524432270901';
            const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
            window.open(whatsappUrl, '_blank');

            // Registrar envío de WhatsApp
            await financeService.corteCaja.marcarWhatsappEnviado(corte.id);

            onClose();

        } catch (err) {
            console.error('Error registrando corte de caja:', err);
            addNotification(
                'Error en Corte de Caja',
                'No se pudo registrar el corte de caja. Intente nuevamente.',
                'error',
                'ERP'
            );
            alert(`Error al registrar corte de caja:\n\n${err instanceof Error ? err.message : 'Error desconocido'}`);
        }
    };

    const generatePDF = () => {
        const doc = new jsPDF();
        doc.setFontSize(18);
        doc.text("Corte de Caja", 105, 20, { align: 'center' });
        doc.setFontSize(10);
        doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 20, 30);
        doc.text(`Sucursal: ${branch}`, 20, 35);
        
        const data = [
            ['Fondo Inicial', `${formatCurrency(Number(initialCash) || 0)}`],
            ['(+) Ventas en Efectivo', `${formatCurrency(expectedCashSales)}`],
            ['(-) Salidas de Efectivo', `-${formatCurrency(Number(cashOutflows) || 0)}`],
            ['', ''],
            ['Total Esperado en Caja', `${formatCurrency(expectedTotalInDrawer)}`],
            ['Total Físico Contado', `${formatCurrency(physicalCashTotal)}`],
            ['', ''],
            ['DIFERENCIA', `${formatCurrency(difference)} ${difference > 0 ? '(SOBRANTE)' : difference < 0 ? '(FALTANTE)' : ''}`],
        ];

        (doc as any).autoTable({
            startY: 45,
            head: [['Concepto', 'Monto']],
            body: data,
            theme: 'striped',
            headStyles: { fillColor: [22, 163, 74] },
        });
        // Agregar desglose de denominaciones
        const denomRows = DENOMINATIONS.map(d => {
            const qty = Number(counts[d]) || 0;
            const amount = d * qty;
            return [`$${d}`, String(qty), formatCurrency(amount)];
        });
        (doc as any).autoTable({
            startY: (doc as any).lastAutoTable.finalY + 10,
            head: [['Denominación', 'Cantidad', 'Importe']],
            body: [...denomRows, ['TOTAL', '', formatCurrency(physicalCashTotal)]],
            theme: 'grid',
            headStyles: { fillColor: [99, 102, 241] },
        });
        // Nota de auditoría
        const auditY = (doc as any).lastAutoTable.finalY + 10;
        doc.setFontSize(9);
        const statusTxt = Math.abs(difference) < 0.01 ? 'CUADRE PERFECTO' : (difference > 0 ? 'SOBRANTE' : 'FALTANTE');
        doc.text(`Auditoría: ${statusTxt} • Esperado ${formatCurrency(expectedTotalInDrawer)} • Contado ${formatCurrency(physicalCashTotal)} • Diferencia ${formatCurrency(difference)}`, 20, auditY);
        
        doc.save(`corte_caja_${branch}_${new Date().toISOString().split('T')[0]}.pdf`);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 p-4">
            <div className="bg-white rounded-2xl w-full max-w-3xl flex flex-col max-h-[90vh]">
                <div className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-lg font-bold flex items-center"><Calculator className="mr-2"/> Corte de Caja</h2>
                    <button onClick={onClose}><X /></button>
                </div>
                <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left: Calculations */}
                    <div className="space-y-4">
                        <h3 className="font-bold text-slate-700">Resumen de Caja</h3>
                        <div className="bg-slate-50 p-3 rounded-lg">
                            <label className="text-xs text-slate-500">Fondo Inicial de Caja</label>
                            <input type="number" value={initialCash} onChange={e => setInitialCash(e.target.value)} className="w-full p-2 border rounded" placeholder="0.00" />
                        </div>
                         <div className="bg-slate-50 p-3 rounded-lg">
                            <label className="text-xs text-slate-500">Ventas en Efectivo (Sistema)</label>
                            <p className="font-bold text-lg p-2">{formatCurrency(expectedCashSales)}</p>
                        </div>
                         <div className="bg-slate-50 p-3 rounded-lg">
                            <label className="text-xs text-slate-500">Salidas de Efectivo (Egresos)</label>
                            <input type="number" value={cashOutflows} onChange={e => setCashOutflows(e.target.value)} className="w-full p-2 border rounded" placeholder="0.00" />
                        </div>
                        <div className="bg-slate-800 text-white p-4 rounded-lg text-center">
                            <p className="text-sm text-slate-300">Total Esperado en Caja</p>
                            <p className="font-bold text-2xl">{formatCurrency(expectedTotalInDrawer)}</p>
                        </div>
                         <div className={`p-4 rounded-lg text-center ${Math.abs(difference) < 0.01 ? 'bg-slate-100' : difference > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                            <p className="text-sm">Diferencia</p>
                            <p className="font-bold text-2xl flex items-center justify-center gap-2">
                                {Math.abs(difference) < 0.01 ? null : difference > 0 ? <CheckCircle /> : <AlertTriangle />}
                                {formatCurrency(difference)}
                            </p>
                            <p className="text-xs font-bold">{Math.abs(difference) < 0.01 ? 'CUADRE PERFECTO' : (difference > 0 ? 'SOBRANTE' : 'FALTANTE')}</p>
                        </div>

                        {/* Alerta de aprobación requerida */}
                        {Math.abs(difference) >= 100 && (
                            <div className="p-4 rounded-lg bg-orange-50 border-2 border-orange-300 text-orange-800 text-center">
                                <AlertTriangle className="w-6 h-6 mx-auto mb-2" />
                                <p className="font-bold text-sm">ATENCIÓN: Diferencia superior a $100</p>
                                <p className="text-xs mt-1">Este corte requerirá aprobación de supervisor</p>
                            </div>
                        )}
                    </div>

                    {/* Right: Physical Count */}
                    <div>
                        <h3 className="font-bold text-slate-700 mb-4">Conteo Físico</h3>
                        <div className="grid grid-cols-3 gap-2 text-sm">
                            {DENOMINATIONS.map(d => (
                                <div key={d} className="flex items-center gap-2">
                                    <span className="w-12 text-right font-bold">${d} x</span>
                                    <input type="number" value={counts[d] || ''} onChange={e => setCounts({...counts, [d]: e.target.value})} className="w-full border rounded p-1 text-center" />
                                </div>
                            ))}
                        </div>
                        <div className="bg-indigo-600 text-white p-4 rounded-lg text-center mt-6">
                            <p className="text-sm text-indigo-200">Total Físico Contado</p>
                            <p className="font-bold text-2xl">{formatCurrency(physicalCashTotal)}</p>
                        </div>
                    </div>
                </div>
                <div className="p-4 border-t flex justify-end gap-2">
                    <button onClick={generatePDF} className="px-4 py-2 flex items-center gap-2 border rounded-lg hover:bg-slate-50"><Download className="w-4 h-4" /> Generar PDF</button>
                    <button onClick={handleFinalizeCut} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Finalizar Corte</button>
                </div>
            </div>
        </div>
    );
};