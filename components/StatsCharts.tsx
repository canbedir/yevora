"use client";

import type { ReactNode } from "react";
import { useMemo } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { CalendarDays, CheckCircle2, Clock, Flame, GitCommitHorizontal, type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import type { CommitActivity } from "@/types/github";

interface PomodoroSessionData {
  id: string;
  duration: number;
  repositoryName?: string | null;
  commitCount?: number | null;
  outputSummary?: string | null;
  completedAt: Date | string;
}

interface StatsChartsProps {
  commitActivity: CommitActivity[];
  commitStreakActivity?: CommitActivity[];
  pomodoroSessions: PomodoroSessionData[];
}

function calculateStreak(activities: CommitActivity[]): number {
  let streak = 0;
  let index = activities.length - 1;

  if (activities[index]?.count === 0) {
    index -= 1;
  }

  for (; index >= 0; index -= 1) {
    if (activities[index].count > 0) {
      streak += 1;
      continue;
    }

    break;
  }

  return streak;
}

function formatTime(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;
  if (hours > 0) return remaining > 0 ? `${hours}h ${remaining}m` : `${hours}h`;
  return `${minutes}m`;
}

function getLocalISODate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getDayLabel(key: string) {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-US", { weekday: "short" });
}

export function StatsCharts({ commitActivity, commitStreakActivity, pomodoroSessions }: StatsChartsProps) {
  const commitData = useMemo(() => {
    return commitActivity.map((item) => ({
      ...item,
      day: getDayLabel(item.date),
    }));
  }, [commitActivity]);

  const pomodoroData = useMemo(() => {
    const counts: Record<string, number> = {};
    const durations: Record<string, number> = {};

    pomodoroSessions.forEach((session) => {
      const dateKey = getLocalISODate(new Date(session.completedAt));
      counts[dateKey] = (counts[dateKey] ?? 0) + 1;
      durations[dateKey] = (durations[dateKey] ?? 0) + session.duration;
    });

    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - index));
      const dateKey = getLocalISODate(date);

      return {
        date: dateKey,
        day: getDayLabel(dateKey),
        count: counts[dateKey] ?? 0,
        duration: durations[dateKey] ?? 0,
      };
    });
  }, [pomodoroSessions]);

  const streak = calculateStreak(commitStreakActivity ?? commitActivity);
  const weeklyCommits = commitActivity.reduce((sum, item) => sum + item.count, 0);
  const sessionsThisWeek = pomodoroData.reduce((sum, item) => sum + item.count, 0);
  const focusTimeThisWeek = pomodoroData.reduce((sum, item) => sum + item.duration, 0);
  const outputLogsThisWeek = pomodoroSessions.filter((session) => {
    const dateKey = getLocalISODate(new Date(session.completedAt));
    return (
      pomodoroData.some((item) => item.date === dateKey) &&
      Boolean(session.outputSummary || session.repositoryName || (session.commitCount ?? 0) > 0)
    );
  }).length;

  return (
    <div className="space-y-6">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Commit streak"
          value={`${streak} days`}
          detail={`${weeklyCommits} commits this week`}
          icon={Flame}
          isActive={streak > 0}
        />
        <StatCard
          title="Sessions this week"
          value={sessionsThisWeek.toString()}
          detail="Pomodoro sessions completed"
          icon={CalendarDays}
        />
        <StatCard
          title="Focus time"
          value={formatTime(focusTimeThisWeek)}
          detail="Total focus logged"
          icon={Clock}
        />
        <StatCard
          title="Output logs"
          value={outputLogsThisWeek.toString()}
          detail="Sessions with recorded output"
          icon={CheckCircle2}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartPanel
          title="Focus sessions"
          description="Completed sessions across the last seven days."
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={pomodoroData}>
              <CartesianGrid vertical={false} stroke="rgba(115,115,115,0.18)" strokeDasharray="3 3" />
              <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fill: "#737373", fontSize: 12 }} />
              <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fill: "#737373", fontSize: 12 }} />
              <Tooltip cursor={{ fill: "rgba(245,245,245,0.9)" }} contentStyle={tooltipStyle} />
              <Bar dataKey="count" fill="var(--primary)" radius={[6, 6, 2, 2]} name="Sessions" />
            </BarChart>
          </ResponsiveContainer>
        </ChartPanel>

        <ChartPanel
          title="Commit activity"
          description="Your shipping rhythm over the last seven days."
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={commitData}>
              <defs>
                <linearGradient id="commitCountGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.28} />
                  <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="rgba(115,115,115,0.18)" strokeDasharray="3 3" />
              <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fill: "#737373", fontSize: 12 }} />
              <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fill: "#737373", fontSize: 12 }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area
                type="monotone"
                dataKey="count"
                stroke="var(--primary)"
                strokeWidth={2}
                fill="url(#commitCountGradient)"
                name="Commits"
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartPanel>
      </div>
    </div>
  );
}

const tooltipStyle = {
  borderRadius: "8px",
  border: "1px solid rgba(0,0,0,0.1)",
  background: "rgba(255,255,255,0.96)",
  boxShadow: "0 14px 30px -22px rgba(15,23,42,0.34)",
};

function StatCard({
  title,
  value,
  detail,
  icon: Icon,
  isActive = false,
}: {
  title: string;
  value: string;
  detail: string;
  icon: LucideIcon;
  isActive?: boolean;
}) {
  return (
    <div className={cn("yev-card p-4", isActive && "yev-active-metric")}>
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-neutral-600">{title}</p>
        <span
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-md bg-neutral-100 text-neutral-700",
            isActive && "yev-live-signal bg-orange-100 text-primary"
          )}
        >
          <Icon className={cn("h-4 w-4", isActive && "yev-live-flame")} />
        </span>
      </div>
      <p className="mt-4 text-2xl font-semibold text-neutral-950">{value}</p>
      <p className="mt-1 text-xs text-neutral-500">{detail}</p>
    </div>
  );
}

function ChartPanel({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="yev-card overflow-hidden">
      <div className="flex items-start justify-between gap-4 border-b border-neutral-200 px-5 py-4">
        <div>
          <h2 className="text-sm font-semibold text-neutral-950">{title}</h2>
          <p className="mt-1 text-sm text-neutral-600">{description}</p>
        </div>
        <GitCommitHorizontal className="h-4 w-4 shrink-0 text-primary" />
      </div>
      <div className="h-[240px] px-4 py-5">{children}</div>
    </section>
  );
}
