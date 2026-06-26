CREATE TYPE "OnboardingStage" AS ENUM (
  'ACCESS_GRANTED',
  'BASIC_PROFILE_PENDING',
  'CLINICAL_PROFILE_PENDING',
  'READY_FOR_REVIEW',
  'PLAN_IN_PROGRESS',
  'ACTIVE_CARE',
  'SUSPENDED'
);

ALTER TABLE "users"
ALTER COLUMN "cpf" DROP NOT NULL;

ALTER TABLE "users"
ADD COLUMN "onboarding_stage" "OnboardingStage"
NOT NULL DEFAULT 'BASIC_PROFILE_PENDING';

ALTER TABLE "users"
ADD COLUMN "primary_goal" TEXT;

ALTER TABLE "users"
ADD COLUMN "restriction_summary" TEXT;

ALTER TABLE "users"
ADD COLUMN "country_code" TEXT
NOT NULL DEFAULT 'BR';

ALTER TABLE "users"
ADD COLUMN "locale" TEXT
NOT NULL DEFAULT 'pt-BR';

ALTER TABLE "users"
ADD COLUMN "timezone" TEXT
NOT NULL DEFAULT 'America/Sao_Paulo';

ALTER TABLE "users"
ADD COLUMN "terms_accepted_at" TIMESTAMP(3);

ALTER TABLE "users"
ADD COLUMN "privacy_accepted_at" TIMESTAMP(3);

UPDATE "users"
SET "onboarding_stage" =
  CASE
    WHEN "is_onboarding_done" = true
      THEN 'CLINICAL_PROFILE_PENDING'::"OnboardingStage"
    ELSE 'BASIC_PROFILE_PENDING'::"OnboardingStage"
  END;