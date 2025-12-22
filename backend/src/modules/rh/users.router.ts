import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const router = Router();
const prisma = new PrismaClient();

router.get('/', async (req, res) => {
  const { skip, take, where, orderBy } = req.query as any;
  const filters = where ? JSON.parse(where) : {};
  const order = orderBy ? JSON.parse(orderBy) : undefined;
  try {
    const data = await prisma.user.findMany({
      skip: skip ? Number(skip) : undefined,
      take: take ? Number(take) : undefined,
      where: filters,
      orderBy: order,
      select: { id: true, name: true, email: true, role: true, isActive: true, verified: true, sucursal: true, telefono: true, createdAt: true, updatedAt: true }
    });
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { password, ...rest } = req.body as any;
    const passwordHash = await bcrypt.hash(password || rest.passwordHash || 'changeme', 10);
    const data = await prisma.user.create({ data: { ...rest, passwordHash } });
    res.status(201).json({ success: true, data: { id: data.id, name: data.name, email: data.email, role: data.role, isActive: data.isActive } });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { password, ...rest } = req.body as any;
    const update: any = { ...rest };
    if (password) update.passwordHash = await bcrypt.hash(password, 10);
    const data = await prisma.user.update({ where: { id: Number(req.params.id) }, data: update });
    res.json({ success: true, data: { id: data.id, name: data.name, email: data.email, role: data.role, isActive: data.isActive } });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await prisma.user.delete({ where: { id: Number(req.params.id) } });
    res.json({ success: true });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Auth
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body as any;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ success: false, error: 'Usuario o contraseña inválidos' });
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ success: false, error: 'Usuario o contraseña inválidos' });
    const token = jwt.sign({ sub: user.id, role: user.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
    res.json({ success: true, data: { token, user: { id: user.id, name: user.name, email: user.email, role: user.role } } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
