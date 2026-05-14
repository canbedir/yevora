"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ExternalLink,
  FileText,
  FolderGit2,
  LayoutDashboard,
  Search,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type SearchResultType = "page" | "note" | "repo";

interface SearchResult {
  id: string;
  type: SearchResultType;
  title: string;
  description: string;
  href: string;
  meta?: string;
  external?: boolean;
}

const resultIcons: Record<SearchResultType, LucideIcon> = {
  page: LayoutDashboard,
  note: FileText,
  repo: FolderGit2,
};

const resultTypeLabels: Record<SearchResultType, string> = {
  page: "Page",
  note: "Note",
  repo: "Repo",
};

function getShortcutLabel() {
  if (typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform)) {
    return "Cmd K";
  }

  return "Ctrl K";
}

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shortcutLabel, setShortcutLabel] = useState("Ctrl K");

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => setShortcutLabel(getShortcutLabel()));
    return () => window.cancelAnimationFrame(frameId);
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => {
      setIsLoading(true);
      setError(null);

      fetch(`/api/search?q=${encodeURIComponent(query)}`, { signal: controller.signal })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Search request failed");
          }

          return response.json() as Promise<{ results: SearchResult[] }>;
        })
        .then((data) => {
          setResults(Array.isArray(data.results) ? data.results : []);
        })
        .catch((searchError: unknown) => {
          if (searchError instanceof DOMException && searchError.name === "AbortError") {
            return;
          }

          setError("Search is unavailable right now.");
          setResults([]);
        })
        .finally(() => setIsLoading(false));
    }, 160);

    return () => {
      controller.abort();
      window.clearTimeout(timeoutId);
    };
  }, [open, query]);

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);

    if (!nextOpen) {
      setQuery("");
      setResults([]);
      setError(null);
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="relative hidden h-8 w-full max-w-[300px] items-center rounded-md border border-transparent bg-neutral-100 pl-9 pr-2 text-left text-sm text-neutral-500 outline-none transition-colors hover:bg-neutral-200/70 focus-visible:border-neutral-300 focus-visible:bg-white focus-visible:ring-3 focus-visible:ring-neutral-200 sm:flex"
      >
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
        <span className="min-w-0 flex-1 truncate">Search notes, repos, pages...</span>
        <span className="ml-2 rounded border border-neutral-200 bg-white px-1.5 py-0.5 text-[10px] font-medium text-neutral-500">
          {shortcutLabel}
        </span>
      </button>

      <DialogContent
        showCloseButton={false}
        className="max-w-[calc(100%-2rem)] gap-0 overflow-hidden rounded-xl border border-neutral-200 bg-white p-0 shadow-[0_28px_90px_-48px_rgba(15,23,42,0.5)] sm:max-w-[640px]"
      >
        <DialogTitle className="sr-only">Command palette</DialogTitle>
        <DialogDescription className="sr-only">
          Search pages, notes, and repositories.
        </DialogDescription>

        <div className="flex items-center gap-3 border-b border-neutral-200 px-4 py-3">
          <Search className="h-4 w-4 shrink-0 text-neutral-500" />
          <input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search pages, notes, repositories..."
            className="h-8 min-w-0 flex-1 bg-transparent text-sm text-neutral-950 outline-none placeholder:text-neutral-400"
          />
          <span className="hidden rounded border border-neutral-200 bg-neutral-50 px-1.5 py-0.5 text-[10px] font-medium text-neutral-500 sm:inline">
            Esc
          </span>
        </div>

        <div className="max-h-[420px] overflow-y-auto p-2">
          {isLoading ? (
            <CommandState icon={Sparkles} title="Searching" description="Gathering matching notes and repositories." />
          ) : error ? (
            <CommandState icon={Search} title="Search unavailable" description={error} />
          ) : results.length === 0 ? (
            <CommandState icon={Search} title="No results" description="Try a note title, repository name, or page." />
          ) : (
            <div className="space-y-1">
              {results.map((result) => (
                <CommandResult
                  key={result.id}
                  result={result}
                  onSelect={() => handleOpenChange(false)}
                />
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function CommandState({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <div className="px-5 py-10 text-center">
      <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-md bg-neutral-100 text-neutral-500">
        <Icon className="h-4 w-4" />
      </div>
      <p className="mt-3 text-sm font-semibold text-neutral-950">{title}</p>
      <p className="mt-1 text-sm text-neutral-500">{description}</p>
    </div>
  );
}

function CommandResult({
  result,
  onSelect,
}: {
  result: SearchResult;
  onSelect: () => void;
}) {
  const Icon = resultIcons[result.type];
  const content = (
    <>
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-neutral-100 text-neutral-600">
        <Icon className="h-4 w-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="truncate text-sm font-semibold text-neutral-950">{result.title}</span>
          <span className="shrink-0 rounded bg-neutral-100 px-1.5 py-0.5 text-[11px] text-neutral-500">
            {result.meta ?? resultTypeLabels[result.type]}
          </span>
        </span>
        <span className="mt-1 line-clamp-1 block text-xs leading-5 text-neutral-500">
          {result.description}
        </span>
      </span>
      {result.external ? <ExternalLink className="h-4 w-4 shrink-0 text-neutral-400" /> : null}
    </>
  );

  const className = cn(
    "flex w-full items-center gap-3 rounded-md px-3 py-3 text-left transition-colors hover:bg-neutral-100 focus-visible:bg-neutral-100 focus-visible:outline-none"
  );

  if (result.external) {
    return (
      <a href={result.href} target="_blank" rel="noopener noreferrer" onClick={onSelect} className={className}>
        {content}
      </a>
    );
  }

  return (
    <Link href={result.href} onClick={onSelect} className={className}>
      {content}
    </Link>
  );
}
