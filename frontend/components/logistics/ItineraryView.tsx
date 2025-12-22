import React, { useState } from 'react';
import {
    GripVertical, MapPin, Clock, CheckCircle2, AlertCircle,
    Navigation, Truck, User, Package, Calendar
} from 'lucide-react';

interface ItineraryStop {
    id: string;
    title: string;
    address: string;
    coordinates: { lat: number; lng: number };
    type: 'Entrega' | 'Recolección' | 'Asesoría Técnica' | 'Visita Comercial';
    estimatedTime: string;
    duration: string;
    status: 'Pendiente' | 'En Ruta' | 'Completada';
    assignedDriver?: string;
    notes?: string;
}

interface ItineraryViewProps {
    stops: ItineraryStop[];
    onReorder: (reorderedStops: ItineraryStop[]) => void;
    vehicleInfo?: {
        name: string;
        plate: string;
        driver: string;
    };
}

export const ItineraryView: React.FC<ItineraryViewProps> = ({
    stops,
    onReorder,
    vehicleInfo
}) => {
    const [draggedItem, setDraggedItem] = useState<string | null>(null);
    const [dragOverItem, setDragOverItem] = useState<string | null>(null);

    const handleDragStart = (e: React.DragEvent, itemId: string) => {
        setDraggedItem(itemId);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', itemId);
    };

    const handleDragOver = (e: React.DragEvent, itemId: string) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        if (draggedItem !== itemId) {
            setDragOverItem(itemId);
        }
    };

    const handleDrop = (e: React.DragEvent, dropItemId: string) => {
        e.preventDefault();

        if (!draggedItem || draggedItem === dropItemId) {
            setDraggedItem(null);
            setDragOverItem(null);
            return;
        }

        const draggedIndex = stops.findIndex(stop => stop.id === draggedItem);
        const dropIndex = stops.findIndex(stop => stop.id === dropItemId);

        if (draggedIndex === -1 || dropIndex === -1) return;

        const newStops = [...stops];
        const [removed] = newStops.splice(draggedIndex, 1);
        newStops.splice(dropIndex, 0, removed);

        onReorder(newStops);
        setDraggedItem(null);
        setDragOverItem(null);
    };

    const handleDragEnd = () => {
        setDraggedItem(null);
        setDragOverItem(null);
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'Entrega':
                return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800';
            case 'Recolección':
                return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800';
            case 'Asesoría Técnica':
                return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
            default:
                return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'Completada':
                return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
            case 'En Ruta':
                return <Navigation className="w-4 h-4 text-blue-500 animate-pulse" />;
            default:
                return <Clock className="w-4 h-4 text-slate-400" />;
        }
    };

    const calculateTotalTime = () => {
        return stops.reduce((total, stop) => {
            const minutes = parseInt(stop.duration) || 30;
            return total + minutes;
        }, 0);
    };

    return (
        <div className="space-y-6 animate-fadeIn">
            {/* Header Info */}
            {vehicleInfo && (
                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                                <Truck className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900 dark:text-white">{vehicleInfo.name}</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    {vehicleInfo.plate} • Conductor: {vehicleInfo.driver}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-6 text-sm">
                            <div className="text-center">
                                <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                                    {stops.length}
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-medium">
                                    Paradas
                                </p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                                    {Math.floor(calculateTotalTime() / 60)}h {calculateTotalTime() % 60}m
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-medium">
                                    Tiempo Est.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Drag Instructions */}
            <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-3 flex items-center gap-3">
                <GripVertical className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <p className="text-sm text-indigo-700 dark:text-indigo-300">
                    <span className="font-semibold">Tip:</span> Arrastra las paradas para reordenar el itinerario
                </p>
            </div>

            {/* Itinerary List */}
            <div className="space-y-3">
                {stops.map((stop, index) => (
                    <div
                        key={stop.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, stop.id)}
                        onDragOver={(e) => handleDragOver(e, stop.id)}
                        onDrop={(e) => handleDrop(e, stop.id)}
                        onDragEnd={handleDragEnd}
                        className={`
                            bg-white dark:bg-slate-900 rounded-xl border-2
                            ${draggedItem === stop.id ? 'opacity-50 scale-95' : 'opacity-100 scale-100'}
                            ${dragOverItem === stop.id ? 'border-indigo-500 dark:border-indigo-400' : 'border-slate-200 dark:border-slate-700'}
                            shadow-sm hover:shadow-md transition-all cursor-move
                        `}
                    >
                        <div className="p-4">
                            <div className="flex items-start gap-4">
                                {/* Drag Handle */}
                                <div className="flex flex-col items-center gap-2 pt-1">
                                    <GripVertical className="w-5 h-5 text-slate-400" />
                                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-sm text-slate-600 dark:text-slate-400">
                                        {index + 1}
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h4 className="font-bold text-slate-900 dark:text-white truncate">
                                                    {stop.title}
                                                </h4>
                                                {getStatusIcon(stop.status)}
                                            </div>
                                            <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                                <MapPin className="w-3 h-3" />
                                                {stop.address}
                                            </p>
                                        </div>
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold border whitespace-nowrap ${getTypeColor(stop.type)}`}>
                                            {stop.type}
                                        </span>
                                    </div>

                                    {/* Details Grid */}
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3 text-xs">
                                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                            <Clock className="w-4 h-4" />
                                            <span>{stop.estimatedTime}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                            <Calendar className="w-4 h-4" />
                                            <span>{stop.duration} min</span>
                                        </div>
                                        {stop.assignedDriver && (
                                            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                                <User className="w-4 h-4" />
                                                <span>{stop.assignedDriver}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Notes */}
                                    {stop.notes && (
                                        <div className="mt-3 p-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                                            <p className="text-xs text-slate-600 dark:text-slate-400">
                                                <Package className="w-3 h-3 inline mr-1" />
                                                {stop.notes}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Connection Line (except for last item) */}
                        {index < stops.length - 1 && (
                            <div className="flex justify-center">
                                <div className="w-0.5 h-4 bg-gradient-to-b from-slate-300 to-transparent dark:from-slate-700"></div>
                            </div>
                        )}
                    </div>
                ))}

                {stops.length === 0 && (
                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-12 text-center">
                        <AlertCircle className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
                        <h3 className="font-bold text-slate-900 dark:text-white mb-2">
                            No hay paradas programadas
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Agrega tareas de logística para crear un itinerario
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};
