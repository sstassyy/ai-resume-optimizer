/*
  Warnings:

  - Added the required column `categoryScoresJson` to the `Analysis` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Vacancy" ADD COLUMN "sourceUrl" TEXT;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Analysis" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "resumeId" TEXT NOT NULL,
    "vacancyId" TEXT NOT NULL,
    "matchPercent" INTEGER NOT NULL,
    "categoryScoresJson" TEXT NOT NULL,
    "matchedSkillsJson" TEXT NOT NULL,
    "missingSkillsJson" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Analysis_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "Resume" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Analysis_vacancyId_fkey" FOREIGN KEY ("vacancyId") REFERENCES "Vacancy" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Analysis" ("createdAt", "id", "matchPercent", "matchedSkillsJson", "missingSkillsJson", "resumeId", "vacancyId") SELECT "createdAt", "id", "matchPercent", "matchedSkillsJson", "missingSkillsJson", "resumeId", "vacancyId" FROM "Analysis";
DROP TABLE "Analysis";
ALTER TABLE "new_Analysis" RENAME TO "Analysis";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
