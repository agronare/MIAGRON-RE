import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Since QuoteItem is not yet in the schema, return an empty array
// This prevents frontend errors when loading quote items
router.get('/', async (req, res) => {
  try {
    // Placeholder: return empty array until QuoteItem model is added to schema
    res.json({ success: true, data: [] });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    res.status(404).json({ success: false, error: 'Not found' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    // Placeholder until schema is updated
    res.status(201).json({ success: true, data: null });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

export default router;
