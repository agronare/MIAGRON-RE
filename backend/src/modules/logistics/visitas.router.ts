import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

router.get('/', async (req, res) => {
  const { skip, take, where, orderBy } = req.query as any;
  const filters = where ? JSON.parse(where) : {};
  const order = orderBy ? JSON.parse(orderBy) : undefined;
  try {
    const data = await prisma.visita.findMany({
      skip: skip ? Number(skip) : undefined,
      take: take ? Number(take) : undefined,
      where: filters,
      orderBy: order,
      include: { planRuta: true },
    });
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const data = await prisma.visita.create({ data: req.body });
    res.status(201).json({ success: true, data });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

export default router;
