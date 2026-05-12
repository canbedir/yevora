"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { FileText, Plus, Save } from "lucide-react";

import { createNote, updateNote } from "@/app/actions/notes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Note } from "@prisma/client";

interface NoteEditorProps {
  note?: Note;
}

export function NoteEditor({ note }: NoteEditorProps) {
  const router = useRouter();
  const [title, setTitle] = useState(note?.title ?? "");
  const [content, setContent] = useState(note?.content ?? "");
  const [isSaving, setIsSaving] = useState(false);

  const wordCount = useMemo(() => {
    return content.trim().length === 0 ? 0 : content.trim().split(/\s+/).length;
  }, [content]);

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) return;

    setIsSaving(true);
    try {
      if (note) {
        await updateNote(note.id, title, content);
      } else {
        const newNote = await createNote(title, content);
        router.push(`/notes?selected=${newNote.id}`);
      }
    } catch (error) {
      console.error("Failed to save note:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex h-full flex-col bg-white">
      <div className="border-b border-neutral-200 p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-neutral-100 text-neutral-600">
              <FileText className="h-4 w-4" />
            </span>
            <Input
              placeholder="Note title..."
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="h-10 flex-1 rounded-md border-transparent bg-neutral-50 px-3 text-base font-semibold focus-visible:border-neutral-200"
            />
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button variant="outline" onClick={() => router.push("/notes")} disabled={isSaving}>
              <Plus className="h-4 w-4" />
              New
            </Button>
            <Button onClick={handleSave} disabled={isSaving || !title.trim() || !content.trim()}>
              <Save className="h-4 w-4" />
              {isSaving ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1 bg-[linear-gradient(180deg,#fff,#fafafa)] p-4">
        <textarea
          value={content}
          onChange={(event) => setContent(event.target.value)}
          placeholder="Write a note..."
          className="h-full min-h-[420px] w-full resize-none rounded-lg border border-neutral-200 bg-white px-4 py-4 text-sm leading-7 text-neutral-800 outline-none transition-colors placeholder:text-neutral-400 focus:border-primary/50 focus:ring-3 focus:ring-primary/15"
        />
      </div>

      <div className="flex items-center justify-between border-t border-neutral-200 px-4 py-3 text-xs text-neutral-500">
        <span>{note ? "Editing note" : "New note"}</span>
        <span>{wordCount} words</span>
      </div>
    </div>
  );
}
