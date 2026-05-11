import { Suspense } from "react";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { getServerSession } from "next-auth";
import type { PomodoroSession } from "@prisma/client";

import { StatsCharts } from "@/components/StatsCharts";
import { Skeleton } from "@/components/ui/skeleton";
import { authOptions } from "@/lib/auth";
import { getRecentCommits, groupCommitsByDay } from "@/lib/github";
import { prisma } from "@/lib/prisma";
import type { GitHubCommit } from "@/types/github";

export default async function StatsPage() {
  await connection();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Statistics</h1>
      <Suspense fallback={<StatsSkeleton />}>
        <StatsContent />
      </Suspense>
    </div>
  );
}

async function StatsContent() {
  const session = await getServerSession(authOptions);

  if (!session?.accessToken || !session?.user?.id) {
    redirect("/login");
  }

  const username = session.user.name ?? "";

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const commitsPromise: Promise<GitHubCommit[]> = username
    ? getRecentCommits(session.accessToken, username)
    : Promise.resolve<GitHubCommit[]>([]);
  const pomodoroSessionsPromise: Promise<PomodoroSession[]> = prisma.pomodoroSession.findMany({
    where: {
      userId: session.user.id,
      completedAt: { gte: thirtyDaysAgo },
    },
    orderBy: { completedAt: "asc" },
  });

  const [commits, pomodoroSessions]: [
    GitHubCommit[],
    PomodoroSession[],
  ] = await Promise.all([
    commitsPromise,
    pomodoroSessionsPromise,
  ]);

  const commitActivity = groupCommitsByDay(commits);

  return (
    <StatsCharts
      commitActivity={commitActivity}
      pomodoroSessions={pomodoroSessions}
    />
  );
}

function StatsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Skeleton className="h-[280px]" />
        <Skeleton className="h-[280px]" />
      </div>
    </div>
  );
}
