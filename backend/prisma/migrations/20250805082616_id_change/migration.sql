/*
  Warnings:

  - The primary key for the `audit_logs` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `certificate_types` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `challenge_technologies` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `challenges` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `companies` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `contest_problems` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `contest_submissions` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `contests` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `examples` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `hiring_process_skills` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `hiring_processes` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `methods` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `problem_suggestions` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `problems` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `solutions` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `technologies` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `topics` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `tutorial_technologies` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `tutorials` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `user_applications` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `user_certificates` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `user_challenge_submissions` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `user_contest_participation` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `user_problem_attempts` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `user_sessions` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `user_topic_progress` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `user_tutorial_progress` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `users` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[topic_id,order_index]` on the table `problems` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `order_index` to the `problems` table without a default value. This is not possible if the table is not empty.
  - Added the required column `attemptNumber` to the `user_problem_attempts` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."audit_logs" DROP CONSTRAINT "audit_logs_user_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."challenge_technologies" DROP CONSTRAINT "challenge_technologies_challenge_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."challenge_technologies" DROP CONSTRAINT "challenge_technologies_technology_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."challenges" DROP CONSTRAINT "challenges_created_by_fkey";

-- DropForeignKey
ALTER TABLE "public"."contest_problems" DROP CONSTRAINT "contest_problems_contest_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."contest_problems" DROP CONSTRAINT "contest_problems_problem_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."contest_submissions" DROP CONSTRAINT "contest_submissions_participation_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."contest_submissions" DROP CONSTRAINT "contest_submissions_problem_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."contests" DROP CONSTRAINT "contests_created_by_fkey";

-- DropForeignKey
ALTER TABLE "public"."examples" DROP CONSTRAINT "examples_method_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."hiring_process_skills" DROP CONSTRAINT "hiring_process_skills_hiring_process_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."hiring_process_skills" DROP CONSTRAINT "hiring_process_skills_technology_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."hiring_processes" DROP CONSTRAINT "hiring_processes_company_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."methods" DROP CONSTRAINT "methods_topic_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."problem_suggestions" DROP CONSTRAINT "problem_suggestions_problem_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."problems" DROP CONSTRAINT "problems_created_by_fkey";

-- DropForeignKey
ALTER TABLE "public"."problems" DROP CONSTRAINT "problems_topic_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."solutions" DROP CONSTRAINT "solutions_created_by_fkey";

-- DropForeignKey
ALTER TABLE "public"."solutions" DROP CONSTRAINT "solutions_problem_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."topics" DROP CONSTRAINT "topics_tutorial_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."tutorial_technologies" DROP CONSTRAINT "tutorial_technologies_technology_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."tutorial_technologies" DROP CONSTRAINT "tutorial_technologies_tutorial_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."tutorials" DROP CONSTRAINT "tutorials_created_by_fkey";

-- DropForeignKey
ALTER TABLE "public"."user_applications" DROP CONSTRAINT "user_applications_hiring_process_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."user_applications" DROP CONSTRAINT "user_applications_user_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."user_certificates" DROP CONSTRAINT "user_certificates_certificate_type_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."user_certificates" DROP CONSTRAINT "user_certificates_user_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."user_challenge_submissions" DROP CONSTRAINT "user_challenge_submissions_challenge_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."user_challenge_submissions" DROP CONSTRAINT "user_challenge_submissions_reviewed_by_fkey";

-- DropForeignKey
ALTER TABLE "public"."user_challenge_submissions" DROP CONSTRAINT "user_challenge_submissions_user_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."user_contest_participation" DROP CONSTRAINT "user_contest_participation_contest_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."user_contest_participation" DROP CONSTRAINT "user_contest_participation_user_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."user_problem_attempts" DROP CONSTRAINT "user_problem_attempts_problem_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."user_problem_attempts" DROP CONSTRAINT "user_problem_attempts_user_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."user_sessions" DROP CONSTRAINT "user_sessions_user_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."user_topic_progress" DROP CONSTRAINT "user_topic_progress_topic_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."user_topic_progress" DROP CONSTRAINT "user_topic_progress_user_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."user_tutorial_progress" DROP CONSTRAINT "user_tutorial_progress_tutorial_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."user_tutorial_progress" DROP CONSTRAINT "user_tutorial_progress_user_id_fkey";

-- AlterTable
ALTER TABLE "public"."audit_logs" DROP CONSTRAINT "audit_logs_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "user_id" SET DATA TYPE TEXT,
ALTER COLUMN "entity_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "audit_logs_id_seq";

-- AlterTable
ALTER TABLE "public"."certificate_types" DROP CONSTRAINT "certificate_types_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "certificate_types_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "certificate_types_id_seq";

-- AlterTable
ALTER TABLE "public"."challenge_technologies" DROP CONSTRAINT "challenge_technologies_pkey",
ALTER COLUMN "challenge_id" SET DATA TYPE TEXT,
ALTER COLUMN "technology_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "challenge_technologies_pkey" PRIMARY KEY ("challenge_id", "technology_id");

-- AlterTable
ALTER TABLE "public"."challenges" DROP CONSTRAINT "challenges_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "created_by" SET DATA TYPE TEXT,
ADD CONSTRAINT "challenges_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "challenges_id_seq";

-- AlterTable
ALTER TABLE "public"."companies" DROP CONSTRAINT "companies_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "companies_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "companies_id_seq";

-- AlterTable
ALTER TABLE "public"."contest_problems" DROP CONSTRAINT "contest_problems_pkey",
ALTER COLUMN "contest_id" SET DATA TYPE TEXT,
ALTER COLUMN "problem_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "contest_problems_pkey" PRIMARY KEY ("contest_id", "problem_id");

-- AlterTable
ALTER TABLE "public"."contest_submissions" DROP CONSTRAINT "contest_submissions_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "participation_id" SET DATA TYPE TEXT,
ALTER COLUMN "problem_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "contest_submissions_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "contest_submissions_id_seq";

-- AlterTable
ALTER TABLE "public"."contests" DROP CONSTRAINT "contests_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "created_by" SET DATA TYPE TEXT,
ADD CONSTRAINT "contests_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "contests_id_seq";

-- AlterTable
ALTER TABLE "public"."examples" DROP CONSTRAINT "examples_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "method_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "examples_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "examples_id_seq";

-- AlterTable
ALTER TABLE "public"."hiring_process_skills" DROP CONSTRAINT "hiring_process_skills_pkey",
ALTER COLUMN "hiring_process_id" SET DATA TYPE TEXT,
ALTER COLUMN "technology_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "hiring_process_skills_pkey" PRIMARY KEY ("hiring_process_id", "technology_id");

-- AlterTable
ALTER TABLE "public"."hiring_processes" DROP CONSTRAINT "hiring_processes_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "company_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "hiring_processes_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "hiring_processes_id_seq";

-- AlterTable
ALTER TABLE "public"."methods" DROP CONSTRAINT "methods_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "topic_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "methods_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "methods_id_seq";

-- AlterTable
ALTER TABLE "public"."problem_suggestions" DROP CONSTRAINT "problem_suggestions_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "problem_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "problem_suggestions_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "problem_suggestions_id_seq";

-- AlterTable
ALTER TABLE "public"."problems" DROP CONSTRAINT "problems_pkey",
ADD COLUMN     "order_index" INTEGER NOT NULL,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "topic_id" SET DATA TYPE TEXT,
ALTER COLUMN "created_by" SET DATA TYPE TEXT,
ADD CONSTRAINT "problems_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "problems_id_seq";

-- AlterTable
ALTER TABLE "public"."solutions" DROP CONSTRAINT "solutions_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "problem_id" SET DATA TYPE TEXT,
ALTER COLUMN "created_by" SET DATA TYPE TEXT,
ADD CONSTRAINT "solutions_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "solutions_id_seq";

-- AlterTable
ALTER TABLE "public"."technologies" DROP CONSTRAINT "technologies_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "technologies_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "technologies_id_seq";

-- AlterTable
ALTER TABLE "public"."topics" DROP CONSTRAINT "topics_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "tutorial_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "topics_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "topics_id_seq";

-- AlterTable
ALTER TABLE "public"."tutorial_technologies" DROP CONSTRAINT "tutorial_technologies_pkey",
ALTER COLUMN "tutorial_id" SET DATA TYPE TEXT,
ALTER COLUMN "technology_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "tutorial_technologies_pkey" PRIMARY KEY ("tutorial_id", "technology_id");

-- AlterTable
ALTER TABLE "public"."tutorials" DROP CONSTRAINT "tutorials_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "created_by" SET DATA TYPE TEXT,
ADD CONSTRAINT "tutorials_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "tutorials_id_seq";

-- AlterTable
ALTER TABLE "public"."user_applications" DROP CONSTRAINT "user_applications_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "user_id" SET DATA TYPE TEXT,
ALTER COLUMN "hiring_process_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "user_applications_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "user_applications_id_seq";

-- AlterTable
ALTER TABLE "public"."user_certificates" DROP CONSTRAINT "user_certificates_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "user_id" SET DATA TYPE TEXT,
ALTER COLUMN "certificate_type_id" SET DATA TYPE TEXT,
ALTER COLUMN "reference_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "user_certificates_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "user_certificates_id_seq";

-- AlterTable
ALTER TABLE "public"."user_challenge_submissions" DROP CONSTRAINT "user_challenge_submissions_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "user_id" SET DATA TYPE TEXT,
ALTER COLUMN "challenge_id" SET DATA TYPE TEXT,
ALTER COLUMN "reviewed_by" SET DATA TYPE TEXT,
ADD CONSTRAINT "user_challenge_submissions_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "user_challenge_submissions_id_seq";

-- AlterTable
ALTER TABLE "public"."user_contest_participation" DROP CONSTRAINT "user_contest_participation_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "user_id" SET DATA TYPE TEXT,
ALTER COLUMN "contest_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "user_contest_participation_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "user_contest_participation_id_seq";

-- AlterTable
ALTER TABLE "public"."user_problem_attempts" DROP CONSTRAINT "user_problem_attempts_pkey",
ADD COLUMN     "attemptNumber" INTEGER NOT NULL,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "user_id" SET DATA TYPE TEXT,
ALTER COLUMN "problem_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "user_problem_attempts_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "user_problem_attempts_id_seq";

-- AlterTable
ALTER TABLE "public"."user_sessions" DROP CONSTRAINT "user_sessions_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "user_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "user_sessions_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "user_sessions_id_seq";

-- AlterTable
ALTER TABLE "public"."user_topic_progress" DROP CONSTRAINT "user_topic_progress_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "user_id" SET DATA TYPE TEXT,
ALTER COLUMN "topic_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "user_topic_progress_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "user_topic_progress_id_seq";

-- AlterTable
ALTER TABLE "public"."user_tutorial_progress" DROP CONSTRAINT "user_tutorial_progress_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "user_id" SET DATA TYPE TEXT,
ALTER COLUMN "tutorial_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "user_tutorial_progress_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "user_tutorial_progress_id_seq";

-- AlterTable
ALTER TABLE "public"."users" DROP CONSTRAINT "users_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "users_id_seq";

-- CreateTable
CREATE TABLE "public"."test_cases" (
    "id" TEXT NOT NULL,
    "problemId" TEXT NOT NULL,
    "input" TEXT NOT NULL,
    "output" TEXT NOT NULL,
    "isHidden" BOOLEAN NOT NULL DEFAULT false,
    "orderIndex" INTEGER NOT NULL,

    CONSTRAINT "test_cases_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "test_cases_problemId_orderIndex_key" ON "public"."test_cases"("problemId", "orderIndex");

-- CreateIndex
CREATE UNIQUE INDEX "problems_topic_id_order_index_key" ON "public"."problems"("topic_id", "order_index");

-- AddForeignKey
ALTER TABLE "public"."tutorials" ADD CONSTRAINT "tutorials_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."tutorial_technologies" ADD CONSTRAINT "tutorial_technologies_tutorial_id_fkey" FOREIGN KEY ("tutorial_id") REFERENCES "public"."tutorials"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."tutorial_technologies" ADD CONSTRAINT "tutorial_technologies_technology_id_fkey" FOREIGN KEY ("technology_id") REFERENCES "public"."technologies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."topics" ADD CONSTRAINT "topics_tutorial_id_fkey" FOREIGN KEY ("tutorial_id") REFERENCES "public"."tutorials"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."methods" ADD CONSTRAINT "methods_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "public"."topics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."examples" ADD CONSTRAINT "examples_method_id_fkey" FOREIGN KEY ("method_id") REFERENCES "public"."methods"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."problems" ADD CONSTRAINT "problems_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "public"."topics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."problems" ADD CONSTRAINT "problems_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."test_cases" ADD CONSTRAINT "test_cases_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "public"."problems"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."problem_suggestions" ADD CONSTRAINT "problem_suggestions_problem_id_fkey" FOREIGN KEY ("problem_id") REFERENCES "public"."problems"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."solutions" ADD CONSTRAINT "solutions_problem_id_fkey" FOREIGN KEY ("problem_id") REFERENCES "public"."problems"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."solutions" ADD CONSTRAINT "solutions_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."challenges" ADD CONSTRAINT "challenges_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."challenge_technologies" ADD CONSTRAINT "challenge_technologies_challenge_id_fkey" FOREIGN KEY ("challenge_id") REFERENCES "public"."challenges"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."challenge_technologies" ADD CONSTRAINT "challenge_technologies_technology_id_fkey" FOREIGN KEY ("technology_id") REFERENCES "public"."technologies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."contests" ADD CONSTRAINT "contests_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."contest_problems" ADD CONSTRAINT "contest_problems_contest_id_fkey" FOREIGN KEY ("contest_id") REFERENCES "public"."contests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."contest_problems" ADD CONSTRAINT "contest_problems_problem_id_fkey" FOREIGN KEY ("problem_id") REFERENCES "public"."problems"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_tutorial_progress" ADD CONSTRAINT "user_tutorial_progress_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_tutorial_progress" ADD CONSTRAINT "user_tutorial_progress_tutorial_id_fkey" FOREIGN KEY ("tutorial_id") REFERENCES "public"."tutorials"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_topic_progress" ADD CONSTRAINT "user_topic_progress_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_topic_progress" ADD CONSTRAINT "user_topic_progress_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "public"."topics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_problem_attempts" ADD CONSTRAINT "user_problem_attempts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_problem_attempts" ADD CONSTRAINT "user_problem_attempts_problem_id_fkey" FOREIGN KEY ("problem_id") REFERENCES "public"."problems"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_challenge_submissions" ADD CONSTRAINT "user_challenge_submissions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_challenge_submissions" ADD CONSTRAINT "user_challenge_submissions_challenge_id_fkey" FOREIGN KEY ("challenge_id") REFERENCES "public"."challenges"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_challenge_submissions" ADD CONSTRAINT "user_challenge_submissions_reviewed_by_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_contest_participation" ADD CONSTRAINT "user_contest_participation_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_contest_participation" ADD CONSTRAINT "user_contest_participation_contest_id_fkey" FOREIGN KEY ("contest_id") REFERENCES "public"."contests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."contest_submissions" ADD CONSTRAINT "contest_submissions_participation_id_fkey" FOREIGN KEY ("participation_id") REFERENCES "public"."user_contest_participation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."contest_submissions" ADD CONSTRAINT "contest_submissions_problem_id_fkey" FOREIGN KEY ("problem_id") REFERENCES "public"."problems"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_certificates" ADD CONSTRAINT "user_certificates_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_certificates" ADD CONSTRAINT "user_certificates_certificate_type_id_fkey" FOREIGN KEY ("certificate_type_id") REFERENCES "public"."certificate_types"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."hiring_processes" ADD CONSTRAINT "hiring_processes_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."hiring_process_skills" ADD CONSTRAINT "hiring_process_skills_hiring_process_id_fkey" FOREIGN KEY ("hiring_process_id") REFERENCES "public"."hiring_processes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."hiring_process_skills" ADD CONSTRAINT "hiring_process_skills_technology_id_fkey" FOREIGN KEY ("technology_id") REFERENCES "public"."technologies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_applications" ADD CONSTRAINT "user_applications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_applications" ADD CONSTRAINT "user_applications_hiring_process_id_fkey" FOREIGN KEY ("hiring_process_id") REFERENCES "public"."hiring_processes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_sessions" ADD CONSTRAINT "user_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."audit_logs" ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
