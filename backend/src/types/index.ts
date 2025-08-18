import type { Prisma } from '@prisma/client';

export type AppUser = Prisma.UserGetPayload<{
  select: {
    id: true;
    email: true;
    username: true;
    firstName: true;
    lastName: true;
  };
}>;


export type AttemptWithProblem = Prisma.UserProblemAttemptGetPayload<{
  include: {
    problem: {
      select: { title: true; difficultyLevel: true };
    };
    language: {
      select: { name: true };
    };
  };
}>;