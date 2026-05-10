import { unstable_cacheLife as cacheLife } from "next/cache";

import type {
  CommitActivity,
  GitHubCommit,
  GitHubPR,
  GitHubRepo,
} from "@/types/github";

const GITHUB_API = "https://api.github.com";

async function githubFetch<T>(endpoint: string, token: string): Promise<T> {
  const response = await fetch(`${GITHUB_API}${endpoint}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github.v3+json",
    },
  });

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}

export async function getUserRepos(token: string): Promise<GitHubRepo[]> {
  "use cache";
  cacheLife("minutes");

  return githubFetch<GitHubRepo[]>("/user/repos?sort=updated&per_page=50&type=all", token);
}

export async function getOpenPRs(token: string): Promise<GitHubPR[]> {
  "use cache";
  cacheLife("minutes");

  const result = await githubFetch<{ items: GitHubPR[] }>(
    "/search/issues?q=type:pr+state:open+author:@me",
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

  const repos = await getUserRepos(token);
  const topRepos = repos.slice(0, 5);

  const results = await Promise.all(
    topRepos.map((repo) =>
      githubFetch<GitHubCommit[]>(
        `/repos/${repo.full_name}/commits?author=${username}&per_page=10`,
        token
      ).catch(() => [] as GitHubCommit[])
    )
  );

  return results.flat();
}

export function groupCommitsByDay(commits: GitHubCommit[]): CommitActivity[] {
  const counts: Record<string, number> = {};

  commits.forEach((commit) => {
    const date = commit.commit.author.date.split("T")[0];
    counts[date] = (counts[date] ?? 0) + 1;
  });

  const result: CommitActivity[] = [];

  for (let index = 6; index >= 0; index -= 1) {
    const date = new Date();
    date.setDate(date.getDate() - index);
    const key = date.toISOString().split("T")[0];
    result.push({ date: key, count: counts[key] ?? 0 });
  }

  return result;
}

