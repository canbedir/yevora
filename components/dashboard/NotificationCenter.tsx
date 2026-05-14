"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useMemo } from "react";
import {
  Bell,
  CheckCircle2,
  CircleDot,
  ExternalLink,
  FileText,
  GitPullRequest,
  Timer,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { NotificationItem, NotificationTone } from "@/components/dashboard/useTodayQueue";

const toneStyles: Record<NotificationTone, string> = {
  focus: "bg-orange-100 text-orange-700",
  github: "bg-sky-100 text-sky-700",
  notes: "bg-emerald-100 text-emerald-700",
  repo: "bg-neutral-100 text-neutral-700",
};

export function NotificationCenter({
  items,
  isLoading,
  hasError,
  onOpenChange,
}: {
  items: NotificationItem[];
  isLoading: boolean;
  hasError: boolean;
  onOpenChange?: (open: boolean) => void;
}) {

  const visibleCount = useMemo(() => Math.min(items.length, 9), [items.length]);

  return (
    <DropdownMenu modal={false} onOpenChange={onOpenChange}>
      <DropdownMenuTrigger asChild>
        <button className="relative flex h-8 w-8 items-center justify-center rounded-md text-neutral-600 outline-none transition-colors hover:bg-neutral-100 hover:text-neutral-950 focus-visible:ring-2 focus-visible:ring-primary/30">
          <Bell className="h-4 w-4" />
          {items.length > 0 ? (
            <span className="yev-live-signal absolute right-1 top-1 flex h-3 min-w-3 items-center justify-center rounded-full bg-primary px-0.5 text-[9px] font-semibold leading-none text-primary-foreground ring-2 ring-neutral-50">
              {visibleCount}
            </span>
          ) : null}
          <span className="sr-only">Notifications</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[calc(100vw-1rem)] p-0 sm:w-[340px]">
        <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-3">
          <div>
            <p className="text-sm font-semibold text-neutral-950">Today queue</p>
            <p className="mt-0.5 text-xs text-neutral-500">
              {items.length > 0 ? `${items.length} signal${items.length > 1 ? "s" : ""} to review` : "All clear"}
            </p>
          </div>
        </div>

        <div className="max-h-[380px] overflow-y-auto p-1.5">
          {isLoading ? (
            <QueueState title="Checking your day..." detail="Pulling focus, notes, and GitHub signals." />
          ) : hasError ? (
            <QueueState title="Could not load queue" detail="Try opening notifications again in a moment." />
          ) : items.length > 0 ? (
            items.map((item) => <QueueLink key={item.id} item={item} />)
          ) : (
            <QueueState
              icon={<CheckCircle2 className="h-5 w-5 text-emerald-600" />}
              title="Nothing urgent"
              detail="Your focus, notes, and repo signals look tidy right now."
            />
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function QueueLink({ item }: { item: NotificationItem }) {
  const content = (
    <>
      <span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${toneStyles[item.tone]}`}>
        <ToneIcon tone={item.tone} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold text-neutral-950">{item.title}</span>
        <span className="mt-0.5 line-clamp-2 block text-xs leading-5 text-neutral-500">{item.detail}</span>
      </span>
      {item.external ? <ExternalLink className="mt-1 h-3.5 w-3.5 shrink-0 text-neutral-400" /> : null}
    </>
  );
  const className =
    "flex items-start gap-3 rounded-md px-2.5 py-2.5 outline-none transition-colors hover:bg-neutral-50 focus-visible:bg-neutral-50";

  if (item.external) {
    return (
      <a href={item.href} target="_blank" rel="noopener noreferrer" className={className}>
        {content}
      </a>
    );
  }

  return (
    <Link href={item.href} className={className}>
      {content}
    </Link>
  );
}

function ToneIcon({ tone }: { tone: NotificationTone }) {
  if (tone === "focus") return <Timer className="h-4 w-4" />;
  if (tone === "github") return <GitPullRequest className="h-4 w-4" />;
  if (tone === "notes") return <FileText className="h-4 w-4" />;
  return <CircleDot className="h-4 w-4" />;
}

function QueueState({
  title,
  detail,
  icon,
}: {
  title: string;
  detail: string;
  icon?: ReactNode;
}) {
  return (
    <div className="px-4 py-8 text-center">
      <div className="mx-auto mb-3 flex h-9 w-9 items-center justify-center rounded-md bg-neutral-100">
        {icon ?? <Bell className="h-4 w-4 text-neutral-500" />}
      </div>
      <p className="text-sm font-semibold text-neutral-950">{title}</p>
      <p className="mt-1 text-xs leading-5 text-neutral-500">{detail}</p>
    </div>
  );
}
