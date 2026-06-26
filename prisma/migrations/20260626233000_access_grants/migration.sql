CREATE TYPE "AccessGrantStatus" AS ENUM (
  'PENDING',
  'ACCEPTED',
  'REVOKED',
  'EXPIRED'
);

CREATE TYPE "AccessGrantSource" AS ENUM (
  'ADMIN',
  'PROFESSIONAL',
  'HOTMART',
  'STRIPE',
  'ASAAS',
  'MERCADO_PAGO',
  'SYSTEM'
);

CREATE TABLE "access_grants" (
  "id" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "phone" TEXT,
  "cpf" TEXT,
  "source" "AccessGrantSource" NOT NULL,
  "status" "AccessGrantStatus" NOT NULL DEFAULT 'PENDING',
  "external_reference" TEXT,
  "created_by_id" TEXT,
  "user_id" TEXT NOT NULL,
  "expires_at" TIMESTAMP(3),
  "consumed_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "access_grants_pkey"
  PRIMARY KEY ("id")
);

CREATE INDEX "access_grants_email_status_idx"
ON "access_grants"("email", "status");

CREATE INDEX "access_grants_user_id_status_idx"
ON "access_grants"("user_id", "status");

CREATE INDEX "access_grants_created_by_id_idx"
ON "access_grants"("created_by_id");

CREATE INDEX "access_grants_external_reference_idx"
ON "access_grants"("external_reference");

ALTER TABLE "access_grants"
ADD CONSTRAINT "access_grants_user_id_fkey"
FOREIGN KEY ("user_id")
REFERENCES "users"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;

ALTER TABLE "access_grants"
ADD CONSTRAINT "access_grants_created_by_id_fkey"
FOREIGN KEY ("created_by_id")
REFERENCES "users"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;