-- Singleton key→value store for integration credentials. Encryption is
-- applied at the application layer (AES-256-GCM, key derived via HKDF
-- from NUXT_SESSION_PASSWORD) for sensitive keys; non-sensitive values
-- (host, port, store id, etc.) are stored as plaintext.
CREATE TABLE "IntegrationSetting" (
  "key" TEXT NOT NULL,
  "value" TEXT NOT NULL,
  "encrypted" BOOLEAN NOT NULL DEFAULT false,
  "updatedById" TEXT,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "IntegrationSetting_pkey" PRIMARY KEY ("key")
);

CREATE INDEX "IntegrationSetting_updatedById_idx" ON "IntegrationSetting"("updatedById");

ALTER TABLE "IntegrationSetting"
  ADD CONSTRAINT "IntegrationSetting_updatedById_fkey"
  FOREIGN KEY ("updatedById") REFERENCES "Account"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
