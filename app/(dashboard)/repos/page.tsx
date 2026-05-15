import { Suspense } from "react";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { getServerSession } from "next-auth";

import { PageHeader } from "@/components/dashboard/PageHeader";
import { AnimatedGroup } from "@/components/motion-primitives/AnimatedGroup";
import { RepoList } from "@/components/RepoList";
import { Skeleton } from "@/components/ui/skeleton";
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
      <Suspense fallback={<ReposSkeleton />}>
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

function ReposSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-24 rounded-lg" />
      <div className="grid gap-3 md:grid-cols-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-lg" />
        ))}
      </div>
    </div>
  );
}
