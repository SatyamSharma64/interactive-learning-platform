/*
  Warnings:

  - You are about to drop the column `aiFeedback` on the `user_problem_attempts` table. All the data in the column will be lost.
  - You are about to drop the column `attemptNumber` on the `user_problem_attempts` table. All the data in the column will be lost.
  - Added the required column `attempt_number` to the `user_problem_attempts` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."user_problem_attempts" DROP COLUMN "aiFeedback",
DROP COLUMN "attemptNumber",
ADD COLUMN     "ai_feedback" TEXT,
ADD COLUMN     "attempt_number" INTEGER NOT NULL;
