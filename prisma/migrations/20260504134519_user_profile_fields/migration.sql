-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "passwordHash" TEXT,
    "googleId" TEXT,
    "avatarUrl" TEXT,
    "role" TEXT NOT NULL DEFAULT 'STUDENT',
    "timeZone" TEXT,
    "phone" TEXT,
    "country" TEXT,
    "age" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "emailVerifiedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_User" ("avatarUrl", "createdAt", "email", "emailVerified", "emailVerifiedAt", "googleId", "id", "name", "passwordHash", "role", "updatedAt") SELECT "avatarUrl", "createdAt", "email", "emailVerified", "emailVerifiedAt", "googleId", "id", "name", "passwordHash", "role", "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_googleId_key" ON "User"("googleId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
