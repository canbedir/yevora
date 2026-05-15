import Link from "next/link";
import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { getServerSession } from "next-auth";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  ExternalLink,
  Flame,
  GitPullRequest,
  ListChecks,
  Timer,
  type LucideIcon,
} from "lucide-react";

import { PageHeader } from "@/components/dashboard/PageHeader";
import { QueueSignalList } from "@/components/dashboard/QueueSignalList";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { authOptions } from "@/lib/auth";
import { getTodaySummary } from "@/lib/today";
import { cn } from "@/lib/utils";

export default async function TodayPage() {
  await connection();

  const session = await getServerSession(authOptions);

  if (!session?.user?.id || !session.accessToken) {
    redirect("/login");
  }

  const summary = await getTodaySummary({
    userId: session.user.id,
    accessToken: session.accessToken,
    githubUsername: session.user.githubUsername,
  });
  const topQueueItems = summary.queueItems.slice(0, 5);
  const recentFocusSessions = summary.recentFocusSessions.slice(0, 3);
  const displayName = session.user.name?.split(" ")[0] ?? "Developer";

  return (
    <div className="mx-auto max-w-[960px] space-y-6">
      <PageHeader
        title={`Today, ${displayName}`}
        description="A focused queue for what deserves attention before the day gets noisy."
      />

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <TodayMetric
          label="Focus today"
          value={`${summary.focusToday}`}
          detail={`${formatMinutes(summary.focusMinutesToday)} logged`}
          icon={Timer}
          active={summary.focusToday > 0}
        />
        <TodayMetric
          label="Commits today"
          value={`${summary.commitsToday}`}
          detail={`${summary.commitStreak} day streak`}
          icon={Flame}
          active={summary.commitStreak > 0}
        />
        <TodayMetric
          label="Open PRs"
          value={`${summary.openPRs.length}`}
          detail="authored by you"
          icon={GitPullRequest}
          active={summary.openPRs.length > 0}
        />
        <TodayMetric
          label="Output logs"
          value={`${summary.outputLogsToday}`}
          detail="captured today"
          icon={CheckCircle2}
          active={summary.outputLogsToday > 0}
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="yev-card overflow-hidden">
          <div className="flex items-start justify-between gap-4 border-b border-neutral-200 px-5 py-4">
            <div>
              <h2 className="text-sm font-semibold text-neutral-950">Today queue</h2>
              <p className="mt-1 text-sm text-neutral-600">
                {topQueueItems.length > 0
                  ? `${topQueueItems.length} useful signal${topQueueItems.length > 1 ? "s" : ""} to handle.`
                  : "No urgent signals right now."}
              </p>
            </div>
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-neutral-100 text-neutral-700">
              <ListChecks className="h-4 w-4" />
            </span>
          </div>

          <div className="divide-y divide-neutral-200">
            {topQueueItems.length > 0 ? (
              <QueueSignalList items={topQueueItems} variant="today" />
            ) : (
              <EmptyQueue />
            )}
          </div>
        </div>

        <aside className="space-y-4">
          <section className="yev-card p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold text-neutral-950">Next focus</h2>
                <p className="mt-1 text-sm text-neutral-600">A clean starting point.</p>
              </div>
              <Clock3 className="h-4 w-4 text-primary" />
            </div>
            <div className="mt-4 rounded-md border border-orange-200 bg-orange-50/70 px-3 py-3">
              <p className="text-xs font-medium text-orange-700">
                {summary.focusToday > 0 ? "Keep momentum" : "First block"}
              </p>
              <p className="mt-1 text-sm font-semibold text-neutral-950">
                {summary.focusToday > 0 ? "Start the next focused pass" : "Log one focused session"}
              </p>
              <p className="mt-1 text-xs leading-5 text-neutral-600">
                {summary.focusToday > 0
                  ? `${formatMinutes(summary.focusMinutesToday)} already logged today.`
                  : "One small session is enough to get the day moving."}
              </p>
            </div>
            <Link
              href="/focus"
              className="mt-4 inline-flex h-9 w-full items-center justify-center gap-2 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Open focus
              <ArrowRight className="h-4 w-4" />
            </Link>
          </section>

          <section className="yev-card p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold text-neutral-950">Context</h2>
                <p className="mt-1 text-sm text-neutral-600">Useful nearby signals.</p>
              </div>
              <CalendarDays className="h-4 w-4 text-primary" />
            </div>
            <div className="mt-4 grid gap-2.5">
              <MiniContext label="Weekly focus" value={formatMinutes(summary.focusMinutesThisWeek)} />
              <MiniContext label="Selected repos" value={`${summary.selectedRepos.length}`} />
              <MiniContext
                label="Latest note"
                value={summary.recentNote ? trimLabel(summary.recentNote.title) : "None yet"}
              />
              <MiniContext
                label="Quiet repo"
                value={summary.staleRepo ? trimLabel(summary.staleRepo.name) : "All active"}
              />
            </div>
          </section>
        </aside>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Panel title="Recent focus output" href="/focus" action="Open focus">
          {recentFocusSessions.length > 0 ? (
            recentFocusSessions.map((sessionItem) => (
              <div key={sessionItem.id} className="px-5 py-4">
                <p className="line-clamp-1 text-sm font-semibold text-neutral-950">
                  {sessionItem.label || "Focus session"}
                </p>
                <p className="mt-1 text-xs text-neutral-500">
                  {sessionItem.duration} min - {formatDay(sessionItem.completedAt)}
                </p>
                {sessionItem.outputSummary ? (
                  <p className="mt-2 line-clamp-2 text-xs leading-5 text-neutral-600">
                    {sessionItem.outputSummary}
                  </p>
                ) : (
                  <p className="mt-2 text-xs leading-5 text-neutral-500">No output summary captured.</p>
                )}
              </div>
            ))
          ) : (
            <PanelEmpty
              title="No focus yet"
              description="Your completed sessions will appear here once you log the first focused block."
              action={
                <Button asChild variant="outline" size="sm">
                  <Link href="/focus">Open focus</Link>
                </Button>
              }
            />
          )}
        </Panel>

        <Panel title="Open PR pipeline" href="/repos" action="Open repos">
          {summary.openPRs.slice(0, 3).length > 0 ? (
            summary.openPRs.slice(0, 3).map((pullRequest) => (
              <a
                key={pullRequest.id}
                href={pullRequest.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-neutral-50"
              >
                <span className="min-w-0">
                  <span className="line-clamp-1 text-sm font-semibold text-neutral-950">
                    {pullRequest.title}
                  </span>
                  <span className="mt-1 block text-xs text-neutral-500">
                    Opened {formatDay(pullRequest.created_at)}
                  </span>
                </span>
                <ExternalLink className="h-4 w-4 shrink-0 text-neutral-400" />
              </a>
            ))
          ) : (
            <PanelEmpty title="PR queue clear" description="No authored open pull requests right now." />
          )}
        </Panel>
      </section>
    </div>
  );
}

function TodayMetric({
  label,
  value,
  detail,
  icon: Icon,
  active = false,
}: {
  label: string;
  value: string;
  detail: string;
  icon: LucideIcon;
  active?: boolean;
}) {
  return (
    <div className={cn("yev-card p-4", active && "yev-active-metric")}>
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-neutral-600">{label}</p>
        <span
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-md bg-neutral-100 text-neutral-700",
            active && "yev-live-signal bg-orange-100 text-primary"
          )}
        >
          <Icon className={cn("h-4 w-4", label === "Commits today" && active && "yev-live-flame")} />
        </span>
      </div>
      <p className="mt-4 text-2xl font-semibold text-neutral-950">{value}</p>
      <p className="mt-1 text-xs text-neutral-500">{detail}</p>
    </div>
  );
}

function EmptyQueue() {
  return (
    <EmptyState
      title="Nothing urgent"
      description="Your focus, notes, repos, and PRs look tidy right now. A fresh focus block is a good next move."
      icon={CheckCircle2}
      action={
        <Button asChild variant="outline" size="sm">
          <Link href="/focus">Start focus</Link>
        </Button>
      }
    />
  );
}

function MiniContext({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex min-h-10 items-center justify-between gap-3 rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2">
      <span className="text-xs text-neutral-500">{label}</span>
      <span className="min-w-0 truncate text-sm font-semibold text-neutral-950">{value}</span>
    </div>
  );
}

function Panel({
  title,
  href,
  action,
  children,
}: {
  title: string;
  href: string;
  action: string;
  children: ReactNode;
}) {
  return (
    <section className="yev-card overflow-hidden">
      <div className="flex items-center justify-between gap-4 border-b border-neutral-200 px-5 py-4">
        <h2 className="text-sm font-semibold text-neutral-950">{title}</h2>
        <Link href={href} className="text-xs text-neutral-600 transition-colors hover:text-neutral-950">
          {action}
        </Link>
      </div>
      <div className="divide-y divide-neutral-200">{children}</div>
    </section>
  );
}

function PanelEmpty({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <EmptyState title={title} description={description} action={action} compact />
  );
}

function formatMinutes(minutes: number) {
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    const remaining = minutes % 60;
    return remaining > 0 ? `${hours}h ${remaining}m` : `${hours}h`;
  }

  return `${minutes}m`;
}

function formatDay(value: Date | string) {
  return new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function trimLabel(value: string) {
  return value.length > 18 ? `${value.slice(0, 16)}...` : value;
}
