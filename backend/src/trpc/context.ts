import type { CreateExpressContextOptions } from '@trpc/server/adapters/express';
import { verifyAccessToken } from '../utils/auth.js';
import { prisma } from '../lib/prisma.js';
import type { AppUser } from '../types/index.js';

export const createContext = async ({ req, res }: CreateExpressContextOptions) => {
  const token = req.headers.authorization?.split(' ')[1];
  console.log('Creating context with token:', token);
  let user: AppUser | null = null;
  if (token) {
    try {
      const payload = verifyAccessToken(token);
      const dbUser = await prisma.user.findUnique({ 
        where: { id: payload.userId },
        select: { id: true, email: true, username: true, firstName: true, lastName: true },
      });

      console.log('User found:', dbUser);
      if (dbUser) {
        user = dbUser;
      }
    } catch(error) {
      console.log(error);
      // Ignore invalid token
    }
  }

  return { req, res, user, prisma };
};

export type Context = Awaited<ReturnType<typeof createContext>>;