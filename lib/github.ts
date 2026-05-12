import { cacheLife } from "next/cache";

import type {
  CommitActivity,
  GitHubCommit,
  GitHubPR,
  GitHubRepo,
  GitHubUser,
} from "@/types/github";

const GITHUB_API = "https://api.github.com";
const MAX_REPO_PAGES = 5;

async function githubFetch<T>(endpoint: string, token: string): Promise<T> {
  const response = await fetch(`${GITHUB_API}${endpoint}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
    },
  });

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}

export async function getAuthenticatedGitHubUser(token: string): Promise<GitHubUser> {
  "use cache";
  cacheLife("minutes");

  return githubFetch<GitHubUser>("/user", token);
}

export async function getUserRepos(token: string): Promise<GitHubRepo[]> {
  "use cache";
  cacheLife("minutes");

  const repos: GitHubRepo[] = [];

  for (let page = 1; page <= MAX_REPO_PAGES; page += 1) {
    const pageRepos = await githubFetch<GitHubRepo[]>(
      `/user/repos?sort=updated&per_page=100&type=all&page=${page}`,
      token
    );

    repos.push(...pageRepos);

    if (pageRepos.length < 100) {
      break;
    }
  }

  return repos;
}

export async function getOpenPRs(token: string, username: string): Promise<GitHubPR[]> {
  "use cache";
  cacheLife("minutes");

  const params = new URLSearchParams({
    q: `type:pr state:open author:${username}`,
    per_page: "100",
  });
  const result = await githubFetch<{ items: GitHubPR[] }>(
    `/search/issues?${params.toString()}`,
    token
  );

  return result.items;
}

export async function getRecentCommits(
  token: string,
  username: string
): Promise<GitHubCommit[]> {
  "use cache";
  cacheLife("minutes");

  const sinceDate = getDateKeyDaysAgo(29);
  const params = new URLSearchParams({
    q: `author:${username} author-date:>=${sinceDate}`,
    sort: "author-date",
    order: "desc",
    per_page: "100",
  });

  try {
    const result = await githubFetch<{ items: GitHubCommit[] }>(
      `/search/commits?${params.toString()}`,
      token
    );

    return result.items;
  } catch {
    return getRecentCommitsFromRepos(token, username, sinceDate);
  }
}

async function getRecentCommitsFromRepos(
  token: string,
  username: string,
  sinceDate: string
): Promise<GitHubCommit[]> {
  const repos = await getUserRepos(token);

  const results = await mapWithConcurrency(repos, 8, (repo) =>
    githubFetch<GitHubCommit[]>(
      `/repos/${repo.full_name}/commits?author=${username}&since=${sinceDate}T00:00:00Z&per_page=100`,
      token
    ).catch(() => [] as GitHubCommit[])
  );

  return results.flat();
}

async function mapWithConcurrency<TItem, TResult>(
  items: TItem[],
  limit: number,
  mapper: (item: TItem) => Promise<TResult>
): Promise<TResult[]> {
  const results: TResult[] = [];
  let nextIndex = 0;
  const workerCount = Math.min(limit, items.length);
  const workers = Array.from({ length: workerCount }, async () => {
    while (nextIndex < items.length) {
      const currentIndex = nextIndex;
      nextIndex += 1;
      results[currentIndex] = await mapper(items[currentIndex]);
    }
  });

  await Promise.all(workers);

  return results;
}

export function groupCommitsByDay(commits: GitHubCommit[], dayCount = 7): CommitActivity[] {
  const counts: Record<string, number> = {};

  commits.forEach((commit) => {
    const date = toDateKey(new Date(commit.commit.author.date));
    counts[date] = (counts[date] ?? 0) + 1;
  });

  const result: CommitActivity[] = [];
  const days = Math.max(1, dayCount);

  for (let index = days - 1; index >= 0; index -= 1) {
    const date = new Date();
    date.setDate(date.getDate() - index);
    const key = toDateKey(date);
    result.push({ date: key, count: counts[key] ?? 0 });
  }

  return result;
}

function getDateKeyDaysAgo(daysAgo: number) {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return toDateKey(date);
}

function toDateKey(date: Date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

