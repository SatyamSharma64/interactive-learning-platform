import { z } from 'zod';
import bcrypt from 'bcryptjs';
// import jwt from 'jsonwebtoken';
import { TRPCError } from '@trpc/server';
import { router, publicProcedure, protectedProcedure } from '../trpc/trpc.js';
import { generateSalt, generateTokens, hashPassword } from '../utils/auth.js';

export const authRouter = router({
  register: publicProcedure
    .input(z.object({
      email: z.string().email(),
      username: z.string().min(3),
      password: z.string().min(6),
      firstName: z.string().optional().transform(v => v ?? null),
      lastName: z.string().optional().transform(v => v ?? null),
    }))
    .mutation(async ({ input, ctx }) => {
      const existingUser = await ctx.prisma.user.findFirst({
        where: {
          OR: [{ email: input.email }, { username: input.username }],
        },
      });

      if (existingUser) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'User already exists',
        });
      }
      const { password, ...userData } = input;

      const salt = await generateSalt();
      const passwordHash = await hashPassword(password, salt);

      const user = await ctx.prisma.user.create({
        data: {
          ...userData,
          passwordHash,
        },
        select: {
          id: true,
          email: true,
          username: true,
          firstName: true,
          lastName: true,
        },
      });

      const token = generateTokens(user.id).accessToken;

      return { user, token };
    }),

  login: publicProcedure
    .input(z.object({
      email: z.string().email(),
      password: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      const user = await ctx.prisma.user.findUnique({
        where: { email: input.email },
      });

      if (!user || !await bcrypt.compare(input.password, user.passwordHash)) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Invalid credentials',
        });
      }
      
      const token = generateTokens(user.id).accessToken;

      return {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
        },
        token,
      };
    }),

  me: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.prisma.user.findUnique({ 
        where: { id: ctx.userId },
        select: { id: true, email: true, username: true, firstName: true, lastName: true },
      });
    return user;
  }),
});