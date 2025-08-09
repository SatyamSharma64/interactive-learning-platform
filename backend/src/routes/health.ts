import express from 'express';
import { prisma } from '../lib/prisma.js';

const router = express.Router();

router.get('/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'healthy',
        executionService: 'healthy',
      },
    };

    res.json(health);
  } catch (error: any) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message,
    });
  }
});

export default router;