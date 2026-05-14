import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { getUserRepos } from "@/lib/github";
import { prisma } from "@/lib/prisma";

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

const PAGE_RESULTS: SearchResult[] = [
  {
    id: "page-dashboard",
    type: "page",
    title: "Dashboard",
    description: "Open your full developer overview.",
    href: "/dashboard",
    meta: "Page",
  },
  {
    id: "page-today",
    type: "page",
    title: "Today",
    description: "Open the queue for today's focus, PRs, notes, and repo signals.",
    href: "/today",
    meta: "Page",
  },
  {
    id: "page-focus",
    type: "page",
    title: "Focus",
    description: "Start a focus timer and log session output.",
    href: "/focus",
    meta: "Page",
  },
  {
    id: "page-repos",
    type: "page",
    title: "Repositories",
    description: "Search, filter, and select GitHub repositories.",
    href: "/repos",
    meta: "Page",
  },
  {
    id: "page-notes",
    type: "page",
    title: "Notes",
    description: "Search and edit your developer notes.",
    href: "/notes",
    meta: "Page",
  },
  {
    id: "page-stats",
    type: "page",
    title: "Stats",
    description: "Review focus and commit trends.",
    href: "/stats",
    meta: "Page",
  },
];

function normalizeQuery(value: string | null) {
  return (value ?? "").trim().slice(0, 80);
}

function includesQuery(value: string | null | undefined, query: string) {
  return value?.toLowerCase().includes(query.toLowerCase()) ?? false;
}

function createSnippet(content: string, query: string) {
  const normalizedContent = content.replace(/[#*`_[\]()]/g, "").replace(/\s+/g, " ").trim();

  if (!query) {
    return normalizedContent.slice(0, 120) || "No content yet.";
  }

  const matchIndex = normalizedContent.toLowerCase().indexOf(query.toLowerCase());
  if (matchIndex === -1) {
    return normalizedContent.slice(0, 120) || "No matching content.";
  }

  const start = Math.max(0, matchIndex - 40);
  return normalizedContent.slice(start, start + 140);
}

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const query = normalizeQuery(url.searchParams.get("q"));
  const lowerQuery = query.toLowerCase();

  const pageResults = query
    ? PAGE_RESULTS.filter(
        (item) =>
          includesQuery(item.title, lowerQuery) ||
          includesQuery(item.description, lowerQuery) ||
          includesQuery(item.href, lowerQuery)
      )
    : PAGE_RESULTS;

  const notes = query
    ? await prisma.note.findMany({
        where: {
          userId: session.user.id,
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { content: { contains: query, mode: "insensitive" } },
          ],
        },
        orderBy: { updatedAt: "desc" },
        take: 5,
      })
    : await prisma.note.findMany({
        where: { userId: session.user.id },
        orderBy: { updatedAt: "desc" },
        take: 4,
      });

  const noteResults: SearchResult[] = notes.map((note) => ({
    id: `note-${note.id}`,
    type: "note",
    title: note.title || "Untitled note",
    description: createSnippet(note.content, query),
    href: `/notes?selected=${note.id}`,
    meta: "Note",
  }));

  let repoResults: SearchResult[] = [];
  if (query && session.accessToken) {
    try {
      const repos = await getUserRepos(session.accessToken);
      repoResults = repos
        .filter(
          (repo) =>
            includesQuery(repo.name, lowerQuery) ||
            includesQuery(repo.full_name, lowerQuery) ||
            includesQuery(repo.description, lowerQuery) ||
            includesQuery(repo.language, lowerQuery)
        )
        .slice(0, 5)
        .map((repo) => ({
          id: `repo-${repo.id}`,
          type: "repo",
          title: repo.name,
          description: repo.description || repo.full_name,
          href: repo.html_url,
          meta: repo.language ?? "Repository",
          external: true,
        }));
    } catch {
      repoResults = [];
    }
  }

  return NextResponse.json({
    results: [...pageResults, ...noteResults, ...repoResults].slice(0, 14),
  });
}
