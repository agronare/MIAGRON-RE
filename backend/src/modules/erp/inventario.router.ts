import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const router = Router();
const prisma = new PrismaClient();

router.get('/', async (req, res) => {
  const { skip, take, where, orderBy } = req.query as any;
  const filters = where ? JSON.parse(where) : {};
  const order = orderBy ? JSON.parse(orderBy) : undefined;
  try {
    const data = await prisma.inventario.findMany({
      skip: skip ? Number(skip) : undefined,
      take: take ? Number(take) : undefined,
      where: filters,
      orderBy: order,
    });
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const data = await prisma.inventario.findUnique({ where: { id: Number(req.params.id) } });
    if (!data) return res.status(404).json({ success: false, error: 'Not found' });
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const data = await prisma.inventario.create({ data: req.body });
    res.status(201).json({ success: true, data });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const data = await prisma.inventario.update({ where: { id: Number(req.params.id) }, data: req.body });
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await prisma.inventario.delete({ where: { id: Number(req.params.id) } });
    res.json({ success: true });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.post('/bulk', async (req, res) => {
  try {
    const items = req.body.items || [];
    const result = await prisma.inventario.createMany({ data: items });
    res.status(201).json({ success: true, data: { inserted: result.count } });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Transferencia transaccional entre sucursales
router.post('/transfer', async (req, res) => {
  try {
    const {
      origenInventarioId,
      productoId,
      origenSucursalId,
      destinoSucursalId,
      cantidad,
      costoUnit,
      lote,
      referencia,
    } = req.body as any;

    const qty = Number(cantidad);
    const prodId = Number(productoId);
    const srcSucId = Number(origenSucursalId);
    const dstSucId = Number(destinoSucursalId);

    if (!prodId || !srcSucId || !dstSucId) {
      return res.status(400).json({ success: false, error: 'Datos requeridos faltantes: productoId, origenSucursalId, destinoSucursalId' });
    }
    if (srcSucId === dstSucId) {
      return res.status(400).json({ success: false, error: 'La sucursal de destino debe ser diferente a la de origen' });
    }
    if (!qty || qty <= 0) {
      return res.status(400).json({ success: false, error: 'Cantidad inválida' });
    }

    const now = new Date().toISOString();

    const transferId = uuidv4();
    const result = await prisma.$transaction(async (tx) => {
      // Obtener inventario origen
      let origen = undefined as any;
      if (origenInventarioId) {
        origen = await tx.inventario.findUnique({ where: { id: Number(origenInventarioId) } });
      } else {
        origen = await tx.inventario.findFirst({
          where: {
            productoId: prodId,
            sucursalId: srcSucId,
            ...(lote ? { lote } : {}),
          },
        });
      }

      if (!origen) {
        throw new Error('Inventario de origen no encontrado');
      }
      if (Number(origen.cantidad) < qty) {
        throw new Error('Stock insuficiente en origen');
      }

      const origenActualizado = await tx.inventario.update({
        where: { id: Number(origen.id) },
        data: {
          cantidad: Number(origen.cantidad) - qty,
          ultimaActualizacion: now,
        },
      });

      // Determinar lote destino de forma estricta
      const loteDestino = (lote ?? origen.lote) ?? null;

      // Obtener/crear inventario destino (estricto por lote)
      const destinoExistente = await tx.inventario.findFirst({
        where: {
          productoId: prodId,
          sucursalId: dstSucId,
          lote: loteDestino,
        },
      });

      let destinoActualizado = destinoExistente;
      if (destinoExistente) {
        destinoActualizado = await tx.inventario.update({
          where: { id: Number(destinoExistente.id) },
          data: {
            cantidad: Number(destinoExistente.cantidad) + qty,
            ultimaActualizacion: now,
          },
        });
      } else {
        destinoActualizado = await tx.inventario.create({
          data: {
            productoId: prodId,
            sucursalId: dstSucId,
            cantidad: qty,
            lote: loteDestino,
            ubicacion: null,
            costoUnit: (costoUnit ?? origen.costoUnit) ?? null,
            metodoCosto: origen.metodoCosto ?? 'Promedio',
            fechaIngreso: now,
            ultimaActualizacion: now,
          },
        });
      }

      // Registrar movimientos
      const referenciaMov = (referencia ?? `Transfer ${lote ?? ''}`).trim() + ` [${transferId}]`;
      const movSalida = await tx.inventarioMovimiento.create({
        data: {
          productoId: prodId,
          sucursalId: srcSucId,
          tipo: 'salida',
          cantidad: qty,
          costoUnit: (costoUnit ?? origen.costoUnit) ?? null,
          referencia: referenciaMov,
          origenModulo: 'ERP',
          fecha: now,
        },
      });

      const movEntrada = await tx.inventarioMovimiento.create({
        data: {
          productoId: prodId,
          sucursalId: dstSucId,
          tipo: 'entrada',
          cantidad: qty,
          costoUnit: (costoUnit ?? origen.costoUnit) ?? null,
          referencia: referenciaMov,
          origenModulo: 'ERP',
          fecha: now,
        },
      });

      // Auditoría: registrar la transferencia
      await tx.inventarioTransfer.create({
        data: {
          transferId,
          productoId: prodId,
          origenSucursalId: srcSucId,
          destinoSucursalId: dstSucId,
          origenInventarioId: Number(origen.id),
          destinoInventarioId: Number(destinoActualizado.id),
          movimientoSalidaId: Number(movSalida.id),
          movimientoEntradaId: Number(movEntrada.id),
          cantidad: qty,
          costoUnit: (costoUnit ?? origen.costoUnit) ?? null,
          lote: loteDestino,
          referencia: referenciaMov,
        },
      });

      return { origen: origenActualizado, destino: destinoActualizado, movimientos: { salidaId: movSalida.id, entradaId: movEntrada.id }, transferId };
    });

    res.json({ success: true, data: result });
  } catch (error: any) {
    const msg = error?.message || 'Error en transferencia';
    const code = msg.includes('Stock insuficiente') || msg.includes('no encontrado') ? 400 : 500;
    res.status(code).json({ success: false, error: msg });
  }
});

// Auditoría: listar transferencias
router.get('/transfer-audit', async (req, res) => {
  const { skip, take, where, orderBy } = req.query as any;
  const filters = where ? JSON.parse(where) : {};
  const order = orderBy ? JSON.parse(orderBy) : { createdAt: 'desc' };
  try {
    const data = await prisma.inventarioTransfer.findMany({
      skip: skip ? Number(skip) : undefined,
      take: take ? Number(take) : undefined,
      where: filters,
      orderBy: order,
    });
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Movimientos
router.get('/movimientos', async (req, res) => {
  const { skip, take, where, orderBy } = req.query as any;
  const filters = where ? JSON.parse(where) : {};
  const order = orderBy ? JSON.parse(orderBy) : { fecha: 'desc' };
  try {
    const data = await prisma.inventarioMovimiento.findMany({
      skip: skip ? Number(skip) : undefined,
      take: take ? Number(take) : undefined,
      where: filters,
      orderBy: order,
    });
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/movimientos', async (req, res) => {
  try {
    const data = await prisma.inventarioMovimiento.create({ data: req.body });
    res.status(201).json({ success: true, data });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

export default router;
