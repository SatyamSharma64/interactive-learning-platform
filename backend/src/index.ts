import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { createExpressMiddleware } from '@trpc/server/adapters/express';
import { appRouter } from './routers/index.js';
import { createContext } from './trpc/context.js';
import { WebSocketService } from './services/websocketService.js';
import http from 'http';
import visualizerRouter from './routes/visualizer.js';
// import { prisma } from './lib/prisma';
import healthRouter from './routes/health.js';

dotenv.config();

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;

export const wsService = new WebSocketService(server);

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(morgan('combined'));
app.use(express.json());

// Routes
app.use('/api', healthRouter);
app.use('/api/visualizer', visualizerRouter);

// tRPC middleware
app.use(
  '/trpc',
  createExpressMiddleware({
    router: appRouter,
    createContext,
  })
);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📚 tRPC endpoint: http://localhost:${PORT}/trpc`);
  console.log(`🔌 WebSocket server ready`);
});

export type AppRouter = typeof appRouter;