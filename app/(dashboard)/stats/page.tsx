import { Suspense } from "react";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { getServerSession } from "next-auth";
import type { PomodoroSession } from "@prisma/client";

import { PageHeader } from "@/components/dashboard/PageHeader";
import { StatsCharts } from "@/components/StatsCharts";
import { Skeleton } from "@/components/ui/skeleton";
import { authOptions } from "@/lib/auth";
import { getAuthenticatedGitHubUser, getRecentCommits, groupCommitsByDay } from "@/lib/github";
import { prisma } from "@/lib/prisma";
import type { GitHubCommit } from "@/types/github";

export default async function StatsPage() {
  await connection();

  return (
    <div className="mx-auto max-w-[960px] space-y-6">
      <PageHeader
        title="Stats"
        description="Read your commit and focus trends without the dashboard noise."
      />
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

  const accessToken = session.accessToken;
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const githubUserPromise = session.user.githubUsername
    ? Promise.resolve({ login: session.user.githubUsername })
    : getAuthenticatedGitHubUser(accessToken);
  const commitsPromise: Promise<GitHubCommit[]> = githubUserPromise.then((githubUser) =>
    getRecentCommits(accessToken, githubUser.login)
  );
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
  const commitStreakActivity = groupCommitsByDay(commits, 30);

  return (
    <StatsCharts
      commitActivity={commitActivity}
      commitStreakActivity={commitStreakActivity}
      pomodoroSessions={pomodoroSessions}
    />
  );
}

function StatsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <Skeleton className="h-28 rounded-lg" />
        <Skeleton className="h-28 rounded-lg" />
        <Skeleton className="h-28 rounded-lg" />
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Skeleton className="h-[300px] rounded-lg" />
        <Skeleton className="h-[300px] rounded-lg" />
      </div>
    </div>
  );
}
