-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'CLIENT', 'NUTRI', 'EFI', 'ASSISTANT');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'CANCELED', 'PAST_DUE');

-- CreateEnum
CREATE TYPE "PlanTier" AS ENUM ('LIGHT', 'PLUS', 'PREMIUM');

-- CreateEnum
CREATE TYPE "BillingPeriod" AS ENUM ('MONTHLY', 'ANNUAL');

-- CreateEnum
CREATE TYPE "PlanStatus" AS ENUM ('DRAFT', 'ACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "InsightType" AS ENUM ('CHURN_RISK', 'METABOLIC_PLATEAU', 'OVERTRAINING_ALERT', 'HIGH_PURCHASE_INTENT');

-- CreateEnum
CREATE TYPE "InsightConfidence" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "LeadStatus" AS ENUM ('NEW', 'SCREENING', 'CONVERTED', 'LOST');

-- CreateEnum
CREATE TYPE "TicketStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED');

-- CreateEnum
CREATE TYPE "TicketCategory" AS ENUM ('CRITICAL', 'ATTENTION', 'ROUTINE');

-- CreateTable
CREATE TABLE "leads" (
    "id" TEXT NOT NULL,
    "whatsapp_id" TEXT NOT NULL,
    "name" TEXT,
    "phone" TEXT NOT NULL,
    "status" "LeadStatus" NOT NULL DEFAULT 'NEW',
    "screening_answers" JSONB,
    "purchase_score" DOUBLE PRECISION,
    "meta_ad_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "leads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "password" TEXT,
    "phone" TEXT,
    "cpf" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'CLIENT',
    "is_onboarding_done" BOOLEAN NOT NULL DEFAULT false,
    "gateway_customer_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "anamneses" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "medical_record" JSONB NOT NULL,
    "injuries" JSONB NOT NULL,
    "objectives" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "anamneses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscriptions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'PAST_DUE',
    "tier" "PlanTier" NOT NULL DEFAULT 'PLUS',
    "period" "BillingPeriod" NOT NULL DEFAULT 'MONTHLY',
    "renewed_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plans" (
    "id" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "nutri_id" TEXT NOT NULL,
    "efi_id" TEXT NOT NULL,
    "created_by_id" TEXT,
    "updated_by_id" TEXT,
    "status" "PlanStatus" NOT NULL DEFAULT 'DRAFT',
    "activated_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "diets" (
    "id" TEXT NOT NULL,
    "plan_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "daily_macros" JSONB NOT NULL,
    "meals" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "diets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workout_routines" (
    "id" TEXT NOT NULL,
    "plan_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "split_type" TEXT NOT NULL,
    "met_estimated" DOUBLE PRECISION NOT NULL DEFAULT 4.5,
    "exercises" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workout_routines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "biometric_histories" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,
    "height" DOUBLE PRECISION NOT NULL,
    "body_fat_percent" DOUBLE PRECISION,
    "lean_mass_kg" DOUBLE PRECISION,
    "anthropometry" JSONB,
    "evolution_photos" JSONB,
    "measured_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "biometric_histories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "smartwatch_daily_telemetry" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "hrv" INTEGER,
    "rhr" INTEGER,
    "sleep_minutes_total" INTEGER,
    "steps_count" INTEGER NOT NULL DEFAULT 0,
    "active_calories" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "smartwatch_daily_telemetry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workout_execution_logs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "workout_routine_id" TEXT,
    "device_source" TEXT NOT NULL,
    "duration_in_minutes" INTEGER NOT NULL,
    "average_heart_rate" INTEGER,
    "device_calories_burned" DOUBLE PRECISION,
    "met_calculated_calories" DOUBLE PRECISION NOT NULL,
    "raw_data" JSONB NOT NULL,
    "executed_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workout_execution_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "support_tickets" (
    "id" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "agent_id" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "answer" TEXT,
    "category" "TicketCategory" NOT NULL DEFAULT 'ROUTINE',
    "status" "TicketStatus" NOT NULL DEFAULT 'OPEN',
    "sla_expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "support_tickets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ml_predictive_insights" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "insight_type" "InsightType" NOT NULL,
    "risk_score" DOUBLE PRECISION NOT NULL,
    "confidence_level" "InsightConfidence" NOT NULL,
    "recommendation" TEXT NOT NULL,
    "features_used" JSONB NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "generated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3),

    CONSTRAINT "ml_predictive_insights_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "leads_whatsapp_id_key" ON "leads"("whatsapp_id");

-- CreateIndex
CREATE UNIQUE INDEX "leads_phone_key" ON "leads"("phone");

-- CreateIndex
CREATE INDEX "leads_phone_idx" ON "leads"("phone");

-- CreateIndex
CREATE INDEX "leads_purchase_score_idx" ON "leads"("purchase_score");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "users_cpf_key" ON "users"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "users_gateway_customer_id_key" ON "users"("gateway_customer_id");

-- CreateIndex
CREATE UNIQUE INDEX "anamneses_user_id_key" ON "anamneses"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_user_id_key" ON "subscriptions"("user_id");

-- CreateIndex
CREATE INDEX "plans_client_id_status_idx" ON "plans"("client_id", "status");

-- CreateIndex
CREATE INDEX "biometric_histories_user_id_measured_at_idx" ON "biometric_histories"("user_id", "measured_at");

-- CreateIndex
CREATE INDEX "smartwatch_daily_telemetry_user_id_date_idx" ON "smartwatch_daily_telemetry"("user_id", "date");

-- CreateIndex
CREATE UNIQUE INDEX "smartwatch_daily_telemetry_user_id_date_key" ON "smartwatch_daily_telemetry"("user_id", "date");

-- CreateIndex
CREATE INDEX "workout_execution_logs_user_id_executed_at_idx" ON "workout_execution_logs"("user_id", "executed_at");

-- CreateIndex
CREATE INDEX "support_tickets_status_category_idx" ON "support_tickets"("status", "category");

-- CreateIndex
CREATE INDEX "support_tickets_client_id_idx" ON "support_tickets"("client_id");

-- CreateIndex
CREATE INDEX "support_tickets_agent_id_idx" ON "support_tickets"("agent_id");

-- CreateIndex
CREATE INDEX "ml_predictive_insights_user_id_is_active_idx" ON "ml_predictive_insights"("user_id", "is_active");

-- AddForeignKey
ALTER TABLE "anamneses" ADD CONSTRAINT "anamneses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plans" ADD CONSTRAINT "plans_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plans" ADD CONSTRAINT "plans_nutri_id_fkey" FOREIGN KEY ("nutri_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plans" ADD CONSTRAINT "plans_efi_id_fkey" FOREIGN KEY ("efi_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plans" ADD CONSTRAINT "plans_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plans" ADD CONSTRAINT "plans_updated_by_id_fkey" FOREIGN KEY ("updated_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diets" ADD CONSTRAINT "diets_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workout_routines" ADD CONSTRAINT "workout_routines_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "biometric_histories" ADD CONSTRAINT "biometric_histories_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "smartwatch_daily_telemetry" ADD CONSTRAINT "smartwatch_daily_telemetry_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workout_execution_logs" ADD CONSTRAINT "workout_execution_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ml_predictive_insights" ADD CONSTRAINT "ml_predictive_insights_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
