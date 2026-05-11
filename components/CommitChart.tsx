"use client";

import { useId } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { CommitActivity } from "@/types/github";

interface CommitChartProps {
  data: CommitActivity[];
}

export function CommitChart({ data }: CommitChartProps) {
  const gradientId = useId();
  const chartData = data.map((item) => {
    const [year, month, day] = item.date.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    return {
      ...item,
      day: date.toLocaleDateString("en-US", { weekday: "short" }),
    };
  });

  return (
    <Card className="dashboard-panel rounded-[30px] border-0 py-0">
      <CardHeader className="border-b border-white/60 px-6 py-5">
        <CardTitle>Commit activity</CardTitle>
        <CardDescription>How your shipping rhythm looked across the last seven days.</CardDescription>
      </CardHeader>
      <CardContent className="px-6 py-6">
        <div className="h-[260px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.95} />
                  <stop offset="100%" stopColor="var(--primary)" stopOpacity={0.42} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="rgba(148, 163, 184, 0.22)" strokeDasharray="3 3" />
              <XAxis
                dataKey="day"
                tickLine={false}
                axisLine={false}
                tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
              />
              <YAxis
                allowDecimals={false}
                tickLine={false}
                axisLine={false}
                tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
              />
              <Tooltip
                cursor={{ fill: "rgba(226, 232, 240, 0.35)" }}
                contentStyle={{
                  borderRadius: "18px",
                  border: "1px solid rgba(255,255,255,0.74)",
                  background: "rgba(255,255,255,0.94)",
                  boxShadow: "0 20px 44px -28px rgba(15,23,42,0.35)",
                }}
              />
              <Bar dataKey="count" fill={`url(#${gradientId})`} radius={[10, 10, 4, 4]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
