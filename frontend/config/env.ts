// ============================================================================
// 🌾 AGRONARE — Configuración de Entorno
// Variables centralizadas para toda la aplicación frontend
// ============================================================================

/**
 * Configuración del entorno de la aplicación.
 * Todas las variables de entorno deben ser accedidas a través de este objeto.
 */
export const ENV = {
  /**
   * URL base del backend (sin /api)
   * @example 'http://localhost:4000'
   */
  BACKEND_URL: ((typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_BACKEND_URL) || '').trim(),

  /**
   * URL base de la API (con /api)
   */
  get API_BASE_URL() {
    // Si no se define BACKEND_URL, usar ruta relativa '/api'
    // para pasar por Nginx (producción) o proxy de Vite (desarrollo)
    if (!this.BACKEND_URL) return '/api';
    return `${this.BACKEND_URL}/api`;
  },

  /**
   * Timeout para peticiones HTTP en milisegundos
   */
  API_TIMEOUT: 10000,

  /**
   * Número de reintentos para peticiones fallidas
   */
  RETRY_ATTEMPTS: 2,

  /**
   * Intervalo de health check en milisegundos
   */
  HEALTH_CHECK_INTERVAL: 15000,

  /**
   * Modo de desarrollo
   */
  IS_DEV: (typeof import.meta !== 'undefined' && (import.meta as any).env?.DEV) || false,

  /**
   * Versión de la aplicación
   */
  APP_VERSION: '1.0.0',

  /**
   * Nombre de la aplicación
   */
  APP_NAME: 'AGRONARE',
} as const;

/**
 * Claves de localStorage permitidas (solo para preferencias UI)
 * Datos de negocio NO deben usar localStorage
 */
export const STORAGE_KEYS = {
  // Preferencias de UI (permitido)
  THEME: 'agronare_theme',
  CURRENT_VIEW: 'agronare_current_view',
  SIDEBAR_COLLAPSED: 'agronare_sidebar_collapsed',
  NOTIFICATION_SETTINGS: 'agronare_notification_settings',
  
  // Auth token (permitido)
  AUTH_TOKEN: 'auth_token',
  
  // Usuario actual (sesión)
  CURRENT_USER: 'agronare_user',
} as const;

/**
 * Verifica si una clave de localStorage es permitida
 */
export const isAllowedStorageKey = (key: string): boolean => {
  return Object.values(STORAGE_KEYS).includes(key as any);
};

export default ENV;
