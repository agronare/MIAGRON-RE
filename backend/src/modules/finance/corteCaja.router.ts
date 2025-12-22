import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Umbral de diferencia para requerir aprobación (en pesos)
const UMBRAL_DIFERENCIA = 100; // $100 MXN

// ────────────────────────────────────────────────────────────────────────────
// CREAR CORTE DE CAJA
// ────────────────────────────────────────────────────────────────────────────
router.post('/', async (req: Request, res: Response) => {
  try {
    const {
      sucursal,
      realizadoPor,
      fondoInicial,
      ventasEfectivo,
      salidasEfectivo,
      totalContado,
      desgloseDenominaciones,
      ventasFolios,
      observaciones,
      ipAddress,
    } = req.body;

    // Validaciones
    if (!sucursal || !realizadoPor) {
      return res.status(400).json({
        success: false,
        error: 'Sucursal y usuario responsable son requeridos'
      });
    }

    if (totalContado < 0 || fondoInicial < 0 || ventasEfectivo < 0 || salidasEfectivo < 0) {
      return res.status(400).json({
        success: false,
        error: 'Los montos no pueden ser negativos'
      });
    }

    // Calcular totales
    const totalEsperado = fondoInicial + ventasEfectivo - salidasEfectivo;
    const diferencia = totalContado - totalEsperado;
    const diferenciaAbs = Math.abs(diferencia);

    // Determinar tipo de diferencia
    let tipoDiferencia = 'CUADRE_PERFECTO';
    if (diferenciaAbs > 0.01) { // Margen de centavos
      tipoDiferencia = diferencia > 0 ? 'SOBRANTE' : 'FALTANTE';
    }

    // Verificar si requiere aprobación
    const requiereAprobacion = diferenciaAbs >= UMBRAL_DIFERENCIA;
    const estatusAprobacion = requiereAprobacion ? 'PENDIENTE' : null;

    // Generar folio único
    const fechaStr = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const conteoHoy = await prisma.corteCaja.count({
      where: {
        sucursal,
        fecha: {
          gte: new Date(new Date().setHours(0, 0, 0, 0))
        }
      }
    });
    const folio = `CORTE-${sucursal}-${fechaStr}-${String(conteoHoy + 1).padStart(3, '0')}`;

    // Crear corte de caja
    const corteCaja = await prisma.corteCaja.create({
      data: {
        folio,
        sucursal,
        realizadoPor,
        fondoInicial,
        ventasEfectivo,
        salidasEfectivo,
        totalEsperado,
        totalContado,
        desgloseDenominaciones,
        diferencia,
        tipoDiferencia,
        requiereAprobacion,
        estatusAprobacion,
        ventasFolios,
        observaciones: observaciones || null,
        ipAddress: ipAddress || null,
        bloqueado: false,
      }
    });

    res.status(201).json({
      success: true,
      data: corteCaja,
      warnings: requiereAprobacion ? [
        `Diferencia de ${diferencia >= 0 ? '+' : ''}${diferencia.toFixed(2)} MXN requiere aprobación de supervisor`
      ] : []
    });

  } catch (error: any) {
    console.error('Error al crear corte de caja:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error al crear corte de caja'
    });
  }
});

// ────────────────────────────────────────────────────────────────────────────
// LISTAR CORTES DE CAJA
// ────────────────────────────────────────────────────────────────────────────
router.get('/', async (req: Request, res: Response) => {
  try {
    const {
      sucursal,
      fechaInicio,
      fechaFin,
      realizadoPor,
      estatusAprobacion,
      skip = '0',
      take = '50'
    } = req.query;

    const where: any = {};

    if (sucursal) where.sucursal = sucursal;
    if (realizadoPor) where.realizadoPor = realizadoPor;
    if (estatusAprobacion) where.estatusAprobacion = estatusAprobacion;

    if (fechaInicio || fechaFin) {
      where.fecha = {};
      if (fechaInicio) where.fecha.gte = new Date(fechaInicio as string);
      if (fechaFin) where.fecha.lte = new Date(fechaFin as string);
    }

    const [cortes, total] = await Promise.all([
      prisma.corteCaja.findMany({
        where,
        skip: parseInt(skip as string),
        take: parseInt(take as string),
        orderBy: { fecha: 'desc' }
      }),
      prisma.corteCaja.count({ where })
    ]);

    res.json({
      success: true,
      data: cortes,
      pagination: {
        total,
        skip: parseInt(skip as string),
        take: parseInt(take as string)
      }
    });

  } catch (error: any) {
    console.error('Error al listar cortes:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ────────────────────────────────────────────────────────────────────────────
// OBTENER CORTE POR ID
// ────────────────────────────────────────────────────────────────────────────
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const corte = await prisma.corteCaja.findUnique({
      where: { id: parseInt(id) }
    });

    if (!corte) {
      return res.status(404).json({
        success: false,
        error: 'Corte de caja no encontrado'
      });
    }

    res.json({
      success: true,
      data: corte
    });

  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ────────────────────────────────────────────────────────────────────────────
// APROBAR/RECHAZAR CORTE (Solo para diferencias que requieren aprobación)
// ────────────────────────────────────────────────────────────────────────────
router.patch('/:id/aprobar', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { aprobadoPor, accion, justificacion } = req.body;

    if (!aprobadoPor || !accion) {
      return res.status(400).json({
        success: false,
        error: 'Se requiere usuario aprobador y acción (APROBAR o RECHAZAR)'
      });
    }

    if (!['APROBAR', 'RECHAZAR'].includes(accion)) {
      return res.status(400).json({
        success: false,
        error: 'Acción debe ser APROBAR o RECHAZAR'
      });
    }

    const corte = await prisma.corteCaja.findUnique({
      where: { id: parseInt(id) }
    });

    if (!corte) {
      return res.status(404).json({
        success: false,
        error: 'Corte no encontrado'
      });
    }

    if (!corte.requiereAprobacion) {
      return res.status(400).json({
        success: false,
        error: 'Este corte no requiere aprobación'
      });
    }

    if (corte.bloqueado) {
      return res.status(403).json({
        success: false,
        error: 'Este corte ya está cerrado y bloqueado'
      });
    }

    const corteActualizado = await prisma.corteCaja.update({
      where: { id: parseInt(id) },
      data: {
        aprobadoPor,
        estatusAprobacion: accion === 'APROBAR' ? 'APROBADO' : 'RECHAZADO',
        justificacionDiferencia: justificacion || null,
        bloqueado: accion === 'APROBAR', // Bloquear solo si se aprueba
        fechaCierre: accion === 'APROBAR' ? new Date() : null
      }
    });

    res.json({
      success: true,
      data: corteActualizado,
      message: accion === 'APROBAR'
        ? 'Corte aprobado y bloqueado exitosamente'
        : 'Corte rechazado. Se requiere nuevo corte.'
    });

  } catch (error: any) {
    console.error('Error al aprobar/rechazar corte:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ────────────────────────────────────────────────────────────────────────────
// CERRAR CORTE (sin diferencias o con aprobación previa)
// ────────────────────────────────────────────────────────────────────────────
router.patch('/:id/cerrar', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { ticketPdfBase64 } = req.body;

    const corte = await prisma.corteCaja.findUnique({
      where: { id: parseInt(id) }
    });

    if (!corte) {
      return res.status(404).json({
        success: false,
        error: 'Corte no encontrado'
      });
    }

    if (corte.bloqueado) {
      return res.status(403).json({
        success: false,
        error: 'Este corte ya está cerrado'
      });
    }

    if (corte.requiereAprobacion && corte.estatusAprobacion !== 'APROBADO') {
      return res.status(403).json({
        success: false,
        error: 'No se puede cerrar: requiere aprobación pendiente'
      });
    }

    const corteActualizado = await prisma.corteCaja.update({
      where: { id: parseInt(id) },
      data: {
        bloqueado: true,
        fechaCierre: new Date(),
        ticketPdfBase64: ticketPdfBase64 || corte.ticketPdfBase64,
      }
    });

    res.json({
      success: true,
      data: corteActualizado,
      message: 'Corte cerrado y bloqueado exitosamente'
    });

  } catch (error: any) {
    console.error('Error al cerrar corte:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ────────────────────────────────────────────────────────────────────────────
// REGISTRAR ENVÍO DE WHATSAPP
// ────────────────────────────────────────────────────────────────────────────
router.patch('/:id/whatsapp-enviado', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const corte = await prisma.corteCaja.update({
      where: { id: parseInt(id) },
      data: { whatsappEnviado: true }
    });

    res.json({
      success: true,
      data: corte
    });

  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ────────────────────────────────────────────────────────────────────────────
// ESTADÍSTICAS DE CORTES
// ────────────────────────────────────────────────────────────────────────────
router.get('/stats/general', async (req: Request, res: Response) => {
  try {
    const { sucursal, fechaInicio, fechaFin } = req.query;

    const where: any = {};
    if (sucursal) where.sucursal = sucursal;
    if (fechaInicio || fechaFin) {
      where.fecha = {};
      if (fechaInicio) where.fecha.gte = new Date(fechaInicio as string);
      if (fechaFin) where.fecha.lte = new Date(fechaFin as string);
    }

    const cortes = await prisma.corteCaja.findMany({ where });

    const stats = {
      totalCortes: cortes.length,
      cuadresPerfectos: cortes.filter(c => c.tipoDiferencia === 'CUADRE_PERFECTO').length,
      sobrantes: cortes.filter(c => c.tipoDiferencia === 'SOBRANTE').length,
      faltantes: cortes.filter(c => c.tipoDiferencia === 'FALTANTE').length,
      conAprobacionPendiente: cortes.filter(c => c.estatusAprobacion === 'PENDIENTE').length,
      sumaFaltantes: cortes
        .filter(c => c.tipoDiferencia === 'FALTANTE')
        .reduce((sum, c) => sum + Math.abs(c.diferencia), 0),
      sumaSobrantes: cortes
        .filter(c => c.tipoDiferencia === 'SOBRANTE')
        .reduce((sum, c) => sum + c.diferencia, 0),
      totalVentasEfectivo: cortes.reduce((sum, c) => sum + c.ventasEfectivo, 0),
    };

    res.json({
      success: true,
      data: stats
    });

  } catch (error: any) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
