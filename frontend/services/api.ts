// ============================================================================
// 🌾 AGRONARE — API Service (Cliente HTTP centralizado)
// ============================================================================

import { ENV } from '@/config/env';

// Base URL centralizada: en dev será "/api" (proxy Vite); en prod usa BACKEND_URL
const API_BASE_URL = ENV.API_BASE_URL;

export interface ApiResponse<T> {
  data?: T;
  total?: number;
  success: boolean;
  error?: string;
}

interface QueryOptions {
  skip?: number;
  take?: number;
  orderBy?: Record<string, 'asc' | 'desc'>;
  where?: Record<string, any>;
}

// Helper: timeout + retries
async function fetchWithRetry(url: string, options: RequestInit & { timeoutMs?: number }, retries = 2): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs ?? 8000);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(timeout);
    if (!res.ok && retries > 0) {
      return fetchWithRetry(url, options, retries - 1);
    }
    return res;
  } catch (e) {
    clearTimeout(timeout);
    if (retries > 0) return fetchWithRetry(url, options, retries - 1);
    throw e;
  }
}

class ApiService {
  // Exponer baseURL para descargas directas usadas en algunos servicios
  public readonly baseURL: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseURL = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    const defaultHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Add auth token if exists
    const token = localStorage.getItem('auth_token');
    if (token) {
      defaultHeaders['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetchWithRetry(url, {
        ...options,
        headers: {
          ...defaultHeaders,
          ...options.headers,
        },
        timeoutMs: 8000,
      }, 2);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error: any) {
      console.error(`API Error [${endpoint}]:`, error);
      return { data: null as T, success: false, error: error.message };
    }
  }

  // GET with query params
  async get<T>(endpoint: string, options?: QueryOptions): Promise<ApiResponse<T>> {
    const params = new URLSearchParams();
    
    if (options?.skip !== undefined) params.append('skip', String(options.skip));
    if (options?.take !== undefined) params.append('take', String(options.take));
    if (options?.orderBy) params.append('orderBy', JSON.stringify(options.orderBy));
    if (options?.where) params.append('where', JSON.stringify(options.where));

    const queryString = params.toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;

    return this.request<T>(url, { method: 'GET' });
  }

  // GET by ID
  async getById<T>(endpoint: string, id: number | string): Promise<ApiResponse<T>> {
    return this.request<T>(`${endpoint}/${id}`, { method: 'GET' });
  }

  // POST (create)
  async post<T>(endpoint: string, body: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  // PUT (update)
  async put<T>(endpoint: string, id: number | string, body: any): Promise<ApiResponse<T>> {
    return this.request<T>(`${endpoint}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  // PATCH (partial update)
  async patch<T>(endpoint: string, id: number | string, body: any): Promise<ApiResponse<T>> {
    return this.request<T>(`${endpoint}/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  }

  // DELETE
  async delete<T>(endpoint: string, id: number | string): Promise<ApiResponse<T>> {
    return this.request<T>(`${endpoint}/${id}`, { method: 'DELETE' });
  }

  // BULK CREATE
  async bulkCreate<T>(endpoint: string, items: any[]): Promise<ApiResponse<T>> {
    return this.request<T>(`${endpoint}/bulk`, {
      method: 'POST',
      body: JSON.stringify({ items }),
    });
  }

  // COUNT
  async count(endpoint: string, where?: Record<string, any>): Promise<ApiResponse<{ count: number }>> {
    const params = new URLSearchParams();
    if (where) params.append('where', JSON.stringify(where));
    const queryString = params.toString();
    const url = queryString ? `${endpoint}/count?${queryString}` : `${endpoint}/count`;
    return this.request<{ count: number }>(url, { method: 'GET' });
  }
}

export const api = new ApiService();
export default api;
