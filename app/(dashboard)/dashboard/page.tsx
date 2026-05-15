import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { getServerSession } from "next-auth";
import type { PomodoroSession } from "@prisma/client";
import {
  ArrowRight,
  Clock3,
  ExternalLink,
  FileText,
  Flame,
  FolderGit2,
  GitCommitHorizontal,
  Star,
  type LucideIcon,
} from "lucide-react";

import { PageHeader } from "@/components/dashboard/PageHeader";
import { AnimatedGroup } from "@/components/motion-primitives/AnimatedGroup";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { authOptions } from "@/lib/auth";
import {
  getAuthenticatedGitHubUser,
  getOpenPRs,
  getRecentCommits,
  getUserRepos,
  groupCommitsByDay,
} from "@/lib/github";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";
import type { CommitActivity, GitHubCommit, GitHubPR, GitHubRepo } from "@/types/github";

export default async function Page() {
  await connection();

  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent />
    </Suspense>
  );
}

async function DashboardContent() {
  const session = await getServerSession(authOptions);

  if (!session?.accessToken || !session?.user?.id) {
    redirect("/login");
  }

  const accessToken = session.accessToken;
  const displayName = session.user.name?.split(" ")[0] ?? "Developer";
  const githubUserPromise = session.user.githubUsername
    ? Promise.resolve({ login: session.user.githubUsername })
    : getAuthenticatedGitHubUser(accessToken);

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

  const reposPromise: Promise<GitHubRepo[]> = getUserRepos(accessToken);
  const openPrsPromise: Promise<GitHubPR[]> = githubUserPromise.then((githubUser) =>
    getOpenPRs(accessToken, githubUser.login)
  );
  const commitsPromise: Promise<GitHubCommit[]> = githubUserPromise.then((githubUser) =>
    getRecentCommits(accessToken, githubUser.login)
  );
  const pomodoroSessionsPromise: Promise<PomodoroSession[]> = prisma.pomodoroSession.findMany({
    where: {
      userId: session.user.id,
      completedAt: { gte: thirtyDaysAgo },
    },
    orderBy: { completedAt: "desc" },
    take: 24,
  });
  const noteCountPromise = prisma.note.count({
    where: { userId: session.user.id },
  });
  const recentNotesPromise = prisma.note.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: "desc" },
    take: 5,
    select: {
      id: true,
      title: true,
      updatedAt: true,
    },
  });

  const [repos, openPRs, commits, pomodoroSessions, noteCount, recentNotes]: [
    GitHubRepo[],
    GitHubPR[],
    GitHubCommit[],
    PomodoroSession[],
    number,
    Awaited<typeof recentNotesPromise>,
  ] = await Promise.all([
    reposPromise,
    openPrsPromise,
    commitsPromise,
    pomodoroSessionsPromise,
    noteCountPromise,
    recentNotesPromise,
  ]);

  const commitActivity = groupCommitsByDay(commits);
  const commitStreakActivity = groupCommitsByDay(commits, 30);
  const weeklyCommits = commitActivity.reduce((total, item) => total + item.count, 0);
  const totalStars = repos.reduce((sum, repo) => sum + repo.stargazers_count, 0);
  const activeRepos = repos.filter((repo) => new Date(repo.updated_at) >= thirtyDaysAgo).length;
  const commitStreak = getContributionStreak(commitStreakActivity);
  const focusMinutesThisWeek = pomodoroSessions
    .filter((sessionItem) => new Date(sessionItem.completedAt) >= sevenDaysAgo)
    .reduce((sum, sessionItem) => sum + sessionItem.duration, 0);
  const sessionsThisWeek = pomodoroSessions.filter(
    (sessionItem) => new Date(sessionItem.completedAt) >= sevenDaysAgo
  ).length;
  const outputLogsThisWeek = pomodoroSessions.filter(
    (sessionItem) =>
      new Date(sessionItem.completedAt) >= sevenDaysAgo &&
      Boolean(sessionItem.outputSummary || sessionItem.repositoryName || sessionItem.commitCount > 0)
  ).length;
  const topLanguage = getTopLanguage(repos);
  const topRepos = [...repos]
    .sort((left, right) => new Date(right.updated_at).getTime() - new Date(left.updated_at).getTime())
    .slice(0, 5);
  const latestPRs = [...openPRs]
    .sort((left, right) => new Date(right.created_at).getTime() - new Date(left.created_at).getTime())
    .slice(0, 3);

  return (
    <AnimatedGroup preset="slide" stagger={0.07} className="mx-auto max-w-[960px] space-y-6">
      <PageHeader
        title={`Welcome back, ${displayName}`}
        description="A calmer overview of your repositories, notes, focus time, and shipping rhythm."
      />

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          title="Weekly commits"
          value={weeklyCommits.toString()}
          detail={`${getBestCommitDay(commitActivity)} on best day`}
          icon={GitCommitHorizontal}
        />
        <SummaryCard
          title="Commit streak"
          value={`${commitStreak}`}
          detail={commitStreak > 0 ? "consecutive days" : "ready to begin"}
          icon={Flame}
          isActive={commitStreak > 0}
        />
        <SummaryCard
          title="Repositories"
          value={repos.length.toString()}
          detail={`${activeRepos} active in 30 days`}
          icon={FolderGit2}
        />
        <SummaryCard
          title="Focus this week"
          value={formatMinutes(focusMinutesThisWeek)}
          detail={`${sessionsThisWeek} sessions logged`}
          icon={Clock3}
        />
      </section>

      <ActivityOverview activity={commitActivity} totalCommits={weeklyCommits} />

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="yev-card yev-card-hover flex h-[340px] flex-col overflow-hidden">
          <PanelHeader
            title="Repository spotlight"
            meta={`${totalStars} stars`}
            href="/repos"
          />
          <div className="yev-scroll-panel min-h-0 flex-1 divide-y divide-neutral-200">
            {topRepos.length > 0 ? (
              topRepos.map((repo) => (
                <a
                  key={repo.id}
                  href={repo.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-neutral-50"
                >
                  <span className="min-w-0">
                    <span className="flex items-center gap-2">
                      <span className="truncate text-sm font-semibold text-neutral-950">{repo.name}</span>
                      {repo.language ? (
                        <span className="rounded bg-neutral-100 px-1.5 py-0.5 text-[11px] text-neutral-600">
                          {repo.language}
                        </span>
                      ) : null}
                    </span>
                    <span className="mt-1 flex items-center gap-3 text-xs text-neutral-500">
                      <span className="inline-flex items-center gap-1">
                        <Star className="h-3 w-3" />
                        {repo.stargazers_count}
                      </span>
                      <span>{repo.open_issues_count} issues</span>
                      <span>{formatRelativeTime(repo.updated_at)}</span>
                    </span>
                  </span>
                  <ExternalLink className="h-4 w-4 shrink-0 text-neutral-400" />
                </a>
              ))
            ) : (
              <EmptyState
                title="No repositories yet"
                description="Open repositories to choose the repos you want Yevora to keep close."
                icon={FolderGit2}
                compact
                action={
                  <Button asChild variant="outline" size="sm">
                    <Link href="/repos">Open repos</Link>
                  </Button>
                }
              />
            )}
          </div>
        </div>

        <div className="yev-card yev-card-hover flex h-[340px] flex-col overflow-hidden">
          <PanelHeader title="Open PR pipeline" meta={`${openPRs.length} open`} href="/repos" />
          <div className="yev-scroll-panel min-h-0 flex-1 divide-y divide-neutral-200">
            {latestPRs.length > 0 ? (
              latestPRs.map((pullRequest) => (
                <a
                  key={pullRequest.id}
                  href={pullRequest.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-neutral-50"
                >
                  <span className="min-w-0">
                    <span className="line-clamp-1 text-sm font-semibold text-neutral-950">
                      {pullRequest.title}
                    </span>
                    <span className="mt-1 text-xs text-neutral-500">
                      {getRepoNameFromApiUrl(pullRequest.repository_url)} by you
                    </span>
                  </span>
                  <span className="rounded-full bg-neutral-100 px-2 py-1 text-[11px] text-neutral-600">
                    review
                  </span>
                </a>
              ))
            ) : (
              <EmptyState
                title="PR queue clear"
                description="No authored pull requests need attention right now."
                icon={GitCommitHorizontal}
                compact
              />
            )}
          </div>
        </div>

        <div className="yev-card yev-card-hover flex h-[340px] flex-col overflow-hidden">
          <PanelHeader title="Latest notes" meta={`${noteCount} notes`} href="/notes" />
          <div className="yev-scroll-panel min-h-0 flex-1 divide-y divide-neutral-200">
            {recentNotes.length > 0 ? (
              recentNotes.map((note) => (
                <Link
                  key={note.id}
                  href={`/notes?selected=${note.id}`}
                  className="flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-neutral-50"
                >
                  <span className="flex min-w-0 items-center gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-neutral-100 text-neutral-600">
                      <FileText className="h-4 w-4" />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold text-neutral-950">{note.title}</span>
                      <span className="text-xs text-neutral-500">{formatRelativeTime(note.updatedAt)}</span>
                    </span>
                  </span>
                  <ArrowRight className="h-4 w-4 shrink-0 text-neutral-400" />
                </Link>
              ))
            ) : (
              <EmptyState
                title="No notes yet"
                description="Start the first note and this space will turn into your recent working context."
                icon={FileText}
                compact
                action={
                  <Button asChild variant="outline" size="sm">
                    <Link href="/notes">Create note</Link>
                  </Button>
                }
              />
            )}
          </div>
        </div>

        <div className="yev-card yev-card-hover flex h-[340px] flex-col p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-neutral-950">At a glance</p>
              <p className="mt-1 text-sm text-neutral-600">Small signals worth keeping visible.</p>
            </div>
            <Flame className={cn("h-5 w-5 text-primary", commitStreak > 0 && "yev-live-flame")} />
          </div>
          <div className="mt-5 grid gap-2.5">
            <MiniMetric label="Top language" value={topLanguage ?? "Mixed"} />
            <MiniMetric label="Commit streak" value={`${commitStreak} days`} isActive={commitStreak > 0} />
            <MiniMetric label="Focus sessions" value={sessionsThisWeek.toString()} />
            <MiniMetric label="Output logs" value={outputLogsThisWeek.toString()} />
            <MiniMetric label="Open PRs" value={openPRs.length.toString()} />
          </div>
        </div>
      </section>
    </AnimatedGroup>
  );
}

function DashboardSkeleton() {
  return (
    <div className="mx-auto max-w-[960px] space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-64 rounded-md" />
        <Skeleton className="h-4 w-80 rounded-md" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-28 rounded-lg" />
        ))}
      </div>
      <Skeleton className="h-64 rounded-lg" />
      <div className="grid gap-4 lg:grid-cols-2">
        <Skeleton className="h-56 rounded-lg" />
        <Skeleton className="h-56 rounded-lg" />
      </div>
    </div>
  );
}

function SummaryCard({
  title,
  value,
  detail,
  icon: Icon,
  isActive = false,
}: {
  title: string;
  value: string;
  detail: string;
  icon: LucideIcon;
  isActive?: boolean;
}) {
  return (
    <div className={cn("yev-card yev-card-hover p-4", isActive && "yev-active-metric")}>
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-neutral-600">{title}</p>
        <span
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-md bg-neutral-100 text-neutral-700",
            isActive && "yev-live-signal bg-orange-100 text-primary"
          )}
        >
          <Icon className={cn("h-4 w-4", isActive && "yev-live-flame")} />
        </span>
      </div>
      <p className="mt-4 text-2xl font-semibold text-neutral-950">{value}</p>
      <p className="mt-1 text-xs text-neutral-500">{detail}</p>
    </div>
  );
}

function ActivityOverview({
  activity,
  totalCommits,
}: {
  activity: CommitActivity[];
  totalCommits: number;
}) {
  const maxCount = Math.max(...activity.map((item) => item.count), 1);
  const bestDay = activity.reduce((best, item) => (item.count > best.count ? item : best), activity[0]);

  return (
    <section className="yev-card overflow-hidden">
      <div className="flex items-center justify-between gap-4 px-5 py-4">
        <div className="flex items-center gap-2">
          <GitCommitHorizontal className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold text-neutral-950">Commit activity</h2>
        </div>
        <span className="text-xs text-neutral-500">Last 7 days</span>
      </div>
      <div className="px-5 pb-5 pt-4">
        <div className="flex h-28 items-end justify-between gap-3 border-b border-neutral-200 px-4 pb-4">
          {activity.map((item) => {
            const height = item.count === 0 ? 4 : Math.max(16, Math.round((item.count / maxCount) * 78));
            return (
              <div key={item.date} className="group relative flex min-w-0 flex-1 flex-col items-center gap-2">
                <div className="pointer-events-none absolute bottom-[calc(100%+10px)] left-1/2 z-10 w-max -translate-x-1/2 rounded-md border border-neutral-200 bg-white px-2.5 py-1.5 text-xs text-neutral-700 opacity-0 shadow-[0_14px_30px_-20px_rgba(15,23,42,0.35)] transition-opacity group-hover:opacity-100">
                  <span className="font-semibold text-neutral-950">{formatDay(item.date)}</span>
                  <span className="mx-1 text-neutral-400">-</span>
                  {item.count} commits
                </div>
                <div
                  className={cn(
                    "w-7",
                    item.count > 0 ? "rounded-t-md bg-primary" : "rounded bg-orange-200",
                    item.count > 0 && item.count === bestDay.count && "yev-live-signal"
                  )}
                  style={{ height }}
                  title={`${item.count} commits`}
                />
                <span className="text-xs text-neutral-500">{formatDay(item.date)}</span>
              </div>
            );
          })}
        </div>
        <div className="flex items-end justify-between px-0 pt-4">
          <div>
            <p className="text-2xl font-semibold text-neutral-950">{totalCommits}</p>
            <p className="text-xs text-neutral-500">Total commits</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-semibold text-neutral-950">{bestDay?.count ?? 0}</p>
            <p className="text-xs text-neutral-500">Best day</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function PanelHeader({ title, meta, href }: { title: string; meta: string; href: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-neutral-200 px-5 py-4">
      <h2 className="text-sm font-semibold text-neutral-950">{title}</h2>
      <Link href={href} className="text-xs text-neutral-600 transition-colors hover:text-neutral-950">
        {meta}
      </Link>
    </div>
  );
}

function MiniMetric({ label, value, isActive = false }: { label: string; value: string; isActive?: boolean }) {
  return (
    <div
      className={cn(
        "flex min-h-10 items-center justify-between rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2",
        isActive && "yev-active-metric"
      )}
    >
      <span className="text-xs text-neutral-500">{label}</span>
      <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-neutral-950">
        {isActive ? <span className="h-1.5 w-1.5 rounded-full bg-primary yev-live-signal" /> : null}
        {value}
      </span>
    </div>
  );
}

function getContributionStreak(activity: { count: number }[]) {
  let streak = 0;
  let index = activity.length - 1;

  if (activity[index]?.count === 0) {
    index -= 1;
  }

  for (; index >= 0; index -= 1) {
    if (activity[index].count > 0) {
      streak += 1;
      continue;
    }

    break;
  }

  return streak;
}

function getTopLanguage(repos: GitHubRepo[]) {
  const counts = repos.reduce<Record<string, number>>((accumulator, repo) => {
    if (!repo.language) {
      return accumulator;
    }

    accumulator[repo.language] = (accumulator[repo.language] ?? 0) + 1;
    return accumulator;
  }, {});

  return Object.entries(counts).sort((left, right) => right[1] - left[1])[0]?.[0] ?? null;
}

function getBestCommitDay(activity: CommitActivity[]) {
  const bestDay = activity.reduce((best, item) => (item.count > best.count ? item : best), activity[0]);
  return `${bestDay?.count ?? 0}`;
}

function formatMinutes(minutes: number) {
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    const remaining = minutes % 60;
    return remaining > 0 ? `${hours}h ${remaining}m` : `${hours}h`;
  }

  return `${minutes}m`;
}

function formatRelativeTime(value: Date | string) {
  const target = new Date(value);
  const diffInSeconds = Math.round((target.getTime() - Date.now()) / 1000);
  const formatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

  const units: Array<[Intl.RelativeTimeFormatUnit, number]> = [
    ["year", 60 * 60 * 24 * 365],
    ["month", 60 * 60 * 24 * 30],
    ["day", 60 * 60 * 24],
    ["hour", 60 * 60],
    ["minute", 60],
  ];

  for (const [unit, seconds] of units) {
    if (Math.abs(diffInSeconds) >= seconds) {
      return formatter.format(Math.round(diffInSeconds / seconds), unit);
    }
  }

  return formatter.format(diffInSeconds, "second");
}

function formatDay(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-US", { weekday: "short" });
}

function getRepoNameFromApiUrl(url: string) {
  const segments = url.split("/").filter(Boolean);
  return segments.slice(-2).join("/");
}
