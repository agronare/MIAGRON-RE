import type { Product } from '../types';
import api from './api';

export interface ProductDB {
  id: number;
  sku?: string | null;
  codigo: string;
  nombre: string;
  precio: number;
  stock: number;
  costo?: number | null;
  descripcion?: string | null;
  categoria?: string | null;
  fabricante?: string | null;
  minStock?: number | null;
  ingredienteActivo?: string | null;
  porcentajeIA?: number | null;
  iva?: number | null;
  ieps?: number | null;
  objetoImpuesto?: string | null;
  claveProdServ?: string | null;
  claveUnidad?: string | null;
  retencionIva?: boolean | null;
  retencionIsr?: boolean | null;
  imageKey?: string | null;
  isBulk?: boolean;
  unidadVenta?: string | null;
  unidadBase?: string | null;
  factorConversion?: number | null;
  fichaTecnicaUrl?: string | null;
  guiaAplicacionUrl?: string | null;
}

export function mapProductToFrontend(p: ProductDB): Product {
  return {
    id: String(p.id),
    sku: p.sku || '',
    name: p.nombre,
    price: p.precio,
    description: p.descripcion || undefined,
    category: p.categoria || undefined,
    manufacturer: p.fabricante || undefined,
    cost: p.costo ?? 0,
    stock: p.stock,
    minStock: (p.minStock ?? 0) as number,
    activeIngredient: p.ingredienteActivo || undefined,
    imageKey: p.imageKey || undefined,
    techSheetUrl: p.fichaTecnicaUrl || undefined,
    applicationGuideUrl: p.guiaAplicacionUrl || undefined,
    ivaRate: (p.iva ?? null) as any,
    iepsRate: (p.ieps ?? null) as any,
    taxObject: p.objetoImpuesto || undefined,
    satKey: p.claveProdServ || undefined,
    satUnitKey: p.claveUnidad || undefined,
    retentionIva: !!p.retencionIva,
    retentionIsr: !!p.retencionIsr,
    isBulk: !!p.isBulk,
    bulkConfig: {
      baseUnit: p.unidadBase || 'KG',
      salesUnit: p.unidadVenta || 'PZA',
      conversionFactor: (p.factorConversion ?? 1) as number,
      tolerancePercent: 0,
      allowVariableWeight: false,
    },
  };
}

export async function fetchProducts(baseUrl?: string): Promise<Product[]> {
  // Usar cliente central para reintentos/timeout si no se pasa baseUrl
  if (!baseUrl) {
    const resp = await api.get<ProductDB[]>('/products');
    if (!resp.success || !resp.data) throw new Error(resp.error || 'Failed to fetch products');
    return resp.data.map(mapProductToFrontend);
  }
  const url = `${baseUrl}/api/products`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Error ${res.status} al obtener productos`);
  const data: ProductDB[] = await res.json();
  return data.map(mapProductToFrontend);
}

export async function pushProducts(products: Product[]): Promise<{ inserted: number }> {
  const items = products.map(p => ({
    sku: p.sku || null,
    codigo: p.id || p.sku || p.name, // provide stable code; backend ensures uniqueness
    nombre: p.name,
    precio: p.price ?? 0,
    stock: p.stock ?? 0,
    costo: p.cost ?? 0,
    descripcion: p.description ?? null,
    categoria: p.category ?? null,
    fabricante: p.manufacturer ?? null,
    minStock: p.minStock ?? null,
    ingredienteActivo: p.activeIngredient ?? null,
    iva: typeof p.ivaRate === 'number' ? (p.ivaRate >= 0 ? p.ivaRate : null) : null,
    ieps: typeof p.iepsRate === 'number' ? p.iepsRate : null,
    objetoImpuesto: p.taxObject ?? null,
    claveProdServ: p.satKey ?? null,
    claveUnidad: p.satUnitKey ?? null,
    retencionIva: !!p.retentionIva,
    retencionIsr: !!p.retentionIsr,
    isBulk: !!p.isBulk,
    unidadBase: p.bulkConfig?.baseUnit ?? null,
    unidadVenta: p.bulkConfig?.salesUnit ?? null,
    factorConversion: p.bulkConfig?.conversionFactor ?? null,
    fichaTecnicaUrl: p.techSheetUrl ?? null,
    guiaAplicacionUrl: p.applicationGuideUrl ?? null,
  }));
  const resp = await api.bulkCreate<{ inserted: number }>('/products', items);
  if (!resp.success || !resp.data) throw new Error(resp.error || 'Failed to bulk import products');
  return resp.data;
}
