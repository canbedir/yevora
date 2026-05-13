-- AlterTable
ALTER TABLE "PomodoroSession"
ADD COLUMN "repositoryName" TEXT,
ADD COLUMN "repositoryUrl" TEXT,
ADD COLUMN "commitCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "outputSummary" TEXT;
