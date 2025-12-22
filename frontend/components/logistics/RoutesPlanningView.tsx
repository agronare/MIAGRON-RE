import React, { useState, useRef, useEffect } from 'react';
import {
    FileText, Download, Send, Check, X, Edit3, Save,
    MapPin, Truck, Calendar, User, Package, Clock, AlertCircle
} from 'lucide-react';

interface RouteInfo {
    id: string;
    vehicleName: string;
    driverName: string;
    date: string;
    stops: number;
    totalDistance: string;
    estimatedTime: string;
    status: 'Borrador' | 'Enviada' | 'Firmada' | 'Rechazada';
}

interface SignatureData {
    driverSignature?: string;
    driverName: string;
    signedAt?: string;
    observations?: string;
}

interface RoutesPlanningViewProps {
    route: RouteInfo;
    onSaveRoute?: (routeData: RouteInfo & SignatureData) => void;
    onSendForSignature?: (routeId: string) => void;
}

export const RoutesPlanningView: React.FC<RoutesPlanningViewProps> = ({
    route,
    onSaveRoute,
    onSendForSignature
}) => {
    const [isDrawing, setIsDrawing] = useState(false);
    const [signature, setSignature] = useState<string | null>(null);
    const [observations, setObservations] = useState('');
    const [showSignaturePanel, setShowSignaturePanel] = useState(false);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        // Initialize canvas
        if (canvasRef.current) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.strokeStyle = '#1e293b';
                ctx.lineWidth = 2;
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';
            }
        }
    }, [showSignaturePanel]);

    const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        setIsDrawing(true);
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const rect = canvas.getBoundingClientRect();
        const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.nativeEvent.offsetX;
        const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.nativeEvent.offsetY;

        ctx.beginPath();
        ctx.moveTo(x, y);
    };

    const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        if (!isDrawing) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const rect = canvas.getBoundingClientRect();
        const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.nativeEvent.offsetX;
        const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.nativeEvent.offsetY;

        ctx.lineTo(x, y);
        ctx.stroke();
    };

    const stopDrawing = () => {
        setIsDrawing(false);
    };

    const clearSignature = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setSignature(null);
    };

    const saveSignature = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const dataUrl = canvas.toDataURL('image/png');
        setSignature(dataUrl);
        setShowSignaturePanel(false);

        // Call the save callback
        if (onSaveRoute) {
            onSaveRoute({
                ...route,
                driverSignature: dataUrl,
                driverName: route.driverName,
                signedAt: new Date().toISOString(),
                observations
            });
        }
    };

    const exportRouteSheet = () => {
        // In a real implementation, this would generate a PDF or print the route sheet
        window.print();
    };

    const sendForSignature = () => {
        if (onSendForSignature) {
            onSendForSignature(route.id);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'Firmada':
                return (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                        <Check className="w-3 h-3 mr-1" />
                        Firmada
                    </span>
                );
            case 'Enviada':
                return (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                        <Send className="w-3 h-3 mr-1" />
                        Enviada
                    </span>
                );
            case 'Rechazada':
                return (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800">
                        <X className="w-3 h-3 mr-1" />
                        Rechazada
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                        <Edit3 className="w-3 h-3 mr-1" />
                        Borrador
                    </span>
                );
        }
    };

    return (
        <div className="space-y-6 animate-fadeIn">
            {/* Header */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                                Hoja de Ruta #{route.id}
                            </h2>
                            {getStatusBadge(route.status)}
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Planificación de ruta para aprobación y firma digital
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={exportRouteSheet}
                            className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-2"
                        >
                            <Download className="w-4 h-4" />
                            Exportar
                        </button>
                        {route.status === 'Borrador' && (
                            <button
                                onClick={sendForSignature}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2"
                            >
                                <Send className="w-4 h-4" />
                                Enviar a Firma
                            </button>
                        )}
                    </div>
                </div>

                {/* Route Details Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                    <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                        <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                            <Truck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Vehículo</p>
                            <p className="font-bold text-slate-900 dark:text-white">{route.vehicleName}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                        <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                            <User className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Conductor</p>
                            <p className="font-bold text-slate-900 dark:text-white">{route.driverName}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                            <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Fecha</p>
                            <p className="font-bold text-slate-900 dark:text-white">{route.date}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                            <MapPin className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Paradas</p>
                            <p className="font-bold text-slate-900 dark:text-white">{route.stops}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Route Summary */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <Package className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    Resumen de Ruta
                </h3>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Distancia Total</p>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">{route.totalDistance}</p>
                    </div>
                    <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Tiempo Estimado</p>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">{route.estimatedTime}</p>
                    </div>
                </div>
            </div>

            {/* Signature Section */}
            {route.status !== 'Borrador' && (
                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                        <Edit3 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                        Firma Digital
                    </h3>

                    {!signature && !showSignaturePanel && (
                        <button
                            onClick={() => setShowSignaturePanel(true)}
                            className="w-full p-8 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl hover:border-indigo-500 dark:hover:border-indigo-400 transition-colors text-center"
                        >
                            <Edit3 className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                Click para firmar la hoja de ruta
                            </p>
                        </button>
                    )}

                    {showSignaturePanel && (
                        <div className="space-y-4">
                            <div className="border-2 border-slate-300 dark:border-slate-700 rounded-xl overflow-hidden bg-white">
                                <canvas
                                    ref={canvasRef}
                                    width={600}
                                    height={200}
                                    onMouseDown={startDrawing}
                                    onMouseMove={draw}
                                    onMouseUp={stopDrawing}
                                    onMouseLeave={stopDrawing}
                                    onTouchStart={startDrawing}
                                    onTouchMove={draw}
                                    onTouchEnd={stopDrawing}
                                    className="w-full cursor-crosshair touch-none"
                                    style={{ touchAction: 'none' }}
                                />
                            </div>
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        Observaciones (opcional)
                                    </label>
                                    <textarea
                                        value={observations}
                                        onChange={(e) => setObservations(e.target.value)}
                                        placeholder="Agregar notas o comentarios..."
                                        className="w-full p-3 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white resize-none"
                                        rows={3}
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={clearSignature}
                                        className="flex-1 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                                    >
                                        Limpiar
                                    </button>
                                    <button
                                        onClick={saveSignature}
                                        className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Save className="w-4 h-4" />
                                        Guardar Firma
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {signature && (
                        <div className="space-y-4">
                            <div className="border-2 border-emerald-300 dark:border-emerald-700 rounded-xl overflow-hidden bg-white p-4">
                                <img src={signature} alt="Firma" className="w-full" />
                            </div>
                            <div className="flex items-center justify-between p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                                        <Check className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-emerald-700 dark:text-emerald-400">
                                            Firmado por {route.driverName}
                                        </p>
                                        <p className="text-xs text-emerald-600 dark:text-emerald-500">
                                            {new Date().toLocaleString('es-MX')}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => {
                                        setSignature(null);
                                        setShowSignaturePanel(true);
                                    }}
                                    className="px-3 py-1.5 bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-700 rounded-lg text-sm font-medium hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
                                >
                                    Firmar de nuevo
                                </button>
                            </div>
                            {observations && (
                                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                        Observaciones:
                                    </p>
                                    <p className="text-sm text-slate-600 dark:text-slate-400">{observations}</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Info Banner */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                    <p className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">
                        Proceso de Firma Digital
                    </p>
                    <p className="text-xs text-blue-600 dark:text-blue-400">
                        La firma digital garantiza la autenticidad y conformidad del conductor con el itinerario asignado.
                        Una vez firmada, la hoja de ruta será vinculante y quedará registrada en el sistema.
                    </p>
                </div>
            </div>
        </div>
    );
};
