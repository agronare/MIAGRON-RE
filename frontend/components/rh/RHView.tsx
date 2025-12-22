
import React, { useState, useMemo, useEffect } from 'react';
// FIX: Import missing icons from lucide-react to fix multiple 'Cannot find name' errors.
import {
    Users,
    LayoutDashboard,
    ArrowUpDown,
    Download,
    Plus,
    Search,
    Eye,
    Pencil,
    Trash2,
    Building2,
    MapPin,
    Phone,
    Mail,
    User,
    Lock
} from 'lucide-react';
import { EMPLOYEES_MOCK, BRANCHES_MOCK, RH_NAV_ITEMS } from '../../constants';
import { Employee, Branch, LoanRequest, TimeOffRequest, PayrollPeriod, PayrollIncident, ComplianceRecord } from '../../types';
import { useData } from '../../context';
import { EmployeeModal } from './EmployeeModal';
import { EmployeeProfile } from './EmployeeProfile';
import { BranchModal } from './BranchModal';
import { PayrollView } from './PayrollView';
import { ComplianceView } from './ComplianceView';
import { SelfServiceView } from './SelfServiceView';
import { RHSidebar } from './RHSidebar';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// This component is intentionally left empty to remove the Talent Management module from the UI.
const TalentView: React.FC<any> = () => {
    return null;
};


// Initial data copy to ensure we can mutate/delete
const INITIAL_EMPLOYEES_DATA: Employee[] = JSON.parse(JSON.stringify(EMPLOYEES_MOCK));
const INITIAL_BRANCHES_DATA: Branch[] = JSON.parse(JSON.stringify(BRANCHES_MOCK));

type SortKey = 'firstName' | 'role' | 'department' | 'branch' | 'status' | 'joinDate';

interface RHViewProps {
    permissions?: string[];
    currentUser?: any;
}

export const RHView: React.FC<RHViewProps> = ({
    permissions = [],
    currentUser
}) => {
  // Use centralized DataContext as single source of truth
  const data = useData();

  // Destructure data from DataContext - no local copies needed
  const { employees, branches, payrollPeriods, payrollIncidents: incidents } = data;

  // Local state for features not yet in DataContext (will be migrated in future phases)
  const [loans, setLoans] = useState<LoanRequest[]>([]);
  const [timeOffRequests, setTimeOffRequests] = useState<TimeOffRequest[]>([]);
  const [activeSurveys, setActiveSurveys] = useState<any[]>([]);
  const [complianceRecords, setComplianceRecords] = useState<ComplianceRecord[]>([]);

  // LAZY LOADING: Load RH data when component mounts
  useEffect(() => {
    const loadRHData = async () => {
      await Promise.all([
        data.loadEmployees(),
        data.loadBranches(),
        data.loadPayrollPeriods(),
        data.loadPayrollIncidents()
      ]);
    };
    loadRHData();
  }, []);

  // Permission mapping to tab IDs
  const PERM_MAP: Record<string, string> = {
      'rh_empleados': 'empleados',
      'rh_sucursales': 'sucursales',
      'rh_nomina': 'nomina',
      'rh_cumplimiento': 'cumplimiento',
      'rh_autoservicio': 'autoservicio',
  };

  // Memoize allowedTabs to ensure stability
  const allowedTabs = useMemo(() => {
      return permissions.length > 0 
      ? Object.entries(PERM_MAP).filter(([perm, id]) => permissions.includes(perm)).map(([_, id]) => id)
      : ['empleados', 'sucursales', 'nomina', 'cumplimiento', 'autoservicio']; // Fallback for full access
  }, [permissions]);

  const [activeTab, setActiveTab] = useState<string>(allowedTabs.length > 0 ? allowedTabs[0] : 'empleados');
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('Todos los departamentos');
  const [sortConfig, setSortConfig] = useState<{ key: SortKey, direction: 'asc' | 'desc' }>({ key: 'firstName', direction: 'asc' });
  
  // Employee Management State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  // Branch Management State
  const [isBranchModalOpen, setIsBranchModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [branchSearchTerm, setBranchSearchTerm] = useState('');
  const [branchStatusFilter, setBranchStatusFilter] = useState('Todos');

  // Ensure active tab is valid when permissions change
  useEffect(() => {
      if (allowedTabs.length > 0 && !allowedTabs.includes(activeTab)) {
          setActiveTab(allowedTabs[0]);
      }
  }, [allowedTabs, activeTab]);

  // Filter Nav Items for Sidebar
  const filteredNavItems = useMemo(() => {
      return RH_NAV_ITEMS.filter(item => allowedTabs.includes(item.id));
  }, [allowedTabs]);


  // --- Employee Handlers ---
  const handleSort = (key: SortKey) => {
      let direction: 'asc' | 'desc' = 'asc';
      if (sortConfig.key === key && sortConfig.direction === 'asc') {
          direction = 'desc';
      }
      setSortConfig({ key, direction });
  };

  const filteredEmployees = useMemo(() => {
      let result = (employees || []).filter(e => {
          const matchesSearch = (e.firstName + ' ' + e.lastName).toLowerCase().includes(searchTerm.toLowerCase()) || 
                                e.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                e.id.toLowerCase().includes(searchTerm.toLowerCase());
          
          const matchesDept = departmentFilter === 'Todos los departamentos' || 
                              e.department === departmentFilter ||
                              (departmentFilter === 'Ventas' && e.department === 'Comercial'); 

          return matchesSearch && matchesDept;
      });

      result.sort((a, b) => {
          let aValue: any = '';
          let bValue: any = '';

          if (sortConfig.key === 'firstName') {
              aValue = `${a.firstName} ${a.lastName}`.toLowerCase();
              bValue = `${b.firstName} ${b.lastName}`.toLowerCase();
          } else {
              aValue = a[sortConfig.key] || '';
              bValue = b[sortConfig.key] || '';
          }
          
          if (aValue < bValue) {
              return sortConfig.direction === 'asc' ? -1 : 1;
          }
          if (aValue > bValue) {
              return sortConfig.direction === 'asc' ? 1 : -1;
          }
          return 0;
      });

      return result;
  }, [employees, searchTerm, departmentFilter, sortConfig]);

  const uniqueDepartments = useMemo(() => {
      const depts = new Set((employees || []).map(e => e.department).filter(Boolean));
      return ['Todos los departamentos', ...Array.from(depts)];
  }, [employees]);

  const handleSaveEmployee = async (employee: Employee) => {
      try {
          if (editingEmployee) {
              await data.updateEmployee(employee.id, employee as any);
          } else {
              await data.createEmployee(employee as any);
          }
          await data.refreshModule('rh');
      } catch (err) {
          console.error('Error saving employee', err);
      } finally {
          setEditingEmployee(null);
      }
  };

  const handleDeleteEmployee = async (id: string) => {
      if (window.confirm("¿Estás seguro que deseas eliminar este colaborador? Esta acción es irreversible.")) {
          try {
              await data.deleteEmployee(id);
              await data.refreshModule('rh');
          } catch (err) {
              console.error('Error deleting employee', err);
          }
      }
  };

  const handleExportEmployees = () => {
      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.text("Directorio de Colaboradores", 14, 15);
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Generado el: ${new Date().toLocaleDateString()}`, 14, 22);

      const tableData = filteredEmployees.map(emp => [
          emp.id,
          `${emp.firstName} ${emp.lastName}`,
          emp.role,
          emp.department || '-',
          emp.branch,
          emp.status,
          new Date(emp.joinDate).toLocaleDateString()
      ]);

      autoTable(doc, {
          head: [['ID', 'Nombre', 'Puesto', 'Departamento', 'Sucursal', 'Estado', 'Ingreso']],
          body: tableData,
          startY: 28,
          styles: { fontSize: 8 },
          headStyles: { fillColor: [79, 70, 229] } 
      });

      doc.save('empleados_agronare.pdf');
  };

  // --- Branch Handlers ---
  const filteredBranches = useMemo(() => {
      return (branches || []).filter(b => {
          const matchesSearch = b.name.toLowerCase().includes(branchSearchTerm.toLowerCase()) || 
                                b.address?.toLowerCase().includes(branchSearchTerm.toLowerCase()) ||
                                b.code?.toLowerCase().includes(branchSearchTerm.toLowerCase()) ||
                                b.city?.toLowerCase().includes(branchSearchTerm.toLowerCase());
          
          const matchesStatus = branchStatusFilter === 'Todos' || b.status === branchStatusFilter;
          return matchesSearch && matchesStatus;
      });
  }, [branches, branchSearchTerm, branchStatusFilter]);

  const handleSaveBranch = async (branch: Branch) => {
      try {
          if (editingBranch) {
              await data.updateBranch(branch.id, branch as any);
          } else {
              await data.createBranch(branch as any);
          }
          await data.refreshModule('rh');
      } catch (err) {
          console.error('Error saving branch', err);
      } finally {
          setEditingBranch(null);
      }
  };

  const handleDeleteBranch = async (id: string) => {
      if (window.confirm("¿Estás seguro que deseas eliminar esta sucursal?")) {
          try {
              await data.deleteBranch(id);
              await data.refreshModule('rh');
          } catch (err) {
              console.error('Error deleting branch', err);
          }
      }
  };

  // Placeholder setters for child components that haven't been refactored yet
  const placeholderSetter = async () => {
    await data.refreshModule('rh');
  };

  // --- Render Helpers ---
  const statusColors: Record<string, string> = {
      'Activo': 'bg-emerald-100 text-emerald-700',
      'Activa': 'bg-emerald-100 text-emerald-700',
      'Inactivo': 'bg-slate-100 text-slate-700',
      'Inactiva': 'bg-slate-100 text-slate-700',
      'Vacaciones': 'bg-blue-100 text-blue-700',
      'Suspendido': 'bg-amber-100 text-amber-700',
      'Baja': 'bg-red-100 text-red-700'
  };

  const SortableHeader = ({ label, sortKey }: { label: string, sortKey: SortKey }) => (
      <th 
          className="text-left py-4 px-6 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group select-none"
          onClick={() => handleSort(sortKey)}
      >
          <div className="flex items-center">
              {label}
              <ArrowUpDown className={`w-3 h-3 ml-1.5 ${sortConfig.key === sortKey ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-300 group-hover:text-slate-400'}`} />
          </div>
      </th>
  );

  if (allowedTabs.length === 0) {
      return (
        <div className="flex min-h-[calc(100vh-64px)] bg-[#f8fafc] dark:bg-slate-950 transition-colors duration-300 items-center justify-center">
            <div className="text-center p-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
                    <Lock className="w-8 h-8 text-slate-400" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Acceso Limitado</h2>
                <p className="text-slate-500 dark:text-slate-400 mt-2">No tienes permisos para ver ninguna sección de este módulo.</p>
            </div>
        </div>
      );
  }

  // --- Sub-Views ---

  const EmployeesView = () => (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
             <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Directorio de Talento</h1>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Gestión centralizada de colaboradores, expedientes y accesos.</p>
             </div>
             <div className="flex gap-3">
                 <button 
                    onClick={handleExportEmployees}
                    className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center shadow-sm"
                 >
                     <Download className="w-4 h-4 mr-2" /> Exportar
                 </button>
                 <button 
                    onClick={() => { setEditingEmployee(null); setIsModalOpen(true); }}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors flex items-center shadow-md shadow-indigo-200 dark:shadow-none"
                 >
                     <Plus className="w-4 h-4 mr-2" /> Nuevo Colaborador
                 </button>
             </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-t-xl border border-slate-200 dark:border-slate-700 border-b-0 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="relative w-full sm:w-96">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input 
                    type="text"
                    placeholder="Buscar por nombre, puesto, ID..."
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm bg-slate-50 dark:bg-slate-800 dark:text-white focus:bg-white dark:focus:bg-slate-900"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
                <select 
                    className="w-full sm:w-auto px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-600 dark:text-slate-300 focus:border-indigo-500 outline-none cursor-pointer"
                    value={departmentFilter}
                    onChange={(e) => setDepartmentFilter(e.target.value)}
                >
                    {uniqueDepartments.map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                    ))}
                </select>
            </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-b-xl overflow-hidden shadow-sm min-h-[400px]">
            <table className="w-full">
                <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                    <tr>
                        <SortableHeader label="Colaborador" sortKey="firstName" />
                        <SortableHeader label="Puesto / Depto" sortKey="role" />
                        <SortableHeader label="Sucursal" sortKey="branch" />
                        <th className="text-center py-4 px-6 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Estado</th>
                        <SortableHeader label="Ingreso" sortKey="joinDate" />
                        <th className="text-right py-4 px-6 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Acciones</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredEmployees.length > 0 ? (
                        filteredEmployees.map((emp) => (
                            <tr 
                                key={emp.id} 
                                className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group cursor-pointer"
                                onClick={() => setSelectedEmployee(emp)}
                            >
                                <td className="py-4 px-6">
                                    <div className="flex items-center gap-3">
                                        {emp.avatar ? (
                                            <img src={emp.avatar} alt="" className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700" />
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300 flex items-center justify-center font-bold text-sm">
                                                {emp.firstName.charAt(0)}{emp.lastName.charAt(0)}
                                            </div>
                                        )}
                                        <div>
                                            <p className="font-bold text-slate-900 dark:text-white text-sm">{emp.firstName} {emp.lastName}</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">{emp.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="py-4 px-6">
                                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{emp.role}</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">{emp.department}</p>
                                </td>
                                <td className="py-4 px-6 text-sm text-slate-600 dark:text-slate-300">{emp.branch}</td>
                                <td className="py-4 px-6 text-center">
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${statusColors[emp.status] || 'bg-slate-100 text-slate-600'}`}>
                                        {emp.status}
                                    </span>
                                </td>
                                <td className="py-4 px-6 text-sm text-slate-600 dark:text-slate-300">{new Date(emp.joinDate).toLocaleDateString()}</td>
                                <td className="py-4 px-6 text-right">
                                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); setSelectedEmployee(emp); }} 
                                            className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/50 rounded transition-colors" 
                                            title="Ver Perfil"
                                        >
                                            <Eye className="w-4 h-4" />
                                        </button>
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); setEditingEmployee(emp); setIsModalOpen(true); }} 
                                            className="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/50 rounded transition-colors" 
                                            title="Editar"
                                        >
                                            <Pencil className="w-4 h-4" />
                                        </button>
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); handleDeleteEmployee(emp.id); }} 
                                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/50 rounded transition-colors" 
                                            title="Eliminar"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={6} className="py-20 text-center text-slate-500 dark:text-slate-400 text-sm">
                                <div className="flex flex-col items-center justify-center">
                                    <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-full mb-3">
                                        <Users className="w-8 h-8 text-slate-400" />
                                    </div>
                                    <p>No se encontraron colaboradores.</p>
                                </div>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    </div>
  );

  const BranchesView = () => (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Sucursales y Centros de Trabajo</h1>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Administra la red de ubicaciones operativas de la empresa.</p>
            </div>
            <button 
                onClick={() => { setEditingBranch(null); setIsBranchModalOpen(true); }}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 flex items-center shadow-md shadow-indigo-200 dark:shadow-none transition-colors"
            >
                <Plus className="w-4 h-4 mr-2" />
                Nueva Sucursal
            </button>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-t-xl border border-slate-200 dark:border-slate-700 border-b-0 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="relative w-full sm:w-96">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input 
                    type="text"
                    placeholder="Buscar sucursal, dirección o código..."
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm bg-slate-50 dark:bg-slate-800 dark:text-white focus:bg-white dark:focus:bg-slate-900"
                    value={branchSearchTerm}
                    onChange={(e) => setBranchSearchTerm(e.target.value)}
                />
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
                <select 
                    className="w-full sm:w-auto px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-600 dark:text-slate-300 focus:border-indigo-500 outline-none cursor-pointer"
                    value={branchStatusFilter}
                    onChange={(e) => setBranchStatusFilter(e.target.value)}
                >
                    <option value="Todos">Todas las sucursales</option>
                    <option value="Activa">Activas</option>
                    <option value="Inactiva">Inactivas</option>
                </select>
            </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-b-xl overflow-hidden shadow-sm min-h-[400px]">
             <table className="w-full">
                <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                    <tr>
                        <th className="text-left py-4 px-6 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Sucursal / Código</th>
                        <th className="text-left py-4 px-6 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Ubicación</th>
                        <th className="text-left py-4 px-6 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Contacto</th>
                        <th className="text-left py-4 px-6 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Responsable</th>
                        <th className="text-center py-4 px-6 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Estatus</th>
                        <th className="text-right py-4 px-6 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Acciones</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredBranches.length > 0 ? (
                        filteredBranches.map((branch) => (
                            <tr key={branch.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                                <td className="py-4 px-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 shrink-0">
                                            <Building2 className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900 dark:text-white text-sm">{branch.name}</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono bg-slate-100 dark:bg-slate-800 px-1.5 rounded w-fit mt-0.5">{branch.code || 'N/A'}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="py-4 px-6">
                                    <div className="flex items-start gap-2">
                                        <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                                        <div>
                                            <p className="text-sm text-slate-700 dark:text-slate-300 font-medium">{branch.city}, {branch.state}</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1" title={branch.address}>{branch.address}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="py-4 px-6">
                                    <div className="space-y-1">
                                        <p className="text-xs text-slate-600 dark:text-slate-400 flex items-center"><Phone className="w-3 h-3 mr-1.5 text-slate-400"/> {branch.phone}</p>
                                        <p className="text-xs text-slate-600 dark:text-slate-400 flex items-center"><Mail className="w-3 h-3 mr-1.5 text-slate-400"/> {branch.email}</p>
                                    </div>
                                </td>
                                <td className="py-4 px-6">
                                    {branch.manager ? (
                                        <div className="flex items-center gap-2">
                                            <User className="w-3.5 h-3.5 text-slate-400" />
                                            <span className="text-sm text-slate-700 dark:text-slate-300">{branch.manager}</span>
                                        </div>
                                    ) : (
                                        <span className="text-xs text-slate-400 italic">Sin asignar</span>
                                    )}
                                </td>
                                <td className="py-4 px-6 text-center">
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${branch.status === 'Activa' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                                        {branch.status}
                                    </span>
                                </td>
                                <td className="py-4 px-6 text-right">
                                    <div className="flex items-center justify-end space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button 
                                            onClick={() => { setEditingBranch(branch); setIsBranchModalOpen(true); }}
                                            className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/50 rounded-lg transition-colors"
                                            title="Editar"
                                        >
                                            <Pencil className="w-4 h-4" />
                                        </button>
                                        <button 
                                            onClick={() => handleDeleteBranch(branch.id)}
                                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/50 rounded-lg transition-colors"
                                            title="Eliminar"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={6} className="py-20 text-center text-slate-500 dark:text-slate-400">
                                <div className="flex flex-col items-center justify-center">
                                    <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-full mb-3">
                                        <Building2 className="w-8 h-8 text-slate-400" />
                                    </div>
                                    <p>No se encontraron sucursales que coincidan con la búsqueda.</p>
                                </div>
                            </td>
                        </tr>
                    )}
                </tbody>
             </table>
        </div>
      </div>
  );

  return (
    <div className="flex min-h-[calc(100vh-64px)] bg-[#f8fafc] dark:bg-slate-950 transition-colors duration-300 w-screen relative left-[calc(50%-50vw)]">
        <RHSidebar activeTab={activeTab} setActiveTab={setActiveTab} navItems={filteredNavItems} />

            {/* Main Content */}
            <div className="flex-1 min-w-0 px-4 py-8 overflow-x-auto">
        <div className="max-w-[1400px]">
            {activeTab === 'empleados' && <EmployeesView />}
            {activeTab === 'sucursales' && <BranchesView />}
            {activeTab === 'nomina' && <PayrollView
                employees={employees}
                payrollPeriods={payrollPeriods}
                setPayrollPeriods={placeholderSetter}
                incidents={incidents}
                setIncidents={placeholderSetter}
                loans={loans}
                setLoans={setLoans}
                timeOffRequests={timeOffRequests} 
                setTimeOffRequests={setTimeOffRequests} 
            />}
            {activeTab === 'cumplimiento' && <ComplianceView employees={employees} complianceRecords={complianceRecords} setComplianceRecords={setComplianceRecords} />}
            {activeTab === 'autoservicio' && <SelfServiceView 
                loans={loans} 
                setLoans={setLoans} 
                timeOffRequests={timeOffRequests} 
                setTimeOffRequests={setTimeOffRequests} 
                activeSurveys={activeSurveys}
                onUpdateSurvey={(updatedSurvey) => {
                    if (setActiveSurveys) {
                        setActiveSurveys(prev => prev.map(s => s.id === updatedSurvey.id ? updatedSurvey : s));
                    }
                }}
                currentUser={currentUser}
            />}
        </div>
      </div>

      {/* Modals */}
      <EmployeeModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleSaveEmployee} 
        initialData={editingEmployee} 
      />
      
      <BranchModal
        isOpen={isBranchModalOpen}
        onClose={() => setIsBranchModalOpen(false)}
        onSave={handleSaveBranch}
        initialData={editingBranch}
      />
      
      {selectedEmployee && (
          <EmployeeProfile 
            employee={selectedEmployee} 
            onClose={() => setSelectedEmployee(null)} 
            onEdit={(emp) => { setSelectedEmployee(null); setEditingEmployee(emp); setIsModalOpen(true); }}
          />
      )}
        </div>
  );
};
