-- CreateEnum
CREATE TYPE "public"."SizeCategory" AS ENUM ('startup', 'small', 'medium', 'large', 'enterprise');

-- CreateEnum
CREATE TYPE "public"."TechnologyCategory" AS ENUM ('language', 'framework', 'library', 'tool', 'database', 'other');

-- CreateEnum
CREATE TYPE "public"."DifficultyLevel" AS ENUM ('beginner', 'intermediate', 'advanced');

-- CreateEnum
CREATE TYPE "public"."ProblemDifficulty" AS ENUM ('easy', 'medium', 'hard');

-- CreateEnum
CREATE TYPE "public"."ContestType" AS ENUM ('interview_style', 'open_book', 'speed_coding', 'algorithm_contest');

-- CreateEnum
CREATE TYPE "public"."ProgressStatus" AS ENUM ('not_started', 'in_progress', 'completed');

-- CreateEnum
CREATE TYPE "public"."SubmissionStatus" AS ENUM ('pending', 'accepted', 'wrong_answer', 'time_limit', 'memory_limit', 'runtime_error', 'compile_error');

-- CreateEnum
CREATE TYPE "public"."ChallengeSubmissionStatus" AS ENUM ('submitted', 'under_review', 'approved', 'rejected', 'needs_revision');

-- CreateEnum
CREATE TYPE "public"."CertificateTypeEnum" AS ENUM ('tutorial_completion', 'challenge_completion', 'contest_achievement', 'skill_milestone');

-- CreateEnum
CREATE TYPE "public"."ReferenceType" AS ENUM ('tutorial', 'challenge', 'contest', 'skill');

-- CreateEnum
CREATE TYPE "public"."JobType" AS ENUM ('internship', 'entry_level', 'mid_level', 'senior_level');

-- CreateEnum
CREATE TYPE "public"."ProficiencyLevel" AS ENUM ('basic', 'intermediate', 'advanced', 'expert');

-- CreateEnum
CREATE TYPE "public"."ApplicationStatus" AS ENUM ('applied', 'under_review', 'interview_scheduled', 'accepted', 'rejected', 'withdrawn');

-- CreateTable
CREATE TABLE "public"."users" (
    "id" BIGSERIAL NOT NULL,
    "username" VARCHAR(50) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "first_name" VARCHAR(100),
    "last_name" VARCHAR(100),
    "profile_image_url" VARCHAR(500),
    "bio" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_login_at" TIMESTAMP(3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "email_verified" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."companies" (
    "id" BIGSERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "website_url" VARCHAR(500),
    "logo_url" VARCHAR(500),
    "industry" VARCHAR(100),
    "size_category" "public"."SizeCategory",
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."technologies" (
    "id" BIGSERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "category" "public"."TechnologyCategory",
    "logo_url" VARCHAR(500),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "technologies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."tutorials" (
    "id" BIGSERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "difficulty_level" "public"."DifficultyLevel",
    "estimated_duration_hours" INTEGER,
    "thumbnail_url" VARCHAR(500),
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" BIGINT,

    CONSTRAINT "tutorials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."tutorial_technologies" (
    "tutorial_id" BIGINT NOT NULL,
    "technology_id" BIGINT NOT NULL,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "tutorial_technologies_pkey" PRIMARY KEY ("tutorial_id","technology_id")
);

-- CreateTable
CREATE TABLE "public"."topics" (
    "id" BIGSERIAL NOT NULL,
    "tutorial_id" BIGINT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "order_index" INTEGER NOT NULL,
    "estimated_duration_minutes" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "topics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."methods" (
    "id" BIGSERIAL NOT NULL,
    "topic_id" BIGINT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "syntax_pattern" VARCHAR(500),
    "complexity_note" TEXT,
    "order_index" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "methods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."examples" (
    "id" BIGSERIAL NOT NULL,
    "method_id" BIGINT NOT NULL,
    "title" VARCHAR(255),
    "code_snippet" TEXT NOT NULL,
    "explanation" TEXT,
    "language" VARCHAR(50) NOT NULL,
    "order_index" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "examples_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."problems" (
    "id" BIGSERIAL NOT NULL,
    "topic_id" BIGINT NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL,
    "difficulty_level" "public"."ProblemDifficulty",
    "time_limit_minutes" INTEGER,
    "memory_limit_mb" INTEGER,
    "sample_input" TEXT,
    "sample_output" TEXT,
    "constraints" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" BIGINT,

    CONSTRAINT "problems_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."problem_suggestions" (
    "id" BIGSERIAL NOT NULL,
    "problem_id" BIGINT NOT NULL,
    "suggestion_text" TEXT NOT NULL,
    "order_index" INTEGER NOT NULL,
    "reveal_after_attempts" INTEGER NOT NULL DEFAULT 3,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "problem_suggestions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."solutions" (
    "id" BIGSERIAL NOT NULL,
    "problem_id" BIGINT NOT NULL,
    "title" VARCHAR(255),
    "code" TEXT NOT NULL,
    "explanation" TEXT,
    "language" VARCHAR(50) NOT NULL,
    "time_complexity" VARCHAR(100),
    "space_complexity" VARCHAR(100),
    "is_optimal" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" BIGINT,

    CONSTRAINT "solutions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."challenges" (
    "id" BIGSERIAL NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL,
    "requirements" TEXT,
    "difficulty_level" "public"."DifficultyLevel",
    "estimated_duration_hours" INTEGER,
    "max_attempts" INTEGER,
    "deadline" TIMESTAMP(3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" BIGINT,

    CONSTRAINT "challenges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."challenge_technologies" (
    "challenge_id" BIGINT NOT NULL,
    "technology_id" BIGINT NOT NULL,
    "is_required" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "challenge_technologies_pkey" PRIMARY KEY ("challenge_id","technology_id")
);

-- CreateTable
CREATE TABLE "public"."contests" (
    "id" BIGSERIAL NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "contest_type" "public"."ContestType",
    "start_time" TIMESTAMP(3) NOT NULL,
    "end_time" TIMESTAMP(3) NOT NULL,
    "max_participants" INTEGER,
    "is_public" BOOLEAN NOT NULL DEFAULT true,
    "registration_deadline" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" BIGINT,

    CONSTRAINT "contests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."contest_problems" (
    "contest_id" BIGINT NOT NULL,
    "problem_id" BIGINT NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 100,
    "order_index" INTEGER NOT NULL,

    CONSTRAINT "contest_problems_pkey" PRIMARY KEY ("contest_id","problem_id")
);

-- CreateTable
CREATE TABLE "public"."user_tutorial_progress" (
    "id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "tutorial_id" BIGINT NOT NULL,
    "status" "public"."ProgressStatus" NOT NULL DEFAULT 'not_started',
    "progress_percentage" DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),
    "last_accessed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_tutorial_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user_topic_progress" (
    "id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "topic_id" BIGINT NOT NULL,
    "status" "public"."ProgressStatus" NOT NULL DEFAULT 'not_started',
    "completed_at" TIMESTAMP(3),
    "time_spent_minutes" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "user_topic_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user_problem_attempts" (
    "id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "problem_id" BIGINT NOT NULL,
    "code_submission" TEXT,
    "language" VARCHAR(50),
    "status" "public"."SubmissionStatus",
    "execution_time_ms" INTEGER,
    "memory_used_mb" DECIMAL(8,2),
    "test_cases_passed" INTEGER NOT NULL DEFAULT 0,
    "total_test_cases" INTEGER NOT NULL DEFAULT 0,
    "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_problem_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user_challenge_submissions" (
    "id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "challenge_id" BIGINT NOT NULL,
    "submission_url" VARCHAR(500),
    "description" TEXT,
    "status" "public"."ChallengeSubmissionStatus",
    "score" DECIMAL(5,2),
    "feedback" TEXT,
    "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewed_at" TIMESTAMP(3),
    "reviewed_by" BIGINT,

    CONSTRAINT "user_challenge_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user_contest_participation" (
    "id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "contest_id" BIGINT NOT NULL,
    "registered_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "started_at" TIMESTAMP(3),
    "finished_at" TIMESTAMP(3),
    "total_score" INTEGER NOT NULL DEFAULT 0,
    "final_rank" INTEGER,
    "problems_solved" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "user_contest_participation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."contest_submissions" (
    "id" BIGSERIAL NOT NULL,
    "participation_id" BIGINT NOT NULL,
    "problem_id" BIGINT NOT NULL,
    "code_submission" TEXT NOT NULL,
    "language" VARCHAR(50) NOT NULL,
    "status" "public"."SubmissionStatus",
    "score" INTEGER NOT NULL DEFAULT 0,
    "execution_time_ms" INTEGER,
    "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contest_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."certificate_types" (
    "id" BIGSERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "certificate_type" "public"."CertificateTypeEnum" NOT NULL,
    "template_url" VARCHAR(500),
    "requirements_json" JSONB,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "certificate_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user_certificates" (
    "id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "certificate_type_id" BIGINT NOT NULL,
    "reference_id" BIGINT,
    "reference_type" "public"."ReferenceType",
    "certificate_url" VARCHAR(500),
    "verification_code" VARCHAR(100) NOT NULL,
    "issued_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3),

    CONSTRAINT "user_certificates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."hiring_processes" (
    "id" BIGSERIAL NOT NULL,
    "company_id" BIGINT NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "requirements" TEXT,
    "job_type" "public"."JobType",
    "location" VARCHAR(255),
    "is_remote" BOOLEAN NOT NULL DEFAULT false,
    "salary_range_min" INTEGER,
    "salary_range_max" INTEGER,
    "currency" VARCHAR(3) NOT NULL DEFAULT 'USD',
    "application_deadline" TIMESTAMP(3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hiring_processes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."hiring_process_skills" (
    "hiring_process_id" BIGINT NOT NULL,
    "technology_id" BIGINT NOT NULL,
    "proficiency_level" "public"."ProficiencyLevel",
    "is_required" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "hiring_process_skills_pkey" PRIMARY KEY ("hiring_process_id","technology_id")
);

-- CreateTable
CREATE TABLE "public"."user_applications" (
    "id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "hiring_process_id" BIGINT NOT NULL,
    "status" "public"."ApplicationStatus",
    "cover_letter" TEXT,
    "resume_url" VARCHAR(500),
    "applied_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user_sessions" (
    "id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "session_token" VARCHAR(255) NOT NULL,
    "ip_address" VARCHAR(45),
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "user_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."audit_logs" (
    "id" BIGSERIAL NOT NULL,
    "user_id" BIGINT,
    "action" VARCHAR(100) NOT NULL,
    "entity_type" VARCHAR(50),
    "entity_id" BIGINT,
    "old_values" JSONB,
    "new_values" JSONB,
    "ip_address" VARCHAR(45),
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "public"."users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE INDEX "users_username_idx" ON "public"."users"("username");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "public"."users"("email");

-- CreateIndex
CREATE INDEX "users_created_at_idx" ON "public"."users"("created_at");

-- CreateIndex
CREATE INDEX "companies_name_idx" ON "public"."companies"("name");

-- CreateIndex
CREATE INDEX "companies_industry_idx" ON "public"."companies"("industry");

-- CreateIndex
CREATE UNIQUE INDEX "technologies_name_key" ON "public"."technologies"("name");

-- CreateIndex
CREATE INDEX "technologies_name_idx" ON "public"."technologies"("name");

-- CreateIndex
CREATE INDEX "technologies_category_idx" ON "public"."technologies"("category");

-- CreateIndex
CREATE INDEX "tutorials_name_idx" ON "public"."tutorials"("name");

-- CreateIndex
CREATE INDEX "tutorials_difficulty_level_idx" ON "public"."tutorials"("difficulty_level");

-- CreateIndex
CREATE INDEX "tutorials_is_published_idx" ON "public"."tutorials"("is_published");

-- CreateIndex
CREATE INDEX "topics_tutorial_id_order_index_idx" ON "public"."topics"("tutorial_id", "order_index");

-- CreateIndex
CREATE UNIQUE INDEX "topics_tutorial_id_order_index_key" ON "public"."topics"("tutorial_id", "order_index");

-- CreateIndex
CREATE INDEX "methods_topic_id_order_index_idx" ON "public"."methods"("topic_id", "order_index");

-- CreateIndex
CREATE UNIQUE INDEX "methods_topic_id_order_index_key" ON "public"."methods"("topic_id", "order_index");

-- CreateIndex
CREATE INDEX "examples_method_id_language_idx" ON "public"."examples"("method_id", "language");

-- CreateIndex
CREATE UNIQUE INDEX "examples_method_id_order_index_key" ON "public"."examples"("method_id", "order_index");

-- CreateIndex
CREATE INDEX "problems_topic_id_difficulty_level_idx" ON "public"."problems"("topic_id", "difficulty_level");

-- CreateIndex
CREATE INDEX "problems_difficulty_level_idx" ON "public"."problems"("difficulty_level");

-- CreateIndex
CREATE UNIQUE INDEX "problem_suggestions_problem_id_order_index_key" ON "public"."problem_suggestions"("problem_id", "order_index");

-- CreateIndex
CREATE INDEX "solutions_problem_id_language_idx" ON "public"."solutions"("problem_id", "language");

-- CreateIndex
CREATE INDEX "challenges_difficulty_level_is_active_idx" ON "public"."challenges"("difficulty_level", "is_active");

-- CreateIndex
CREATE INDEX "challenges_deadline_idx" ON "public"."challenges"("deadline");

-- CreateIndex
CREATE INDEX "contests_start_time_idx" ON "public"."contests"("start_time");

-- CreateIndex
CREATE INDEX "contests_contest_type_idx" ON "public"."contests"("contest_type");

-- CreateIndex
CREATE INDEX "contests_is_public_idx" ON "public"."contests"("is_public");

-- CreateIndex
CREATE UNIQUE INDEX "contest_problems_contest_id_order_index_key" ON "public"."contest_problems"("contest_id", "order_index");

-- CreateIndex
CREATE INDEX "user_tutorial_progress_user_id_status_idx" ON "public"."user_tutorial_progress"("user_id", "status");

-- CreateIndex
CREATE INDEX "user_tutorial_progress_progress_percentage_idx" ON "public"."user_tutorial_progress"("progress_percentage");

-- CreateIndex
CREATE INDEX "user_tutorial_progress_user_id_status_last_accessed_at_idx" ON "public"."user_tutorial_progress"("user_id", "status", "last_accessed_at");

-- CreateIndex
CREATE UNIQUE INDEX "user_tutorial_progress_user_id_tutorial_id_key" ON "public"."user_tutorial_progress"("user_id", "tutorial_id");

-- CreateIndex
CREATE INDEX "user_topic_progress_user_id_status_idx" ON "public"."user_topic_progress"("user_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "user_topic_progress_user_id_topic_id_key" ON "public"."user_topic_progress"("user_id", "topic_id");

-- CreateIndex
CREATE INDEX "user_problem_attempts_user_id_problem_id_idx" ON "public"."user_problem_attempts"("user_id", "problem_id");

-- CreateIndex
CREATE INDEX "user_problem_attempts_status_idx" ON "public"."user_problem_attempts"("status");

-- CreateIndex
CREATE INDEX "user_problem_attempts_submitted_at_idx" ON "public"."user_problem_attempts"("submitted_at");

-- CreateIndex
CREATE INDEX "user_challenge_submissions_status_idx" ON "public"."user_challenge_submissions"("status");

-- CreateIndex
CREATE INDEX "user_challenge_submissions_score_idx" ON "public"."user_challenge_submissions"("score" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "user_challenge_submissions_user_id_challenge_id_key" ON "public"."user_challenge_submissions"("user_id", "challenge_id");

-- CreateIndex
CREATE INDEX "user_contest_participation_contest_id_final_rank_idx" ON "public"."user_contest_participation"("contest_id", "final_rank");

-- CreateIndex
CREATE INDEX "user_contest_participation_user_id_total_score_idx" ON "public"."user_contest_participation"("user_id", "total_score" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "user_contest_participation_user_id_contest_id_key" ON "public"."user_contest_participation"("user_id", "contest_id");

-- CreateIndex
CREATE INDEX "contest_submissions_participation_id_problem_id_idx" ON "public"."contest_submissions"("participation_id", "problem_id");

-- CreateIndex
CREATE INDEX "contest_submissions_status_idx" ON "public"."contest_submissions"("status");

-- CreateIndex
CREATE INDEX "certificate_types_certificate_type_is_active_idx" ON "public"."certificate_types"("certificate_type", "is_active");

-- CreateIndex
CREATE UNIQUE INDEX "user_certificates_verification_code_key" ON "public"."user_certificates"("verification_code");

-- CreateIndex
CREATE INDEX "user_certificates_user_id_issued_at_idx" ON "public"."user_certificates"("user_id", "issued_at" DESC);

-- CreateIndex
CREATE INDEX "user_certificates_verification_code_idx" ON "public"."user_certificates"("verification_code");

-- CreateIndex
CREATE INDEX "user_certificates_reference_type_reference_id_idx" ON "public"."user_certificates"("reference_type", "reference_id");

-- CreateIndex
CREATE INDEX "user_certificates_user_id_reference_type_issued_at_idx" ON "public"."user_certificates"("user_id", "reference_type", "issued_at" DESC);

-- CreateIndex
CREATE INDEX "hiring_processes_company_id_is_active_idx" ON "public"."hiring_processes"("company_id", "is_active");

-- CreateIndex
CREATE INDEX "hiring_processes_job_type_idx" ON "public"."hiring_processes"("job_type");

-- CreateIndex
CREATE INDEX "hiring_processes_application_deadline_idx" ON "public"."hiring_processes"("application_deadline");

-- CreateIndex
CREATE INDEX "hiring_processes_company_id_is_active_application_deadline_idx" ON "public"."hiring_processes"("company_id", "is_active", "application_deadline" DESC);

-- CreateIndex
CREATE INDEX "user_applications_status_idx" ON "public"."user_applications"("status");

-- CreateIndex
CREATE INDEX "user_applications_applied_at_idx" ON "public"."user_applications"("applied_at" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "user_applications_user_id_hiring_process_id_key" ON "public"."user_applications"("user_id", "hiring_process_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_sessions_session_token_key" ON "public"."user_sessions"("session_token");

-- CreateIndex
CREATE INDEX "user_sessions_session_token_idx" ON "public"."user_sessions"("session_token");

-- CreateIndex
CREATE INDEX "user_sessions_user_id_is_active_idx" ON "public"."user_sessions"("user_id", "is_active");

-- CreateIndex
CREATE INDEX "user_sessions_expires_at_idx" ON "public"."user_sessions"("expires_at");

-- CreateIndex
CREATE INDEX "audit_logs_user_id_action_idx" ON "public"."audit_logs"("user_id", "action");

-- CreateIndex
CREATE INDEX "audit_logs_entity_type_entity_id_idx" ON "public"."audit_logs"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "audit_logs_created_at_idx" ON "public"."audit_logs"("created_at");

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
