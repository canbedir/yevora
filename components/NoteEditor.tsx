"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Save, Plus } from "lucide-react";

import { createNote, updateNote } from "@/app/actions/notes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Note } from "@prisma/client";

// Dynamically import MDEditor to avoid SSR issues
const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

interface NoteEditorProps {
  note?: Note;
}

export function NoteEditor({ note }: NoteEditorProps) {
  const router = useRouter();
  const [title, setTitle] = useState(note?.title ?? "");
  const [content, setContent] = useState<string | undefined>(note?.content ?? "");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setTitle(note?.title ?? "");
    setContent(note?.content ?? "");
  }, [note]);

  const handleSave = async () => {
    if (!title.trim() || !content?.trim()) return;

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

  const handleNewNote = () => {
    router.push("/notes");
  };

  return (
    <div className="flex flex-col h-full bg-background" data-color-mode="light">
      <div className="p-4 border-b flex items-center gap-2">
        <Input
          placeholder="Note title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="flex-1 font-semibold text-lg border-transparent focus-visible:ring-0 focus-visible:border-border px-0"
        />
        <Button variant="outline" size="sm" onClick={handleNewNote} disabled={isSaving}>
          <Plus className="h-4 w-4 mr-2" />
          New
        </Button>
        <Button size="sm" onClick={handleSave} disabled={isSaving || !title.trim() || !content?.trim()}>
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? "Saving..." : "Save"}
        </Button>
      </div>
      <div className="flex-1 overflow-hidden" data-color-mode="light">
        <MDEditor
          value={content}
          onChange={setContent}
          height="100%"
          className="h-full border-0 !rounded-none"
          previewOptions={{
            style: { padding: '24px' }
          }}
        />
      </div>
    </div>
  );
}
