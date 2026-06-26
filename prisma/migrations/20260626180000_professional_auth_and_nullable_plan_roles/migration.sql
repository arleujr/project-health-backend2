CREATE TABLE IF NOT EXISTS "login_otps" (
  "id" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "code_hash" TEXT NOT NULL,
  "attempts" INTEGER NOT NULL DEFAULT 0,
  "expires_at" TIMESTAMP(3) NOT NULL,
  "consumed_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "login_otps_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "login_otps_email_created_at_idx" ON "login_otps"("email", "created_at");
CREATE INDEX IF NOT EXISTS "login_otps_expires_at_idx" ON "login_otps"("expires_at");
ALTER TABLE "plans" ALTER COLUMN "nutri_id" DROP NOT NULL;
ALTER TABLE "plans" ALTER COLUMN "efi_id" DROP NOT NULL;
