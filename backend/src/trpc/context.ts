import type { CreateExpressContextOptions } from '@trpc/server/adapters/express';
import { verifyAccessToken } from '../utils/auth.js';
import { prisma } from '../lib/prisma.js';
import { type Request, type Response } from 'express';

export interface Context {
  req: Request;
  res: Response;
  userId: string | null;
  prisma: typeof prisma;
}

export const createContext = async ({ req, res }: CreateExpressContextOptions): Promise<Context> => {
  const token = req.headers.authorization?.split(' ')[1];
  let userId: string | null = null;
  if (token) {
    try {
      const payload = verifyAccessToken(token);
      userId = payload.userId;
      
    } catch(error) {
      console.log(error);
      // Ignore invalid token
    }
  }

  return { req, res, userId, prisma };
};

// export type Context = Awaited<ReturnType<typeof createContext>>;