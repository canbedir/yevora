import { Suspense } from "react";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { getServerSession } from "next-auth";

import { PageHeader } from "@/components/dashboard/PageHeader";
import { ReposContentSkeleton } from "@/components/dashboard/PageSkeletons";
import { AnimatedGroup } from "@/components/motion-primitives/AnimatedGroup";
import { RepoList } from "@/components/RepoList";
import { authOptions } from "@/lib/auth";
import { getUserRepos } from "@/lib/github";
import { prisma } from "@/lib/prisma";

export default async function ReposPage() {
  await connection();

  return (
    <AnimatedGroup preset="slide" stagger={0.07} className="mx-auto max-w-[960px] space-y-6">
      <PageHeader
        title="Repositories"
        description="Manage your repositories and track activity."
      />
      <Suspense fallback={<ReposContentSkeleton />}>
        <ReposContent />
      </Suspense>
    </AnimatedGroup>
  );
}

async function ReposContent() {
  const session = await getServerSession(authOptions);

  if (!session?.accessToken || !session.user?.id) {
    redirect("/login");
  }

  const [repos, trackedRepos, userPreferenceState] = await Promise.all([
    getUserRepos(session.accessToken),
    prisma.trackedRepo.findMany({
      where: { userId: session.user.id },
      select: { repoId: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { trackedReposInitialized: true },
    }),
  ]);

  return (
    <RepoList
      repos={repos}
      initialTrackedRepoIds={trackedRepos.map((trackedRepo) => trackedRepo.repoId)}
      hasSavedSelection={Boolean(userPreferenceState?.trackedReposInitialized)}
    />
  );
}
