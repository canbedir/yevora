"use client";

import { useRouter } from "next/navigation";
import { useCallback, useMemo, useRef, useState, useEffect } from "react";
import MDEditor from "@uiw/react-md-editor/nohighlight";
import { AlertCircle, CheckCircle2, CircleDot, Eye, FileText, LoaderCircle, Pencil, Plus, Save } from "lucide-react";

import { createNote, updateNote } from "@/app/actions/notes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { Note } from "@prisma/client";

interface NoteEditorProps {
  note?: Note;
}

type EditorMode = "write" | "preview";
type SaveStatus = "idle" | "dirty" | "saving" | "saved" | "error";

export function NoteEditor({ note }: NoteEditorProps) {
  const router = useRouter();
  const [title, setTitle] = useState(note?.title ?? "");
  const [content, setContent] = useState(note?.content ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [mode, setMode] = useState<EditorMode>("write");
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const noteIdRef = useRef(note?.id ?? null);
  const savedSnapshotRef = useRef({
    title: note?.title ?? "",
    content: note?.content ?? "",
  });
  const editVersionRef = useRef(0);

  const wordCount = useMemo(() => {
    return content.trim().length === 0 ? 0 : content.trim().split(/\s+/).length;
  }, [content]);

  const canSave = Boolean(title.trim() && content.trim());

  const markDirty = () => {
    editVersionRef.current += 1;
    setSaveStatus("dirty");
  };

  const saveNote = useCallback(async () => {
    const safeTitle = title.trim();
    const safeContent = content.trim();

    if (!safeTitle || !safeContent) return;
    if (
      safeTitle === savedSnapshotRef.current.title &&
      safeContent === savedSnapshotRef.current.content
    ) {
      return;
    }

    setIsSaving(true);
    setSaveStatus("saving");
    const savingVersion = editVersionRef.current;

    try {
      const currentNoteId = noteIdRef.current;
      const savedNote = currentNoteId
        ? await updateNote(currentNoteId, safeTitle, safeContent)
        : await createNote(safeTitle, safeContent);

      noteIdRef.current = savedNote.id;
      savedSnapshotRef.current = {
        title: savedNote.title,
        content: savedNote.content,
      };

      if (savingVersion === editVersionRef.current) {
        setSaveStatus("saved");
        setSavedAt(new Date());
      } else {
        setSaveStatus("dirty");
      }

      if (!currentNoteId) {
        router.replace(`/notes?selected=${savedNote.id}`);
      }

      router.refresh();
    } catch (error) {
      console.error("Failed to save note:", error);
      setSaveStatus("error");
    } finally {
      setIsSaving(false);
    }
  }, [content, router, title]);

  useEffect(() => {
    if (!canSave) {
      return;
    }

    const safeTitle = title.trim();
    const safeContent = content.trim();
    if (
      safeTitle === savedSnapshotRef.current.title &&
      safeContent === savedSnapshotRef.current.content
    ) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      void saveNote();
    }, 900);

    return () => window.clearTimeout(timeoutId);
  }, [canSave, content, saveNote, title]);

  const statusLabel = getStatusLabel(saveStatus, savedAt);

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
              onChange={(event) => {
                setTitle(event.target.value);
                markDirty();
              }}
              className="h-10 flex-1 rounded-md border-transparent bg-neutral-50 px-3 text-base font-semibold focus-visible:border-neutral-200"
            />
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <div className="hidden rounded-md border border-neutral-200 bg-neutral-50 p-0.5 sm:flex">
              <ModeButton active={mode === "write"} onClick={() => setMode("write")}>
                <Pencil className="h-3.5 w-3.5" />
                Write
              </ModeButton>
              <ModeButton active={mode === "preview"} onClick={() => setMode("preview")}>
                <Eye className="h-3.5 w-3.5" />
                Preview
              </ModeButton>
            </div>
            <Button variant="outline" onClick={() => router.push("/notes")} disabled={isSaving}>
              <Plus className="h-4 w-4" />
              New
            </Button>
            <Button onClick={() => void saveNote()} disabled={isSaving || !canSave}>
              {isSaving ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {isSaving ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
        <div className="mt-3 flex rounded-md border border-neutral-200 bg-neutral-50 p-0.5 sm:hidden">
          <ModeButton active={mode === "write"} onClick={() => setMode("write")}>
            <Pencil className="h-3.5 w-3.5" />
            Write
          </ModeButton>
          <ModeButton active={mode === "preview"} onClick={() => setMode("preview")}>
            <Eye className="h-3.5 w-3.5" />
            Preview
          </ModeButton>
        </div>
      </div>

      <div className="min-h-0 flex-1 bg-[linear-gradient(180deg,#fff,#fafafa)] p-4">
        {mode === "write" ? (
          <textarea
            value={content}
            onChange={(event) => {
              setContent(event.target.value);
              markDirty();
            }}
            placeholder="Write a note..."
            className="h-full min-h-[420px] w-full resize-none rounded-lg border border-neutral-200 bg-white px-4 py-4 text-sm leading-7 text-neutral-800 outline-none transition-colors placeholder:text-neutral-400 focus:border-primary/50 focus:ring-3 focus:ring-primary/15"
          />
        ) : (
          <div data-color-mode="light" className="h-full min-h-[420px] overflow-y-auto rounded-lg border border-neutral-200 bg-white px-5 py-5">
            {content.trim() ? (
              <MDEditor.Markdown
                source={content}
                className="!bg-transparent text-sm leading-7"
                style={{ whiteSpace: "pre-wrap" }}
              />
            ) : (
              <div className="flex h-full min-h-[360px] items-center justify-center text-center">
                <div>
                  <FileText className="mx-auto h-5 w-5 text-neutral-400" />
                  <p className="mt-3 text-sm font-medium text-neutral-950">Nothing to preview yet</p>
                  <p className="mt-1 text-sm text-neutral-500">Write markdown to see it rendered here.</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-neutral-200 px-4 py-3 text-xs text-neutral-500">
        <span className="inline-flex items-center gap-1.5">
          {saveStatus === "saving" ? (
            <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
          ) : saveStatus === "saved" ? (
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-700" />
          ) : saveStatus === "dirty" ? (
            <CircleDot className="h-3.5 w-3.5 text-primary yev-live-signal" />
          ) : saveStatus === "error" ? (
            <AlertCircle className="h-3.5 w-3.5 text-destructive" />
          ) : null}
          {statusLabel}
        </span>
        <span>{wordCount} words</span>
      </div>
    </div>
  );
}

function ModeButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex h-7 flex-1 items-center justify-center gap-1.5 rounded px-2.5 text-xs font-medium transition-colors sm:flex-none",
        active ? "bg-white text-neutral-950 shadow-sm" : "text-neutral-600 hover:text-neutral-950"
      )}
    >
      {children}
    </button>
  );
}

function getStatusLabel(status: SaveStatus, savedAt: Date | null) {
  if (status === "saving") return "Autosaving";
  if (status === "dirty") return "Unsaved changes";
  if (status === "error") return "Save failed";
  if (status === "saved" && savedAt) {
    return `Saved ${savedAt.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}`;
  }

  return "Ready";
}
