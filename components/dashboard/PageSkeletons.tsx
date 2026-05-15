import type { ReactNode } from "react";

import { Skeleton } from "@/components/ui/skeleton";

export function DashboardPageSkeleton() {
  return (
    <div className="mx-auto max-w-[960px] space-y-6">
      <PageHeaderSkeleton />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <MetricCardSkeleton key={index} />
        ))}
      </div>
      <PanelSkeleton className="px-5 py-5">
        <div className="flex h-28 items-end justify-between gap-3 border-b border-neutral-200 px-4 pb-4">
          {[36, 68, 48, 84, 54, 74, 62].map((height, index) => (
            <div key={index} className="flex flex-1 flex-col items-center gap-2">
              <Skeleton className="w-7 rounded-t-md rounded-b-sm" style={{ height }} />
              <Skeleton className="h-3 w-7 rounded-sm" />
            </div>
          ))}
        </div>
        <div className="flex items-end justify-between pt-4">
          <div className="space-y-2">
            <Skeleton className="h-7 w-16" />
            <Skeleton className="h-3 w-20" />
          </div>
          <div className="space-y-2 text-right">
            <Skeleton className="ml-auto h-7 w-14" />
            <Skeleton className="ml-auto h-3 w-[4.5rem]" />
          </div>
        </div>
      </PanelSkeleton>
      <div className="grid gap-4 lg:grid-cols-2">
        <ListPanelSkeleton rows={5} />
        <ListPanelSkeleton rows={3} badge />
        <ListPanelSkeleton rows={5} noteRows />
        <PanelSkeleton className="p-5">
          <div className="space-y-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-3 w-40" />
          </div>
          <div className="mt-5 grid gap-2.5">
            {Array.from({ length: 5 }).map((_, index) => (
              <MiniRowSkeleton key={index} />
            ))}
          </div>
        </PanelSkeleton>
      </div>
    </div>
  );
}

export function DashboardContentSkeleton() {
  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <MetricCardSkeleton key={index} />
        ))}
      </div>
      <PanelSkeleton className="px-5 py-5">
        <div className="flex h-28 items-end justify-between gap-3 border-b border-neutral-200 px-4 pb-4">
          {[36, 68, 48, 84, 54, 74, 62].map((height, index) => (
            <div key={index} className="flex flex-1 flex-col items-center gap-2">
              <Skeleton className="w-7 rounded-t-md rounded-b-sm" style={{ height }} />
              <Skeleton className="h-3 w-7 rounded-sm" />
            </div>
          ))}
        </div>
        <div className="flex items-end justify-between pt-4">
          <div className="space-y-2">
            <Skeleton className="h-7 w-16" />
            <Skeleton className="h-3 w-20" />
          </div>
          <div className="space-y-2 text-right">
            <Skeleton className="ml-auto h-7 w-14" />
            <Skeleton className="ml-auto h-3 w-[4.5rem]" />
          </div>
        </div>
      </PanelSkeleton>
      <div className="grid gap-4 lg:grid-cols-2">
        <ListPanelSkeleton rows={5} />
        <ListPanelSkeleton rows={3} badge />
        <ListPanelSkeleton rows={5} noteRows />
        <PanelSkeleton className="p-5">
          <div className="space-y-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-3 w-40" />
          </div>
          <div className="mt-5 grid gap-2.5">
            {Array.from({ length: 5 }).map((_, index) => (
              <MiniRowSkeleton key={index} />
            ))}
          </div>
        </PanelSkeleton>
      </div>
    </>
  );
}

export function TodayPageSkeleton() {
  return (
    <div className="mx-auto max-w-[960px] space-y-6">
      <PageHeaderSkeleton />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <MetricCardSkeleton key={index} />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <ListPanelSkeleton rows={5} />
        <div className="space-y-4">
          <PanelSkeleton className="p-5">
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-3 w-28" />
            </div>
            <div className="mt-4 rounded-md border border-neutral-200 bg-orange-50/40 p-3">
              <Skeleton className="h-3 w-[4.5rem]" />
              <Skeleton className="mt-2 h-4 w-[8.5rem]" />
              <Skeleton className="mt-2 h-3 w-full" />
              <Skeleton className="mt-1 h-3 w-3/4" />
            </div>
            <Skeleton className="mt-4 h-9 w-full rounded-md" />
          </PanelSkeleton>
          <PanelSkeleton className="p-5">
            <div className="space-y-2">
              <Skeleton className="h-4 w-[4.5rem]" />
              <Skeleton className="h-3 w-[6.5rem]" />
            </div>
            <div className="mt-4 grid gap-2.5">
              {Array.from({ length: 4 }).map((_, index) => (
                <MiniRowSkeleton key={index} />
              ))}
            </div>
          </PanelSkeleton>
        </div>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <ListPanelSkeleton rows={3} noteRows />
        <ListPanelSkeleton rows={3} />
      </div>
    </div>
  );
}

export function FocusPageSkeleton() {
  return (
    <div className="mx-auto max-w-[960px] space-y-6">
      <PageHeaderSkeleton />
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <PanelSkeleton className="overflow-hidden">
          <div className="border-b border-neutral-200 px-5 py-4">
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-[5.5rem]" />
                <Skeleton className="h-3 w-56" />
              </div>
              <Skeleton className="h-9 w-9 rounded-md" />
            </div>
          </div>
          <div className="space-y-6 px-5 py-5">
            <div className="rounded-lg border border-neutral-200 bg-white px-5 py-8 text-center">
              <Skeleton className="mx-auto h-4 w-28" />
              <Skeleton className="mx-auto mt-4 h-[4.5rem] w-44 rounded-lg" />
              <Skeleton className="mx-auto mt-6 h-2 w-full max-w-md rounded-full" />
              <div className="mx-auto mt-2 flex max-w-md items-center justify-between">
                <Skeleton className="h-3 w-8" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-[1fr_220px]">
              <FieldSkeleton />
              <FieldSkeleton />
            </div>
            <div className="grid gap-3 sm:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-10 rounded-md" />
              ))}
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Skeleton className="h-10 flex-1 rounded-md" />
              <Skeleton className="h-10 sm:w-32 rounded-md" />
            </div>
          </div>
        </PanelSkeleton>
        <div className="space-y-4">
          <PanelSkeleton className="p-5">
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-28" />
            </div>
            <div className="mt-4 space-y-3">
              <FieldSkeleton />
              <MiniRowSkeleton />
            </div>
          </PanelSkeleton>
          <PanelSkeleton className="p-5">
            <div className="space-y-2">
              <Skeleton className="h-4 w-[4.5rem]" />
              <Skeleton className="h-3 w-[6.5rem]" />
            </div>
            <div className="mt-4 grid gap-2.5">
              {Array.from({ length: 3 }).map((_, index) => (
                <MiniRowSkeleton key={index} />
              ))}
            </div>
          </PanelSkeleton>
          <ListPanelSkeleton rows={4} noteRows />
        </div>
      </div>
    </div>
  );
}

export function ReposPageSkeleton() {
  return (
    <div className="mx-auto max-w-[960px] space-y-6">
      <PageHeaderSkeleton />
      <ReposContentSkeleton />
    </div>
  );
}

export function ReposContentSkeleton() {
  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <MetricCardSkeleton key={index} compact />
        ))}
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Skeleton className="h-9 flex-1 rounded-md" />
        <div className="grid grid-cols-2 gap-3 sm:flex">
          <Skeleton className="h-9 rounded-md sm:w-[160px]" />
          <Skeleton className="h-9 rounded-md sm:w-[160px]" />
        </div>
      </div>
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-[8.5rem] rounded-md" />
        <div className="space-y-2 text-right">
          <Skeleton className="ml-auto h-3 w-24" />
          <Skeleton className="ml-auto h-3 w-28" />
        </div>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {Array.from({ length: 6 }).map((_, index) => (
          <RepoCardSkeleton key={index} />
        ))}
      </div>
    </div>
  );
}

export function NotesPageSkeleton() {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-7rem)] max-w-[960px] flex-col space-y-6">
      <PageHeaderSkeleton withAction />
      <NotesContentSkeleton />
    </div>
  );
}

export function NotesContentSkeleton() {
  return (
    <div className="grid flex-1 gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
      <PanelSkeleton className="flex min-h-[360px] flex-col overflow-hidden">
        <div className="border-b border-neutral-200 px-4 py-3">
          <Skeleton className="h-9 w-full rounded-md" />
        </div>
        <div className="space-y-0.5 p-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="rounded-md px-3 py-3">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="mt-2 h-3 w-20" />
            </div>
          ))}
        </div>
      </PanelSkeleton>
      <PanelSkeleton className="flex min-h-[520px] flex-col overflow-hidden">
        <div className="border-b border-neutral-200 px-5 py-4">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="mt-2 h-3 w-28" />
        </div>
        <div className="flex items-center gap-2 border-b border-neutral-200 px-4 py-3">
          <Skeleton className="h-8 w-16 rounded-md" />
          <Skeleton className="h-8 w-[4.5rem] rounded-md" />
        </div>
        <div className="flex-1 p-4">
          <Skeleton className="h-full min-h-[360px] w-full rounded-lg" />
        </div>
      </PanelSkeleton>
    </div>
  );
}

export function StatsPageSkeleton() {
  return (
    <div className="mx-auto max-w-[960px] space-y-6">
      <PageHeaderSkeleton />
      <StatsContentSkeleton />
    </div>
  );
}

export function StatsContentSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <MetricCardSkeleton key={index} />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <ChartPanelSkeleton />
        <ChartPanelSkeleton area />
      </div>
    </div>
  );
}

function PageHeaderSkeleton({ withAction = false }: { withAction?: boolean }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="space-y-2">
        <Skeleton className="h-7 w-44 rounded-md" />
        <Skeleton className="h-4 w-72 max-w-full rounded-md" />
      </div>
      {withAction ? <Skeleton className="h-10 w-28 rounded-md" /> : null}
    </div>
  );
}

function MetricCardSkeleton({ compact = false }: { compact?: boolean }) {
  return (
    <div className="yev-card p-4">
      <div className="flex items-center justify-between gap-3">
        <Skeleton className="h-4 w-24 rounded-sm" />
        <Skeleton className="h-8 w-8 rounded-md" />
      </div>
      <Skeleton className={compact ? "mt-4 h-8 w-14 rounded-md" : "mt-4 h-8 w-[4.5rem] rounded-md"} />
      <Skeleton className="mt-2 h-3 w-28 rounded-sm" />
    </div>
  );
}

function PanelSkeleton({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return <div className={`yev-card ${className ?? ""}`}>{children}</div>;
}

function ListPanelSkeleton({
  rows,
  badge = false,
  noteRows = false,
}: {
  rows: number;
  badge?: boolean;
  noteRows?: boolean;
}) {
  return (
    <PanelSkeleton className="overflow-hidden">
      <div className="flex items-start justify-between gap-4 border-b border-neutral-200 px-5 py-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-3 w-36" />
        </div>
        <Skeleton className="h-8 w-10 rounded-md" />
      </div>
      <div className="divide-y divide-neutral-200">
        {Array.from({ length: rows }).map((_, index) => (
          <div key={index} className="flex items-start gap-3 px-5 py-4">
            <Skeleton className="h-8 w-8 rounded-md" />
            <div className="min-w-0 flex-1">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className={`mt-2 h-3 ${noteRows ? "w-5/6" : "w-2/3"}`} />
              {noteRows ? <Skeleton className="mt-2 h-3 w-3/5" /> : null}
            </div>
            {badge ? <Skeleton className="h-5 w-14 rounded-full" /> : <Skeleton className="h-4 w-4 rounded-sm" />}
          </div>
        ))}
      </div>
    </PanelSkeleton>
  );
}

function MiniRowSkeleton() {
  return (
    <div className="flex min-h-10 items-center justify-between gap-3 rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2">
      <Skeleton className="h-3 w-[4.5rem]" />
      <Skeleton className="h-4 w-[5.5rem]" />
    </div>
  );
}

function FieldSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-3 w-[5.5rem]" />
      <Skeleton className="h-10 w-full rounded-md" />
    </div>
  );
}

function RepoCardSkeleton() {
  return (
    <div className="yev-card min-h-32 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-3 w-1/2" />
        </div>
        <div className="flex gap-1">
          <Skeleton className="h-7 w-7 rounded-md" />
          <Skeleton className="h-7 w-7 rounded-md" />
        </div>
      </div>
      <Skeleton className="mt-4 h-3 w-full" />
      <Skeleton className="mt-2 h-3 w-5/6" />
      <div className="mt-5 flex items-center gap-3">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-3 w-12" />
        <Skeleton className="h-3 w-10" />
        <Skeleton className="ml-auto h-3 w-16" />
      </div>
    </div>
  );
}

function ChartPanelSkeleton({ area = false }: { area?: boolean }) {
  return (
    <PanelSkeleton className="overflow-hidden">
      <div className="flex items-start justify-between gap-4 border-b border-neutral-200 px-5 py-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-44" />
        </div>
        <Skeleton className="h-4 w-4 rounded-sm" />
      </div>
      <div className="h-[240px] px-4 py-5">
        <div className="flex h-full items-end gap-3">
          {[42, 74, 58, 88, 64, 96, 70].map((height, index) => (
            <div key={index} className="flex flex-1 flex-col items-center justify-end gap-2">
              <Skeleton
                className={area ? "w-full rounded-[14px]" : "w-full rounded-t-[10px] rounded-b-sm"}
                style={{ height }}
              />
              <Skeleton className="h-3 w-7 rounded-sm" />
            </div>
          ))}
        </div>
      </div>
    </PanelSkeleton>
  );
}
