import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { CommitChart } from "@/components/CommitChart";
import { HackerNewsFeed } from "@/components/HackerNewsFeed";
import { MetricCards } from "@/components/MetricCards";
import { PomodoroWidget } from "@/components/PomodoroWidget";
import { Skeleton } from "@/components/ui/skeleton";
import { authOptions } from "@/lib/auth";
import { getOpenPRs, getRecentCommits, getUserRepos, groupCommitsByDay } from "@/lib/github";

export default function Page() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent />
    </Suspense>
  );
}

async function DashboardContent() {
  const session = await getServerSession(authOptions);

  if (!session?.accessToken) {
    redirect("/login");
  }

  const username = session.user.name ?? "";

  const [repos, openPRs, commits] = await Promise.all([
    getUserRepos(session.accessToken),
    getOpenPRs(session.accessToken),
    username ? getRecentCommits(session.accessToken, username) : Promise.resolve([]),
  ]);

  const commitActivity = groupCommitsByDay(commits);
  const weeklyCommits = commitActivity.reduce((total, item) => total + item.count, 0);

  return (
    <div className="space-y-6">
      <MetricCards
        repoCount={repos.length}
        openPRCount={openPRs.length}
        weeklyCommits={weeklyCommits}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <CommitChart data={commitActivity} />
        </div>
        <div className="space-y-6">
          <PomodoroWidget />
          <Suspense fallback={<Skeleton className="h-[300px] w-full" />}>
            <HackerNewsFeed />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Skeleton className="h-64" />
        <div className="space-y-6">
          <Skeleton className="h-28" />
          <Skeleton className="h-[300px]" />
        </div>
      </div>
    </div>
  );
}
