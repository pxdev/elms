-- Bilingual Plan + sortOrder
ALTER TABLE "Plan"
  ADD COLUMN "nameAr" TEXT,
  ADD COLUMN "descriptionAr" TEXT,
  ADD COLUMN "sortOrder" INTEGER NOT NULL DEFAULT 0;

-- Promo code applied at checkout
ALTER TABLE "Order"
  ADD COLUMN "promoCodeId" TEXT;

-- Feature catalog (bilingual labels)
CREATE TABLE "Feature" (
  "id" TEXT NOT NULL,
  "label" TEXT NOT NULL,
  "labelAr" TEXT,
  "notes" TEXT,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "Feature_pkey" PRIMARY KEY ("id")
);

-- Plan ↔ Feature join
CREATE TABLE "PlanFeature" (
  "planId" TEXT NOT NULL,
  "featureId" TEXT NOT NULL,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "PlanFeature_pkey" PRIMARY KEY ("planId", "featureId")
);

CREATE INDEX "PlanFeature_planId_idx" ON "PlanFeature"("planId");
CREATE INDEX "PlanFeature_featureId_idx" ON "PlanFeature"("featureId");

ALTER TABLE "PlanFeature"
  ADD CONSTRAINT "PlanFeature_planId_fkey"
  FOREIGN KEY ("planId") REFERENCES "Plan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "PlanFeature"
  ADD CONSTRAINT "PlanFeature_featureId_fkey"
  FOREIGN KEY ("featureId") REFERENCES "Feature"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Promo codes
CREATE TABLE "PromoCode" (
  "id" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "discountPercent" INTEGER NOT NULL,
  "planId" TEXT,
  "maxUses" INTEGER,
  "currentUses" INTEGER NOT NULL DEFAULT 0,
  "expiresAt" TIMESTAMP(3),
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "PromoCode_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PromoCode_code_key" ON "PromoCode"("code");
CREATE INDEX "PromoCode_code_idx" ON "PromoCode"("code");
CREATE INDEX "PromoCode_planId_idx" ON "PromoCode"("planId");

ALTER TABLE "PromoCode"
  ADD CONSTRAINT "PromoCode_planId_fkey"
  FOREIGN KEY ("planId") REFERENCES "Plan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Order ↔ PromoCode FK + index
CREATE INDEX "Order_promoCodeId_idx" ON "Order"("promoCodeId");

ALTER TABLE "Order"
  ADD CONSTRAINT "Order_promoCodeId_fkey"
  FOREIGN KEY ("promoCodeId") REFERENCES "PromoCode"("id") ON DELETE SET NULL ON UPDATE CASCADE;
