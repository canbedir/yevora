"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  Check,
  CheckCircle2,
  CircleDot,
  Code2,
  ExternalLink,
  LoaderCircle,
  Lock,
  Plus,
  Search,
  Star,
} from "lucide-react";

import { saveTrackedRepos } from "@/app/actions/tracked-repos";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { GitHubRepo } from "@/types/github";

function getRelativeTime(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  const formatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

  const days = Math.floor(diffInSeconds / 86400);
  if (days > 0) return formatter.format(-days, "day");

  const hours = Math.floor(diffInSeconds / 3600);
  if (hours > 0) return formatter.format(-hours, "hour");

  const minutes = Math.floor(diffInSeconds / 60);
  if (minutes > 0) return formatter.format(-minutes, "minute");

  return formatter.format(-diffInSeconds, "second");
}

function getLanguageTone(language: string) {
  const normalized = language.toLowerCase();

  if (normalized === "typescript") return "bg-sky-500";
  if (normalized === "javascript") return "bg-amber-400";
  if (normalized === "python") return "bg-emerald-500";
  if (normalized === "go") return "bg-cyan-500";
  if (normalized === "rust") return "bg-orange-500";

  return "bg-neutral-400";
}

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = window.setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => window.clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

type RepoSyncState = "idle" | "saving" | "saved" | "error";

interface RepoListProps {
  repos: GitHubRepo[];
  initialTrackedRepoIds: number[];
  hasSavedSelection: boolean;
}

function arraysEqual(left: number[], right: number[]) {
  if (left.length !== right.length) {
    return false;
  }

  return left.every((item, index) => item === right[index]);
}

export function RepoList({ repos, initialTrackedRepoIds, hasSavedSelection }: RepoListProps) {
  const [search, setSearch] = useState("");
  const [language, setLanguage] = useState("all");
  const [sortBy, setSortBy] = useState("updated");
  const [showAll, setShowAll] = useState(false);
  const [syncState, setSyncState] = useState<RepoSyncState>("idle");
  const fallbackTrackedRepoIds = repos.slice(0, 6).map((repo) => repo.id);
  const [trackedRepoIds, setTrackedRepoIds] = useState<number[]>(
    hasSavedSelection ? initialTrackedRepoIds : fallbackTrackedRepoIds
  );
  const lastSyncedRepoIdsRef = useRef<number[]>(hasSavedSelection ? initialTrackedRepoIds : []);
  const debouncedSearch = useDebounce(search, 250);

  useEffect(() => {
    if (arraysEqual(trackedRepoIds, lastSyncedRepoIdsRef.current)) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setSyncState("saving");

      saveTrackedRepos(trackedRepoIds)
        .then(() => {
          lastSyncedRepoIdsRef.current = trackedRepoIds;
          setSyncState("saved");
        })
        .catch((error) => {
          console.error("Failed to save tracked repos", error);
          setSyncState("error");
        });
    }, 280);

    return () => window.clearTimeout(timeoutId);
  }, [trackedRepoIds]);

  const uniqueLanguages = useMemo(() => {
    const languages = new Set<string>();
    repos.forEach((repo) => {
      if (repo.language) languages.add(repo.language);
    });
    return Array.from(languages).sort();
  }, [repos]);

  const filteredAndSortedRepos = useMemo(() => {
    const lowerSearch = debouncedSearch.toLowerCase();
    const result = repos.filter((repo) => {
      const matchesSearch =
        !lowerSearch ||
        repo.name.toLowerCase().includes(lowerSearch) ||
        repo.full_name.toLowerCase().includes(lowerSearch) ||
        (repo.description?.toLowerCase().includes(lowerSearch) ?? false);
      const matchesLanguage = language === "all" || repo.language === language;

      return matchesSearch && matchesLanguage;
    });

    result.sort((left, right) => {
      if (sortBy === "stars") {
        return right.stargazers_count - left.stargazers_count;
      }
      if (sortBy === "name") {
        return left.name.localeCompare(right.name);
      }
      return new Date(right.updated_at).getTime() - new Date(left.updated_at).getTime();
    });

    return result;
  }, [repos, debouncedSearch, language, sortBy]);

  const trackedRepoIdSet = useMemo(() => new Set(trackedRepoIds), [trackedRepoIds]);
  const displayedRepos = showAll
    ? filteredAndSortedRepos
    : filteredAndSortedRepos.filter((repo) => trackedRepoIdSet.has(repo.id));

  const privateRepos = repos.filter((repo) => repo.private).length;
  const activeRepos = repos.filter((repo) => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return new Date(repo.updated_at) >= thirtyDaysAgo;
  }).length;

  const toggleTrackedRepo = (repoId: number) => {
    setTrackedRepoIds((currentIds) => {
      if (currentIds.includes(repoId)) {
        return currentIds.filter((id) => id !== repoId);
      }

      return [...currentIds, repoId];
    });
  };

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-3">
        <RepoStat label="Total repos" value={repos.length.toString()} />
        <RepoStat label="Active in 30 days" value={activeRepos.toString()} />
        <RepoStat label="Selected repos" value={trackedRepoIds.length.toString()} />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
          <Input
            placeholder="Search repositories..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="h-9 rounded-md border-neutral-200 bg-white pl-9"
          />
        </div>
        <div className="grid grid-cols-2 gap-3 sm:flex">
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className="h-9 rounded-md border-neutral-200 bg-white sm:w-[160px]">
              <SelectValue placeholder="Language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All languages</SelectItem>
              {uniqueLanguages.map((item) => (
                <SelectItem key={item} value={item}>
                  {item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="h-9 rounded-md border-neutral-200 bg-white sm:w-[160px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="updated">Recently updated</SelectItem>
              <SelectItem value="stars">Most stars</SelectItem>
              <SelectItem value="name">Name A-Z</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="inline-flex rounded-md border border-neutral-200 bg-white p-0.5">
          <button
            type="button"
            onClick={() => setShowAll(false)}
            className={`h-7 rounded px-3 text-xs font-medium transition-colors ${
              !showAll ? "bg-neutral-900 text-white" : "text-neutral-600 hover:bg-neutral-100"
            }`}
          >
            Selected
          </button>
          <button
            type="button"
            onClick={() => setShowAll(true)}
            className={`h-7 rounded px-3 text-xs font-medium transition-colors ${
              showAll ? "bg-neutral-900 text-white" : "text-neutral-600 hover:bg-neutral-100"
            }`}
          >
            All
          </button>
        </div>
        <div className="text-right">
          <p className="text-xs text-neutral-500">
            {displayedRepos.length} shown, {privateRepos} private
          </p>
          <RepoSyncStatus status={syncState} />
        </div>
      </div>

      {displayedRepos.length > 0 ? (
        <div className="grid gap-3 md:grid-cols-2">
          {displayedRepos.map((repo) => {
            const isTracked = trackedRepoIdSet.has(repo.id);

            return (
              <div
                key={repo.id}
                className={cn(
                  "yev-card yev-card-hover flex min-h-32 flex-col justify-between p-4",
                  isTracked && "yev-selected-card"
                )}
              >
                <span>
                  <span className="flex items-start justify-between gap-3">
                    <span className="min-w-0">
                      <span className="flex items-center gap-2">
                        <a
                          href={repo.html_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="truncate text-sm font-semibold text-neutral-950 hover:text-primary"
                        >
                          {repo.name}
                        </a>
                        {repo.private ? <Lock className="h-3.5 w-3.5 shrink-0 text-neutral-400" /> : null}
                      </span>
                      <span className="mt-1 block truncate text-xs text-neutral-500">{repo.full_name}</span>
                    </span>
                    <div className="flex shrink-0 items-center gap-1">
                      <button
                        type="button"
                        onClick={() => toggleTrackedRepo(repo.id)}
                        className={`flex h-7 w-7 items-center justify-center rounded-md border transition-colors ${
                          isTracked
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-neutral-200 bg-white text-neutral-500 hover:border-primary/40 hover:text-primary"
                        }`}
                        title={isTracked ? "Remove from selected" : "Add to selected"}
                      >
                        {isTracked ? <Check className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                      </button>
                      <a
                        href={repo.html_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex h-7 w-7 items-center justify-center rounded-md text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-950"
                        title="Open on GitHub"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </div>
                  </span>

                  <span className="mt-3 line-clamp-2 block min-h-10 text-sm leading-5 text-neutral-600">
                    {repo.description || "No description provided."}
                  </span>
                </span>

                <span className="mt-4 flex flex-wrap items-center gap-3 text-xs text-neutral-500">
                  {repo.language ? (
                    <span className="inline-flex items-center gap-1.5">
                      <span className={`h-2 w-2 rounded-full ${getLanguageTone(repo.language)}`} />
                      {repo.language}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5">
                      <Code2 className="h-3.5 w-3.5" />
                      Mixed
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1">
                    <Star className="h-3.5 w-3.5" />
                    {repo.stargazers_count}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <CircleDot className="h-3.5 w-3.5" />
                    {repo.open_issues_count}
                  </span>
                  <span className="ml-auto" suppressHydrationWarning>
                    {getRelativeTime(repo.updated_at)}
                  </span>
                </span>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="yev-card px-5 py-12 text-center">
          <p className="text-sm font-medium text-neutral-950">
            {showAll ? "No repositories found" : "No selected repositories"}
          </p>
          <p className="mt-1 text-sm text-neutral-500">
            {showAll ? "Try a different search or language filter." : "Switch to All and add the repositories you want here."}
          </p>
        </div>
      )}
    </div>
  );
}

function RepoSyncStatus({ status }: { status: RepoSyncState }) {
  if (status === "saving") {
    return (
      <p className="mt-1 inline-flex items-center justify-end gap-1 text-[11px] text-neutral-500">
        <LoaderCircle className="h-3 w-3 animate-spin" />
        Saving to your account
      </p>
    );
  }

  if (status === "saved") {
    return (
      <p className="mt-1 inline-flex items-center justify-end gap-1 text-[11px] text-emerald-700">
        <CheckCircle2 className="h-3 w-3" />
        Saved to your account
      </p>
    );
  }

  if (status === "error") {
    return (
      <p className="mt-1 inline-flex items-center justify-end gap-1 text-[11px] text-destructive">
        <AlertCircle className="h-3 w-3" />
        Could not save selection
      </p>
    );
  }

  return <p className="mt-1 text-[11px] text-neutral-500">Selections stay with your account</p>;
}

function RepoStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="yev-card p-4">
      <p className="text-xs text-neutral-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-neutral-950">{value}</p>
    </div>
  );
}
