import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { router, protectedProcedure } from '../trpc/trpc.js';
import { AIService, type CodeAnalysisResponse } from '../services/aiService.js';
import axios from 'axios';
// import { SubmissionStatus } from '@prisma/client';
import { wsService } from '../index.js';
import { CodeTemplateService } from '../services/templateManagementService.js';
// import {
//   ProblemQueryInput,
//   ProblemListItem,
//   ProblemWithRelations,
//   UserProgress,
//   DifficultyLevel,
//   AttemptStatus
// } from '../../../shared/types.js';

const aiService = new AIService();

// interface AttemptStatus {
//   status: SubmissionStatus | null;
// }

export const problemsRouter = router({
  getAll: protectedProcedure
    .input(z.object({
      search: z.string().optional(),
      difficulty: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).optional(),
      status: z.enum(['SOLVED', 'ATTEMPTED', 'NOT_ATTEMPTED']).optional(),
      limit: z.number().min(1).max(100).default(50),
      offset: z.number().min(0).default(0),
    }))
    .query(async ({ input, ctx }) => {
      const { search, difficulty, status, limit, offset } = input;
      const userId = ctx.user.id;

      // Build where clause
      const whereClause: any = {};
      
      if (search) {
        whereClause.OR = [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ];
      }
      
      if (difficulty) {
        whereClause.difficultyLevel = difficulty;
      }

      const problems = await ctx.prisma.problem.findMany({
        where: whereClause,
        include: {
          topic: {
            select: { id: true, name: true }
          },
          testCases: {
            select: { id: true }
          },
          userAttempts: {
            where: { userId },
            select: {
              id: true,
              status: true,
              testCasesPassed: true,
              totalTestCases: true,
              attemptNumber: true,
            },
            orderBy: { submittedAt: 'desc' }
          }
        },
        orderBy: [
          { topic: { orderIndex: 'asc' } },
          { orderIndex: 'asc' }
        ],
        take: limit,
        skip: offset,
      });

      const problemsWithProgress = problems.map((problem: any) => {
        const attempts = problem.userAttempts;
        const solved = attempts.some((attempt: any) => attempt.status === "ACCEPTED");
        const bestAttempt = attempts.find((attempt: any) => attempt.status === "ACCEPTED") || attempts[0];

        return {
          id: problem.id,
          title: problem.title,
          description: problem.description,
          difficultyLevel: problem.difficultyLevel,
          topic: problem.topic,
          testCasesCount: problem.testCases.length,
          userProgress: attempts.length > 0 ? {
            attempts: attempts.length,
            solved,
            bestScore: bestAttempt?.testCasesPassed || 0,
            lastAttempt: bestAttempt,
          } : null,
        };
      }).filter((problem: any) => {
        // Apply status filter
        if (status === 'SOLVED' && !problem.userProgress?.solved) return false;
        if (status === 'ATTEMPTED' && (!problem.userProgress || problem.userProgress.solved)) return false;
        if (status === 'NOT_ATTEMPTED' && problem.userProgress) return false;
        return true;
      });

      return problemsWithProgress;
    }),


  getByTopic: protectedProcedure
    .input(z.object({ topicId: z.string() }))
    .query(async ({ input, ctx }) => {
      return await ctx.prisma.problem.findMany({
        where: { topicId: input.topicId },
        include: {
          testCases: { where: { isHidden: false } },
          suggestions: { orderBy: { orderIndex: 'asc' } },
        },
        orderBy: { orderIndex: 'asc' },
      });
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      return await ctx.prisma.problem.findUnique({
        where: { id: input.id },
        include: {
          testCases: true,
          codeTemplates: { where: { languageId: 'lang1' } },
          suggestions: { orderBy: { orderIndex: 'asc' } },
          solutions: { where: { isOptimal: true } },
        },
      });
    }),

    getCodeTemplateById: protectedProcedure
    .input(z.object({
      problemId: z.string(),
      languageId: z.string()
    }))
    .query(async ({ input, ctx }) => {
      return await ctx.prisma.codeTemplate.findUnique({
        where: {
          problemId_languageId: {
            problemId: input.problemId,
            languageId: input.languageId,
          },
        },
      });
    }),

    getAvailableProgrammingLanguages: protectedProcedure
    .query(async ({ ctx }) => {
      return await ctx.prisma.programmingLanguage.findMany({
        select: {
          id: true,
          name: true,
          displayName: true,
          isActive: true,
        },
      });
    }),

  testCode: protectedProcedure
    .input(z.object({
      code: z.string(),
      languageId: z.string(),
      input: z.string().optional(),
      problemId: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      const { code, languageId, problemId } = input;
      const userId = ctx.user.id;

      // Emit execution started event
      const requestId = `${userId}-${Date.now()}`;
      // wsService.emitExecutionStarted(userId, requestId);
      try {
        // Fetch code template if available
        const codeTemplate = await ctx.prisma.codeTemplate.findUnique({
          where: { 
            problemId_languageId: { problemId, languageId } 
          },
          include: {
            parameters: {
              orderBy: { orderIndex: 'asc' }
            }
          }
        });

        if (!codeTemplate) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Code template not found for this problem and language' });
        }

        const templateService = new CodeTemplateService(ctx.prisma);
        // Build the complete code with template
        const fullCode = templateService.buildFullScript(codeTemplate, code);

        const language = await ctx.prisma.programmingLanguage.findUnique({
          where: { id: languageId },
        });

        const testCases = await ctx.prisma.testCase.findMany({
          where: { problemId, isSample: true },
          orderBy: { orderIndex: 'asc' },
        })
        // Send execution request to the execution service
        const executionResponse = await axios.post('http://localhost:3001/api/execute', {
          code: fullCode,
          language: language?.name || 'python',
          testCases: testCases.map((tc: any) => ({
            input: tc.input,
            output: tc.expectedOutput,
          })),
        });

        const { allPassed, totalExecutionTime, testResults } = executionResponse.data;

        // let status = allPassed ? 'ACCEPTED' : 'WRONG_ANSWER';

        const result = {
          success: allPassed,
          testResults,
          executionTime: totalExecutionTime,
        };


        // wsService.emitExecutionCompleted(userId, requestId, response.data);
        console.log('Execution result:', result);
        return result;
      } catch (error: any) {
        console.error('Execution error:', error);
        // wsService.emitExecutionError(userId, requestId, error.message);
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message });
      }
    }),



  submitSolution: protectedProcedure
    .input(z.object({
      problemId: z.string(),
      code: z.string(),
      languageId: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      const { problemId, code, languageId } = input;
      const userId = ctx.user.id;

      const language = await ctx.prisma.programmingLanguage.findUnique({
        where: { id: languageId },
      });
      // Emit execution started event
      const requestId = `${userId}-${Date.now()}`;
      wsService.emitExecutionStarted(userId, requestId);

      const problem = await ctx.prisma.problem.findUnique({
        where: { id: problemId },
        include: { testCases: true },
      });

      if (!problem) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Problem not found' });
      }

      const attemptCount = await ctx.prisma.userProblemAttempt.count({
        where: { userId, problemId },
      });
      const currentAttempt = attemptCount + 1;

      try {
        wsService.emitExecutionProgress(userId, requestId, 'Running test cases...');

        const executionResponse = await axios.post('http://localhost:3001/validate', {
          code,
          language: language?.name || 'python',
          testCases: problem.testCases.map((tc: any) => ({
            input: tc.input,
            output: tc.expectedOutput,
          })),
        });

        const { allPassed, totalExecutionTime, testResults } = executionResponse.data;

        wsService.emitExecutionProgress(userId, requestId, 'Analyzing results...');

        let aiAnalysis = null;
        let status = allPassed ? 'ACCEPTED' : 'WRONG_ANSWER';

        const attempt = await ctx.prisma.userProblemAttempt.create({
          data: {
            userId,
            problemId,
            codeSubmission: code,
            languageId: languageId,
            status: status as any,
            executionTimeMs: totalExecutionTime,
            testCasesPassed: testResults.filter((r: any) => r.passed).length,
            totalTestCases: testResults.length,
            attemptNumber: currentAttempt,
          },
        });

        // Generate AI analysis for failed attempts
        if (!allPassed) {
          wsService.emitExecutionProgress(userId, requestId, 'Generating AI feedback...');
          
          // Generate AI analysis asynchronously
          aiService.analyzeFailedCode({
            problemDescription: problem.description,
            userCode: code,
            language: language?.name || 'python',
            testResults,
            attemptNumber: currentAttempt,
          }).then(analysis => {
            // Update attempt with AI feedback
            ctx.prisma.userProblemAttempt.update({
              where: { id: attempt.id },
              data: { aiFeedback: JSON.stringify(analysis) },
            }).then(() => {
              wsService.emitAnalysisCompleted(userId, attempt.id, analysis);
            });
          }).catch(error => {
            console.error('AI analysis failed:', error);
          });
        }

        const result = {
          success: allPassed,
          attemptId: attempt.id,
          testResults,
          executionTime: totalExecutionTime,
          attemptNumber: currentAttempt,
          aiAnalysis,
        };

        wsService.emitExecutionCompleted(userId, requestId, result);
        
        return result;
        
      } catch (error: any) {
        const attempt = await ctx.prisma.userProblemAttempt.create({
          data: {
            userId: ctx.user.id,
            problemId: input.problemId,
            codeSubmission: input.code,
            languageId: input.languageId,
            status: 'runtime_error',
            attemptNumber: currentAttempt,
            aiFeedback: JSON.stringify({
              feedback: 'Your code encountered a runtime error. Check for syntax issues or infinite loops.',
              suggestions: ['Check syntax', 'Verify input handling', 'Look for infinite loops'],
              confidence: 8,
              errorTypes: ['runtime'],
            }),
          },
        });

        const result = {
          success: false,
          attemptId: attempt.id,
          error: error.response?.data?.error || error.message,
          attemptNumber: currentAttempt,
        };

        wsService.emitExecutionCompleted(userId, requestId, result);
        
        return result;
      }
    }),

  getHint: protectedProcedure
    .input(z.object({ problemId: z.string() }))
    .query(async ({ input, ctx }) => {
      const attemptCount = await ctx.prisma.userProblemAttempt.count({
        where: {
          userId: ctx.user.id,
          problemId: input.problemId,
        },
      });

      const hint = await aiService.generateHint(input.problemId, attemptCount + 1);
      return { hint, attemptNumber: attemptCount + 1 };
    }),


  getUserProgress: protectedProcedure
    .input(z.object({ problemId: z.string() }))
    .query(async ({ input, ctx }) => {
      const attempts = await ctx.prisma.userProblemAttempt.findMany({
        where: {
          userId: ctx.user.id,
          problemId: input.problemId,
        },
        orderBy: { submittedAt: 'desc' },
      });

      const bestAttempt = attempts.find((a: any) => a.status === "ACCEPTED") || attempts[0];
      
      return {
        attempts: attempts.length,
        solved: attempts.some((a: any) => a.status === "ACCEPTED"),
        bestScore: bestAttempt?.testCasesPassed || 0,
        lastAttempt: bestAttempt,
      };
    }),
});