import { Router } from 'express';

// Placeholder router for purchase items until model is finalized in Prisma
// Prevents frontend 404 and HTML responses (Unexpected token '<')
const router = Router();

router.get('/', async (_req, res) => {
  try {
    res.json({ success: true, data: [] });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
