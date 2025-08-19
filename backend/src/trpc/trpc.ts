import { TRPCError, initTRPC } from '@trpc/server';
import type { Context } from './context.js';

const t = initTRPC.context<Context>().create();

export const router: typeof t.router = t.router;
export const publicProcedure: typeof t.procedure = t.procedure;

// Protected procedure with JWT auth
export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.userId) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  return next({
    ctx: {
      ...ctx,
      userId: ctx.userId as string,
    },
  });
}) satisfies typeof t.procedure;;