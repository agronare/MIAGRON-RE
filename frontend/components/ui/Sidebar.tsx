import React, { useEffect, useRef, useState } from 'react';

export interface SidebarItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface SidebarProps {
  items: SidebarItem[];
  activeId: string;
  onSelect: (id: string) => void;
  title?: string;
  titleIcon?: React.ComponentType<{ className?: string }>;
  titleImageSrc?: string;
  titleImageAlt?: string;
  collapsedWidth?: number; // tailwind width in px (default 80 => w-20)
  expandedWidth?: number; // tailwind width in px (default 256 => w-64)
  colorScheme?: 'indigo' | 'blue' | 'emerald';
  className?: string;
}

const widthClass = (px?: number) => {
  switch (px) {
    case 64: return 'w-16';
    case 80: return 'w-20';
    case 96: return 'w-24';
    case 256: return 'w-64';
    case 280: return 'w-70';
    case 320: return 'w-80';
    default: return px && px < 120 ? 'w-20' : 'w-64';
  }
};

export const Sidebar: React.FC<SidebarProps> = ({
  items,
  activeId,
  onSelect,
  title,
  titleIcon: TitleIcon,
  titleImageSrc,
  titleImageAlt = 'Sidebar logo',
  collapsedWidth = 80,
  expandedWidth = 288,
  colorScheme = 'indigo',
  className = ''
}) => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const collapsedCls = widthClass(collapsedWidth);
  const expandedCls = widthClass(expandedWidth);
  
  const scheme = {
    bgActive: colorScheme === 'blue' 
      ? 'from-blue-500 to-blue-600' 
      : colorScheme === 'emerald' 
      ? 'from-emerald-500 to-emerald-600' 
      : 'from-indigo-500 to-indigo-600',
    textActive: colorScheme === 'blue' 
      ? 'text-blue-600 dark:text-blue-400' 
      : colorScheme === 'emerald' 
      ? 'text-emerald-600 dark:text-emerald-400' 
      : 'text-indigo-600 dark:text-indigo-400',
    shadowActive: colorScheme === 'blue'
      ? 'shadow-blue-500/30'
      : colorScheme === 'emerald'
      ? 'shadow-emerald-500/30'
      : 'shadow-indigo-500/30',
    bgGradient: colorScheme === 'blue'
      ? 'from-blue-50 to-blue-100/50 dark:from-blue-900/30 dark:to-blue-800/20'
      : colorScheme === 'emerald'
      ? 'from-emerald-50 to-emerald-100/50 dark:from-emerald-900/30 dark:to-emerald-800/20'
      : 'from-indigo-50 to-indigo-100/50 dark:from-indigo-900/30 dark:to-indigo-800/20',
    borderColor: colorScheme === 'blue'
      ? 'border-blue-200/50 dark:border-blue-700/50'
      : colorScheme === 'emerald'
      ? 'border-emerald-200/50 dark:border-emerald-700/50'
      : 'border-indigo-200/50 dark:border-indigo-700/50'
  };

  const sidebarRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const updateSidebarWidth = () => {
      const el = sidebarRef.current;
      if (!el) {
        document.documentElement.style.setProperty('--sidebar-width', '0px');
        return;
      }

      // Detectar visibilidad real del sidebar: visible en md+ o cuando el menú móvil está abierto.
      const mdVisible = window.matchMedia('(min-width: 768px)').matches;
      const isActuallyVisible = mdVisible || isMobileOpen;

      if (!isActuallyVisible) {
        // En móviles con el menú cerrado, no reservar ancho.
        document.documentElement.style.setProperty('--sidebar-width', '0px');
        return;
      }

      // Establecer inmediatamente el ancho esperado según estado de colapso para suavizar la transición.
      const expected = isCollapsed ? collapsedWidth : expandedWidth;
      document.documentElement.style.setProperty('--sidebar-width', `${expected}px`);

      // Luego, medir el ancho real y sincronizar si difiere.
      const rect = el.getBoundingClientRect();
      if (rect.right <= 0 || rect.width <= 0) {
        document.documentElement.style.setProperty('--sidebar-width', '0px');
        return;
      }

      document.documentElement.style.setProperty('--sidebar-width', `${Math.round(rect.width)}px`);
    };

    updateSidebarWidth();
    const observer = sidebarRef.current ? new ResizeObserver(updateSidebarWidth) : null;
    window.addEventListener('resize', updateSidebarWidth);

    return () => {
      observer?.disconnect();
      window.removeEventListener('resize', updateSidebarWidth);
      document.documentElement.style.setProperty('--sidebar-width', '0px');
    };
  }, [isCollapsed, isMobileOpen]);

  const sidebarContainerStyle: React.CSSProperties = {
    width: `var(--sidebar-width, ${collapsedWidth}px)`,
    minWidth: `var(--sidebar-width, ${collapsedWidth}px)`
  };

  const sidebarFixedStyle: React.CSSProperties = {
    top: 'var(--header-height, 80px)',
    height: 'calc(100vh - var(--header-height, 80px))'
  };

  return (
    <div className={`relative flex-shrink-0 ${className}`} style={sidebarContainerStyle}>
      {/* Mobile Toggle */}
      <button
        className="md:hidden absolute -right-3 top-3 z-50 p-2 rounded-full bg-white border border-slate-200 shadow-sm text-slate-600"
        aria-label="Abrir menú"
        onClick={() => { setIsCollapsed(false); setIsMobileOpen(true); }}
      >
        {/* Simple hamburger */}
        <span className="block w-4 h-0.5 bg-slate-600 mb-1" />
        <span className="block w-4 h-0.5 bg-slate-600 mb-1" />
        <span className="block w-4 h-0.5 bg-slate-600" />
      </button>

      {/* Overlay for mobile when open */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm md:hidden z-40 transition-opacity duration-200"
          onClick={() => { setIsMobileOpen(false); setIsCollapsed(true); }}
          aria-hidden="true"
        />
      )}
      <div
        aria-label="Hover rail"
        className="absolute left-0 top-0 h-full w-2 z-50 hidden md:block"
        onMouseEnter={() => setIsCollapsed(false)}
      />
      <div
        onMouseEnter={() => setIsCollapsed(false)}
        onMouseLeave={() => { setIsCollapsed(true); setIsMobileOpen(false); }}
        id="agronare-sidebar"
        ref={sidebarRef}
        className={`hidden md:flex flex-col border-r bg-gradient-to-b from-white via-slate-50/50 to-white dark:from-slate-900 dark:via-slate-900/80 dark:to-slate-950 border-slate-200/60 dark:border-slate-800/60 shadow-lg transition-all duration-300 ease-in-out fixed left-0 z-40 ${
          isMobileOpen ? 'shadow-2xl translate-x-0 scale-100' : '-translate-x-full md:translate-x-0 md:shadow-lg md:scale-100 scale-95'
        } ${
          isCollapsed ? `${collapsedCls}` : `${expandedCls}`
        }`}
        style={sidebarFixedStyle}
      >
        {/* Logo Header */}
        {(title || TitleIcon || titleImageSrc) && (
          <div className="flex items-center justify-center h-24 mb-4 transition-all duration-300">
            {titleImageSrc ? (
              <div className={`flex items-center justify-center transition-all duration-300 ${isCollapsed ? 'w-14 h-14' : `w-16 h-16 bg-gradient-to-br ${scheme.bgGradient} rounded-2xl border ${scheme.borderColor} shadow-sm`}`}>
                <img
                  src={titleImageSrc}
                  alt={titleImageAlt}
                  className={`w-auto object-contain transition-all duration-300 ${isCollapsed ? 'h-10' : 'h-12'}`}
                />
              </div>
            ) : TitleIcon ? (
              <div className={`flex items-center justify-center ${isCollapsed ? 'w-14 h-14' : 'w-16 h-16'}`}>
                <TitleIcon className={`w-8 h-8 flex-shrink-0 ${scheme.textActive}`} />
              </div>
            ) : null}
          </div>
        )}

        {/* Navigation */}
        <nav className="space-y-1 flex-1 px-3">
          {items.map((item) => (
            <div key={item.id} className="relative group">
              <button
                onClick={() => onSelect(item.id)}
                className={`relative w-full flex items-center rounded-xl transition-all duration-200 ease-in-out overflow-hidden
                  ${isCollapsed ? 'justify-center px-3 py-3' : 'justify-start px-4 py-3'}
                  ${activeId === item.id 
                    ? `bg-gradient-to-r ${scheme.bgActive} text-white shadow-lg ${scheme.shadowActive} scale-[1.02]` 
                    : 'text-slate-600 dark:text-slate-400 hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-50 dark:hover:from-slate-800 dark:hover:to-slate-800/80 hover:text-slate-900 dark:hover:text-white hover:shadow-md'}`}
              >
                {/* Barra de acento lateral para item activo */}
                {activeId === item.id && !isCollapsed && (
                  <span className="absolute left-0 top-2 bottom-2 w-1 bg-white rounded-r-full opacity-80" />
                )}
                
                {/* Icono */}
                <div className={`flex items-center justify-center transition-all duration-200 ${isCollapsed ? '' : 'ml-1'}`}>
                  <item.icon className={`w-5 h-5 shrink-0 transition-all duration-200 ${activeId === item.id ? 'text-white' : 'text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200'}`} />
                </div>
                
                {/* Label */}
                <span className={`text-sm font-medium whitespace-nowrap overflow-hidden transition-all duration-200 ${isCollapsed ? 'w-0 opacity-0 ml-0' : 'w-auto opacity-100 ml-3'} ${activeId === item.id ? 'font-semibold' : ''}`}>
                  {item.label}
                </span>
                
                {/* Indicador de hover */}
                {activeId !== item.id && !isCollapsed && (
                  <span className="absolute right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                )}
              </button>
              
              {/* Tooltip cuando está colapsado */}
              {isCollapsed && (
                <div className="absolute left-full ml-3 px-3 py-2 bg-slate-900 dark:bg-slate-800 text-white text-xs font-medium rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap z-50 border border-slate-700/50">
                  {item.label}
                  <div className="absolute right-full top-1/2 -translate-y-1/2 border-[6px] border-transparent border-r-slate-900 dark:border-r-slate-800" />
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Close button visible on mobile when open */}
        {isMobileOpen && (
          <button
            className="md:hidden mt-2 mb-4 mx-3 px-3 py-2 text-xs rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
            onClick={() => { setIsMobileOpen(false); setIsCollapsed(true); }}
          >
            Cerrar
          </button>
        )}
      </div>
    </div>
  );
};
