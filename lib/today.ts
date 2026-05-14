import {
  getAuthenticatedGitHubUser,
  getOpenPRs,
  getRecentCommits,
  getUserRepos,
  groupCommitsByDay,
} from "@/lib/github";
import { prisma } from "@/lib/prisma";
import type { GitHubCommit, GitHubPR, GitHubRepo } from "@/types/github";

export type TodayQueueTone = "focus" | "github" | "notes" | "repo";

export interface TodayQueueItem {
  id: string;
  title: string;
  detail: string;
  href: string;
  tone: TodayQueueTone;
  external?: boolean;
  priority: number;
}

export interface TodaySummary {
  queueItems: TodayQueueItem[];
  focusToday: number;
  focusMinutesToday: number;
  focusMinutesThisWeek: number;
  outputLogsToday: number;
  commitsToday: number;
  commitStreak: number;
  openPRs: GitHubPR[];
  selectedRepos: GitHubRepo[];
  staleRepo: GitHubRepo | null;
  recentNote: { id: string; title: string; updatedAt: Date } | null;
  recentFocusSessions: Array<{
    id: string;
    duration: number;
    label: string | null;
    repositoryName: string | null;
    commitCount: number;
    outputSummary: string | null;
    completedAt: Date;
  }>;
}

interface TodaySummaryInput {
  userId: string;
  accessToken: string;
  githubUsername?: string | null;
}

export async function getTodaySummary({
  userId,
  accessToken,
  githubUsername,
}: TodaySummaryInput): Promise<TodaySummary> {
  const githubUserPromise = githubUsername
    ? Promise.resolve({ login: githubUsername })
    : getAuthenticatedGitHubUser(accessToken);

  const todayStart = getStartOfToday();
  const sevenDaysAgo = getDaysAgo(6);
  const staleRepoDate = getDaysAgo(14);

  const reposPromise = getUserRepos(accessToken);
  const openPrsPromise = githubUserPromise.then((githubUser) => getOpenPRs(accessToken, githubUser.login));
  const commitsPromise = githubUserPromise.then((githubUser) => getRecentCommits(accessToken, githubUser.login));
  const recentFocusSessionsPromise = prisma.pomodoroSession.findMany({
    where: {
      userId,
      completedAt: { gte: sevenDaysAgo },
    },
    orderBy: { completedAt: "desc" },
    take: 12,
    select: {
      id: true,
      duration: true,
      label: true,
      repositoryName: true,
      commitCount: true,
      outputSummary: true,
      completedAt: true,
    },
  });
  const recentNotePromise = prisma.note.findFirst({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    select: { id: true, title: true, updatedAt: true },
  });
  const trackedReposPromise = prisma.trackedRepo.findMany({
    where: { userId },
    select: { repoId: true },
  });

  const [repos, openPRs, commits, recentFocusSessions, recentNote, trackedRepos] =
    await Promise.all([
      reposPromise,
      openPrsPromise,
      commitsPromise,
      recentFocusSessionsPromise,
      recentNotePromise,
      trackedReposPromise,
    ]);

  const trackedRepoIds = new Set(trackedRepos.map((repo) => repo.repoId));
  const selectedRepos = trackedRepoIds.size > 0 ? repos.filter((repo) => trackedRepoIds.has(repo.id)) : repos;
  const focusSessionsToday = recentFocusSessions.filter((session) => session.completedAt >= todayStart);
  const focusToday = focusSessionsToday.length;
  const focusMinutesToday = focusSessionsToday.reduce((sum, session) => sum + session.duration, 0);
  const focusMinutesThisWeek = recentFocusSessions.reduce((sum, session) => sum + session.duration, 0);
  const outputLogsToday = focusSessionsToday.filter(hasSessionOutput).length;
  const commitActivity = groupCommitsByDay(commits, 30);
  const commitsToday = commitActivity[commitActivity.length - 1]?.count ?? 0;
  const commitStreak = getContributionStreak(commitActivity);
  const staleRepo = getStaleRepo(selectedRepos, staleRepoDate);
  const queueItems = [
    ...getFocusQueueItems(focusToday, recentFocusSessions),
    ...getPullRequestQueueItems(openPRs),
    ...getRepositoryQueueItems(staleRepo),
    ...getNoteQueueItems(recentNote),
    ...getCommitQueueItems(commits),
  ].sort((left, right) => right.priority - left.priority);

  return {
    queueItems,
    focusToday,
    focusMinutesToday,
    focusMinutesThisWeek,
    outputLogsToday,
    commitsToday,
    commitStreak,
    openPRs,
    selectedRepos,
    staleRepo,
    recentNote,
    recentFocusSessions,
  };
}

export function toPublicQueueItem(item: TodayQueueItem) {
  return {
    id: item.id,
    title: item.title,
    detail: item.detail,
    href: item.href,
    tone: item.tone,
    external: item.external,
  };
}

function hasSessionOutput(session: {
  outputSummary: string | null;
  repositoryName: string | null;
  commitCount: number;
}) {
  return Boolean(session.outputSummary || session.repositoryName || session.commitCount > 0);
}

function getFocusQueueItems(
  focusToday: number,
  recentFocusSessions: Array<{
    outputSummary: string | null;
    repositoryName: string | null;
    commitCount: number;
  }>
): TodayQueueItem[] {
  const items: TodayQueueItem[] = [];
  const sessionsWithoutOutput = recentFocusSessions.filter((sessionItem) => !hasSessionOutput(sessionItem)).length;

  if (focusToday === 0) {
    items.push({
      id: "focus-today",
      title: "Start today's focus block",
      detail: "No focus session has been logged today.",
      href: "/focus",
      tone: "focus",
      priority: 90,
    });
  }

  if (sessionsWithoutOutput > 0) {
    items.push({
      id: "focus-output",
      title: "Wrap up recent focus output",
      detail: `${sessionsWithoutOutput} recent session${sessionsWithoutOutput > 1 ? "s" : ""} missing output notes.`,
      href: "/focus",
      tone: "focus",
      priority: 72,
    });
  }

  return items;
}

function getPullRequestQueueItems(openPRs: GitHubPR[]): TodayQueueItem[] {
  if (openPRs.length === 0) {
    return [];
  }

  const stalePrs = openPRs.filter((pullRequest) => new Date(pullRequest.created_at) <= getDaysAgo(3));
  const oldestPr = [...openPRs].sort(
    (left, right) => new Date(left.created_at).getTime() - new Date(right.created_at).getTime()
  )[0];

  return [
    {
      id: "open-prs",
      title: `${openPRs.length} open PR${openPRs.length > 1 ? "s" : ""} waiting`,
      detail:
        stalePrs.length > 0
          ? `${stalePrs.length} has been open for 3+ days.`
          : `Oldest: ${oldestPr.title}`,
      href: oldestPr.html_url,
      tone: "github",
      priority: stalePrs.length > 0 ? 86 : 68,
      external: true,
    },
  ];
}

function getRepositoryQueueItems(staleRepo: GitHubRepo | null): TodayQueueItem[] {
  if (!staleRepo) {
    return [];
  }

  return [
    {
      id: "stale-repo",
      title: "A selected repo is going quiet",
      detail: `${staleRepo.name} has not moved in ${getAgeInDays(staleRepo.updated_at)} days.`,
      href: "/repos",
      tone: "repo",
      priority: 58,
    },
  ];
}

function getNoteQueueItems(
  recentNote: { id: string; title: string; updatedAt: Date } | null
): TodayQueueItem[] {
  if (!recentNote) {
    return [
      {
        id: "first-note",
        title: "Capture the first note",
        detail: "Notes are empty, so today's context has nowhere to land yet.",
        href: "/notes",
        tone: "notes",
        priority: 62,
      },
    ];
  }

  const daysSinceUpdate = getAgeInDays(recentNote.updatedAt);
  if (daysSinceUpdate < 3) {
    return [];
  }

  return [
    {
      id: "stale-note",
      title: "Refresh your latest note",
      detail: `${recentNote.title} was last touched ${daysSinceUpdate} days ago.`,
      href: `/notes?selected=${recentNote.id}`,
      tone: "notes",
      priority: 52,
    },
  ];
}

function getCommitQueueItems(commits: GitHubCommit[]): TodayQueueItem[] {
  const activity = groupCommitsByDay(commits, 30);
  const today = activity[activity.length - 1];
  const currentStreak = getContributionStreak(activity);

  if ((today?.count ?? 0) > 0 || currentStreak === 0) {
    return [];
  }

  return [
    {
      id: "streak-waiting",
      title: "Commit streak is waiting",
      detail: `${currentStreak} day${currentStreak > 1 ? "s" : ""} active before today.`,
      href: "/dashboard",
      tone: "github",
      priority: 64,
    },
  ];
}

function getStaleRepo(repos: GitHubRepo[], staleRepoDate: Date) {
  return (
    [...repos]
      .filter((repo) => new Date(repo.updated_at) <= staleRepoDate)
      .sort((left, right) => new Date(left.updated_at).getTime() - new Date(right.updated_at).getTime())[0] ?? null
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

function getStartOfToday() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

function getDaysAgo(days: number) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}

function getAgeInDays(value: Date | string) {
  const target = new Date(value);
  const diffInMilliseconds = Date.now() - target.getTime();
  return Math.max(0, Math.floor(diffInMilliseconds / 86_400_000));
}
