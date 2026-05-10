-- CreateTable
CREATE TABLE "PromoCode" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "discountPercent" INTEGER NOT NULL,
    "maxUses" INTEGER,
    "usedCount" INTEGER NOT NULL DEFAULT 0,
    "expiresAt" DATETIME,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "courseVariantId" INTEGER,
    "lsDiscountId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PromoCode_courseVariantId_fkey" FOREIGN KEY ("courseVariantId") REFERENCES "CourseVariant" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Enrollment" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "courseVariantId" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "enrolledAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lsOrderId" TEXT,
    "lsCustomerId" TEXT,
    "amountCents" INTEGER,
    "currency" TEXT,
    "paidAt" DATETIME,
    "paymentStatus" TEXT,
    "promoCodeId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Enrollment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Enrollment_courseVariantId_fkey" FOREIGN KEY ("courseVariantId") REFERENCES "CourseVariant" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Enrollment_promoCodeId_fkey" FOREIGN KEY ("promoCodeId") REFERENCES "PromoCode" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Enrollment" ("amountCents", "courseVariantId", "createdAt", "currency", "enrolledAt", "id", "lsCustomerId", "lsOrderId", "paidAt", "paymentStatus", "status", "updatedAt", "userId") SELECT "amountCents", "courseVariantId", "createdAt", "currency", "enrolledAt", "id", "lsCustomerId", "lsOrderId", "paidAt", "paymentStatus", "status", "updatedAt", "userId" FROM "Enrollment";
DROP TABLE "Enrollment";
ALTER TABLE "new_Enrollment" RENAME TO "Enrollment";
CREATE UNIQUE INDEX "Enrollment_lsOrderId_key" ON "Enrollment"("lsOrderId");
CREATE UNIQUE INDEX "Enrollment_userId_courseVariantId_key" ON "Enrollment"("userId", "courseVariantId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "PromoCode_code_key" ON "PromoCode"("code");

-- CreateIndex
CREATE UNIQUE INDEX "PromoCode_lsDiscountId_key" ON "PromoCode"("lsDiscountId");
