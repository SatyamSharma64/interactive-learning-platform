import { TRPCError } from '@trpc/server';
import { router, protectedProcedure } from '../trpc/trpc.js';
import type { AttemptWithProblem } from '../types/index.js';

export const dashboardRouter = router({
  getUserStats: protectedProcedure.query(async ({ ctx }) => {
    if(!ctx.userId){
      throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'UserId does not exists',
        });
    }
    
    const userId = ctx.userId;

    const [totalProblems, totalAttempts, successfulAttempts] = await Promise.all([
      ctx.prisma.problem.count(),
      ctx.prisma.userProblemAttempt.count({ where: { userId } }),
      ctx.prisma.userProblemAttempt.count({
        where: { userId, status: 'accepted' },
      }),
    ]);

    const solvedProblemsQuery = await ctx.prisma.userProblemAttempt.findMany({
      where: { userId, status: 'accepted' },
      distinct: ['problemId'],
      select: { problemId: true },
    });

    const solvedProblems = solvedProblemsQuery.length;

    const successRate = totalAttempts > 0 ? Math.round((successfulAttempts / totalAttempts) * 100) : 0;
    const totalTimeSpent = Math.round(totalAttempts * 15 / 60);

    return {
      problemsSolved: solvedProblems,
      totalProblems,
      successRate,
      currentStreak: 0,
      totalTimeSpent,
    };
  }),

  getRecentActivity: protectedProcedure.query(async ({ ctx }) => {
    if(!ctx.userId){
      throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'UserId does not exists',
        });
    }
    
    const recentAttempts = await ctx.prisma.userProblemAttempt.findMany({
      where: { userId: ctx.userId },
      include: {
        problem: {
          select: { title: true, difficultyLevel: true },
        },
        language: {
          select: { name: true },
        },
      },
      orderBy: { submittedAt: 'desc' },
      take: 10,
    });

    return recentAttempts.map((attempt: AttemptWithProblem) => ({
      id: attempt.id,
      type: 'problem_attempt',
      title: attempt.problem.title,
      status: attempt.status,
      difficulty: attempt.problem.difficultyLevel,
      timestamp: attempt.submittedAt,
      details: {
        language: attempt.language.name,
        testCasesPassed: attempt.testCasesPassed,
        totalTestCases: attempt.totalTestCases,
        attemptNumber: attempt.attemptNumber,
      },
    }));
  }),
});