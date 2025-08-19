// import { z } from 'zod';
// import { DifficultyLevel, SubmissionStatus, ProgressStatus } from './types.js';

// // Authentication Schemas
// export const loginSchema = z.object({
//   email: z.string().email('Invalid email address'),
//   password: z.string().min(1, 'Password is required'),
// });

// export const registerSchema = z.object({
//   email: z.string().email('Invalid email address'),
//   username: z.string()
//     .min(3, 'Username must be at least 3 characters')
//     .max(50, 'Username must not exceed 50 characters')
//     .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
//   password: z.string()
//     .min(6, 'Password must be at least 6 characters')
//     .max(100, 'Password must not exceed 100 characters'),
//   firstName: z.string().max(50).optional(),
//   lastName: z.string().max(50).optional(),
// });

// // Problem Schemas
// export const problemQuerySchema = z.object({
//   search: z.string().optional(),
//   difficulty: z.nativeEnum(DifficultyLevel).optional(),
//   status: z.enum(['SOLVED', 'ATTEMPTED', 'NOT_ATTEMPTED']).optional(),
//   limit: z.number().min(1).max(100).default(50),
//   offset: z.number().min(0).default(0),
// });

// export const problemByIdSchema = z.object({
//   id: z.string().cuid('Invalid problem ID'),
// });

// export const submitSolutionSchema = z.object({
//   problemId: z.string().cuid('Invalid problem ID'),
//   code: z.string().min(1, 'Code cannot be empty').max(10000, 'Code too long'),
//   language: z.enum(['python', 'javascript']),
// });

// // Tutorial Schemas
// export const tutorialByIdSchema = z.object({
//   id: z.string().cuid('Invalid tutorial ID'),
// });

// export const startTutorialSchema = z.object({
//   tutorialId: z.string().cuid('Invalid tutorial ID'),
// });

// export const tutorialProgressSchema = z.object({
//   tutorialId: z.string().cuid('Invalid tutorial ID'),
// });

// // Execution Schemas
// export const executionRequestSchema = z.object({
//   code: z.string().min(1, 'Code cannot be empty').max(10000, 'Code too long'),
//   language: z.enum(['python', 'javascript']),
//   input: z.string().optional().default(''),
//   timeLimit: z.number().min(1000).max(30000).default(5000),
//   memoryLimit: z.number().min(64).max(512).default(128),
// });

// export const validationRequestSchema = z.object({
//   code: z.string().min(1, 'Code cannot be empty'),
//   language: z.enum(['python', 'javascript']),
//   testCases: z.array(z.object({
//     input: z.string(),
//     output: z.string(),
//   })).min(1, 'At least one test case required'),
// });

// // Code Tracing Schemas
// export const tracingRequestSchema = z.object({
//   code: z.string().min(1, 'Code cannot be empty').max(5000, 'Code too long for tracing'),
//   language: z.enum(['python', 'javascript']),
//   input: z.string().optional().default(''),
// });

// // Dashboard Schemas
// export const dashboardStatsSchema = z.object({
//   userId: z.string().cuid().optional(), // Optional for current user
// });

// export const recentActivitySchema = z.object({
//   userId: z.string().cuid().optional(),
//   limit: z.number().min(1).max(50).default(10),
// });

// // Type inference from schemas
// export type LoginInput = z.infer<typeof loginSchema>;
// export type RegisterInput = z.infer<typeof registerSchema>;
// export type ProblemQueryInput = z.infer<typeof problemQuerySchema>;
// export type ProblemByIdInput = z.infer<typeof problemByIdSchema>;
// export type SubmitSolutionInput = z.infer<typeof submitSolutionSchema>;
// export type TutorialByIdInput = z.infer<typeof tutorialByIdSchema>;
// export type StartTutorialInput = z.infer<typeof startTutorialSchema>;
// export type TutorialProgressInput = z.infer<typeof tutorialProgressSchema>;
// export type ExecutionRequestInput = z.infer<typeof executionRequestSchema>;
// export type ValidationRequestInput = z.infer<typeof validationRequestSchema>;
// export type TracingRequestInput = z.infer<typeof tracingRequestSchema>;
// export type DashboardStatsInput = z.infer<typeof dashboardStatsSchema>;
// export type RecentActivityInput = z.infer<typeof recentActivitySchema>;

// // Error handling schemas
// export const apiErrorSchema = z.object({
//   code: z.string(),
//   message: z.string(),
//   details: z.record(z.string(), z.any()).optional(),
// });

// export type ApiError = z.infer<typeof apiErrorSchema>;