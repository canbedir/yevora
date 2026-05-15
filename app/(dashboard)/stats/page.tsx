import { Suspense } from "react";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { getServerSession } from "next-auth";
import type { PomodoroSession } from "@prisma/client";

import { PageHeader } from "@/components/dashboard/PageHeader";
import { StatsContentSkeleton } from "@/components/dashboard/PageSkeletons";
import { AnimatedGroup } from "@/components/motion-primitives/AnimatedGroup";
import { StatsCharts } from "@/components/StatsCharts";
import { authOptions } from "@/lib/auth";
import { getAuthenticatedGitHubUser, getRecentCommits, groupCommitsByDay } from "@/lib/github";
import { prisma } from "@/lib/prisma";
import type { GitHubCommit } from "@/types/github";

export default async function StatsPage() {
  await connection();

  return (
    <AnimatedGroup preset="slide" stagger={0.07} className="mx-auto max-w-[960px] space-y-6">
      <PageHeader
        title="Stats"
        description="Read your commit and focus trends without the dashboard noise."
      />
      <Suspense fallback={<StatsContentSkeleton />}>
        <StatsContent />
      </Suspense>
    </AnimatedGroup>
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
