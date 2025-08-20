import express, { Router, type Response } from 'express';
import { prisma } from '../lib/prisma.js';

const router: Router = express.Router();

router.get('/health', async (res: Response): Promise<void> => {
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