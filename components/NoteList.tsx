"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { FileText, Search, Trash2 } from "lucide-react";

import { deleteNote } from "@/app/actions/notes";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { Note } from "@prisma/client";

function stripMarkdown(text: string) {
  return text.replace(/[#*`_[\]()]/g, "").trim();
}

interface NoteListProps {
  notes: Note[];
  selectedId?: string;
}

export function NoteList({ notes, selectedId }: NoteListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("q") ?? "");
  const [noteToDelete, setNoteToDelete] = useState<string | null>(null);

  useEffect(() => {
    const delayDebounceFn = window.setTimeout(() => {
      const params = new URLSearchParams(searchParams);
      if (search) {
        params.set("q", search);
      } else {
        params.delete("q");
      }
      const query = params.toString();
      router.replace(query ? `/notes?${query}` : "/notes");
    }, 250);

    return () => window.clearTimeout(delayDebounceFn);
  }, [search, router, searchParams]);

  const handleDelete = async () => {
    if (!noteToDelete) return;

    await deleteNote(noteToDelete);
    setNoteToDelete(null);

    if (selectedId === noteToDelete) {
      router.push("/notes");
    }
  };

  return (
    <div className="flex h-full flex-col bg-white">
      <div className="border-b border-neutral-200 p-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
          <Input
            placeholder="Search notes..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="h-9 rounded-md border-neutral-200 bg-neutral-50 pl-9"
          />
        </div>
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm font-semibold text-neutral-950">All notes</p>
          <p className="text-xs text-neutral-500">{notes.length} notes</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {notes.length === 0 ? (
          <div className="px-4 py-10 text-center">
            <p className="text-sm font-medium text-neutral-950">No notes found</p>
            <p className="mt-1 text-sm text-neutral-500">Create a note or change your search.</p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-200">
            {notes.map((note) => (
              <div
                key={note.id}
                role="button"
                tabIndex={0}
                className={cn(
                  "group flex w-full items-start gap-3 px-4 py-4 text-left transition-colors hover:bg-neutral-50",
                  selectedId === note.id && "bg-neutral-100"
                )}
                onClick={() => {
                  const params = new URLSearchParams(searchParams);
                  params.set("selected", note.id);
                  router.push(`/notes?${params.toString()}`);
                }}
                onKeyDown={(event) => {
                  if (event.key !== "Enter" && event.key !== " ") return;

                  event.preventDefault();
                  const params = new URLSearchParams(searchParams);
                  params.set("selected", note.id);
                  router.push(`/notes?${params.toString()}`);
                }}
              >
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-neutral-100 text-neutral-600">
                  <FileText className="h-4 w-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-start justify-between gap-3">
                    <span className="truncate text-sm font-semibold text-neutral-950">
                      {note.title || "Untitled"}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      className="shrink-0 opacity-0 group-hover:opacity-100"
                      onClick={(event) => {
                        event.stopPropagation();
                        setNoteToDelete(note.id);
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                      <span className="sr-only">Delete note</span>
                    </Button>
                  </span>
                  <span className="mt-1 line-clamp-2 block text-xs leading-5 text-neutral-600">
                    {stripMarkdown(note.content).slice(0, 100) || "No content"}
                  </span>
                  <span className="mt-2 block text-xs text-neutral-500">
                    {format(new Date(note.updatedAt), "MMM d, yyyy")}
                  </span>
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={!!noteToDelete} onOpenChange={(open) => !open && setNoteToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete note</DialogTitle>
            <DialogDescription>
              This note will be permanently removed from your workspace.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNoteToDelete(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
