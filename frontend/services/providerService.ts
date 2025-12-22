// Simple service to fetch providers from backend and map to frontend Supplier
import type { Supplier } from '../types';
import api from './api';

export interface ProviderDB {
  id: number;
  nombreEmpresa: string;
  nombreContacto: string;
  email: string;
  telefono?: string;
  rfc?: string;
  habilitarCredito: boolean;
  credito?: number;
}

export function mapProviderToSupplier(p: ProviderDB): Supplier {
  return {
    id: String(p.id),
    companyName: p.nombreEmpresa,
    contactName: p.nombreContacto,
    phone: p.telefono || '',
    email: p.email,
    rfc: p.rfc,
    hasCredit: !!p.habilitarCredito,
    creditLimit: p.credito ?? 0,
  };
}

export async function fetchProviders(baseUrl?: string): Promise<Supplier[]> {
  // Preferir cliente centralizado con reintentos/timeout
  if (!baseUrl) {
    const resp = await api.get<ProviderDB[]>('/providers');
    if (!resp.success || !resp.data) throw new Error(resp.error || 'Failed to fetch providers');
    return resp.data.map(mapProviderToSupplier);
  }
  // Fallback explícito a URL base si se pasa manualmente
  const url = `${baseUrl}/api/providers`;
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`Error ${resp.status} al obtener proveedores`);
  const data: ProviderDB[] = await resp.json();
  return data.map(mapProviderToSupplier);
}
