import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

router.get('/', async (req, res) => {
  const { skip, take, where, orderBy } = req.query as any;
  const filters = where ? JSON.parse(where) : {};
  const order = orderBy ? JSON.parse(orderBy) : undefined;
  try {
    const data = await prisma.product.findMany({
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

router.get('/count', async (req, res) => {
  const { where } = req.query as any;
  const filters = where ? JSON.parse(where) : {};
  try {
    const count = await prisma.product.count({ where: filters });
    res.json({ success: true, data: { count } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const data = await prisma.product.findUnique({ where: { id: Number(req.params.id) } });
    if (!data) return res.status(404).json({ success: false, error: 'Not found' });
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const payload = req.body || {};
    const codigo = payload.codigo || payload.code || payload.sku || payload.nombre || `PROD-${Date.now()}`;
    const dataMap: any = {
      codigo,
      nombre: payload.nombre ?? payload.name ?? '',
      precio: payload.precio ?? payload.price ?? 0,
      stock: payload.stock ?? 0,
      sku: payload.sku ?? null,
      costo: payload.costo ?? payload.cost ?? null,
      descripcion: payload.descripcion ?? payload.description ?? null,
      categoria: payload.categoria ?? payload.category ?? null,
      fabricante: payload.fabricante ?? payload.manufacturer ?? null,
      minStock: payload.minStock ?? null,
      ingredienteActivo: payload.ingredienteActivo ?? payload.activeIngredient ?? null,
      porcentajeIA: payload.porcentajeIA ?? payload.activeIngredientPct ?? payload.iaPercent ?? null,
      iva: payload.iva ?? (typeof payload.ivaRate === 'number' ? (payload.ivaRate >= 0 ? payload.ivaRate : null) : null),
      ieps: payload.ieps ?? payload.iepsRate ?? null,
      objetoImpuesto: payload.objetoImpuesto ?? payload.taxObject ?? null,
      claveProdServ: payload.claveProdServ ?? payload.satKey ?? null,
      claveUnidad: payload.claveUnidad ?? payload.satUnitKey ?? null,
      retencionIva: payload.retencionIva ?? payload.retentionIva ?? false,
      retencionIsr: payload.retencionIsr ?? payload.retentionIsr ?? false,
      imageKey: payload.imageKey ?? null,
      isBulk: payload.isBulk ?? false,
      unidadBase: payload.unidadBase ?? payload.bulkConfig?.baseUnit ?? null,
      unidadVenta: payload.unidadVenta ?? payload.bulkConfig?.salesUnit ?? null,
      factorConversion: payload.factorConversion ?? payload.bulkConfig?.conversionFactor ?? null,
      fichaTecnicaUrl: payload.fichaTecnicaUrl ?? payload.techSheetUrl ?? null,
      guiaAplicacionUrl: payload.guiaAplicacionUrl ?? payload.applicationGuideUrl ?? null,
    };
    const data = await prisma.product.create({ data: dataMap });
    res.status(201).json({ success: true, data });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const payload = req.body || {};
    const dataMap: any = {
      codigo: payload.codigo ?? payload.code,
      nombre: payload.nombre ?? payload.name,
      precio: payload.precio ?? payload.price,
      stock: payload.stock,
      sku: payload.sku,
      costo: payload.costo ?? payload.cost,
      descripcion: payload.descripcion ?? payload.description,
      categoria: payload.categoria ?? payload.category,
      fabricante: payload.fabricante ?? payload.manufacturer,
      minStock: payload.minStock,
      ingredienteActivo: payload.ingredienteActivo ?? payload.activeIngredient,
      porcentajeIA: payload.porcentajeIA ?? payload.activeIngredientPct ?? payload.iaPercent,
      iva: payload.iva ?? (typeof payload.ivaRate === 'number' ? (payload.ivaRate >= 0 ? payload.ivaRate : null) : undefined),
      ieps: payload.ieps ?? payload.iepsRate,
      objetoImpuesto: payload.objetoImpuesto ?? payload.taxObject,
      claveProdServ: payload.claveProdServ ?? payload.satKey,
      claveUnidad: payload.claveUnidad ?? payload.satUnitKey,
      retencionIva: payload.retencionIva ?? payload.retentionIva,
      retencionIsr: payload.retencionIsr ?? payload.retentionIsr,
      imageKey: payload.imageKey,
      isBulk: payload.isBulk,
      unidadBase: payload.unidadBase ?? payload.bulkConfig?.baseUnit,
      unidadVenta: payload.unidadVenta ?? payload.bulkConfig?.salesUnit,
      factorConversion: payload.factorConversion ?? payload.bulkConfig?.conversionFactor,
      fichaTecnicaUrl: payload.fichaTecnicaUrl ?? payload.techSheetUrl,
      guiaAplicacionUrl: payload.guiaAplicacionUrl ?? payload.applicationGuideUrl,
    };
    const data = await prisma.product.update({ where: { id: Number(req.params.id) }, data: dataMap });
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.patch('/:id', async (req, res) => {
  try {
    const data = await prisma.product.update({ where: { id: Number(req.params.id) }, data: req.body });
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await prisma.product.delete({ where: { id: Number(req.params.id) } });
    res.json({ success: true });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.post('/bulk', async (req, res) => {
  try {
    const items = req.body.items || [];
    const result = await prisma.product.createMany({ data: items });
    res.status(201).json({ success: true, data: { inserted: result.count } });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

export default router;
