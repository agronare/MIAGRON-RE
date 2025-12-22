// ============================================================================
// 🌾 AGRONARE — API Client Mejorado
// Cliente HTTP robusto con timeout, reintentos, interceptores y manejo de errores
// ============================================================================

import { ENV, STORAGE_KEYS } from '../config/env';

// ============================================================================
// TIPOS
// ============================================================================

export interface ApiResponse<T = any> {
  data?: T;
  total?: number;
  success: boolean;
  error?: string;
  statusCode?: number;
}

export interface RequestOptions extends Omit<RequestInit, 'body'> {
  timeout?: number;
  retries?: number;
  body?: any;
  skipAuth?: boolean;
}

export interface QueryOptions {
  skip?: number;
  take?: number;
  orderBy?: Record<string, 'asc' | 'desc'>;
  where?: Record<string, any>;
}

// ============================================================================
// ERRORES PERSONALIZADOS
// ============================================================================

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public isNetworkError: boolean = false,
    public isTimeout: boolean = false
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class NetworkError extends ApiError {
  constructor(message: string = 'Error de conexión con el servidor') {
    super(message, 0, true, false);
    this.name = 'NetworkError';
  }
}

export class TimeoutError extends ApiError {
  constructor(message: string = 'La solicitud tardó demasiado tiempo') {
    super(message, 408, false, true);
    this.name = 'TimeoutError';
  }
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Crea un AbortController con timeout
 */
const createTimeoutController = (timeoutMs: number): { controller: AbortController; timeoutId: NodeJS.Timeout } => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  return { controller, timeoutId };
};

/**
 * Obtiene el token de autenticación
 */
const getAuthToken = (): string | null => {
  try {
    return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  } catch {
    return null;
  }
};

/**
 * Log en desarrollo
 */
const devLog = (message: string, data?: any) => {
  if (ENV.IS_DEV) {
    console.log(`[API] ${message}`, data || '');
  }
};

// ============================================================================
// API CLIENT CLASS
// ============================================================================

class ApiClient {
  private baseUrl: string;
  private defaultTimeout: number;
  private defaultRetries: number;

  constructor(
    baseUrl: string = ENV.API_BASE_URL,
    timeout: number = ENV.API_TIMEOUT,
    retries: number = ENV.RETRY_ATTEMPTS
  ) {
    this.baseUrl = baseUrl;
    this.defaultTimeout = timeout;
    this.defaultRetries = retries;
  }

  /**
   * Realiza una petición HTTP con reintentos y timeout
   */
  private async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const {
      timeout = this.defaultTimeout,
      retries = this.defaultRetries,
      skipAuth = false,
      body,
      ...fetchOptions
    } = options;

    const url = `${this.baseUrl}${endpoint}`;
    
    // Headers por defecto
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(fetchOptions.headers as Record<string, string>),
    };

    // Token de autenticación
    if (!skipAuth) {
      const token = getAuthToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    // Intentos con reintentos
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt <= retries; attempt++) {
      const { controller, timeoutId } = createTimeoutController(timeout);

      try {
        devLog(`${fetchOptions.method || 'GET'} ${endpoint} (intento ${attempt + 1})`);

        const response = await fetch(url, {
          ...fetchOptions,
          headers,
          body: body ? JSON.stringify(body) : undefined,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        // Parsear respuesta
        let data: any;
        const contentType = response.headers.get('content-type');
        
        if (contentType?.includes('application/json')) {
          data = await response.json();
        } else {
          data = await response.text();
        }

        // Error HTTP
        if (!response.ok) {
          const errorMessage = data?.error || data?.message || `Error HTTP ${response.status}`;
          
          // No reintentar errores 4xx (excepto 408 timeout, 429 rate limit)
          if (response.status >= 400 && response.status < 500 && ![408, 429].includes(response.status)) {
            return {
              data: undefined,
              success: false,
              error: errorMessage,
              statusCode: response.status,
            };
          }
          
          throw new ApiError(errorMessage, response.status);
        }

        devLog(`✅ ${endpoint} completado`, { status: response.status });

        // Respuesta exitosa
        return {
          data: data?.data !== undefined ? data.data : data,
          total: data?.total,
          success: true,
          statusCode: response.status,
        };

      } catch (error: any) {
        clearTimeout(timeoutId);
        lastError = error;

        // Timeout (AbortError)
        if (error.name === 'AbortError') {
          devLog(`⏱️ Timeout en ${endpoint} (intento ${attempt + 1})`);
          lastError = new TimeoutError();
          continue;
        }

        // Error de red
        if (error instanceof TypeError && error.message.includes('fetch')) {
          devLog(`🔌 Error de red en ${endpoint} (intento ${attempt + 1})`);
          lastError = new NetworkError();
          continue;
        }

        // Error de API con status >= 500, reintentar
        if (error instanceof ApiError && error.statusCode >= 500) {
          devLog(`🔄 Error ${error.statusCode} en ${endpoint}, reintentando...`);
          continue;
        }

        // Otros errores, no reintentar
        break;
      }
    }

    // Todos los intentos fallaron
    const errorMessage = lastError?.message || 'Error desconocido';
    console.error(`[API] Error final en ${endpoint}:`, errorMessage);

    return {
      data: undefined,
      success: false,
      error: errorMessage,
      statusCode: lastError instanceof ApiError ? lastError.statusCode : 500,
    };
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, queryOptions?: QueryOptions): Promise<ApiResponse<T>> {
    const params = new URLSearchParams();

    if (queryOptions?.skip !== undefined) params.append('skip', String(queryOptions.skip));
    if (queryOptions?.take !== undefined) params.append('take', String(queryOptions.take));
    if (queryOptions?.orderBy) params.append('orderBy', JSON.stringify(queryOptions.orderBy));
    if (queryOptions?.where) params.append('where', JSON.stringify(queryOptions.where));

    const queryString = params.toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;

    return this.request<T>(url, { method: 'GET' });
  }

  /**
   * GET by ID
   */
  async getById<T>(endpoint: string, id: number | string): Promise<ApiResponse<T>> {
    return this.request<T>(`${endpoint}/${id}`, { method: 'GET' });
  }

  /**
   * POST request (crear)
   */
  async post<T>(endpoint: string, body: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'POST', body });
  }

  /**
   * PUT request (actualizar completo)
   */
  async put<T>(endpoint: string, id: number | string, body: any): Promise<ApiResponse<T>> {
    return this.request<T>(`${endpoint}/${id}`, { method: 'PUT', body });
  }

  /**
   * PATCH request (actualizar parcial)
   */
  async patch<T>(endpoint: string, id: number | string, body: any): Promise<ApiResponse<T>> {
    return this.request<T>(`${endpoint}/${id}`, { method: 'PATCH', body });
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string, id: number | string): Promise<ApiResponse<T>> {
    return this.request<T>(`${endpoint}/${id}`, { method: 'DELETE' });
  }

  /**
   * Bulk create
   */
  async bulkCreate<T>(endpoint: string, items: any[]): Promise<ApiResponse<T>> {
    return this.request<T>(`${endpoint}/bulk`, { method: 'POST', body: { items } });
  }

  /**
   * Count
   */
  async count(endpoint: string, where?: Record<string, any>): Promise<ApiResponse<{ count: number }>> {
    const params = new URLSearchParams();
    if (where) params.append('where', JSON.stringify(where));
    const queryString = params.toString();
    const url = queryString ? `${endpoint}/count?${queryString}` : `${endpoint}/count`;
    return this.request<{ count: number }>(url, { method: 'GET' });
  }

  /**
   * Health check del backend
   */
  async healthCheck(): Promise<boolean> {
    // Implementación robusta con AbortController (compatible más ampliamente que AbortSignal.timeout)
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    try {
      // En desarrollo, usar ruta relativa para pasar por el proxy de Vite
      const healthUrl = ENV.BACKEND_URL ? `${ENV.BACKEND_URL}/health` : '/health';

      const response = await fetch(healthUrl, {
        method: 'GET',
        signal: controller.signal,
        cache: 'no-store',
      });

      clearTimeout(timeout);
      return response.ok;
    } catch (error) {
      clearTimeout(timeout);
      // No generar ruido innecesario: en dev sólo trazas suaves
      if (ENV.IS_DEV) {
        console.debug('[HealthCheck] Backend no disponible:', (error as any)?.message || error);
      }
      return false;
    }
  }
}

// ============================================================================
// INSTANCIA SINGLETON
// ============================================================================

export const apiClient = new ApiClient();

// Export por defecto para compatibilidad
export default apiClient;
