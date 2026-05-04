/*
  Warnings:

  - A unique constraint covering the columns `[lsOrderId]` on the table `Enrollment` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "CourseVariant" ADD COLUMN "lsVariantId" TEXT;

-- AlterTable
ALTER TABLE "Enrollment" ADD COLUMN "amountCents" INTEGER;
ALTER TABLE "Enrollment" ADD COLUMN "currency" TEXT;
ALTER TABLE "Enrollment" ADD COLUMN "lsCustomerId" TEXT;
ALTER TABLE "Enrollment" ADD COLUMN "lsOrderId" TEXT;
ALTER TABLE "Enrollment" ADD COLUMN "paidAt" DATETIME;
ALTER TABLE "Enrollment" ADD COLUMN "paymentStatus" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Enrollment_lsOrderId_key" ON "Enrollment"("lsOrderId");
