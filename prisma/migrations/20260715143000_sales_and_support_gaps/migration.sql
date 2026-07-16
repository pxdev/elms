ALTER TABLE "Course" ADD COLUMN "outcomes" TEXT;
ALTER TABLE "Course" ADD COLUMN "prerequisites" TEXT;
ALTER TABLE "Course" ADD COLUMN "targetAudience" TEXT;
ALTER TABLE "Course" ADD COLUMN "refundPolicy" TEXT;

ALTER TABLE "Enrollment" ADD COLUMN "receiptUrl" TEXT;
ALTER TABLE "Enrollment" ADD COLUMN "refundedAt" DATETIME;

CREATE TABLE "SupportRequest" (
  "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  "userId" INTEGER NOT NULL,
  "enrollmentId" INTEGER,
  "subject" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'OPEN',
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL,
  CONSTRAINT "SupportRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "SupportRequest_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "Enrollment" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE INDEX "SupportRequest_userId_status_idx" ON "SupportRequest"("userId", "status");
CREATE INDEX "SupportRequest_enrollmentId_idx" ON "SupportRequest"("enrollmentId");
