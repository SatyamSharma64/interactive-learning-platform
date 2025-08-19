import { z } from 'zod';
import { router, protectedProcedure } from '../trpc/trpc.js';

export const tutorialsRouter: ReturnType<typeof router> = router({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.prisma.tutorial.findMany({
      where: { isPublished: true },
      include: {
        topics: {
          include: {
            problems: {
              select: { id: true, title: true, difficultyLevel: true },
            },
          },
          orderBy: { orderIndex: 'asc' },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      return await ctx.prisma.tutorial.findUnique({
        where: { id: input.id },
        include: {
          topics: {
            include: {
              problems: {
                select: {
                  id: true,
                  title: true,
                  difficultyLevel: true,
                  orderIndex: true,
                },
                orderBy: { orderIndex: 'asc' },
              },
            },
            orderBy: { orderIndex: 'asc' },
          },
        },
      });
    }),
    
    getUserProgress: protectedProcedure
    .input(z.object({ tutorialId: z.string() }))
    .query(async ({ input, ctx }) => {
      const userId = ctx.userId;
      const { tutorialId } = input;

      // Get tutorial with all problems
      const tutorial = await ctx.prisma.tutorial.findUnique({
        where: { id: tutorialId },
        include: {
          topics: {
            include: {
              problems: { select: { id: true } }
            }
          }
        }
      });

      if (!tutorial) return null;

      // Get all problem IDs in this tutorial
      const problemIds = tutorial.topics.flatMap((topic: any) => 
        topic.problems.map((problem: any) => problem.id)
      );

      // Get user's progress on all problems in this tutorial
      const problemProgress = await ctx.prisma.userProblemAttempt.findMany({
        where: {
          userId,
          problemId: { in: problemIds }
        },
        select: {
          problemId: true,
          status: true,
          attemptNumber: true,
          submittedAt: true,
        },
        orderBy: { submittedAt: 'desc' }
      });

      // Group by problem and get best attempt for each
      const progressByProblem = problemIds.map((problemId: string) => {
        const attempts = problemProgress.filter((p: any) => p.problemId === problemId);
        const solved = attempts.some((a: any) => a.status === 'ACCEPTED');
        const bestAttempt = attempts.find((a: any) => a.status === 'ACCEPTED') || attempts[0];
        
        return {
          problemId,
          solved,
          attempts: attempts.length,
          lastAttempt: bestAttempt?.submittedAt,
        };
      });

      // Get or create tutorial progress record
      const tutorialProgress = await ctx.prisma.userTutorialProgress.upsert({
        where: {
          unique_user_tutorial: { userId, tutorialId }
        },
        update: {
          lastAccessedAt: new Date(),
        },
        create: {
          userId,
          tutorialId,
          status: 'in_progress',
          progressPercentage: 0,
        }
      });

      return {
        ...tutorialProgress,
        problemProgress: progressByProblem,
      };
    }),

  startTutorial: protectedProcedure
    .input(z.object({ tutorialId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.userId;
      const { tutorialId } = input;

      // Create or update tutorial progress
      const progress = await ctx.prisma.userTutorialProgress.upsert({
        where: {
          unique_user_tutorial: { userId, tutorialId }
        },
        update: {
          status: 'in_progress',
          lastAccessedAt: new Date(),
        },
        create: {
          userId,
          tutorialId,
          status: 'in_progress',
          progressPercentage: 0,
        }
      });

      return progress;
    }),
});