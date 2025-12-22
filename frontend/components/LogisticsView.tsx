
import React, { useState, useMemo, useEffect } from 'react';
import {
    MapPin, Truck, DollarSign, Plus, FileText, Sparkles, Loader2,
    Search, Filter, Calendar, User, Package, Tractor, Navigation,
    CheckCircle2, Clock, AlertCircle, List, Grid, ChevronRight, Settings,
    ExternalLink, Route, ClipboardList, Map
} from 'lucide-react';
import { LogisticsTask, Vehicle, Driver, Client, Supplier, FixedAsset, Employee } from '../types';
import { LogisticsTaskModal } from './logistics/LogisticsTaskModal';
import { ItineraryView } from './logistics/ItineraryView';
import { RoutesPlanningView } from './logistics/RoutesPlanningView';
import { optimizeRouteWithAI, RouteStop } from '../services/geminiService';

// Helper to calculate distance between two coordinates (Haversine formula simplified)
const getDistance = (coord1: {lat: number, lng: number}, coord2: {lat: number, lng: number}) => {
    const R = 6371; // Radius of the earth in km
    const dLat = (coord2.lat - coord1.lat) * (Math.PI / 180);
    const dLon = (coord2.lng - coord1.lng) * (Math.PI / 180);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(coord1.lat * (Math.PI / 180)) * Math.cos(coord2.lat * (Math.PI / 180)) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
    return R * c; // Distance in km
};

// Link to Google Maps instead of embedding to avoid API key issues
const MapVisualization = ({ tasks, isOptimized }: { tasks: LogisticsTask[], isOptimized: boolean }) => {
    
    const constructDirectionsUrl = () => {
        if (!tasks || tasks.length === 0) return "#";
        
        // Limit to avoid URL length issues in browsers, though Google Maps handles many
        const routeTasks = tasks.slice(0, 20); 
        
        const origin = `${routeTasks[0].coordinates.lat},${routeTasks[0].coordinates.lng}`;
        let url = `https://www.google.com/maps/dir/?api=1&origin=${origin}`;

        if (routeTasks.length > 1) {
            const destination = `${routeTasks[routeTasks.length - 1].coordinates.lat},${routeTasks[routeTasks.length - 1].coordinates.lng}`;
            url += `&destination=${destination}`;
        }

        if (routeTasks.length > 2) {
            const waypoints = routeTasks.slice(1, -1)
                .map(task => `${task.coordinates.lat},${task.coordinates.lng}`)
                .join('|');
            url += `&waypoints=${waypoints}`;
        }
        
        return url;
    };

    const url = constructDirectionsUrl();

    return (
        <div className="relative w-full h-[500px] bg-slate-900 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-inner group block">
            {/* Static Map Background */}
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=1600&q=80')] bg-cover opacity-40 group-hover:opacity-50 transition-opacity duration-300"></div>
            
            {/* Connection Lines (Visual only) */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-60" style={{zIndex: 10}}>
                 <defs>
                    <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#6366f1" stopOpacity="0" />
                        <stop offset="50%" stopColor="#6366f1" stopOpacity="1" />
                        <stop offset="100%" stopColor="#818cf8" stopOpacity="0" />
                    </linearGradient>
                </defs>
                {/* Simulated route path for visual effect */}
                <path d="M 100 400 Q 300 100, 600 300 T 900 200" stroke="url(#routeGradient)" strokeWidth="3" fill="none" strokeDasharray="8 4" className="animate-pulse"/>
            </svg>

            <div className="absolute inset-0 flex items-center justify-center z-20">
                <a 
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-center text-white p-8 rounded-2xl bg-slate-900/60 backdrop-blur-md border border-white/10 hover:bg-slate-900/80 transition-all transform hover:scale-105 group/btn"
                >
                    <div className="relative">
                        <MapPin className="w-12 h-12 text-indigo-400 mx-auto mb-3 drop-shadow-lg" />
                        {isOptimized && <span className="absolute -top-1 -right-1 flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span></span>}
                    </div>
                    <h3 className="font-bold text-xl mb-1">
                        {isOptimized ? 'Ruta Optimizada Lista' : 'Visualizar Ruta en Mapa'}
                    </h3>
                    <p className="text-sm text-slate-300 mb-4 max-w-xs mx-auto">
                        {(tasks || []).length} paradas programadas. Click para navegar con Google Maps.
                    </p>
                    <div className="flex items-center justify-center gap-2 text-xs font-mono text-indigo-300 bg-black/30 py-1 px-3 rounded-full w-fit mx-auto">
                        <ExternalLink className="w-3 h-3" /> Abrir GPS
                    </div>
                </a>
            </div>

            {/* Task Counters */}
            <div className="absolute bottom-4 left-4 z-20 flex gap-2">
                <div className="bg-slate-900/80 backdrop-blur text-white px-3 py-1.5 rounded-lg text-xs border border-white/10">
                    <span className="font-bold text-indigo-400">{(tasks || []).length}</span> Tareas
                </div>
                {isOptimized && (
                    <div className="bg-emerald-900/80 backdrop-blur text-emerald-100 px-3 py-1.5 rounded-lg text-xs border border-emerald-500/30 flex items-center">
                        <Sparkles className="w-3 h-3 mr-1" /> IA Optimizada
                    </div>
                )}
            </div>
        </div>
    );
};

const FleetGrid = ({ vehicles, drivers }: { vehicles: Vehicle[], drivers: Driver[] }) => {
    const getDriverName = (driverId?: string) => {
        if (!driverId) return 'N/A';
        return drivers.find(d => d.id === driverId)?.name || 'Desconocido';
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-fadeIn">
            {(vehicles || []).map(v => (
                <div key={v.id} className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-400">
                                <Truck className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-900 dark:text-white">{v.name}</h4>
                                <p className="text-xs text-slate-500 dark:text-slate-400">{v.plate}</p>
                            </div>
                        </div>
                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${v.status === 'En Ruta' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : v.status === 'Mantenimiento' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                            {v.status}
                        </span>
                    </div>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-slate-500 dark:text-slate-400">Capacidad</span>
                            <span className="font-medium text-slate-700 dark:text-slate-200">{v.capacity}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-500 dark:text-slate-400">Combustible</span>
                            <div className="flex items-center gap-2">
                                <div className="w-16 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                    <div className="h-full bg-indigo-600 rounded-full" style={{width: `${v.fuelLevel}%`}}></div>
                                </div>
                                <span className="font-medium text-xs text-slate-700 dark:text-slate-200">{v.fuelLevel}%</span>
                            </div>
                        </div>
                         <div className="flex justify-between">
                            <span className="text-slate-500 dark:text-slate-400">Conductor</span>
                            <span className="font-medium text-slate-700 dark:text-slate-200">{getDriverName(v.driverId)}</span>
                        </div>
                    </div>
                </div>
            ))}
            {(vehicles || []).length === 0 && (
                <div className="col-span-3 p-8 text-center text-slate-400">
                    <Truck className="w-12 h-12 mx-auto mb-2 opacity-20" />
                    <p>No hay vehículos registrados en Activos Fijos.</p>
                </div>
            )}
        </div>
    );
};

const TaskList = ({ tasks, onEdit }: { tasks: LogisticsTask[], onEdit: (t: LogisticsTask) => void }) => (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm animate-fadeIn">
        <div className="overflow-x-auto">
            <table className="w-full text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                    <tr>
                        <th className="p-3 text-left font-semibold text-slate-600 dark:text-slate-400">Orden</th>
                        <th className="p-3 text-left font-semibold text-slate-600 dark:text-slate-400">Tipo</th>
                        <th className="p-3 text-left font-semibold text-slate-600 dark:text-slate-400">Cliente / Destino</th>
                        <th className="p-3 text-left font-semibold text-slate-600 dark:text-slate-400">Asignado</th>
                        <th className="p-3 text-left font-semibold text-slate-600 dark:text-slate-400">Fecha</th>
                        <th className="p-3 text-center font-semibold text-slate-600 dark:text-slate-400">Estado</th>
                        <th className="p-3 text-right font-semibold text-slate-600 dark:text-slate-400">Acción</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {(tasks || []).map((task, index) => (
                        <tr key={task.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer" onClick={() => onEdit(task)}>
                            <td className="p-3">
                                <div className="w-6 h-6 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-xs font-bold text-slate-500">
                                    {index + 1}
                                </div>
                            </td>
                            <td className="p-3">
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold 
                                    ${task.type === 'Entrega' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 
                                      task.type === 'Recolección' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' : 
                                      task.type === 'Asesoría Técnica' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'}`}>
                                    {task.type === 'Asesoría Técnica' && <Tractor className="w-3 h-3 mr-1" />}
                                    {task.type}
                                </span>
                            </td>
                            <td className="p-3 font-medium text-slate-800 dark:text-slate-200">{task.title}</td>
                            <td className="p-3 text-slate-600 dark:text-slate-400">{task.assignedTo || '-'}</td>
                            <td className="p-3 text-slate-500 dark:text-slate-400">{new Date(task.scheduledDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</td>
                            <td className="p-3 text-center">
                                <span className={`text-xs font-medium px-2 py-0.5 rounded border ${
                                    task.status === 'Completada' ? 'bg-white dark:bg-slate-800 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400' :
                                    task.status === 'En Ruta' ? 'bg-white dark:bg-slate-800 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400' :
                                    'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400'
                                }`}>
                                    {task.status}
                                </span>
                            </td>
                            <td className="p-3 text-right">
                                <button className="text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400"><ChevronRight className="w-5 h-5" /></button>
                            </td>
                        </tr>
                    ))}
                    {(tasks || []).length === 0 && (
                        <tr>
                            <td colSpan={7} className="p-8 text-center text-slate-400">
                                No hay tareas programadas. Registre clientes o proveedores para generar rutas.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    </div>
);

interface LogisticsViewProps {
    clients: Client[];
    suppliers: Supplier[];
    fixedAssets: FixedAsset[];
    employees: Employee[];
    vehicles?: any[];
    trips?: any[];
    deliveries?: any[];
    pickups?: any[];
}

export const LogisticsView: React.FC<LogisticsViewProps> = ({ clients = [], suppliers = [], fixedAssets = [], employees = [], vehicles: vehiclesFromBackend = [], trips: tripsFromBackend = [], deliveries: deliveriesFromBackend = [], pickups: pickupsFromBackend = [] }) => {
    const [activeTab, setActiveTab] = useState<'operations' | 'schedule' | 'fleet' | 'itinerary' | 'planning'>('operations');
    const [tasks, setTasks] = useState<LogisticsTask[]>([]);
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<LogisticsTask | null>(null);
    const [isGeneratingRoute, setIsGeneratingRoute] = useState(false);
    const [isRouteOptimized, setIsRouteOptimized] = useState(false);
    const [aiOptimizationResult, setAiOptimizationResult] = useState<any>(null);

    const drivers: Driver[] = useMemo(() => {
        return (employees || []).map(emp => ({
            id: emp.id,
            name: `${emp.firstName} ${emp.lastName}`,
            license: `LIC-${emp.id.substring(4)}`,
            status: 'Disponible' // Default status, updated by assignments below
        }));
    }, [employees]);

    const vehicles: Vehicle[] = useMemo(() => {
        // Prefer backend vehicles if provided
        if ((vehiclesFromBackend || []).length > 0) {
            return (vehiclesFromBackend as any[]).map((v, index) => ({
                id: String(v.id ?? `veh-${index}`),
                name: v.nombre || v.name || `Vehículo ${index+1}`,
                plate: v.placas || v.plate || `PLATE-${index+1}`,
                type: v.tipo || 'Vehículo',
                status: (v.estado as any) || 'Disponible',
                capacity: String(v.capacidad || '1 Ton'),
                fuelLevel: Number(v.kilometrajeActual || 50),
                driverId: v.conductorId ? String(v.conductorId) : undefined,
            }));
        }
        // Fallback: filter real vehicles from fixed assets
        return (fixedAssets || [])
            .filter(asset => asset.category === 'Vehículo' && asset.status !== 'Dado de Baja')
            .map((asset, index) => {
                // Simulate random status/assignment if not strictly tracked in backend yet
                const isBusy = index % 3 === 0; 
                let status: Vehicle['status'] = asset.status === 'En Mantenimiento' ? 'Mantenimiento' : (isBusy ? 'En Ruta' : 'Disponible');
                let driverId: string | undefined = undefined;

                if (status === 'En Ruta' && drivers.length > 0) {
                    // Assign a driver for demo purposes
                    const driver = drivers[index % drivers.length];
                    if (driver) {
                        driverId = driver.id;
                        driver.status = 'En Ruta'; // Update driver status reference
                    }
                }

                return {
                    id: asset.id,
                    name: asset.name,
                    plate: asset.assetId || `PLATE-${123 + index}`,
                    type: asset.name.toLowerCase().includes('camioneta') ? 'Camioneta' : asset.name.toLowerCase().includes('camión') ? 'Camión' : 'Automóvil',
                    status,
                    capacity: asset.description?.match(/\d+(\.\d+)?\s*Ton/i)?.[0] || '1 Ton',
                    fuelLevel: Math.floor(Math.random() * 60) + 40,
                    driverId: driverId,
                };
            });
    }, [fixedAssets, drivers]);

    // Basic sections to show backend synced lists
    const trips = tripsFromBackend || [];
    const deliveries = deliveriesFromBackend || [];
    const pickups = pickupsFromBackend || [];

    useEffect(() => {
        // Generate tasks from real clients and suppliers using their REAL coordinates if available
        const clientTasks: LogisticsTask[] = (clients || []).map((client, index) => {
            const addressString = client.address 
                ? `${client.address.street} ${client.address.exteriorNo}, ${client.address.colony}, ${client.address.municipality}`
                : 'Dirección no disponible';
            
            const vehicle = vehicles.find(v => v.status === 'En Ruta' && index % 2 === 0);
            const assignedDriver = vehicle ? drivers.find(d => d.id === vehicle.driverId) : undefined;

            // Prioritize Client Coordinates, fallback to a default center if missing (Morelia Center aprox)
            const lat = client.coordinates?.lat || 19.70078;
            const lng = client.coordinates?.lng || -101.18443;

            return {
                id: `task-c-${client.id}`,
                type: client.isFarmer ? 'Asesoría Técnica' : 'Entrega',
                title: client.name,
                address: addressString,
                coordinates: { lat, lng },
                status: index < 2 ? 'Completada' : (vehicle ? 'En Ruta' : 'Pendiente'),
                scheduledDate: new Date(Date.now() + (index * 3600 * 1000)).toISOString(),
                assignedTo: assignedDriver?.name,
                vehicleId: vehicle?.id,
                notes: client.isFarmer ? 'Revisión de cultivo' : 'Entrega de insumos'
            };
        });

        const supplierTasks: LogisticsTask[] = (suppliers || []).map((supplier, index) => {
             // Fallback for suppliers as they might not have coords yet
             const lat = 19.70 + (Math.random() * 0.1 - 0.05);
             const lng = -101.19 + (Math.random() * 0.1 - 0.05);
             
             return {
                id: `task-s-${supplier.id}`,
                type: 'Recolección',
                title: supplier.companyName,
                address: 'Dirección de proveedor',
                coordinates: { lat, lng },
                status: 'Pendiente',
                scheduledDate: new Date(Date.now() + 24 * 3600 * 1000 + (index * 3600 * 1000)).toISOString(),
                assignedTo: undefined
            };
        });
        
        setTasks([...clientTasks, ...supplierTasks]);
    }, [clients, suppliers, vehicles, drivers]);

    const handleSaveTask = (taskData: LogisticsTask) => {
        if (editingTask) {
            setTasks(prev => prev.map(t => t.id === taskData.id ? taskData : t));
        } else {
            setTasks(prev => [taskData, ...prev]);
        }
    };

    // AI-powered route optimization
    const handleGenerateOptimizedRoute = async () => {
        setIsGeneratingRoute(true);

        if (tasks.length === 0) {
            setIsGeneratingRoute(false);
            return;
        }

        // Convert tasks to RouteStop format for AI
        const routeStops: RouteStop[] = tasks.map(task => ({
            id: task.id,
            name: task.title,
            address: task.address,
            coordinates: task.coordinates,
            type: task.type,
            priority: 'Media',
            estimatedDuration: 30
        }));

        // Get vehicle info
        const selectedVehicle = vehicles.find(v => v.status === 'Disponible') || vehicles[0];
        const vehicleInfo = {
            capacity: selectedVehicle?.capacity || '1 Ton',
            fuelEfficiency: 10
        };

        try {
            // Call AI optimization
            const result = await optimizeRouteWithAI(routeStops, vehicleInfo, {
                prioritizeUrgent: true
            });

            if (result) {
                // Update tasks with optimized order
                setTasks(result.optimizedStops.map(stop =>
                    tasks.find(t => t.id === stop.id)!
                ));
                setAiOptimizationResult(result);
                setIsRouteOptimized(true);
            } else {
                // Fallback to simple nearest neighbor if AI fails
                const pendingTasks = [...tasks];
                const startNode = pendingTasks.shift()!;
                const optimizedRoute: LogisticsTask[] = [startNode];
                let currentNode = startNode;

                while (pendingTasks.length > 0) {
                    let nearestIndex = -1;
                    let minDistance = Infinity;

                    for (let i = 0; i < pendingTasks.length; i++) {
                        const dist = getDistance(currentNode.coordinates, pendingTasks[i].coordinates);
                        if (dist < minDistance) {
                            minDistance = dist;
                            nearestIndex = i;
                        }
                    }

                    if (nearestIndex !== -1) {
                        const nextNode = pendingTasks.splice(nearestIndex, 1)[0];
                        optimizedRoute.push(nextNode);
                        currentNode = nextNode;
                    } else {
                        break;
                    }
                }
                setTasks(optimizedRoute);
                setIsRouteOptimized(true);
            }
        } catch (error) {
            console.error('Error optimizing route:', error);
        } finally {
            setIsGeneratingRoute(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-64px)] bg-[#f8fafc] dark:bg-slate-950 transition-colors duration-300 p-4 sm:p-8">
            <div className="max-w-[1400px] mx-auto w-full">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-200 dark:shadow-none text-white">
                            <Navigation className="w-6 h-6" />
                        </div>

                        {/* Backend Logistics Data */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
                            <div className="card p-4">
                                <h3 className="text-lg font-semibold mb-3">Vehículos (Backend)</h3>
                                <div className="overflow-auto max-h-64">
                                    <table className="w-full text-sm">
                                        <thead><tr><th className="text-left p-2">Nombre</th><th className="text-left p-2">Placas</th><th className="text-left p-2">Estado</th></tr></thead>
                                        <tbody>
                                            {(vehicles || []).map(v => (
                                                <tr key={v.id}><td className="p-2">{v.name}</td><td className="p-2">{v.plate}</td><td className="p-2">{v.status}</td></tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <div className="card p-4">
                                <h3 className="text-lg font-semibold mb-3">Viajes (Backend)</h3>
                                <div className="overflow-auto max-h-64">
                                    <table className="w-full text-sm">
                                        <thead><tr><th className="text-left p-2">Nombre</th><th className="text-left p-2">Estado</th><th className="text-left p-2">Vehículo</th></tr></thead>
                                        <tbody>
                                            {(trips || []).map((t:any, i:number) => (
                                                <tr key={t.id ?? i}><td className="p-2">{t.nombre || t.name || '-'}</td><td className="p-2">{t.estado || '-'}</td><td className="p-2">{String(t.vehiculoId || '')}</td></tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <div className="card p-4">
                                <h3 className="text-lg font-semibold mb-3">Entregas (Backend)</h3>
                                <div className="overflow-auto max-h-64">
                                    <table className="w-full text-sm">
                                        <thead><tr><th className="text-left p-2">Cliente</th><th className="text-left p-2">Estado</th><th className="text-left p-2">Fecha</th></tr></thead>
                                        <tbody>
                                            {(deliveries || []).map((d:any, i:number) => (
                                                <tr key={d.id ?? i}><td className="p-2">{String(d.clienteId || '')}</td><td className="p-2">{d.estado || '-'}</td><td className="p-2">{String(d.fechaEntrega || d.fecha || '')}</td></tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <div className="card p-4">
                                <h3 className="text-lg font-semibold mb-3">Recolecciones (Backend)</h3>
                                <div className="overflow-auto max-h-64">
                                    <table className="w-full text-sm">
                                        <thead><tr><th className="text-left p-2">Proveedor</th><th className="text-left p-2">Estado</th><th className="text-left p-2">Fecha</th></tr></thead>
                                        <tbody>
                                            {(pickups || []).map((r:any, i:number) => (
                                                <tr key={r.id ?? i}><td className="p-2">{String(r.providerId || '')}</td><td className="p-2">{r.estado || '-'}</td><td className="p-2">{String(r.fecha || '')}</td></tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Logística y Operaciones de Campo</h1>
                            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Control de rutas, entregas, recolecciones y visitas técnicas.</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button 
                            onClick={handleGenerateOptimizedRoute}
                            disabled={isGeneratingRoute}
                            className={`px-4 py-2 border rounded-lg text-sm font-medium flex items-center disabled:opacity-70 transition-colors ${isRouteOptimized ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-white dark:bg-slate-800 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-50'}`}
                            aria-label="Optimizar rutas con IA"
                            title="Optimizar rutas"
                        >
                            {isGeneratingRoute ? <Loader2 className="w-4 h-4 mr-2 animate-spin"/> : isRouteOptimized ? <Sparkles className="w-4 h-4 mr-2 text-emerald-500" /> : <Route className="w-4 h-4 mr-2" />}
                            {isGeneratingRoute ? 'Optimizando...' : isRouteOptimized ? 'Ruta Optimizada' : 'Optimizar Rutas (IA)'}
                        </button>
                        <button 
                            onClick={() => { setEditingTask(null); setIsTaskModalOpen(true); }}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 shadow-lg shadow-indigo-200 dark:shadow-none flex items-center"
                            aria-label="Crear nueva tarea"
                            title="Crear tarea"
                        >
                            <Plus className="w-4 h-4 mr-2" /> Nueva Tarea
                        </button>
                    </div>
                </div>

                {/* Navigation Tabs */}
                <div className="flex overflow-x-auto no-scrollbar gap-1 p-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl w-full md:w-fit mb-8 shadow-sm">
                    <button onClick={() => setActiveTab('operations')} className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'operations' ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}>
                        <MapPin className="w-4 h-4 mr-2" /> Torre de Control
                    </button>
                    <button onClick={() => setActiveTab('itinerary')} className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'itinerary' ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}>
                        <Map className="w-4 h-4 mr-2" /> Itinerario
                    </button>
                    <button onClick={() => setActiveTab('planning')} className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'planning' ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}>
                        <ClipboardList className="w-4 h-4 mr-2" /> Hoja de Ruta
                    </button>
                    <button onClick={() => setActiveTab('schedule')} className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'schedule' ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}>
                        <List className="w-4 h-4 mr-2" /> Listado
                    </button>
                    <button onClick={() => setActiveTab('fleet')} className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'fleet' ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}>
                        <Truck className="w-4 h-4 mr-2" /> Flota
                    </button>
                </div>

                {/* Content */}
                <div className="min-h-[500px]">
                    {activeTab === 'operations' && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
                            <div className="lg:col-span-2 space-y-6">
                                <MapVisualization tasks={tasks} isOptimized={isRouteOptimized} />
                                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-wrap gap-4 justify-between text-sm text-slate-600 dark:text-slate-400">
                                    <span className="flex items-center"><div className="w-3 h-3 rounded-full bg-blue-600 mr-2"></div> Entregas</span>
                                    <span className="flex items-center"><div className="w-3 h-3 rounded-full bg-purple-600 mr-2"></div> Recolecciones</span>
                                    <span className="flex items-center"><div className="w-3 h-3 rounded-full bg-emerald-600 mr-2"></div> Asesoría Técnica</span>
                                    <span className="flex items-center"><div className="w-3 h-3 rounded-full bg-amber-500 mr-2"></div> Visita Comercial</span>
                                </div>
                                {/* AI Optimization Results */}
                                {aiOptimizationResult && (
                                    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 p-5 rounded-xl border border-indigo-200 dark:border-indigo-800 shadow-sm">
                                        <h3 className="font-bold text-indigo-900 dark:text-indigo-200 mb-3 flex items-center gap-2">
                                            <Sparkles className="w-5 h-5" />
                                            Resultados de Optimización IA
                                        </h3>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                            <div>
                                                <p className="text-xs text-indigo-600 dark:text-indigo-400 mb-1">Distancia</p>
                                                <p className="text-lg font-bold text-indigo-900 dark:text-indigo-200">{aiOptimizationResult.totalDistance.toFixed(1)} km</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-indigo-600 dark:text-indigo-400 mb-1">Tiempo</p>
                                                <p className="text-lg font-bold text-indigo-900 dark:text-indigo-200">{Math.floor(aiOptimizationResult.estimatedTime / 60)}h {aiOptimizationResult.estimatedTime % 60}m</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-indigo-600 dark:text-indigo-400 mb-1">Combustible</p>
                                                <p className="text-lg font-bold text-indigo-900 dark:text-indigo-200">{aiOptimizationResult.fuelEstimate.toFixed(1)} L</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-indigo-600 dark:text-indigo-400 mb-1">Costo Est.</p>
                                                <p className="text-lg font-bold text-indigo-900 dark:text-indigo-200">${aiOptimizationResult.costEstimate.toFixed(0)}</p>
                                            </div>
                                        </div>
                                        <div className="text-xs text-indigo-700 dark:text-indigo-300 bg-white/50 dark:bg-slate-800/50 p-3 rounded-lg">
                                            <p className="font-medium mb-2">💡 Sugerencias:</p>
                                            <ul className="space-y-1 list-disc list-inside">
                                                {aiOptimizationResult.suggestions.map((suggestion: string, idx: number) => (
                                                    <li key={idx}>{suggestion}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="space-y-6">
                                <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                                    <h3 className="font-bold text-slate-900 dark:text-white mb-4">Actividad en Tiempo Real</h3>
                                    <div className="space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar">
                                        {(tasks || []).filter(t => t.status === 'En Ruta').map(t => (
                                            <div key={t.id} className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-700/50">
                                                <div className="mt-1 animate-pulse w-2 h-2 rounded-full bg-green-500"></div>
                                                <div>
                                                    <p className="font-bold text-sm text-slate-800 dark:text-slate-200">{t.title}</p>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400">{t.type} • {t.assignedTo || 'Sin conductor'}</p>
                                                </div>
                                            </div>
                                        ))}
                                        {(tasks || []).filter(t => t.status === 'En Ruta').length === 0 && (
                                            <p className="text-sm text-slate-400 text-center py-4">No hay unidades en ruta activa.</p>
                                        )}
                                    </div>
                                </div>
                                <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                                    <h3 className="font-bold text-slate-900 dark:text-white mb-4">Resumen del Día</h3>
                                    <div className="grid grid-cols-2 gap-4 text-center">
                                        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                            <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">{(tasks || []).filter(t => t.type === 'Entrega').length}</p>
                                            <p className="text-xs text-blue-600 dark:text-blue-300 uppercase font-bold">Entregas</p>
                                        </div>
                                        <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                                            <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">{(tasks || []).filter(t => t.type === 'Asesoría Técnica').length}</p>
                                            <p className="text-xs text-emerald-600 dark:text-emerald-300 uppercase font-bold">Asesorías</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'itinerary' && (
                        <ItineraryView
                            stops={tasks.map(task => ({
                                id: task.id,
                                title: task.title,
                                address: task.address,
                                coordinates: task.coordinates,
                                type: task.type,
                                estimatedTime: new Date(task.scheduledDate).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
                                duration: '30',
                                status: task.status,
                                assignedDriver: task.assignedTo,
                                notes: task.notes
                            }))}
                            onReorder={(reorderedStops) => {
                                const reorderedTasks = reorderedStops.map(stop =>
                                    tasks.find(t => t.id === stop.id)!
                                );
                                setTasks(reorderedTasks);
                            }}
                            vehicleInfo={vehicles.length > 0 ? {
                                name: vehicles[0].name,
                                plate: vehicles[0].plate,
                                driver: drivers.find(d => d.id === vehicles[0].driverId)?.name || 'Sin asignar'
                            } : undefined}
                        />
                    )}

                    {activeTab === 'planning' && (
                        <RoutesPlanningView
                            route={{
                                id: `ROUTE-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}`,
                                vehicleName: vehicles[0]?.name || 'Sin vehículo',
                                driverName: drivers[0]?.name || 'Sin conductor',
                                date: new Date().toLocaleDateString('es-MX'),
                                stops: tasks.length,
                                totalDistance: aiOptimizationResult ? `${aiOptimizationResult.totalDistance.toFixed(1)} km` : 'Calcular ruta',
                                estimatedTime: aiOptimizationResult ? `${Math.floor(aiOptimizationResult.estimatedTime / 60)}h ${aiOptimizationResult.estimatedTime % 60}m` : 'Calcular ruta',
                                status: 'Borrador'
                            }}
                            onSaveRoute={(routeData) => {
                                console.log('Route saved with signature:', routeData);
                            }}
                            onSendForSignature={(routeId) => {
                                console.log('Route sent for signature:', routeId);
                            }}
                        />
                    )}

                    {activeTab === 'schedule' && (
                        <TaskList
                            tasks={tasks}
                            onEdit={(t) => { setEditingTask(t); setIsTaskModalOpen(true); }}
                        />
                    )}

                    {activeTab === 'fleet' && <FleetGrid vehicles={vehicles} drivers={drivers} />}
                </div>
            </div>

            <LogisticsTaskModal 
                isOpen={isTaskModalOpen}
                onClose={() => setIsTaskModalOpen(false)}
                onSave={handleSaveTask}
                task={editingTask}
            />
        </div>
    );
};
