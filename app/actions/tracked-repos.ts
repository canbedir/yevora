'use server'

import { revalidatePath } from 'next/cache'
import { getServerSession } from 'next-auth'

import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function saveTrackedRepos(repoIds: number[]) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) throw new Error('Unauthorized')

  const safeRepoIds = Array.from(
    new Set(
      repoIds
        .filter((repoId) => Number.isInteger(repoId))
        .map((repoId) => Math.max(1, Math.min(repoId, 2_147_483_647)))
    )
  ).slice(0, 200)

  await prisma.$transaction([
    prisma.user.update({
      where: { id: session.user.id },
      data: { trackedReposInitialized: true },
    }),
    prisma.trackedRepo.deleteMany({
      where: {
        userId: session.user.id,
        repoId: { notIn: safeRepoIds.length > 0 ? safeRepoIds : [-1] },
      },
    }),
    ...(safeRepoIds.length > 0
      ? [
          prisma.trackedRepo.createMany({
            data: safeRepoIds.map((repoId) => ({
              userId: session.user.id,
              repoId,
            })),
            skipDuplicates: true,
          }),
        ]
      : []),
  ])

  revalidatePath('/repos')
}
