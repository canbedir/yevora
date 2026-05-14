-- AlterTable
ALTER TABLE "User" ADD COLUMN "trackedReposInitialized" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "TrackedRepo" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "repoId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TrackedRepo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TrackedRepo_userId_repoId_key" ON "TrackedRepo"("userId", "repoId");

-- CreateIndex
CREATE INDEX "TrackedRepo_userId_idx" ON "TrackedRepo"("userId");

-- AddForeignKey
ALTER TABLE "TrackedRepo" ADD CONSTRAINT "TrackedRepo_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
