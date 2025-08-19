import { router } from '../trpc/trpc.js';
import { authRouter } from './auth.js';
import { problemsRouter } from './problems.js';
import { dashboardRouter } from './dashboard.js';
import { tutorialsRouter } from './tutorials.js';

export const appRouter: ReturnType<typeof router> = router({
  auth: authRouter,
  problems: problemsRouter,
  dashboard: dashboardRouter,
  tutorials: tutorialsRouter,
});

export type AppRouter = typeof appRouter;