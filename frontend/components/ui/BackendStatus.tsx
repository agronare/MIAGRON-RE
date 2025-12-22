// ============================================================================
// 🌾 AGRONARE — Backend Status Indicator
// Indicador visual del estado de conexión con el backend
// ============================================================================

import React, { useState, useEffect } from 'react';
import { Cloud, CloudOff, RefreshCw, Database } from 'lucide-react';
import api from '../../services/api';

interface BackendStatusProps {
  className?: string;
  showLabel?: boolean;
}

export const BackendStatus: React.FC<BackendStatusProps> = ({ className = '', showLabel = false }) => {
  const [status, setStatus] = useState<'connected' | 'disconnected' | 'checking'>('checking');
  const [lastCheck, setLastCheck] = useState<Date | null>(null);
  const [stats, setStats] = useState<any>(null);

  const checkConnection = async () => {
    setStatus('checking');
    try {
      const response = await api.get<any>('/stats/overview');
      if (response.success) {
        setStatus('connected');
        setStats(response.data);
      } else {
        setStatus('disconnected');
      }
    } catch (err) {
      setStatus('disconnected');
    }
    setLastCheck(new Date());
  };

  useEffect(() => {
    checkConnection();
    // Check every 30 seconds
    const interval = setInterval(checkConnection, 30000);
    return () => clearInterval(interval);
  }, []);

  const statusConfig = {
    connected: {
      icon: Cloud,
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10',
      label: 'Backend Conectado',
      pulse: false,
    },
    disconnected: {
      icon: CloudOff,
      color: 'text-red-500',
      bg: 'bg-red-500/10',
      label: 'Sin Conexión',
      pulse: false,
    },
    checking: {
      icon: RefreshCw,
      color: 'text-amber-500',
      bg: 'bg-amber-500/10',
      label: 'Verificando...',
      pulse: true,
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <button
        onClick={checkConnection}
        className={`
          flex items-center gap-2 px-3 py-1.5 rounded-lg
          ${config.bg} ${config.color}
          transition-all duration-300 hover:scale-105
          ${config.pulse ? 'animate-pulse' : ''}
        `}
        title={`Último check: ${lastCheck?.toLocaleTimeString() || 'Nunca'}`}
      >
        <Icon className={`w-4 h-4 ${config.pulse ? 'animate-spin' : ''}`} />
        {showLabel && (
          <span className="text-xs font-medium">{config.label}</span>
        )}
      </button>
      
      {status === 'connected' && stats && (
        <div className="hidden md:flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
          <Database className="w-3 h-3" />
          <span>{stats.clientes || 0} clientes</span>
          <span className="text-slate-300 dark:text-slate-600">•</span>
          <span>{stats.productos || 0} productos</span>
        </div>
      )}
    </div>
  );
};

export default BackendStatus;
