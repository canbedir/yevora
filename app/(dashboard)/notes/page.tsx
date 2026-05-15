import { Suspense } from "react";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { Plus } from "lucide-react";

import { PageHeader } from "@/components/dashboard/PageHeader";
import { NotesContentSkeleton } from "@/components/dashboard/PageSkeletons";
import { NoteEditor } from "@/components/NoteEditor";
import { NoteList } from "@/components/NoteList";
import { AnimatedGroup } from "@/components/motion-primitives/AnimatedGroup";
import { Button } from "@/components/ui/button";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface NotesPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function NotesPage({ searchParams }: NotesPageProps) {
  await connection();

  return (
    <AnimatedGroup
      preset="slide"
      stagger={0.07}
      className="mx-auto flex min-h-[calc(100vh-7rem)] max-w-[960px] flex-col space-y-6"
    >
      <PageHeader
        title="Notes"
        description="Your knowledge base and quick notes."
        actions={
          <Button asChild>
            <Link href="/notes">
              <Plus className="h-4 w-4" />
              New note
            </Link>
          </Button>
        }
      />
      <Suspense fallback={<NotesContentSkeleton />}>
        <NotesContent searchParams={searchParams} />
      </Suspense>
    </AnimatedGroup>
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
      OR: q
        ? [
            { title: { contains: q, mode: "insensitive" } },
            { content: { contains: q, mode: "insensitive" } },
          ]
        : undefined,
    },
    orderBy: { updatedAt: "desc" },
  });

  const selectedNote = notes.find((note) => note.id === selectedId);

  return (
    <div className="grid flex-1 gap-4 overflow-hidden lg:grid-cols-[320px_minmax(0,1fr)]">
      <div className="yev-card flex min-h-[360px] flex-col overflow-hidden">
        <NoteList notes={notes} selectedId={selectedId} />
      </div>
      <div className="yev-card flex min-h-[520px] flex-col overflow-hidden">
        <NoteEditor key={selectedNote?.id ?? "new-note"} note={selectedNote} />
      </div>
    </div>
  );
}
