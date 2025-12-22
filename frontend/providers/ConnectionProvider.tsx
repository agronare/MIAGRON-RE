// ============================================================================
// 🌾 AGRONARE — Connection Provider
// Contexto global para estado de conexión con el backend
// ============================================================================

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { ENV } from '../config/env';
import { apiClient } from '../lib/apiClient';

// ============================================================================
// TIPOS
// ============================================================================

export type ConnectionStatus = 'online' | 'offline' | 'checking';

export interface ConnectionState {
  /** Estado actual de la conexión */
  status: ConnectionStatus;
  /** ¿Está conectado al backend? */
  isOnline: boolean;
  /** ¿Está verificando la conexión? */
  isChecking: boolean;
  /** Última verificación exitosa */
  lastCheck: Date | null;
  /** Número de intentos fallidos consecutivos */
  failedAttempts: number;
  /** Información de sincronización */
  syncInfo: {
    lastSync: Date | null;
    syncAttempts: number;
  };
}

export interface ConnectionContextValue extends ConnectionState {
  /** Verificar conexión manualmente */
  checkConnection: () => Promise<boolean>;
  /** Forzar resincronización */
  triggerResync: () => void;
  /** Verificar si se puede realizar una operación de escritura */
  canWrite: () => boolean;
}

// ============================================================================
// CONTEXTO
// ============================================================================

const ConnectionContext = createContext<ConnectionContextValue | null>(null);

// ============================================================================
// EVENTOS PERSONALIZADOS
// ============================================================================

const EVENTS = {
  CONNECTED: 'backend-connected',
  DISCONNECTED: 'backend-disconnected',
  RECONNECTED: 'backend-reconnected',
  MANUAL_RESYNC: 'manual-resync',
  SYNC_INFO: 'backend-sync-info',
} as const;

/**
 * Dispara un evento personalizado
 */
const dispatchConnectionEvent = (eventName: string, detail?: any) => {
  window.dispatchEvent(new CustomEvent(eventName, { detail }));
};

// ============================================================================
// PROVIDER
// ============================================================================

export interface ConnectionProviderProps {
  children: React.ReactNode;
  /** Intervalo de health check en ms (default: 15000) */
  checkInterval?: number;
  /** Callback cuando se conecta */
  onConnect?: () => void;
  /** Callback cuando se desconecta */
  onDisconnect?: () => void;
}

export const ConnectionProvider: React.FC<ConnectionProviderProps> = ({
  children,
  checkInterval = ENV.HEALTH_CHECK_INTERVAL,
  onConnect,
  onDisconnect,
}) => {
  // Estado
  const [status, setStatus] = useState<ConnectionStatus>('checking');
  const [lastCheck, setLastCheck] = useState<Date | null>(null);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [syncInfo, setSyncInfo] = useState<{ lastSync: Date | null; syncAttempts: number }>({
    lastSync: null,
    syncAttempts: 0,
  });

  // Refs para evitar closures stale
  const prevStatusRef = useRef<ConnectionStatus>('checking');
  const mountedRef = useRef(true);

  // Verificar conexión
  const checkConnection = useCallback(async (): Promise<boolean> => {
    if (!mountedRef.current) return false;

    setStatus('checking');

    try {
      const isHealthy = await apiClient.healthCheck();

      if (!mountedRef.current) return false;

      const newStatus: ConnectionStatus = isHealthy ? 'online' : 'offline';
      const prevStatus = prevStatusRef.current;

      setStatus(newStatus);
      setLastCheck(new Date());
      setFailedAttempts(isHealthy ? 0 : (prev) => prev + 1);

      // Detectar cambios de estado
      if (prevStatus !== newStatus) {
        if (newStatus === 'online') {
          // Se conectó o reconectó
          if (prevStatus === 'offline') {
            dispatchConnectionEvent(EVENTS.RECONNECTED);
            onConnect?.();
          } else {
            dispatchConnectionEvent(EVENTS.CONNECTED);
            onConnect?.();
          }
        } else if (newStatus === 'offline') {
          dispatchConnectionEvent(EVENTS.DISCONNECTED);
          onDisconnect?.();
        }
      }

      prevStatusRef.current = newStatus;
      return isHealthy;

    } catch (error) {
      if (!mountedRef.current) return false;

      setStatus('offline');
      setLastCheck(new Date());
      setFailedAttempts((prev) => prev + 1);

      if (prevStatusRef.current !== 'offline') {
        dispatchConnectionEvent(EVENTS.DISCONNECTED);
        onDisconnect?.();
      }

      prevStatusRef.current = 'offline';
      return false;
    }
  }, [onConnect, onDisconnect]);

  // Forzar resincronización
  const triggerResync = useCallback(() => {
    dispatchConnectionEvent(EVENTS.MANUAL_RESYNC);
    setSyncInfo((prev) => ({
      ...prev,
      syncAttempts: prev.syncAttempts + 1,
    }));
  }, []);

  // Verificar si se puede escribir
  const canWrite = useCallback((): boolean => {
    return status === 'online';
  }, [status]);

  // Escuchar eventos de sync info
  useEffect(() => {
    const handleSyncInfo = (e: CustomEvent<{ attempts: number; lastSync: Date }>) => {
      if (e.detail) {
        setSyncInfo({
          lastSync: e.detail.lastSync,
          syncAttempts: e.detail.attempts,
        });
      }
    };

    window.addEventListener(EVENTS.SYNC_INFO, handleSyncInfo as EventListener);
    return () => {
      window.removeEventListener(EVENTS.SYNC_INFO, handleSyncInfo as EventListener);
    };
  }, []);

  // Health check inicial y periódico
  useEffect(() => {
    mountedRef.current = true;

    // Check inicial
    checkConnection();

    // Check periódico
    const intervalId = setInterval(checkConnection, checkInterval);

    return () => {
      mountedRef.current = false;
      clearInterval(intervalId);
    };
  }, [checkConnection, checkInterval]);

  // Valor del contexto
  const contextValue: ConnectionContextValue = {
    status,
    isOnline: status === 'online',
    isChecking: status === 'checking',
    lastCheck,
    failedAttempts,
    syncInfo,
    checkConnection,
    triggerResync,
    canWrite,
  };

  return (
    <ConnectionContext.Provider value={contextValue}>
      {children}
    </ConnectionContext.Provider>
  );
};

// ============================================================================
// HOOK
// ============================================================================

/**
 * Hook para acceder al estado de conexión
 * @throws Error si se usa fuera de ConnectionProvider
 */
export const useConnection = (): ConnectionContextValue => {
  const context = useContext(ConnectionContext);
  
  if (!context) {
    throw new Error('useConnection debe usarse dentro de ConnectionProvider');
  }
  
  return context;
};

// ============================================================================
// COMPONENTE DE BARRERA OFFLINE
// ============================================================================

export interface OfflineBarrierProps {
  children: React.ReactNode;
  /** Mensaje a mostrar cuando está offline */
  message?: string;
  /** Mostrar botón de reintentar */
  showRetry?: boolean;
  /** Componente personalizado para offline */
  fallback?: React.ReactNode;
}

/**
 * Componente que bloquea contenido cuando está offline
 */
export const OfflineBarrier: React.FC<OfflineBarrierProps> = ({
  children,
  message = 'Las operaciones de escritura están deshabilitadas mientras el servidor no esté disponible.',
  showRetry = true,
  fallback,
}) => {
  const { isOnline, isChecking, checkConnection } = useConnection();

  if (isOnline) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <div className="relative">
      {/* Overlay con blur */}
      <div className="pointer-events-none opacity-50 blur-[1px]">
        {children}
      </div>
      
      {/* Mensaje de offline */}
      <div className="absolute inset-0 flex items-center justify-center bg-slate-900/20 dark:bg-slate-900/40 backdrop-blur-sm rounded-lg">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-xl border border-amber-200 dark:border-amber-700 max-w-md text-center">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
            <svg className="w-6 h-6 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
            Modo Offline
          </h3>
          
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
            {message}
          </p>
          
          {showRetry && (
            <button
              onClick={() => checkConnection()}
              disabled={isChecking}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-400 text-white rounded-lg text-sm font-medium transition-colors"
            >
              {isChecking ? 'Verificando...' : 'Reintentar conexión'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// EXPORTS
// ============================================================================

export default ConnectionProvider;
