"use client";

import { useMemo } from "react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Flame, Clock, CalendarDays } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CommitActivity } from "@/types/github";

interface PomodoroSessionData {
  id: string;
  duration: number;
  completedAt: Date | string; // Date on server, string on client over boundary
}

interface StatsChartsProps {
  commitActivity: CommitActivity[];
  commitStreakActivity?: CommitActivity[];
  pomodoroSessions: PomodoroSessionData[];
}

function calculateStreak(activities: CommitActivity[]): number {
  let streak = 0;
  let i = activities.length - 1;

  if (activities[i]?.count === 0) {
    i--;
  }

  for (; i >= 0; i--) {
    if (activities[i].count > 0) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

function formatTime(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0) return `${h} hrs ${m} min`;
  return `${m} min`;
}

function getLocalISODate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function StatsCharts({ commitActivity, commitStreakActivity, pomodoroSessions }: StatsChartsProps) {
  const commitData = useMemo(() => {
    return commitActivity.map((item) => {
      const [year, month, day] = item.date.split("-").map(Number);
      const date = new Date(year, month - 1, day);
      return {
        ...item,
        day: date.toLocaleDateString("en-US", { weekday: "short" }),
      };
    });
  }, [commitActivity]);

  const streak = calculateStreak(commitStreakActivity ?? commitActivity);

  const pomodoroData = useMemo(() => {
    const counts: Record<string, number> = {};
    const durations: Record<string, number> = {};

    pomodoroSessions.forEach((session) => {
      const dateStr = getLocalISODate(new Date(session.completedAt));
      counts[dateStr] = (counts[dateStr] ?? 0) + 1;
      durations[dateStr] = (durations[dateStr] ?? 0) + session.duration;
    });

    const result = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = getLocalISODate(d);
      
      const [year, month, day] = key.split("-").map(Number);
      const localDate = new Date(year, month - 1, day);

      result.push({
        date: key,
        day: localDate.toLocaleDateString("en-US", { weekday: "short" }),
        count: counts[key] ?? 0,
        duration: durations[key] ?? 0,
      });
    }
    return result;
  }, [pomodoroSessions]);

  const sessionsThisWeek = pomodoroData.reduce((acc, curr) => acc + curr.count, 0);
  const focusTimeThisWeek = pomodoroData.reduce((acc, curr) => acc + curr.duration, 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Commit Streak</CardTitle>
            <Flame className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{streak} days</div>
            <p className="text-xs text-muted-foreground mt-1">Current consecutive days</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sessions This Week</CardTitle>
            <CalendarDays className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sessionsThisWeek}</div>
            <p className="text-xs text-muted-foreground mt-1">Pomodoro sessions completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Focus Time</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatTime(focusTimeThisWeek)}</div>
            <p className="text-xs text-muted-foreground mt-1">Total focus time this week</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Focus Sessions (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={pomodoroData}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis dataKey="day" tickLine={false} axisLine={false} />
                  <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
                  <Tooltip cursor={{ fill: "var(--accent)" }} />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Sessions" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Commit Activity (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={commitData}>
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis dataKey="day" tickLine={false} axisLine={false} />
                  <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Area 
                    type="monotone" 
                    dataKey="count" 
                    stroke="hsl(var(--primary))" 
                    fillOpacity={1} 
                    fill="url(#colorCount)" 
                    name="Commits"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
