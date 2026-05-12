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
  Flame,
  FolderGit2,
  GitCommitHorizontal,
  GitPullRequest,
  Workflow,
} from "lucide-react";

import { CommitChart } from "@/components/CommitChart";
import { HackerNewsFeed } from "@/components/HackerNewsFeed";
import { AnimatedGroup } from "@/components/motion-primitives/AnimatedGroup";
import { PomodoroWidget } from "@/components/PomodoroWidget";
import { Button } from "@/components/ui/button";
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
import type { GitHubCommit, GitHubPR, GitHubRepo } from "@/types/github";

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
    where: {
      userId: session.user.id,
    },
  });
  const recentNotesPromise = prisma.note.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: {
      updatedAt: "desc",
    },
    take: 3,
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
  const totalStars = repos.reduce((sum: number, repo: GitHubRepo) => sum + repo.stargazers_count, 0);
  const activeRepos = repos.filter((repo) => new Date(repo.updated_at) >= thirtyDaysAgo).length;
  const privateRepos = repos.filter((repo) => repo.private).length;
  const commitStreak = getContributionStreak(commitStreakActivity);
  const topLanguage = getTopLanguage(repos);
  const mostStarredRepo = [...repos].sort((left, right) => right.stargazers_count - left.stargazers_count)[0];
  const focusMinutesThisWeek = pomodoroSessions
    .filter((sessionItem: PomodoroSession) => new Date(sessionItem.completedAt) >= sevenDaysAgo)
    .reduce((sum: number, sessionItem: PomodoroSession) => sum + sessionItem.duration, 0);
  const sessionsThisWeek = pomodoroSessions.filter(
    (sessionItem: PomodoroSession) => new Date(sessionItem.completedAt) >= sevenDaysAgo
  ).length;
  const todayKey = toDateKey(new Date());
  const focusToday = pomodoroSessions.filter(
    (sessionItem: PomodoroSession) => toDateKey(new Date(sessionItem.completedAt)) === todayKey
  );
  const topRepos = [...repos]
    .sort((left, right) => new Date(right.updated_at).getTime() - new Date(left.updated_at).getTime())
    .slice(0, 4);
  const recentCommits = [...commits]
    .sort(
      (left, right) =>
        new Date(right.commit.author.date).getTime() - new Date(left.commit.author.date).getTime()
    )
    .slice(0, 5);
  const latestPRs = [...openPRs]
    .sort((left, right) => new Date(right.created_at).getTime() - new Date(left.created_at).getTime())
    .slice(0, 4);
  const heroStats = [
    {
      label: "Focus this week",
      value: formatMinutes(focusMinutesThisWeek),
      detail: sessionsThisWeek > 0 ? `${sessionsThisWeek} sessions logged` : "Start your first sprint",
      icon: Clock3,
    },
    {
      label: "Repos in motion",
      value: `${activeRepos}`,
      detail: `${privateRepos} private repos in your mix`,
      icon: FolderGit2,
    },
    {
      label: "Knowledge base",
      value: `${noteCount}`,
      detail: recentNotes[0] ? `Last updated ${formatRelativeTime(recentNotes[0].updatedAt)}` : "No notes yet",
      icon: Workflow,
    },
  ];
  const metricCards = [
    {
      label: "Repositories",
      value: repos.length.toString(),
      detail: `${totalStars} stars across all tracked repos`,
      icon: FolderGit2,
    },
    {
      label: "Open PRs",
      value: openPRs.length.toString(),
      detail: openPRs.length > 0 ? "Active review queue is moving" : "No PRs waiting right now",
      icon: GitPullRequest,
    },
    {
      label: "Weekly commits",
      value: weeklyCommits.toString(),
      detail: commitStreak > 0 ? `${commitStreak} day commit streak` : "Fresh streak ready to begin",
      icon: GitCommitHorizontal,
    },
    {
      label: "Focus today",
      value: `${focusToday.length}`,
      detail: focusToday[0]?.label ? `Latest: ${focusToday[0].label}` : "No sprint logged yet",
      icon: Workflow,
    },
  ];

  return (
    <AnimatedGroup className="space-y-6" preset="blur-slide" stagger={0.07}>
      <section className="yev-card relative overflow-hidden px-6 py-8 md:px-8">
        <div className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.12),transparent_48%)]" />
        <div className="relative flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-xl space-y-4">
            <h1 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
              Welcome back, {displayName}.
            </h1>
            <div className="flex flex-wrap gap-2">
              <Button asChild className="h-10 rounded-xl px-4 text-sm">
                <Link href="/repos">
                  Review repositories
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-10 rounded-xl border-black/10 bg-white/80 px-4 text-sm">
                <Link href="/notes">
                  Open notes
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
            <AnimatedGroup
              className="grid gap-3 sm:grid-cols-3 xl:w-[30rem]"
              itemClassName="h-full"
              preset="scale"
              delay={0.08}
              stagger={0.06}
            >
              {heroStats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={stat.label}
                    className="yev-card-hover h-full rounded-2xl border border-black/[0.06] bg-white/80 p-4"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-medium text-muted-foreground">{stat.label}</p>
                      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <Icon className="h-3.5 w-3.5" />
                      </span>
                    </div>
                    <p className="mt-3 text-2xl font-semibold tracking-tight text-foreground">
                      {stat.value}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">{stat.detail}</p>
                  </div>
                );
              })}
            </AnimatedGroup>
          </div>
        </section>

      <AnimatedGroup className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-4" preset="slide" stagger={0.06}>
        {metricCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="yev-card yev-card-hover p-5">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{card.label}</p>
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="h-3.5 w-3.5" />
                </span>
              </div>
              <p className="mt-3 text-3xl font-semibold tracking-tight text-foreground">{card.value}</p>
              <p className="mt-1.5 text-xs text-muted-foreground">{card.detail}</p>
            </div>
          );
        })}
      </AnimatedGroup>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(360px,0.92fr)]">
        <div className="space-y-6">
          <CommitChart data={commitActivity} />

          <div className="yev-card overflow-hidden">
            <div className="border-b border-black/[0.06] px-6 py-4">
              <p className="text-sm font-semibold text-foreground">Recent commits</p>
            </div>
            <div className="space-y-2 px-4 py-4">
              {recentCommits.length > 0 ? (
                recentCommits.map((commit) => (
                  <a
                    key={commit.sha}
                    href={commit.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="yev-card-hover flex items-start gap-3 rounded-xl border border-black/[0.05] bg-black/[0.02] px-4 py-3 hover:bg-white"
                  >
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <GitCommitHorizontal className="h-3.5 w-3.5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-1 text-sm font-medium text-foreground">
                        {getCommitHeadline(commit)}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {getRepoNameFromCommitUrl(commit.html_url)} · {formatRelativeTime(commit.commit.author.date)}
                      </p>
                    </div>
                    <ExternalLink className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground/50" />
                  </a>
                ))
              ) : (
                <EmptyState
                  title="No recent commits yet"
                  description="Once commits land in GitHub, this stream will start highlighting your latest pushes."
                />
              )}
            </div>
          </div>

          <div className="yev-card overflow-hidden">
            <div className="border-b border-black/[0.06] px-6 py-4">
              <p className="text-sm font-semibold text-foreground">Repository spotlight</p>
            </div>
            <div className="grid gap-3 px-4 py-4 md:grid-cols-2">
              {topRepos.length > 0 ? (
                topRepos.map((repo) => (
                  <a
                    key={repo.id}
                    href={repo.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="yev-card-hover rounded-xl border border-black/[0.05] bg-black/[0.02] p-4 hover:bg-white"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-foreground">{repo.name}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">{repo.language ?? "—"}</p>
                      </div>
                      <ExternalLink className="h-3.5 w-3.5 shrink-0 text-muted-foreground/50" />
                    </div>
                    <p className="mt-3 line-clamp-2 text-xs leading-5 text-muted-foreground">
                      {repo.description ?? "No description."}
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <span>{repo.stargazers_count} ★</span>
                      <span>·</span>
                      <span>{repo.open_issues_count} issues</span>
                      <span>·</span>
                      <span>{formatRelativeTime(repo.updated_at)}</span>
                    </div>
                  </a>
                ))
              ) : (
                <div className="md:col-span-2">
                  <EmptyState
                    title="No repositories returned"
                    description="Once GitHub data is available, your most active repos will appear here automatically."
                  />
                </div>
              )}
            </div>
          </div>

          <div className="yev-card overflow-hidden">
            <div className="border-b border-black/[0.06] px-6 py-4">
              <p className="text-sm font-semibold text-foreground">Open PR pipeline</p>
            </div>
            <div className="space-y-2 px-4 py-4">
              {latestPRs.length > 0 ? (
                latestPRs.map((pullRequest) => (
                  <a
                    key={pullRequest.id}
                    href={pullRequest.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="yev-card-hover flex items-start gap-3 rounded-xl border border-black/[0.05] bg-black/[0.02] px-4 py-3 hover:bg-white"
                  >
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <GitPullRequest className="h-3.5 w-3.5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-1 text-sm font-medium text-foreground">{pullRequest.title}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {getRepoNameFromApiUrl(pullRequest.repository_url)} Â· {formatRelativeTime(pullRequest.created_at)}
                      </p>
                    </div>
                    <ExternalLink className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground/50" />
                  </a>
                ))
              ) : (
                <EmptyState
                  title="No open PRs"
                  description="Your review queue is clear."
                />
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <PomodoroWidget />

          <div className="yev-card overflow-hidden">
            <div className="border-b border-black/[0.06] px-6 py-4">
              <p className="text-sm font-semibold text-foreground">At a glance</p>
            </div>
            <div className="space-y-3 px-4 py-4">
              <div className="grid gap-2 sm:grid-cols-2">
                <MiniMetric title="Commit streak" value={`${commitStreak} days`} icon={Flame} />
                <MiniMetric title="Top language" value={topLanguage ?? "Mixed"} icon={Workflow} />
                <MiniMetric title="Focus this week" value={formatMinutes(focusMinutesThisWeek)} icon={Clock3} />
                <MiniMetric title="Spotlight repo" value={mostStarredRepo?.name ?? "None"} icon={FolderGit2} />
              </div>
              <div className="rounded-xl border border-black/[0.05] bg-black/[0.02] p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-foreground">Latest notes</p>
                  <Button asChild variant="outline" className="h-8 rounded-xl border-black/10 bg-white/80 px-3 text-xs">
                    <Link href="/notes">
                      Open
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </div>
                <div className="mt-3 space-y-1.5">
                  {recentNotes.length > 0 ? (
                    recentNotes.map((note) => (
                      <Link
                        key={note.id}
                        href="/notes"
                        className="flex items-center justify-between rounded-xl border border-black/[0.05] bg-white/80 px-3 py-2.5 transition-colors hover:bg-white"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-foreground">{note.title}</p>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {formatRelativeTime(note.updatedAt)}
                          </p>
                        </div>
                        <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground/50" />
                      </Link>
                    ))
                  ) : (
                    <EmptyState
                      title="No notes yet"
                      description="Create a note to start building your searchable workspace memory."
                    />
                  )}
                </div>
              </div>
            </div>
          </div>

          {false && (
          <div className="yev-card overflow-hidden">
            <div className="border-b border-black/[0.06] px-6 py-4">
              <p className="text-sm font-semibold text-foreground">Open PR pipeline</p>
            </div>
            <div className="space-y-2 px-4 py-4">
              {latestPRs.length > 0 ? (
                latestPRs.map((pullRequest) => (
                  <a
                    key={pullRequest.id}
                    href={pullRequest.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="yev-card-hover flex items-start gap-3 rounded-xl border border-black/[0.05] bg-black/[0.02] px-4 py-3 hover:bg-white"
                  >
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <GitPullRequest className="h-3.5 w-3.5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-1 text-sm font-medium text-foreground">{pullRequest.title}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {getRepoNameFromApiUrl(pullRequest.repository_url)} · {formatRelativeTime(pullRequest.created_at)}
                      </p>
                    </div>
                    <ExternalLink className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground/50" />
                  </a>
                ))
              ) : (
                <EmptyState
                  title="No open PRs"
                  description="Your review queue is clear."
                />
              )}
            </div>
          </div>
          )}

          <Suspense fallback={<Skeleton className="dashboard-panel h-[360px] rounded-[30px]" />}>
            <HackerNewsFeed />
          </Suspense>
        </div>
      </section>
    </AnimatedGroup>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-[280px] rounded-[34px]" />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-4">
        <Skeleton className="h-36 rounded-[28px]" />
        <Skeleton className="h-36 rounded-[28px]" />
        <Skeleton className="h-36 rounded-[28px]" />
        <Skeleton className="h-36 rounded-[28px]" />
      </div>
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(360px,0.92fr)]">
        <div className="space-y-6">
          <Skeleton className="h-[360px] rounded-[30px]" />
          <Skeleton className="h-[360px] rounded-[30px]" />
          <Skeleton className="h-[360px] rounded-[30px]" />
          <Skeleton className="h-[340px] rounded-[30px]" />
        </div>
        <div className="space-y-6">
          <Skeleton className="h-[340px] rounded-[30px]" />
          <Skeleton className="h-[380px] rounded-[30px]" />
          <Skeleton className="h-[320px] rounded-[30px]" />
        </div>
      </div>
    </div>
  );
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-[24px] border border-dashed border-white/70 bg-white/56 px-4 py-8 text-center">
      <p className="font-medium text-foreground">{title}</p>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
    </div>
  );
}

function MiniMetric({
  title,
  value,
  icon: Icon,
}: {
  title: string;
  value: string;
  icon: typeof Flame;
}) {
  return (
    <div className="rounded-xl border border-black/[0.05] bg-black/[0.02] p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium text-muted-foreground">{title}</p>
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-3.5 w-3.5" />
        </span>
      </div>
      <p className="mt-2 text-base font-semibold tracking-tight text-foreground">{value}</p>
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

function getRepoNameFromApiUrl(url: string) {
  const segments = url.split("/").filter(Boolean);
  return segments.slice(-2).join("/");
}

function getRepoNameFromCommitUrl(url: string) {
  const segments = new URL(url).pathname.split("/").filter(Boolean);
  return segments.length >= 2 ? `${segments[0]}/${segments[1]}` : "Unknown repo";
}

function getCommitHeadline(commit: GitHubCommit) {
  return commit.commit.message.split("\n")[0];
}

function toDateKey(date: Date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}
