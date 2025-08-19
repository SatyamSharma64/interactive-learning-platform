import { 
  User as PrismaUser, 
  Problem as PrismaProblem, 
  Tutorial as PrismaTutorial,
  Topic as PrismaTopic,
  TestCase as PrismaTestCase,
  UserProblemAttempt as PrismaUserProblemAttempt,
  UserTutorialProgress as PrismaUserTutorialProgress,
  DifficultyLevel,
  SubmissionStatus,
  ProgressStatus
} from '@prisma/client';

// Base types exported from Prisma
export type User = PrismaUser;
export type Problem = PrismaProblem;
export type Tutorial = PrismaTutorial;
export type Topic = PrismaTopic;
export type TestCase = PrismaTestCase;
export type UserProblemAttempt = PrismaUserProblemAttempt;
export type UserTutorialProgress = PrismaUserTutorialProgress;

// Export enums
export { DifficultyLevel, SubmissionStatus, ProgressStatus };

// API Response wrapper
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
  };
}

// Extended types with relations
export type UserSafe = Omit<User, 'passwordHash'>;

export type ProblemWithTopic = Problem & {
  topic: {
    id: string;
    name: string;
  };
};

export type ProblemWithRelations = Problem & {
  topic: {
    id: string;
    name: string;
  };
  testCases: TestCase[];
  userAttempts: UserProblemAttempt[];
};

export type TutorialWithTopics = Tutorial & {
  topics: (Topic & {
    problems: Problem[];
  })[];
};

export type TopicWithProblems = Topic & {
  problems: Problem[];
};

// Frontend-specific types
export interface UserProgress {
  attempts: number;
  solved: boolean;
  bestScore: number;
  lastAttempt?: UserProblemAttempt;
}

export interface ProblemListItem {
  id: string;
  title: string;
  description: string;
  difficultyLevel: DifficultyLevel;
  topic?: {
    id: string;
    name: string;
  };
  testCasesCount: number;
  userProgress?: UserProgress;
}

// Execution Service Types
export interface ExecutionRequest {
  code: string;
  language: string;
  input?: string;
  timeLimit: number;
  memoryLimit: number;
}

export interface ExecutionResult {
  success: boolean;
  output: string[];
  errors: string[];
  executionTime: number;
  memoryUsed: number;
  exitCode: number;
}

export interface TestResult {
  input: string;
  expectedOutput: string;
  actualOutput: string;
  passed: boolean;
  executionTime: number;
  success: boolean;
  errors: string[];
}

export interface ValidationResult {
  allPassed: boolean;
  totalExecutionTime: number;
  testResults: TestResult[];
}

// Code Analysis Types
export interface CodeAnalysisRequest {
  problemDescription: string;
  userCode: string;
  language: string;
  testResults: TestResult[];
  attemptNumber: number;
}

export interface CodeAnalysisResponse {
  feedback: string;
  suggestions: string[];
  hint?: string;
  confidence: number;
  errorTypes: string[];
}

// Code Tracing Types
export interface ExecutionStep {
  lineNumber: number;
  variables: Record<string, any>;
  output?: string;
  callStack: string[];
  description: string;
  stepNumber: number;
}

export interface TracingRequest {
  code: string;
  language: string;
  input?: string;
}

// WebSocket Event Types
export interface SocketEvents {
  'execution:started': { requestId: string };
  'execution:progress': { requestId: string; stage: string };
  'execution:completed': { requestId: string; result: any };
  'analysis:started': { attemptId: string };
  'analysis:completed': { attemptId: string; analysis: CodeAnalysisResponse };
  'progress:updated': { userId: string; progress: any };
  'achievement:unlocked': { userId: string; achievement: any };
}

// Dashboard Types
export interface UserStats {
  problemsSolved: number;
  totalProblems: number;
  successRate: number;
  currentStreak: number;
  totalTimeSpent: number;
}

export interface ActivityItem {
  id: string;
  type: 'problem_attempt';
  title: string;
  status: SubmissionStatus;
  difficulty: DifficultyLevel;
  timestamp: Date;
  details: {
    language: string;
    testCasesPassed: number;
    totalTestCases: number;
    attemptNumber: number;
  };
}

// Tutorial Progress Types
export interface TutorialProgressDetails {
  id: string;
  userId: string;
  tutorialId: string;
  status: ProgressStatus;
  progressPercentage: number;
  startedAt: Date;
  completedAt?: Date;
  lastAccessedAt: Date;
  problemProgress?: ProblemProgressItem[];
}

export interface ProblemProgressItem {
  problemId: string;
  solved: boolean;
  attempts: number;
  lastAttempt?: Date;
}

// Form Types
export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  email: string;
  username: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface SubmissionFormData {
  problemId: string;
  code: string;
  language: string;
}

// Supported Languages
export type SupportedLanguage = 'python' | 'javascript';

export const SUPPORTED_LANGUAGES: SupportedLanguage[] = ['python', 'javascript'];

// Filter Types
export interface ProblemFilters {
  search?: string;
  difficulty?: DifficultyLevel;
  status?: 'SOLVED' | 'ATTEMPTED' | 'NOT_ATTEMPTED';
  limit?: number;
  offset?: number;
}

export interface TutorialFilters {
  difficulty?: DifficultyLevel;
  status?: 'COMPLETED' | 'IN_PROGRESS' | 'NOT_STARTED';
  limit?: number;
  offset?: number;
}