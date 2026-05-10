import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { NoteEditor } from "@/components/NoteEditor";
import { NoteList } from "@/components/NoteList";
import { Skeleton } from "@/components/ui/skeleton";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface NotesPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default function NotesPage({ searchParams }: NotesPageProps) {
  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <h1 className="text-3xl font-bold tracking-tight mb-6">Notes</h1>
      <Suspense fallback={<NotesSkeleton />}>
        <NotesContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function NotesContent({ searchParams }: NotesPageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const resolvedParams = await searchParams;
  const q = typeof resolvedParams.q === "string" ? resolvedParams.q : undefined;
  const selectedId = typeof resolvedParams.selected === "string" ? resolvedParams.selected : undefined;

  const notes = await prisma.note.findMany({
    where: {
      userId: session.user.id,
      title: q ? { contains: q, mode: "insensitive" } : undefined,
    },
    orderBy: { updatedAt: "desc" },
  });

  const selectedNote = notes.find((note) => note.id === selectedId);

  return (
    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 overflow-hidden">
      <div className="md:col-span-1 flex flex-col overflow-hidden border rounded-lg bg-card text-card-foreground shadow-sm">
        <NoteList notes={notes} selectedId={selectedId} />
      </div>
      <div className="md:col-span-2 flex flex-col overflow-hidden border rounded-lg bg-card text-card-foreground shadow-sm">
        <NoteEditor note={selectedNote} />
      </div>
    </div>
  );
}

function NotesSkeleton() {
  return (
    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6">
      <Skeleton className="md:col-span-1 h-full min-h-[400px]" />
      <Skeleton className="md:col-span-2 h-full min-h-[400px]" />
    </div>
  );
}
