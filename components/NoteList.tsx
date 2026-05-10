"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { Trash2 } from "lucide-react";

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
  return text.replace(/[#*`_\[\]()]/g, "").trim();
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
    const delayDebounceFn = setTimeout(() => {
      const params = new URLSearchParams(searchParams);
      if (search) {
        params.set("q", search);
      } else {
        params.delete("q");
      }
      router.replace(`/notes?${params.toString()}`);
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [search, router, searchParams]);

  const handleDelete = async () => {
    if (noteToDelete) {
      await deleteNote(noteToDelete);
      setNoteToDelete(null);
      if (selectedId === noteToDelete) {
        router.push("/notes");
      }
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <Input
          placeholder="Search notes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {notes.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No notes found.
          </div>
        ) : (
          notes.map((note) => (
            <div
              key={note.id}
              className={cn(
                "p-3 rounded-md cursor-pointer transition-colors group border border-transparent hover:border-border",
                selectedId === note.id ? "bg-accent" : "hover:bg-accent/50"
              )}
              onClick={() => {
                const params = new URLSearchParams(searchParams);
                params.set("selected", note.id);
                router.push(`/notes?${params.toString()}`);
              }}
            >
              <div className="flex justify-between items-start">
                <div className="font-semibold truncate pr-2">{note.title || "Untitled"}</div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-0 group-hover:opacity-100 shrink-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    setNoteToDelete(note.id);
                  }}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
              <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                {stripMarkdown(note.content).slice(0, 100) || "No content"}
              </div>
              <div className="text-[10px] text-muted-foreground mt-2">
                {format(new Date(note.updatedAt), "MMM d, yyyy")}
              </div>
            </div>
          ))
        )}
      </div>

      <Dialog open={!!noteToDelete} onOpenChange={(open) => !open && setNoteToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Note</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this note? This action cannot be undone.
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
