import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma.js';

export interface SocketEvents {
  'execution:started': { requestId: string };
  'execution:progress': { requestId: string; stage: string };
  'execution:completed': { requestId: string; result: any };
  'analysis:started': { attemptId: string };
  'analysis:completed': { attemptId: string; analysis: any };
  'progress:updated': { userId: string; progress: any };
  'achievement:unlocked': { userId: string; achievement: any };
}

export class WebSocketService {
  private io: Server;

  constructor(server: any) {
    this.io = new Server(server, {
      cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:5173',
        credentials: true,
      },
    });

    this.setupAuthentication();
    this.setupEventHandlers();
  }

  private setupAuthentication() {
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token;
        if (!token) {
          throw new Error('No token provided');
        }

        const payload = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
        const user = await prisma.user.findUnique({
          where: { id: payload.userId },
          select: { id: true, email: true, username: true },
        });

        if (!user) {
          throw new Error('User not found');
        }

        socket.data.user = user;
        next();
      } catch (error) {
        next(new Error('Authentication failed'));
      }
    });
  }

  private setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`User ${socket.data.user.username} connected`);

      socket.join(`user:${socket.data.user.id}`);

      socket.on('disconnect', () => {
        console.log(`User ${socket.data.user.username} disconnected`);
      });
    });
  }

  emitToUser(userId: string, event: keyof SocketEvents, data: any) {
    this.io.to(`user:${userId}`).emit(event, data);
  }

  emitExecutionStarted(userId: string, requestId: string) {
    this.emitToUser(userId, 'execution:started', { requestId });
  }

  emitExecutionProgress(userId: string, requestId: string, stage: string) {
    this.emitToUser(userId, 'execution:progress', { requestId, stage });
  }

  emitExecutionCompleted(userId: string, requestId: string, result: any) {
    this.emitToUser(userId, 'execution:completed', { requestId, result });
  }

  emitAnalysisCompleted(userId: string, attemptId: string, analysis: any) {
    this.emitToUser(userId, 'analysis:completed', { attemptId, analysis });
  }
}