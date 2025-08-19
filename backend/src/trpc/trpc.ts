import { TRPCError, initTRPC } from '@trpc/server';
import type { Context } from './context.js';

const t = initTRPC.context<Context>().create();

export const router: typeof t.router = t.router;
export const publicProcedure: typeof t.procedure = t.procedure;

// Protected procedure with JWT auth
const isAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.userId) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  return next({
    ctx: {
      ...ctx,
      // We're passing the `userId` in the context, so we can access it in the resolvers
      userId: ctx.userId as string,
    },
  });
});

export const protectedProcedure = t.procedure.use(isAuthed);