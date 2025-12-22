
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { NAV_ITEMS, NAV_ICON_MAP } from '../constants';
import { Bell, Sun, Moon, Menu, X, Check, Trash2, Info, AlertTriangle, CheckCircle, XCircle, Sparkles, LogOut, User, MoreHorizontal, Accessibility } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useNotification } from '../context/NotificationContext';
import { AgronareLogo } from './AgronareLogo';
import { NotificationType } from '../types';

// Helper para combinar clases de forma segura
const cn = (...classes: Array<string | false | null | undefined>) => classes.filter(Boolean).join(' ');

interface HeaderProps {
    currentView: string;
    onNavigate: (viewId: string) => void;
    currentUser?: any;
    onLogout?: () => void;
    allowedViews?: string[];
}

export const Header: React.FC<HeaderProps> = ({ currentView, onNavigate, currentUser, onLogout, allowedViews = [] }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isMoreOpen, setIsMoreOpen] = useState(false);
    const [iconsOnly, setIconsOnly] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [notifFilter, setNotifFilter] = useState<'all' | 'unread' | 'system'>('all');

    const { theme, toggleTheme } = useTheme();
  const { notifications, unreadCount, markAsRead, markAllAsRead, removeNotification, clearAll } = useNotification();
  
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
    const navRef = useRef<HTMLElement | null>(null);
    const moreRef = useRef<HTMLButtonElement | null>(null);
    const [visibleIds, setVisibleIds] = useState<string[]>([]);
    const [overflowIds, setOverflowIds] = useState<string[]>([]);
    const [compactNav, setCompactNav] = useState<boolean>(false);
        const headerRef = useRef<HTMLElement | null>(null);

  // Close menus when clicking outside
    useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [notifRef, profileRef]);

    // Keep a CSS custom property with the current header height so sidebars can align underneath.
    useEffect(() => {
        const updateHeaderHeight = () => {
            const el = headerRef.current;
            const height = el ? `${Math.round(el.offsetHeight)}px` : '64px';
            document.documentElement.style.setProperty('--header-height', height);
        };

        updateHeaderHeight();
        const observer = headerRef.current ? new ResizeObserver(updateHeaderHeight) : null;
        window.addEventListener('resize', updateHeaderHeight);
        return () => {
            observer?.disconnect();
            window.removeEventListener('resize', updateHeaderHeight);
            document.documentElement.style.setProperty('--header-height', '64px');
        };
    }, []);

  // Format time helper
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 60000); // minutes
    if (diff < 1) return 'Justo ahora';
    if (diff < 60) return `Hace ${diff} min`;
    if (diff < 1440) return `Hace ${Math.floor(diff / 60)} h`;
    return date.toLocaleDateString();
  };

  const getIcon = (type: NotificationType) => {
      switch(type) {
          case 'warning': return <AlertTriangle className="w-4 h-4 text-amber-500" />;
          case 'success': return <CheckCircle className="w-4 h-4 text-emerald-500" />;
          case 'error': return <XCircle className="w-4 h-4 text-red-500" />;
          default: return <Info className="w-4 h-4 text-blue-500" />;
      }
  };

  const getThemeIcon = () => {
      switch(theme) {
          case 'light': return <Sun className="h-4 w-4" />;
          case 'dark': return <Moon className="h-4 w-4" />;
          case 'modern': return <Sparkles className="h-4 w-4 text-indigo-400" />;
          case 'hc': return <Accessibility className="h-4 w-4 text-black" />;
      }
  };

  const getThemeLabel = () => {
      switch(theme) {
          case 'light': return 'Modo Claro';
          case 'dark': return 'Modo Oscuro';
          case 'modern': return 'Modo Moderno';
          case 'hc': return 'Alto Contraste';
      }
  };

  const userInitials = currentUser 
    ? `${currentUser.firstName.charAt(0)}${currentUser.lastName.charAt(0)}`
    : 'AG';

    // Restaurar menú superior completo, incluyendo Exportar y Ajustes
    const filteredNavItems = NAV_ITEMS.filter(item => allowedViews.includes(item.id));

    // Compute visible/overflow items depending on available width
    // Helper to shallow-compare arrays and avoid unnecessary setState
    const arraysEqual = (a: string[], b: string[]) => a.length === b.length && a.every((v, i) => v === b[i]);

    const computeVisible = React.useCallback(() => {
        const container = navRef.current;
        if (!container) return;
        const children = container.querySelectorAll<HTMLButtonElement>('.nav-inner button[data-nav-id]');
        const moreBtnWidth = moreRef.current ? moreRef.current.offsetWidth + 8 : 56; // fallback
        const containerWidth = container.clientWidth;
        let used = 0;
        const vis: string[] = [];
        const ovf: string[] = [];
        children.forEach((child) => {
            const id = child.dataset.navId as string;
            const w = child.offsetWidth;
            if (used + w + moreBtnWidth > containerWidth) {
                ovf.push(id);
            } else {
                vis.push(id);
                used += w;
            }
        });

        setVisibleIds(prev => arraysEqual(prev, vis) ? prev : vis);
        setOverflowIds(prev => arraysEqual(prev, ovf) ? prev : ovf);
        setCompactNav(prev => prev === (ovf.length > 0) ? prev : (ovf.length > 0));

        // If container is very narrow, switch to icons-only mode
        // Hysteresis thresholds to avoid toggle thrash when zooming or small resizes
        // Umbrales ajustados para el nuevo diseño más compacto
        const enableIcons = containerWidth < 600 && filteredNavItems.length > 4;
        const disableIcons = containerWidth > 900 || filteredNavItems.length <= 4;
        const shouldIcons = iconsOnly ? !disableIcons : enableIcons;
        setIconsOnly(prev => prev === shouldIcons ? prev : shouldIcons);
    }, [filteredNavItems.length]);

    // Debounce to avoid reacting to every small layout change (zoom / resize)
    const debounceRef = React.useRef<number | null>(null);
    useEffect(() => {
        const handler = () => {
            if (debounceRef.current) window.clearTimeout(debounceRef.current);
            debounceRef.current = window.setTimeout(() => computeVisible(), 120);
        };
        handler();
        const ro = new ResizeObserver(handler);
        if (navRef.current) ro.observe(navRef.current);
        const sidebarEl = document.getElementById('agronare-sidebar');
        if (sidebarEl) ro.observe(sidebarEl);
        window.addEventListener('resize', handler);
        return () => {
            ro.disconnect();
            window.removeEventListener('resize', handler);
            if (debounceRef.current) window.clearTimeout(debounceRef.current);
        };
    }, [computeVisible, iconsOnly]);
    

  // Filter logic for notifications
  const displayedNotifications = useMemo(() => {
      if (notifFilter === 'unread') return notifications.filter(n => !n.read);
      if (notifFilter === 'system') return notifications.filter(n => n.category === 'System');
      return notifications;
  }, [notifications, notifFilter]);

        const headerStretchStyle = {
            width: '100vw',
            marginLeft: 'calc(-50vw + 50%)',
            marginRight: 'calc(-50vw + 50%)'
        } as React.CSSProperties;

        return (
                    <header
                        ref={headerRef}
                        className="sticky top-0 inset-x-0 z-50 border-b border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md supports-[backdrop-filter]:bg-white/80 dark:supports-[backdrop-filter]:bg-slate-900/80 shadow-sm transition-colors"
                        style={headerStretchStyle}
                    >
                        <div className="w-full max-w-[2000px] mx-auto px-3">
        <div className="flex items-center justify-between h-16">

          {/* Logo Section */}
                                        <div className="flex items-center flex-shrink-0 mr-2 cursor-pointer" onClick={() => onNavigate('dashboard')}>
                        <AgronareLogo className="h-10 w-auto" />
                    </div>

                                        {/* Desktop Navigation */}
                                        <nav ref={(el) => { navRef.current = el; }} className={`hidden xl:flex flex-1 min-w-0 items-center justify-center overflow-hidden px-3`}>
                                            <div className={`nav-inner inline-flex items-center gap-1 text-sm snap-x snap-mandatory overflow-x-auto no-scrollbar whitespace-nowrap flex-nowrap min-w-0`}>
                                                {filteredNavItems.map((item) => (
                                                                                                                <div key={item.id} className="relative group">
                                                                                                                        <button
                type="button"
                key={item.id}
                onClick={() => onNavigate(item.id)}
                                                                                                                                                                                                                    className={cn(`transition-all duration-200 px-2.5 py-1.5 rounded-lg shrink-0 snap-start whitespace-nowrap font-medium text-xs `,
                                    currentView === item.id
                                                                                ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-500/30 ring-1 ring-indigo-200 dark:ring-indigo-800'
                                                                                : 'text-slate-700 hover:text-indigo-600 hover:bg-indigo-50/80 dark:text-slate-300 dark:hover:text-indigo-400 dark:hover:bg-indigo-900/30 hover:scale-105'
                                                                            )}
                                                                                                        data-nav-id={item.id}
                                aria-label={`Ir a ${item.label}`}
                                role="link"
              >
                                                                        {iconsOnly ? (
                                                                            (NAV_ICON_MAP[item.id] ? React.createElement(NAV_ICON_MAP[item.id], { className: 'w-4 h-4' }) : item.label)
                                                                        ) : item.label}
                            </button>
                            {iconsOnly && (
                                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 bg-slate-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 shadow-md">
                                    {item.label}
                                </div>
                            )}
                        </div>
                        ))}
                                                                {overflowIds.length > 0 && (
                                                                    <div className="relative">
                                                                        <button type="button" ref={(el) => { moreRef.current = el; }} onClick={() => setIsMoreOpen(!isMoreOpen)} className="transition-all duration-200 text-xs w-auto shrink-0 px-2.5 py-1.5 rounded-lg snap-start text-slate-700 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800 hover:scale-105" aria-label="Más opciones" title="Más">
                                                                            <MoreHorizontal className="w-4 h-4" />
                                                                        </button>
                                                                        {isMoreOpen && (
                                                                            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-lg shadow-md border border-slate-100 dark:border-slate-700 overflow-hidden transform origin-top-right transition-all animate-in fade-in zoom-in-95 z-[60]">
                                                                                {overflowIds.map((id) => {
                                                                                    const item = filteredNavItems.find(i => i.id === id)!;
                                                                                    return (
                                                                                        <button type="button" key={`ov-${id}`} onClick={() => { onNavigate(item.id); setIsMoreOpen(false); }} className="w-full text-left px-3 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg flex items-center gap-1.5" aria-label={`Ir a ${item.label}`}>
                                                                                            {NAV_ICON_MAP[item.id] && React.createElement(NAV_ICON_MAP[item.id], { className: 'w-4 h-4 text-slate-500' })}
                                                                                            {item.label}
                                                                                        </button>
                                                                                    );
                                                                                })}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                )}
                                            </div>
          </nav>

          {/* Right Side Icons */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {/* Notification Bell */}
            <div className="relative" ref={notifRef}>
                <button
                    type="button"
                    onClick={() => setIsNotifOpen(!isNotifOpen)}
                    className="relative h-9 w-9 flex items-center justify-center rounded-lg text-slate-600 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-400 transition-all hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:scale-110"
                    aria-label="Abrir notificaciones"
                    title="Abrir notificaciones"
                >
                    <Bell className="h-4 w-4" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 h-4 min-w-4 px-1 rounded-full bg-red-500 text-white text-[9px] leading-4 text-center font-bold shadow-lg">
                            {unreadCount}
                        </span>
                    )}
                </button>

                {/* Notifications Dropdown */}
                {isNotifOpen && (
                    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-800 rounded-lg shadow-md border border-slate-100 dark:border-slate-700 overflow-hidden transform origin-top-right transition-all animate-in fade-in zoom-in-95 z-[60]">
                        {/* Header */}
                        <div className="p-3 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
                            <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-xs">Notificaciones</h3>
                            <div className="flex gap-1.5">
                                {unreadCount > 0 && (
                                    <button type="button" onClick={markAllAsRead} className="p-1.5 text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 rounded hover:bg-white dark:hover:bg-slate-700 transition-colors" title="Marcar todo como leído" aria-label="Marcar todas las notificaciones como leídas">
                                        <Check className="w-4 h-4" />
                                    </button>
                                )}
                                <button type="button" onClick={clearAll} className="p-1.5 text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 rounded hover:bg-white dark:hover:bg-slate-700 transition-colors" title="Limpiar todo" aria-label="Limpiar todas las notificaciones">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                        
                        {/* Tabs */}
                        <div className="flex border-b border-slate-100 dark:border-slate-700">
                            <button
                                type="button"
                                onClick={() => setNotifFilter('all')}
                                className={`flex-1 py-2 text-xs font-medium ${notifFilter === 'all' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50 dark:bg-blue-900/20' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
                                aria-label="Filtrar todas las notificaciones"
                            >
                                Todas
                            </button>
                            <button
                                type="button"
                                onClick={() => setNotifFilter('unread')}
                                className={`flex-1 py-2 text-xs font-medium ${notifFilter === 'unread' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50 dark:bg-blue-900/20' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
                                aria-label="Filtrar notificaciones no leídas"
                            >
                                No leídas
                            </button>
                            <button
                                type="button"
                                onClick={() => setNotifFilter('system')}
                                className={`flex-1 py-2 text-xs font-medium ${notifFilter === 'system' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50 dark:bg-blue-900/20' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
                                aria-label="Filtrar notificaciones del sistema"
                            >
                                Sistema
                            </button>
                        </div>

                        {/* List */}
                        <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                            {displayedNotifications.length > 0 ? (
                                displayedNotifications.map((notif) => (
                                    <div 
                                        key={notif.id} 
                                        className={`p-4 border-b border-slate-50 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors relative group ${!notif.read ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''}`}
                                        onClick={() => {
                                            markAsRead(notif.id);
                                            if(notif.link) onNavigate(notif.link);
                                        }}
                                    >
                                        <div className="flex gap-3">
                                            <div className="mt-1 shrink-0">{getIcon(notif.type)}</div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start">
                                                    <p className={`text-sm font-medium truncate pr-6 ${!notif.read ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>
                                                        {notif.title}
                                                    </p>
                                                    <span className="text-[10px] text-slate-400 whitespace-nowrap ml-2 flex-shrink-0">{formatTime(notif.timestamp)}</span>
                                                </div>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-snug">{notif.message}</p>
                                                {notif.category && <span className="inline-block mt-2 text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400">{notif.category}</span>}
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={(e) => { e.stopPropagation(); removeNotification(notif.id); }}
                                            className="absolute top-3 right-3 p-1 text-slate-300 hover:text-red-500 rounded opacity-0 group-hover:opacity-100 transition-all"
                                            aria-label="Eliminar notificación"
                                            title="Eliminar"
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <div className="p-8 text-center text-slate-400 dark:text-slate-500">
                                    <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                    <p className="text-sm">Sin notificaciones.</p>
                                </div>
                            )}
                        </div>
                        <div className="p-2 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-700 text-center">
                            <button type="button" onClick={() => onNavigate('ajustes')} className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline" aria-label="Ir a configurar alertas">Configurar alertas</button>
                        </div>
                    </div>
                )}
            </div>
            
            {/* Theme Switcher */}
            <button
                type="button"
                onClick={() => toggleTheme()}
                className="h-9 w-9 flex items-center justify-center rounded-lg text-slate-600 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 transition-all hover:bg-amber-50 dark:hover:bg-amber-900/20 hover:scale-110"
                title={getThemeLabel()}
                aria-label="Cambiar tema"
            >
                {getThemeIcon()}
            </button>

            {/* High-Contrast quick toggle removed to avoid double theme controls */}

            {/* Profile Avatar & Dropdown */}
            <div className="relative" ref={profileRef}>
                <button
                    type="button"
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="h-9 w-9 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 dark:from-indigo-600 dark:to-indigo-700 flex items-center justify-center text-white font-bold text-xs ring-2 ring-indigo-200 dark:ring-indigo-800 shadow-md shadow-indigo-500/30 cursor-pointer hover:ring-indigo-300 dark:hover:ring-indigo-700 hover:scale-110 transition-all focus:outline-none overflow-hidden"
                    aria-label="Abrir menú de perfil"
                    title="Abrir menú de perfil"
                >
                    {currentUser?.avatar ? (
                        <img src={currentUser.avatar} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                        userInitials
                    )}
                </button>

                {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-lg shadow-md border border-slate-100 dark:border-slate-700 overflow-hidden transform origin-top-right transition-all animate-in fade-in zoom-in-95 z-[60]">
                        <div className="p-4 border-b border-slate-100 dark:border-slate-700">
                            <p className="text-xs font-semibold text-slate-900 dark:text-white">{currentUser?.firstName} {currentUser?.lastName}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{currentUser?.email}</p>
                            <span className="inline-block mt-2 px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold rounded-full uppercase">
                                {currentUser?.role || 'Usuario'}
                            </span>
                        </div>
                        <div className="p-1">
                            <button
                                type="button"
                                onClick={() => { onNavigate('rh'); setIsProfileOpen(false); }}
                                className="w-full flex items-center px-3 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
                                aria-label="Ir a mi perfil"
                            >
                                <User className="w-4 h-4 mr-2" /> Mi Perfil
                            </button>
                            {/* Removidas opciones de Configuración/Exportar del menú de perfil para volver al menú superior */}
                            <button
                                type="button"
                                onClick={() => {
                                    if (window.confirm('⚠️ ¿Estás seguro de resetear todos los datos? Esto cargará los datos de prueba iniciales.')) {
                                        // Borra solo las claves relevantes para forzar recarga de datos demo
                                        const keys = [
                                            'agronare_clients_v3',
                                            'agronare_suppliers_v2',
                                            'agronare_branches_v2',
                                            'agronare_products',
                                            'agronare_inventory',
                                            'agronare_sales',
                                            'agronare_payments',
                                            'agronare_quotes',
                                            'agronare_pos',
                                            'agronare_assets',
                                            'agronare_projects',
                                            'agronare_tasks',
                                            'agronare_employees',
                                            'agronare_loans',
                                            'agronare_timeoff',
                                            'agronare_payroll_periods',
                                            'agronare_payroll_incidents',
                                            'agronare_compliance_records',
                                            'agronare_role_access',
                                            'agronare_current_view',
                                            'agronare_user',
                                            'agronare_chat_messages'
                                        ];
                                        keys.forEach(k => localStorage.removeItem(k));
                                        window.location.reload();
                                    }
                                }}
                                className="w-full flex items-center px-3 py-2 text-xs text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg"
                            >
                                <Trash2 className="w-4 h-4 mr-2" /> Resetear Datos (Demo)
                            </button>
                        </div>
                        <div className="p-1 border-t border-slate-100 dark:border-slate-700">
                            <button
                                type="button"
                                onClick={() => {
                                    setIsProfileOpen(false);
                                    if (onLogout) onLogout();
                                }}
                                className="w-full flex items-center px-3 py-2 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg font-medium"
                                aria-label="Cerrar sesión"
                            >
                                <LogOut className="w-4 h-4 mr-2" /> Cerrar Sesión
                            </button>
                        </div>
                    </div>
                )}
            </div>

             {/* Mobile Menu Button */}
             <div className="xl:hidden ml-2">
              <button
                type="button"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 focus:outline-none"
                aria-label={isMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
                aria-expanded={isMenuOpen}
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMenuOpen && (
        <div className="xl:hidden bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 animate-in slide-in-from-top-5">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {filteredNavItems.map((item) => (
              <button
                type="button"
                key={item.id}
                onClick={() => {
                    onNavigate(item.id);
                    setIsMenuOpen(false);
                }}
                className={`block w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                   currentView === item.id
                    ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800'
                }`}
                aria-label={`Ir a ${item.label}`}
              >
                {item.label}
              </button>
                        ))}
                        {/* Mobile HC toggle removed to keep a single theme control */}
            <button
                type="button"
                onClick={() => { if (onLogout) onLogout(); setIsMenuOpen(false); }}
                className="block w-full text-left px-3 py-2 rounded-md text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                aria-label="Cerrar sesión"
            >
                Cerrar Sesión
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
