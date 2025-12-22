
import React, { useState, useRef, useEffect } from 'react';
import { 
  LayoutDashboard, Kanban, CalendarRange, Wallet, Users, Plus, 
  Search, Filter, MoreVertical, AlertTriangle, CheckCircle2, Clock, 
  ArrowUpRight, Calendar as CalendarIcon, Paperclip, MessageSquare,
  Briefcase, ChevronRight, Table as TableIcon, ChevronDown, ChevronLeft,
  ZoomIn, ZoomOut, Info, ListTodo, Trash2, Pencil, Eye
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';
import { Project, Task } from '../types';
import { NewProjectModal } from './projects/NewProjectModal';
import { NewTaskModal } from './projects/NewTaskModal';
import { useLocalStorage } from '../hooks/useLocalStorage';

const DashboardView = ({ projects, tasks }: { projects: Project[], tasks: Task[] }) => {
    // Stats
    const totalProjects = (projects || []).length;
    const activeProjects = (projects || []).filter(p => p.status === 'En Curso').length;
    const delayedProjects = (projects || []).filter(p => p.health === 'Delayed').length;
    const totalBudget = (projects || []).reduce((acc, curr) => acc + curr.budget, 0);
    const totalSpent = (projects || []).reduce((acc, curr) => acc + curr.spent, 0);

    if (totalProjects === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-96 text-center animate-fadeIn">
                <div className="bg-slate-100 dark:bg-slate-800 p-6 rounded-full mb-4">
                    <LayoutDashboard className="w-12 h-12 text-slate-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">No hay proyectos activos</h3>
                <p className="text-slate-500 dark:text-slate-400 max-w-md mt-2">
                    Comienza creando un nuevo proyecto para visualizar las estadísticas y el rendimiento de tu portafolio.
                </p>
            </div>
        );
    }

    return (
        <div className="animate-fadeIn space-y-6">
             {/* Stats Cards */}
             <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                        <div className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg"><Briefcase className="w-5 h-5" /></div>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Proyectos Activos</p>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{activeProjects} / {totalProjects}</h3>
                </div>
                <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                         <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg"><Wallet className="w-5 h-5" /></div>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Presupuesto Total</p>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">${(totalBudget/1000).toFixed(0)}k</h3>
                    <span className="text-xs text-slate-400">Gastado: ${(totalSpent/1000).toFixed(0)}k</span>
                </div>
                <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                         <div className="p-2 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg"><Users className="w-5 h-5" /></div>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Recursos Asignados</p>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{(projects || []).reduce((a,b)=>a+b.teamSize,0)}</h3>
                </div>
                <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                         <div className="p-2 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg"><AlertTriangle className="w-5 h-5" /></div>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Proyectos Retrasados</p>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{delayedProjects}</h3>
                </div>
             </div>

             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                     <h3 className="font-bold text-slate-900 dark:text-white mb-6">Estado de Salud de Proyectos</h3>
                     <div className="space-y-4">
                         {(projects || []).map(project => (
                             <div key={project.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                                 <div className="flex items-center gap-3">
                                     <div className={`w-2 h-2 rounded-full ${project.health === 'On Track' ? 'bg-emerald-500' : project.health === 'At Risk' ? 'bg-amber-500' : 'bg-red-500'}`}></div>
                                     <div>
                                         <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{project.name}</p>
                                         <p className="text-xs text-slate-500 dark:text-slate-400">PM: {project.manager}</p>
                                     </div>
                                 </div>
                                 <div className="text-right">
                                     <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{project.progress}%</p>
                                     <div className="w-24 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mt-1">
                                         <div className="h-full bg-blue-600 rounded-full" style={{width: `${project.progress}%`}}></div>
                                     </div>
                                 </div>
                             </div>
                         ))}
                     </div>
                 </div>

                 <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                     <h3 className="font-bold text-slate-900 dark:text-white mb-6">Distribución de Tareas</h3>
                     <div className="h-[300px] w-full">
                         <ResponsiveContainer width="100%" height="100%">
                             <BarChart data={[
                                 { name: 'Por Hacer', value: (tasks || []).filter(t => t.status === 'todo').length },
                                 { name: 'En Curso', value: (tasks || []).filter(t => t.status === 'in-progress').length },
                                 { name: 'Revisión', value: (tasks || []).filter(t => t.status === 'review').length },
                                 { name: 'Hecho', value: (tasks || []).filter(t => t.status === 'done').length },
                             ]}>
                                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.3} />
                                 <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                                 <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                                 <Tooltip cursor={{fill: 'transparent'}} contentStyle={{backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: 'white'}} />
                                 <Bar dataKey="value" fill="#6366f1" radius={[4,4,0,0]} barSize={40} />
                             </BarChart>
                         </ResponsiveContainer>
                     </div>
                 </div>
             </div>
        </div>
    );
}

const ProjectsListView = ({ 
    projects, 
    searchTerm, 
    onDelete,
    onEdit
}: { 
    projects: Project[], 
    searchTerm: string,
    onDelete: (id: string) => void,
    onEdit: (project: Project) => void
}) => {
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);

    // Close menu on click outside
    useEffect(() => {
        const handleClickOutside = () => setOpenMenuId(null);
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden animate-fadeIn min-h-[400px]">
            <div className="overflow-visible">
                <table className="w-full">
                    <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                        <tr>
                            <th className="text-left py-4 px-6 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Proyecto</th>
                            <th className="text-left py-4 px-6 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Manager</th>
                            <th className="text-left py-4 px-6 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Cronograma</th>
                            <th className="text-left py-4 px-6 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Presupuesto</th>
                            <th className="text-center py-4 px-6 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Estado</th>
                            <th className="text-center py-4 px-6 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Salud</th>
                            <th className="text-right py-4 px-6 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {(projects || []).filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).map((project) => (
                            <tr key={project.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                <td className="py-4 px-6">
                                    <div className="font-bold text-slate-900 dark:text-white text-sm">{project.name}</div>
                                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 mt-2 max-w-[120px]">
                                        <div className="bg-indigo-600 h-1.5 rounded-full" style={{width: `${project.progress}%`}}></div>
                                    </div>
                                </td>
                                <td className="py-4 px-6">
                                    <div className="flex items-center">
                                        <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-300 mr-2">
                                            {project.manager.split(' ').map(n => n[0]).join('').substring(0,2)}
                                        </div>
                                        <span className="text-sm text-slate-600 dark:text-slate-300">{project.manager}</span>
                                    </div>
                                </td>
                                <td className="py-4 px-6 text-sm text-slate-600 dark:text-slate-400">
                                    {project.startDate} - {project.endDate}
                                </td>
                                <td className="py-4 px-6">
                                    <div className="text-sm font-medium text-slate-900 dark:text-white">${project.budget.toLocaleString()}</div>
                                    <div className="text-xs text-slate-500 dark:text-slate-400">{((project.spent/project.budget)*100).toFixed(0)}% consumido</div>
                                </td>
                                <td className="py-4 px-6 text-center">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                        project.status === 'En Curso' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' :
                                        project.status === 'Completado' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' :
                                        project.status === 'Planificación' ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300' :
                                        'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                                    }`}>{project.status}</span>
                                </td>
                                <td className="py-4 px-6 text-center">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                        project.health === 'On Track' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800' :
                                        project.health === 'At Risk' ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-800' :
                                        'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-800'
                                    }`}>{project.health}</span>
                                </td>
                                <td className="py-4 px-6 text-right relative">
                                    <button 
                                        onClick={(e) => { 
                                            e.stopPropagation(); 
                                            setOpenMenuId(openMenuId === project.id ? null : project.id); 
                                        }} 
                                        className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                                    >
                                        <MoreVertical className="w-5 h-5" />
                                    </button>
                                    
                                    {/* Dropdown Menu */}
                                    {openMenuId === project.id && (
                                        <div className="absolute right-6 top-10 w-40 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 z-50 overflow-hidden animate-in fade-in zoom-in-95">
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); onEdit(project); setOpenMenuId(null); }}
                                                className="w-full text-left px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center"
                                            >
                                                <Pencil className="w-4 h-4 mr-2" /> Editar
                                            </button>
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); onDelete(project.id); setOpenMenuId(null); }}
                                                className="w-full text-left px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center border-t border-slate-100 dark:border-slate-700"
                                            >
                                                <Trash2 className="w-4 h-4 mr-2" /> Eliminar
                                            </button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {(projects || []).length === 0 && (
                            <tr><td colSpan={7} className="text-center py-12 text-slate-500 dark:text-slate-400">No hay proyectos registrados.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

const KanbanView = ({ tasks, onAddTask }: { tasks: Task[], onAddTask: (status: string) => void }) => (
    <div className="flex gap-6 overflow-x-auto pb-6 animate-fadeIn h-full">
        {[
            { id: 'todo', label: 'Por Hacer', color: 'border-t-slate-400' },
            { id: 'in-progress', label: 'En Curso', color: 'border-t-blue-500' },
            { id: 'review', label: 'Revisión', color: 'border-t-purple-500' },
            { id: 'done', label: 'Completado', color: 'border-t-emerald-500' }
        ].map(column => (
            <div key={column.id} className="min-w-[320px] bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col h-full">
                <div className={`p-4 bg-white dark:bg-slate-900 rounded-t-xl border-b border-slate-200 dark:border-slate-800 border-t-4 ${column.color} flex justify-between items-center shrink-0`}>
                    <h4 className="font-bold text-slate-800 dark:text-white text-sm uppercase">{column.label}</h4>
                    <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold px-2 py-1 rounded-full">
                        {(tasks || []).filter(t => t.status === column.id).length}
                    </span>
                </div>
                <div className="p-4 space-y-3 overflow-y-auto flex-1 custom-scrollbar">
                    {(tasks || []).filter(t => t.status === column.id).map(task => (
                        <div key={task.id} className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow cursor-grab group">
                            <div className="flex justify-between items-start mb-2">
                                <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wide ${
                                    task.priority === 'high' ? 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400' : 
                                    task.priority === 'medium' ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400' : 
                                    'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                                }`}>{task.priority}</span>
                                <button className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><MoreVertical className="w-4 h-4" /></button>
                            </div>
                            <h5 className="font-bold text-slate-800 dark:text-white text-sm mb-2 line-clamp-2">{task.title}</h5>
                            <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 dark:border-slate-700/50">
                                <div className="flex items-center text-xs text-slate-500 dark:text-slate-400">
                                    <Clock className="w-3 h-3 mr-1" /> {task.dueDate}
                                </div>
                                <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 flex items-center justify-center text-[10px] font-bold border border-indigo-200 dark:border-indigo-700" title={task.assignee}>
                                    {task.assignee.charAt(0)}
                                </div>
                            </div>
                        </div>
                    ))}
                    <button 
                        onClick={() => onAddTask(column.id)}
                        className="w-full py-2.5 border border-dashed border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition-colors flex items-center justify-center"
                    >
                        <Plus className="w-4 h-4 mr-2" /> Añadir Tarea
                    </button>
                </div>
            </div>
        ))}
    </div>
);

export const ProjectsView: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'dashboard' | 'projects' | 'kanban'>('kanban');
    const [searchTerm, setSearchTerm] = useState('');
    const [projects, setProjects] = useLocalStorage<Project[]>('agronare_projects', []);
    const [tasks, setTasks] = useLocalStorage<Task[]>('agronare_tasks', []);
    
    // Modals
    const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [newTaskStatus, setNewTaskStatus] = useState('todo');
    
    // Editing State
    const [editingProject, setEditingProject] = useState<Project | null>(null);

    const handleAddProject = (projectData: Partial<Project>) => {
        if (editingProject) {
            setProjects((projects || []).map(p => p.id === editingProject.id ? { ...p, ...projectData } : p));
            setEditingProject(null);
        } else {
            const newProject: Project = {
                ...projectData,
                id: `PRJ-${Date.now()}`,
                spent: 0,
                progress: 0,
                teamSize: 0
            } as Project;
            setProjects([newProject, ...(projects || [])]);
        }
    };
    
    const handleDeleteProject = (id: string) => {
        if (window.confirm('¿Confirmas eliminar este proyecto? Esta acción no se puede deshacer.')) {
            setProjects((projects || []).filter(p => p.id !== id));
            // Cleanup associated tasks
            setTasks((tasks || []).filter(t => t.project !== id));
        }
    };

    const handleEditProject = (project: Project) => {
        setEditingProject(project);
        setIsProjectModalOpen(true);
    };
    
    const handleAddTask = (taskData: Partial<Task>) => {
        const newTask: Task = {
            ...taskData,
            id: `t-${Date.now()}`
        } as Task;
        setTasks([...(tasks || []), newTask]);
    };

    const openTaskModal = (status: string = 'todo') => {
        if (!projects || projects.length === 0) {
            alert("Debes crear un proyecto antes de añadir tareas.");
            return;
        }
        setNewTaskStatus(status);
        setIsTaskModalOpen(true);
    };

    return (
        <div className="min-h-[calc(100vh-64px)] bg-[#f8fafc] dark:bg-slate-950 transition-colors duration-300 p-4 sm:p-8">
            <div className="max-w-[1400px] mx-auto w-full h-full flex flex-col">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-200 dark:shadow-none">
                            <LayoutDashboard className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Gestión de Proyectos</h1>
                            <p className="text-slate-500 dark:text-slate-400 text-sm">Planificación, ejecución y seguimiento de iniciativas estratégicas.</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                            <input 
                                type="text" 
                                placeholder="Buscar proyecto..." 
                                className="pl-10 pr-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:border-indigo-500 w-64 bg-white dark:bg-slate-800 dark:text-white"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button 
                            onClick={() => { setEditingProject(null); setIsProjectModalOpen(true); }}
                            className="flex items-center px-4 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 shadow-sm shadow-indigo-600/20 transition-all"
                            aria-label="Crear nuevo proyecto"
                            title="Crear proyecto"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Nuevo Proyecto
                        </button>
                    </div>
                </div>

                {/* Navigation Tabs */}
                <div className="flex overflow-x-auto no-scrollbar gap-1 p-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl w-full md:w-fit mb-8 shadow-sm shrink-0">
                    {[
                        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
                        { id: 'projects', label: 'Lista de Proyectos', icon: TableIcon },
                        { id: 'kanban', label: 'Tablero Kanban', icon: Kanban },
                    ].map((tab) => (
                        <button 
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                                activeTab === tab.id 
                                ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300' 
                                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
                            }`}
                        >
                            <tab.icon className="w-4 h-4 mr-2" />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="flex-1 min-h-0">
                    {activeTab === 'dashboard' && <DashboardView projects={projects} tasks={tasks} />}
                    {activeTab === 'projects' && (
                        <ProjectsListView 
                            projects={projects} 
                            searchTerm={searchTerm} 
                            onDelete={handleDeleteProject}
                            onEdit={handleEditProject}
                        />
                    )}
                    {activeTab === 'kanban' && <KanbanView tasks={tasks} onAddTask={openTaskModal} />}
                </div>
            </div>

            {/* Modals */}
            <NewProjectModal 
                isOpen={isProjectModalOpen} 
                onClose={() => setIsProjectModalOpen(false)} 
                onSave={handleAddProject} 
            />
            <NewTaskModal
                isOpen={isTaskModalOpen}
                onClose={() => setIsTaskModalOpen(false)}
                onSave={handleAddTask}
                initialStatus={newTaskStatus}
                projects={projects}
            />
        </div>
    );
};
