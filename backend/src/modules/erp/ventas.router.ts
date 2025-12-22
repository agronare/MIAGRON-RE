import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import rateLimit from 'express-rate-limit';

const router = Router();
const prisma = new PrismaClient();

// ────────────────────────────────────────────────────────────────────────────
// RATE LIMITERS para endpoints públicos
// ────────────────────────────────────────────────────────────────────────────

const publicLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 20, // 20 requests por ventana por IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Demasiadas solicitudes. Intente más tarde.' },
});

const cfdiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 5, // Solo 5 solicitudes CFDI por hora por IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Límite de solicitudes de factura excedido.' },
});

// ────────────────────────────────────────────────────────────────────────────
// UTILIDADES
// ────────────────────────────────────────────────────────────────────────────

function isValidFolio(folio: string): boolean {
  return /^VENTA-\d+$/.test(folio);
}

// ────────────────────────────────────────────────────────────────────────────
// RUTAS INTERNAS (Para ERP - Protegidas)
// ────────────────────────────────────────────────────────────────────────────

// Crear venta
router.post('/', async (req: Request, res: Response) => {
  try {
    const { folio, clienteId, clienteNombre, clienteRfc, fecha, sucursal, subtotal, impuestos, descuentoTotal, total, metodoPago, referenciaPago, montoRecibido, cambioDevuelto, montoPagado, estatus, requiereFactura, regimenFiscal, usoCfdi, creadoPor, items } = req.body;

    // Validar datos requeridos
    if (!folio || !clienteNombre || !sucursal || subtotal === undefined || impuestos === undefined || total === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Faltan campos requeridos: folio, clienteNombre, sucursal, subtotal, impuestos, total'
      });
    }

    // Crear venta con items
    const venta = await prisma.venta.create({
      data: {
        folio,
        clienteId: clienteId || null,
        clienteNombre,
        clienteRfc: clienteRfc || null,
        fecha: fecha ? new Date(fecha) : new Date(),
        sucursal,
        subtotal,
        impuestos,
        descuentoTotal: descuentoTotal || 0,
        total,
        metodoPago,
        referenciaPago: referenciaPago || null,
        montoRecibido: montoRecibido || null,
        cambioDevuelto: cambioDevuelto || null,
        montoPagado: montoPagado || 0,
        estatus,
        requiereFactura: requiereFactura || false,
        regimenFiscal: regimenFiscal || null,
        usoCfdi: usoCfdi || null,
        creadoPor: creadoPor || null,
        items: {
          create: items?.map((item: any) => ({
            productoId: item.productoId || null,
            sku: item.sku,
            nombre: item.nombre,
            cantidad: item.cantidad,
            unidad: item.unidad || 'PZA',
            precioUnitario: item.precioUnitario,
            descuento: item.descuento || 0,
            subtotal: item.subtotal,
            impuestoMonto: item.impuestoMonto,
            total: item.total,
            claveProdServ: item.claveProdServ || null,
            claveUnidad: item.claveUnidad || null,
            objetoImpuesto: item.objetoImpuesto || null,
            tasaIva: item.tasaIva || null,
          })) || []
        }
      },
      include: {
        items: true,
        cliente: true
      }
    });

    res.json({
      success: true,
      data: venta
    });

  } catch (error: any) {
    console.error('Error al crear venta:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error al crear venta'
    });
  }
});

// Listar ventas con paginación y filtros
router.get('/', async (req: Request, res: Response) => {
  try {
    const { page = '1', limit = '20', folio, clienteId, estatus, fechaInicio, fechaFin } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Construir filtros
    const where: any = {};
    if (folio) where.folio = { contains: folio as string };
    if (clienteId) where.clienteId = parseInt(clienteId as string);
    if (estatus) where.estatus = estatus;
    if (fechaInicio || fechaFin) {
      where.fecha = {};
      if (fechaInicio) where.fecha.gte = new Date(fechaInicio as string);
      if (fechaFin) where.fecha.lte = new Date(fechaFin as string);
    }

    const [ventas, total] = await Promise.all([
      prisma.venta.findMany({
        where,
        skip,
        take: limitNum,
        include: {
          items: true,
          cliente: {
            select: {
              id: true,
              nombre: true,
              rfc: true,
              email: true
            }
          }
        },
        orderBy: { fecha: 'desc' }
      }),
      prisma.venta.count({ where })
    ]);

    res.json({
      success: true,
      data: ventas,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    });

  } catch (error: any) {
    console.error('Error al listar ventas:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error al listar ventas'
    });
  }
});

// Obtener venta por ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const venta = await prisma.venta.findUnique({
      where: { id: parseInt(id) },
      include: {
        items: true,
        cliente: true,
        solicitudesCfdi: true
      }
    });

    if (!venta) {
      return res.status(404).json({
        success: false,
        error: 'Venta no encontrada'
      });
    }

    res.json({
      success: true,
      data: venta
    });

  } catch (error: any) {
    console.error('Error al obtener venta:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error al obtener venta'
    });
  }
});

// Actualizar venta
router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // No permitir actualizar items directamente desde aquí
    delete updateData.items;
    delete updateData.cliente;
    delete updateData.solicitudesCfdi;

    const venta = await prisma.venta.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        items: true,
        cliente: true
      }
    });

    res.json({
      success: true,
      data: venta
    });

  } catch (error: any) {
    console.error('Error al actualizar venta:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error al actualizar venta'
    });
  }
});

// ────────────────────────────────────────────────────────────────────────────
// PROCESAR VENTA CON ACTUALIZACIÓN ATÓMICA DE INVENTARIO (FIFO)
// ────────────────────────────────────────────────────────────────────────────
router.post('/process-sale', async (req: Request, res: Response) => {
  try {
    const ventaData = req.body;

    // Validaciones previas
    if (!ventaData.items || ventaData.items.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'La venta debe contener al menos un producto'
      });
    }

    if (!ventaData.sucursal) {
      return res.status(400).json({
        success: false,
        error: 'Se requiere especificar la sucursal'
      });
    }

    // TRANSACCIÓN ATÓMICA: Todo o nada
    const result = await prisma.$transaction(async (tx) => {
      // 1. Crear la venta con sus items
      const venta = await tx.venta.create({
        data: {
          folio: ventaData.folio,
          clienteId: ventaData.clienteId || null,
          clienteNombre: ventaData.clienteNombre,
          clienteRfc: ventaData.clienteRfc || 'XAXX010101000',
          fecha: new Date(ventaData.fecha),
          sucursal: ventaData.sucursal,
          subtotal: ventaData.subtotal,
          impuestos: ventaData.impuestos,
          descuentoTotal: ventaData.descuentoTotal || 0,
          total: ventaData.total,
          metodoPago: ventaData.metodoPago,
          referenciaPago: ventaData.referenciaPago || null,
          montoRecibido: ventaData.montoRecibido || null,
          cambioDevuelto: ventaData.cambioDevuelto || null,
          montoPagado: ventaData.montoPagado || 0,
          estatus: ventaData.estatus,
          requiereFactura: ventaData.requiereFactura || false,
          regimenFiscal: ventaData.regimenFiscal || null,
          usoCfdi: ventaData.usoCfdi || null,
          creadoPor: ventaData.creadoPor || null,
          items: {
            create: ventaData.items.map((item: any) => ({
              productoId: item.productoId,
              sku: item.sku,
              nombre: item.nombre,
              cantidad: item.cantidad,
              unidad: item.unidad || 'PZA',
              precioUnitario: item.precioUnitario,
              descuento: item.descuento || 0,
              subtotal: item.subtotal,
              impuestoMonto: item.impuestoMonto,
              total: item.total,
              claveProdServ: item.claveProdServ || null,
              claveUnidad: item.claveUnidad || null,
              objetoImpuesto: item.objetoImpuesto || null,
              tasaIva: item.tasaIva || null,
            }))
          }
        },
        include: { items: true }
      });

      // 2. Obtener sucursal ID
      const sucursal = await tx.sucursal.findFirst({
        where: {
          OR: [
            { nombre: ventaData.sucursal },
            { codigoInterno: ventaData.sucursal }
          ]
        }
      });

      if (!sucursal) {
        throw new Error(`Sucursal no encontrada: ${ventaData.sucursal}`);
      }

      // 3. Por cada item de la venta, aplicar FIFO al inventario
      const inventarioActualizado = [];

      for (const item of ventaData.items) {
        // Usar cantidadBase si está disponible (para productos a granel)
        let cantidadPorDeducir = item.cantidadBase || item.cantidad;

        // Obtener lotes disponibles ordenados por FIFO (más antiguo primero)
        const lotes = await tx.inventario.findMany({
          where: {
            productoId: item.productoId,
            sucursalId: sucursal.id,
            cantidad: { gt: 0 }
          },
          orderBy: { fechaIngreso: 'asc' } // FIFO: primero entrado, primero salido
        });

        // Validar stock total disponible
        const stockTotal = lotes.reduce((sum, lote) => sum + lote.cantidad, 0);
        if (stockTotal < cantidadPorDeducir) {
          throw new Error(
            `Stock insuficiente para ${item.nombre}. ` +
            `Disponible: ${stockTotal}, Requerido: ${cantidadPorDeducir}`
          );
        }

        // Deducir cantidad usando FIFO
        for (const lote of lotes) {
          if (cantidadPorDeducir <= 0) break;

          const deduccion = Math.min(lote.cantidad, cantidadPorDeducir);
          const nuevaCantidad = lote.cantidad - deduccion;

          // Actualizar inventario
          const loteActualizado = await tx.inventario.update({
            where: { id: lote.id },
            data: {
              cantidad: nuevaCantidad,
              ultimaActualizacion: new Date()
            }
          });

          inventarioActualizado.push(loteActualizado);
          cantidadPorDeducir -= deduccion;

          // Registrar movimiento de inventario
          await tx.inventarioMovimiento.create({
            data: {
              productoId: item.productoId,
              sucursalId: sucursal.id,
              tipo: 'SALIDA',
              cantidad: Math.round(deduccion),
              costoUnit: lote.costoUnit,
              referencia: venta.folio,
              origenModulo: 'POS'
            }
          });
        }

        // Validación final: asegurar que se dedujo toda la cantidad
        if (cantidadPorDeducir > 0.001) { // Margen mínimo para decimales
          throw new Error(
            `Error en deducción FIFO para ${item.nombre}. ` +
            `Cantidad restante: ${cantidadPorDeducir}`
          );
        }
      }

      return { venta, inventarioActualizado };
    }, {
      timeout: 10000, // 10 segundos timeout
      isolationLevel: 'Serializable' // Máximo nivel de aislamiento para evitar race conditions
    });

    res.json({
      success: true,
      data: result
    });

  } catch (error: any) {
    console.error('Error al procesar venta:', error);

    // Clasificar errores para respuesta adecuada
    const isStockError = error.message?.includes('Stock insuficiente');
    const statusCode = isStockError ? 409 : 500; // 409 Conflict para problemas de stock

    res.status(statusCode).json({
      success: false,
      error: error.message || 'Error al procesar venta',
      type: isStockError ? 'STOCK_INSUFICIENTE' : 'ERROR_SERVIDOR'
    });
  }
});

// ────────────────────────────────────────────────────────────────────────────
// RUTAS PÚBLICAS (Para portal de facturación)
// ────────────────────────────────────────────────────────────────────────────

// Buscar ticket por folio
router.get('/public/ticket/:folio', publicLimiter, async (req: Request, res: Response) => {
  try {
    const { folio } = req.params;

    // Validar formato de folio
    if (!isValidFolio(folio)) {
      return res.status(400).json({
        success: false,
        error: 'Formato de ticket inválido. Use: VENTA-1234'
      });
    }

    const venta = await prisma.venta.findUnique({
      where: { folio },
      select: {
        id: true,
        folio: true,
        clienteNombre: true,
        clienteRfc: true,
        fecha: true,
        sucursal: true,
        subtotal: true,
        impuestos: true,
        descuentoTotal: true,
        total: true,
        metodoPago: true,
        estatus: true,
        requiereFactura: true,
        cfdiEstatus: true,
        cfdiUuid: true,
        cfdiTimbradoAt: true,
        items: {
          select: {
            sku: true,
            nombre: true,
            cantidad: true,
            unidad: true,
            precioUnitario: true,
            descuento: true,
            subtotal: true,
            impuestoMonto: true,
            total: true
          }
        }
      }
    });

    if (!venta) {
      return res.status(404).json({
        success: false,
        error: 'Ticket no encontrado. Verifique el número.'
      });
    }

    // Ocultar parcialmente datos sensibles para seguridad
    const ventaPublica = {
      ...venta,
      clienteNombre: venta.clienteNombre.length > 10
        ? `${venta.clienteNombre.substring(0, 7)}***`
        : venta.clienteNombre,
      clienteRfc: venta.clienteRfc
        ? `${venta.clienteRfc.substring(0, 3)}******${venta.clienteRfc.substring(venta.clienteRfc.length - 3)}`
        : null
    };

    res.json({
      success: true,
      data: ventaPublica
    });

  } catch (error: any) {
    console.error('Error al buscar ticket:', error);
    res.status(500).json({
      success: false,
      error: 'Error al buscar ticket'
    });
  }
});

// Descargar PDF del ticket
router.get('/public/ticket/:folio/pdf', publicLimiter, async (req: Request, res: Response) => {
  try {
    const { folio } = req.params;

    if (!isValidFolio(folio)) {
      return res.status(400).json({
        success: false,
        error: 'Formato de ticket inválido'
      });
    }

    const venta = await prisma.venta.findUnique({
      where: { folio },
      select: {
        ticketPdfBase64: true,
        folio: true
      }
    });

    if (!venta || !venta.ticketPdfBase64) {
      return res.status(404).json({
        success: false,
        error: 'PDF no disponible para este ticket'
      });
    }

    // Convertir base64 a buffer
    const base64Data = venta.ticketPdfBase64.replace(/^data:application\/pdf;base64,/, '');
    const pdfBuffer = Buffer.from(base64Data, 'base64');

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="Ticket_${folio}.pdf"`);
    res.send(pdfBuffer);

  } catch (error: any) {
    console.error('Error al descargar PDF:', error);
    res.status(500).json({
      success: false,
      error: 'Error al descargar PDF'
    });
  }
});

// Solicitar CFDI timbrado
router.post('/public/cfdi/request', cfdiLimiter, async (req: Request, res: Response) => {
  try {
    const { folio, clienteEmail, clienteTelefono, notaCliente } = req.body;

    if (!folio || !clienteEmail) {
      return res.status(400).json({
        success: false,
        error: 'Se requiere folio y email del cliente'
      });
    }

    if (!isValidFolio(folio)) {
      return res.status(400).json({
        success: false,
        error: 'Formato de ticket inválido'
      });
    }

    // Buscar venta
    const venta = await prisma.venta.findUnique({
      where: { folio }
    });

    if (!venta) {
      return res.status(404).json({
        success: false,
        error: 'Ticket no encontrado'
      });
    }

    // Verificar si ya tiene CFDI timbrado
    if (venta.cfdiEstatus === 'timbrado') {
      return res.status(400).json({
        success: false,
        error: 'Este ticket ya tiene CFDI timbrado'
      });
    }

    // Crear solicitud de CFDI
    const solicitud = await prisma.solicitudCfdi.create({
      data: {
        ventaId: venta.id,
        clienteEmail,
        clienteTelefono: clienteTelefono || null,
        notaCliente: notaCliente || null,
        estatusSolicitud: 'pendiente'
      }
    });

    // Actualizar estatus de la venta
    await prisma.venta.update({
      where: { id: venta.id },
      data: { cfdiEstatus: 'solicitado' }
    });

    res.json({
      success: true,
      data: {
        message: 'Solicitud de CFDI recibida. Se le notificará por email cuando esté listo.',
        solicitudId: solicitud.id,
        estimadoTiempo: '24-48 horas'
      }
    });

  } catch (error: any) {
    console.error('Error al solicitar CFDI:', error);
    res.status(500).json({
      success: false,
      error: 'Error al procesar solicitud de CFDI'
    });
  }
});

// Consultar estado del CFDI
router.get('/public/cfdi/status/:folio', publicLimiter, async (req: Request, res: Response) => {
  try {
    const { folio } = req.params;

    if (!isValidFolio(folio)) {
      return res.status(400).json({
        success: false,
        error: 'Formato de ticket inválido'
      });
    }

    const venta = await prisma.venta.findUnique({
      where: { folio },
      select: {
        cfdiEstatus: true,
        cfdiUuid: true,
        cfdiTimbradoAt: true,
        cfdiErrorMsg: true,
        solicitudesCfdi: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: {
            estatusSolicitud: true,
            createdAt: true
          }
        }
      }
    });

    if (!venta) {
      return res.status(404).json({
        success: false,
        error: 'Ticket no encontrado'
      });
    }

    res.json({
      success: true,
      data: {
        cfdiEstatus: venta.cfdiEstatus,
        cfdiUuid: venta.cfdiUuid,
        cfdiTimbradoAt: venta.cfdiTimbradoAt,
        cfdiErrorMsg: venta.cfdiErrorMsg,
        ultimaSolicitud: venta.solicitudesCfdi[0] || null
      }
    });

  } catch (error: any) {
    console.error('Error al consultar estado CFDI:', error);
    res.status(500).json({
      success: false,
      error: 'Error al consultar estado'
    });
  }
});

// Descargar CFDI PDF
router.get('/public/cfdi/download/:folio/pdf', publicLimiter, async (req: Request, res: Response) => {
  try {
    const { folio } = req.params;

    if (!isValidFolio(folio)) {
      return res.status(400).json({
        success: false,
        error: 'Formato de ticket inválido'
      });
    }

    const venta = await prisma.venta.findUnique({
      where: { folio },
      select: {
        cfdiEstatus: true,
        cfdiPdfPath: true
      }
    });

    if (!venta) {
      return res.status(404).json({
        success: false,
        error: 'Ticket no encontrado'
      });
    }

    if (venta.cfdiEstatus !== 'timbrado' || !venta.cfdiPdfPath) {
      return res.status(404).json({
        success: false,
        error: 'CFDI no disponible aún. Consulte el estado.'
      });
    }

    // TODO: Implementar descarga de archivo desde filesystem
    res.status(501).json({
      success: false,
      error: 'Descarga de CFDI PDF en desarrollo'
    });

  } catch (error: any) {
    console.error('Error al descargar CFDI PDF:', error);
    res.status(500).json({
      success: false,
      error: 'Error al descargar CFDI PDF'
    });
  }
});

// Descargar CFDI XML
router.get('/public/cfdi/download/:folio/xml', publicLimiter, async (req: Request, res: Response) => {
  try {
    const { folio } = req.params;

    if (!isValidFolio(folio)) {
      return res.status(400).json({
        success: false,
        error: 'Formato de ticket inválido'
      });
    }

    const venta = await prisma.venta.findUnique({
      where: { folio },
      select: {
        cfdiEstatus: true,
        cfdiXmlPath: true
      }
    });

    if (!venta) {
      return res.status(404).json({
        success: false,
        error: 'Ticket no encontrado'
      });
    }

    if (venta.cfdiEstatus !== 'timbrado' || !venta.cfdiXmlPath) {
      return res.status(404).json({
        success: false,
        error: 'CFDI no disponible aún. Consulte el estado.'
      });
    }

    // TODO: Implementar descarga de archivo desde filesystem
    res.status(501).json({
      success: false,
      error: 'Descarga de CFDI XML en desarrollo'
    });

  } catch (error: any) {
    console.error('Error al descargar CFDI XML:', error);
    res.status(500).json({
      success: false,
      error: 'Error al descargar CFDI XML'
    });
  }
});

export default router;
