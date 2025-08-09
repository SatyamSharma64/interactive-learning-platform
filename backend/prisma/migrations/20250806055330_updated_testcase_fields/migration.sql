/*
  Warnings:

  - You are about to drop the column `isHidden` on the `test_cases` table. All the data in the column will be lost.
  - You are about to drop the column `orderIndex` on the `test_cases` table. All the data in the column will be lost.
  - You are about to drop the column `problemId` on the `test_cases` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[problem_id,order_index]` on the table `test_cases` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `order_index` to the `test_cases` table without a default value. This is not possible if the table is not empty.
  - Added the required column `problem_id` to the `test_cases` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."test_cases" DROP CONSTRAINT "test_cases_problemId_fkey";

-- DropIndex
DROP INDEX "public"."test_cases_problemId_orderIndex_key";

-- AlterTable
ALTER TABLE "public"."test_cases" DROP COLUMN "isHidden",
DROP COLUMN "orderIndex",
DROP COLUMN "problemId",
ADD COLUMN     "is_hidden" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "order_index" INTEGER NOT NULL,
ADD COLUMN     "problem_id" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "test_cases_problem_id_order_index_key" ON "public"."test_cases"("problem_id", "order_index");

-- AddForeignKey
ALTER TABLE "public"."test_cases" ADD CONSTRAINT "test_cases_problem_id_fkey" FOREIGN KEY ("problem_id") REFERENCES "public"."problems"("id") ON DELETE CASCADE ON UPDATE CASCADE;
