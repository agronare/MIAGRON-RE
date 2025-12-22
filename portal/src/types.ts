export interface VentaItem {
  sku: string;
  nombre: string;
  cantidad: number;
  unidad: string;
  precioUnitario: number;
  descuento?: number;
  subtotal: number;
  impuestoMonto: number;
  total: number;
}

export interface Venta {
  id?: number;
  folio: string;
  clienteNombre: string;
  clienteRfc?: string;
  fecha: string;
  sucursal: string;
  subtotal: number;
  impuestos: number;
  descuentoTotal: number;
  total: number;
  metodoPago: string;
  estatus: string;
  requiereFactura: boolean;
  cfdiEstatus: string;
  cfdiUuid?: string;
  cfdiTimbradoAt?: string;
  items: VentaItem[];
}

export interface CFDIStatus {
  cfdiEstatus: string;
  cfdiUuid?: string;
  cfdiTimbradoAt?: string;
  cfdiErrorMsg?: string;
  ultimaSolicitud?: {
    estatusSolicitud: string;
    createdAt: string;
  };
}
