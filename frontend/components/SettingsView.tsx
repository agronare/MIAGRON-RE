import React, { useMemo, useState } from 'react';
import { LogOut, Palette, Bell, Shield, Users, Undo2 } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { NotificationSettings } from '../types';
import { NAV_ITEMS, SUB_MODULES, DEFAULT_ROLE_ACCESS } from '../constants';

type RoleAccessMap = Record<string, string[]>;

interface SettingsProps {
  onLogout: () => void;
  currentUser?: any;
  roleAccess: RoleAccessMap;
  setRoleAccess: React.Dispatch<React.SetStateAction<RoleAccessMap>>;
  notificationSettings: NotificationSettings;
  onUpdateNotificationSettings: (s: Partial<NotificationSettings>) => void;
}

export const SettingsView: React.FC<SettingsProps> = ({ 
  onLogout,
  currentUser,
  roleAccess,
  setRoleAccess,
  notificationSettings,
  onUpdateNotificationSettings
}) => {
  const { theme, setTheme } = useTheme();
  const roles = useMemo(() => Object.keys(roleAccess || DEFAULT_ROLE_ACCESS), [roleAccess]);
  const [selectedRole, setSelectedRole] = useState<string>(roles[0] || 'Usuario');

  const allModules = useMemo(() => {
    const base = NAV_ITEMS.map(n => n.id);
    const subs = Object.values(SUB_MODULES).flat().map(s => s.id);
    return [...base, ...subs];
  }, []);

  const rolePermissions = roleAccess?.[selectedRole] || [];

  const togglePermission = (perm: string) => {
    setRoleAccess(prev => {
      const current = prev[selectedRole] || [];
      const exists = current.includes(perm);
      const updated = exists ? current.filter(p => p !== perm) : [...current, perm];
      return { ...prev, [selectedRole]: updated };
    });
  };

  const resetToDefault = () => {
    if (!confirm('¿Restablecer accesos al valor predeterminado para todos los roles?')) return;
    setRoleAccess(DEFAULT_ROLE_ACCESS);
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#f8fafc] dark:bg-slate-950 transition-colors duration-300 p-6">
      <div className="max-w-[1400px] mx-auto w-full space-y-6">
        {/* Header */}
        <div className="card p-6 sm:p-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-lg">
              {currentUser?.firstName ? currentUser.firstName.charAt(0) : 'U'}
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">Ajustes</h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm">Preferencias del sistema, accesos y notificaciones.</p>
            </div>
          </div>
          <button onClick={onLogout} className="button button-secondary" aria-label="Cerrar sesión" title="Cerrar sesión">
            <LogOut className="w-4 h-4 mr-2"/> Cerrar Sesión
          </button>
        </div>

        {/* Preferencias de tema */}
        <div className="card p-6">
          <h2 className="h3 font-bold mb-4 flex items-center"><Palette className="w-5 h-5 mr-2 text-indigo-600"/> Tema</h2>
          <div className="flex items-center gap-3">
            <select value={theme} onChange={(e) => setTheme(e.target.value as any)} className="button text-sm" title="Seleccionar tema" aria-label="Seleccionar tema">
              <option value="light">Claro</option>
              <option value="dark">Oscuro</option>
              <option value="modern">Moderno</option>
              <option value="hc">Alto Contraste</option>
            </select>
            <span className="text-sm text-slate-500 dark:text-slate-400">Actual: {theme}</span>
          </div>
        </div>

        {/* Notificaciones */}
        <div className="card p-6">
          <h2 className="h3 font-bold mb-4 flex items-center"><Bell className="w-5 h-5 mr-2 text-indigo-600"/> Notificaciones</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { key: 'email', label: 'Email' },
              { key: 'push', label: 'Push' },
              { key: 'sound', label: 'Sonido' }
            ].map(opt => (
              <label key={opt.key} className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
                <input
                  type="checkbox"
                  checked={(notificationSettings as any)[opt.key]}
                  onChange={(e) => onUpdateNotificationSettings({ [opt.key]: e.target.checked } as any)}
                />
                <span className="text-sm">{opt.label}</span>
              </label>
            ))}
          </div>
          <div className="mt-4">
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Categorías</p>
            <div className="flex flex-wrap gap-2">
              {Object.keys(notificationSettings.categories).map((cat) => (
                <label key={cat} className="flex items-center gap-2 px-3 py-2 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
                  <input
                    type="checkbox"
                    checked={notificationSettings.categories[cat as keyof NotificationSettings['categories']]}
                    onChange={(e) => onUpdateNotificationSettings({
                      categories: { ...notificationSettings.categories, [cat]: e.target.checked }
                    })}
                  />
                  <span className="text-xs font-medium">{cat}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Accesos por rol (RBAC) */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="h3 font-bold flex items-center"><Shield className="w-5 h-5 mr-2 text-indigo-600"/> Roles y Accesos</h2>
            <button onClick={resetToDefault} className="button button-secondary" title="Restablecer accesos a predeterminados">
              <Undo2 className="w-4 h-4 mr-2"/> Restablecer
            </button>
          </div>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="md:w-64 shrink-0">
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Seleccionar Rol</label>
              <div className="space-y-2">
                {roles.map(r => (
                  <button key={r} onClick={() => setSelectedRole(r)} className={`w-full text-left px-3 py-2 rounded-lg border text-sm transition-colors ${
                    selectedRole === r ? 'border-indigo-300 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300' : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}>
                    <Users className="w-4 h-4 inline mr-2"/> {r}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Módulos</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {NAV_ITEMS.map(n => (
                  <label key={n.id} className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
                    <input type="checkbox" checked={rolePermissions.includes(n.id)} onChange={() => togglePermission(n.id)} />
                    <span className="text-sm">{n.label}</span>
                  </label>
                ))}
              </div>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mt-5 mb-2">Submódulos</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {Object.entries(SUB_MODULES).map(([group, items]) => (
                  <div key={group} className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 p-3">
                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">{group.toUpperCase()}</p>
                    <div className="space-y-2">
                      {items.map(it => (
                        <label key={it.id} className="flex items-center gap-2">
                          <input type="checkbox" checked={rolePermissions.includes(it.id)} onChange={() => togglePermission(it.id)} />
                          <span className="text-sm">{it.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
