"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CommitActivity } from "@/types/github";

interface CommitChartProps {
  data: CommitActivity[];
}

export function CommitChart({ data }: CommitChartProps) {
  const chartData = data.map((item) => {
    const [year, month, day] = item.date.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    return {
      ...item,
      day: date.toLocaleDateString("en-US", { weekday: "short" }),
    };
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Commit activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[220px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="day" tickLine={false} axisLine={false} />
              <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
              <Tooltip />
              <Bar dataKey="count" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
