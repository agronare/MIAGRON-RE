import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';

const prisma = new PrismaClient();

// ────────────────────────────────────────────────────────────────────────────
// CONFIGURACIÓN
// ────────────────────────────────────────────────────────────────────────────

const FACTURAPI_URL = 'https://www.facturapi.io/v2';
const FACTURAPI_KEY = process.env.CFDI_PAC_API_KEY || '';
const INVOICE_STORAGE_PATH = process.env.INVOICE_STORAGE_PATH || './uploads/invoices';

// Datos de la empresa emisora (desde .env)
const COMPANY_DATA = {
  rfc: process.env.COMPANY_RFC || 'AGR010101ABC',
  razonSocial: process.env.COMPANY_RAZON_SOCIAL || 'AGRONARE S.A. DE C.V.',
  regimenFiscal: process.env.COMPANY_REGIMEN_FISCAL || '601',
  codigoPostal: process.env.COMPANY_CP || '58880'
};

// ────────────────────────────────────────────────────────────────────────────
// INTERFACES
// ────────────────────────────────────────────────────────────────────────────

interface CFDIResult {
  success: boolean;
  uuid?: string;
  pdfUrl?: string;
  xmlUrl?: string;
  error?: string;
}

interface FacturapiInvoiceData {
  customer: {
    legal_name: string;
    tax_id: string;
    tax_system?: string;
    email?: string;
    address?: {
      zip: string;
    };
  };
  items: Array<{
    product: {
      description: string;
      product_key: string;
      sku?: string;
    };
    quantity: number;
    price: number;
    discount?: number;
  }>;
  payment_form: string;
  use: string;
  folio_number?: number;
  series?: string;
}

// ────────────────────────────────────────────────────────────────────────────
// FUNCIONES PRINCIPALES
// ────────────────────────────────────────────────────────────────────────────

/**
 * Timbrar factura CFDI para una venta usando FacturAPI
 */
export async function timbrarVenta(ventaId: number): Promise<CFDIResult> {
  try {
    // 1. Obtener venta con items y cliente
    const venta = await prisma.venta.findUnique({
      where: { id: ventaId },
      include: {
        items: true,
        cliente: true
      }
    });

    if (!venta) {
      return {
        success: false,
        error: 'Venta no encontrada'
      };
    }

    // 2. Validar que la venta requiera factura
    if (!venta.requiereFactura) {
      return {
        success: false,
        error: 'Esta venta no requiere factura'
      };
    }

    // 3. Validar que no esté ya timbrada
    if (venta.cfdiEstatus === 'timbrado') {
      return {
        success: false,
        error: 'Esta venta ya tiene CFDI timbrado'
      };
    }

    // 4. Validar datos fiscales del cliente
    if (!venta.clienteRfc || venta.clienteRfc === 'XAXX010101000') {
      return {
        success: false,
        error: 'Se requiere RFC válido del cliente para timbrar CFDI'
      };
    }

    // 5. Construir payload para FacturAPI
    const invoiceData: FacturapiInvoiceData = {
      customer: {
        legal_name: venta.clienteNombre,
        tax_id: venta.clienteRfc,
        tax_system: venta.regimenFiscal || '612', // 612 = Personas Físicas con Actividades Empresariales
        email: venta.cliente?.email || undefined,
        address: {
          zip: '00000' // TODO: Obtener del cliente si está disponible
        }
      },
      items: venta.items.map(item => ({
        product: {
          description: item.nombre,
          product_key: item.claveProdServ || '01010101', // Clave genérica SAT
          sku: item.sku
        },
        quantity: item.cantidad,
        price: item.precioUnitario,
        discount: item.descuento > 0 ? (item.precioUnitario * item.cantidad * item.descuento / 100) : undefined
      })),
      payment_form: mapMetodoPagoToSAT(venta.metodoPago),
      use: venta.usoCfdi || 'G03', // G03 = Gastos en general
      series: 'AGRO',
      folio_number: parseInt(venta.folio.replace('VENTA-', ''))
    };

    // 6. Llamar a FacturAPI para timbrar
    console.log('Timbrando factura con FacturAPI...');
    const response = await axios.post(
      `${FACTURAPI_URL}/invoices`,
      invoiceData,
      {
        headers: {
          'Authorization': `Bearer ${FACTURAPI_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const facturApiData = response.data;

    // 7. Descargar PDF y XML
    const pdfPath = await downloadAndSaveFile(
      facturApiData.pdf_url,
      venta.folio,
      'cfdi.pdf'
    );

    const xmlPath = await downloadAndSaveFile(
      facturApiData.xml_url,
      venta.folio,
      'cfdi.xml'
    );

    // 8. Actualizar venta en base de datos
    await prisma.venta.update({
      where: { id: ventaId },
      data: {
        cfdiUuid: facturApiData.uuid,
        cfdiEstatus: 'timbrado',
        cfdiPdfPath: pdfPath,
        cfdiXmlPath: xmlPath,
        cfdiTimbradoAt: new Date(),
        cfdiPacProvider: 'facturapi'
      }
    });

    // 9. Actualizar solicitudes de CFDI a completado
    await prisma.solicitudCfdi.updateMany({
      where: {
        ventaId: ventaId,
        estatusSolicitud: 'pendiente'
      },
      data: {
        estatusSolicitud: 'completado',
        procesadoAt: new Date()
      }
    });

    console.log(`CFDI timbrado exitosamente. UUID: ${facturApiData.uuid}`);

    return {
      success: true,
      uuid: facturApiData.uuid,
      pdfUrl: pdfPath,
      xmlUrl: xmlPath
    };

  } catch (error: any) {
    console.error('Error al timbrar CFDI:', error);

    // Guardar error en la base de datos
    try {
      await prisma.venta.update({
        where: { id: ventaId },
        data: {
          cfdiEstatus: 'error',
          cfdiErrorMsg: error.response?.data?.message || error.message
        }
      });

      await prisma.solicitudCfdi.updateMany({
        where: {
          ventaId: ventaId,
          estatusSolicitud: 'pendiente'
        },
        data: {
          estatusSolicitud: 'error'
        }
      });
    } catch (dbError) {
      console.error('Error al guardar error en BD:', dbError);
    }

    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Error al timbrar CFDI'
    };
  }
}

/**
 * Cancelar CFDI timbrado
 */
export async function cancelarCFDI(uuid: string, motivo: string = '01'): Promise<CFDIResult> {
  try {
    // 1. Buscar venta por UUID
    const venta = await prisma.venta.findUnique({
      where: { cfdiUuid: uuid }
    });

    if (!venta) {
      return {
        success: false,
        error: 'CFDI no encontrado'
      };
    }

    if (venta.cfdiEstatus !== 'timbrado') {
      return {
        success: false,
        error: 'Solo se pueden cancelar CFDI timbrados'
      };
    }

    // 2. Llamar a FacturAPI para cancelar
    await axios.delete(
      `${FACTURAPI_URL}/invoices/${uuid}`,
      {
        headers: {
          'Authorization': `Bearer ${FACTURAPI_KEY}`
        },
        data: {
          motive: motivo // 01 = Comprobante emitido con errores con relación
        }
      }
    );

    // 3. Actualizar estado en BD
    await prisma.venta.update({
      where: { id: venta.id },
      data: {
        cfdiEstatus: 'cancelado'
      }
    });

    console.log(`CFDI cancelado exitosamente. UUID: ${uuid}`);

    return {
      success: true,
      uuid
    };

  } catch (error: any) {
    console.error('Error al cancelar CFDI:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Error al cancelar CFDI'
    };
  }
}

/**
 * Procesar solicitudes de CFDI pendientes (para uso en worker/cron)
 */
export async function procesarSolicitudesPendientes(): Promise<void> {
  try {
    // Obtener solicitudes pendientes
    const solicitudesPendientes = await prisma.solicitudCfdi.findMany({
      where: {
        estatusSolicitud: 'pendiente',
        venta: {
          cfdiEstatus: 'solicitado'
        }
      },
      include: {
        venta: true
      },
      take: 10 // Procesar máximo 10 a la vez
    });

    console.log(`Procesando ${solicitudesPendientes.length} solicitudes de CFDI...`);

    for (const solicitud of solicitudesPendientes) {
      // Marcar como procesando
      await prisma.solicitudCfdi.update({
        where: { id: solicitud.id },
        data: { estatusSolicitud: 'procesando' }
      });

      // Timbrar
      const result = await timbrarVenta(solicitud.ventaId);

      if (result.success) {
        console.log(`✓ Solicitud ${solicitud.id} procesada exitosamente`);
        // TODO: Enviar email de notificación al cliente
      } else {
        console.error(`✗ Error en solicitud ${solicitud.id}:`, result.error);
      }

      // Pequeña pausa entre timbrados
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

  } catch (error) {
    console.error('Error al procesar solicitudes pendientes:', error);
  }
}

// ────────────────────────────────────────────────────────────────────────────
// FUNCIONES AUXILIARES
// ────────────────────────────────────────────────────────────────────────────

/**
 * Mapear método de pago de sistema interno a clave SAT
 */
function mapMetodoPagoToSAT(metodoPago: string): string {
  const map: Record<string, string> = {
    'Efectivo': '01',
    'Tarjeta': '04',
    'Transferencia': '03',
    'Crédito': '99' // Por definir
  };

  return map[metodoPago] || '99';
}

/**
 * Descargar archivo desde URL y guardarlo en filesystem
 */
async function downloadAndSaveFile(
  url: string,
  folio: string,
  filename: string
): Promise<string> {
  try {
    // Crear estructura de carpetas por fecha: YYYY/MM
    const now = new Date();
    const year = now.getFullYear().toString();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');

    const dirPath = path.join(INVOICE_STORAGE_PATH, year, month);

    // Crear directorio si no existe
    await fs.mkdir(dirPath, { recursive: true });

    // Descargar archivo
    const response = await axios.get(url, {
      responseType: 'arraybuffer',
      headers: {
        'Authorization': `Bearer ${FACTURAPI_KEY}`
      }
    });

    // Guardar archivo
    const filePath = path.join(dirPath, `${folio}_${filename}`);
    await fs.writeFile(filePath, response.data);

    console.log(`Archivo guardado: ${filePath}`);

    return filePath;

  } catch (error) {
    console.error('Error al descargar archivo:', error);
    throw error;
  }
}

/**
 * Leer archivo desde filesystem
 */
export async function readInvoiceFile(filePath: string): Promise<Buffer> {
  try {
    return await fs.readFile(filePath);
  } catch (error) {
    console.error('Error al leer archivo:', error);
    throw new Error('Archivo no encontrado');
  }
}

// ────────────────────────────────────────────────────────────────────────────
// EXPORTACIONES
// ────────────────────────────────────────────────────────────────────────────

export default {
  timbrarVenta,
  cancelarCFDI,
  procesarSolicitudesPendientes,
  readInvoiceFile
};
