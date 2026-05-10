import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { StatsCharts } from "@/components/StatsCharts";
import { authOptions } from "@/lib/auth";
import { getRecentCommits, groupCommitsByDay } from "@/lib/github";
import { prisma } from "@/lib/prisma";

export default async function StatsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.accessToken || !session?.user?.id) {
    redirect("/login");
  }

  const username = session.user.name ?? "";

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [commits, pomodoroSessions] = await Promise.all([
    username ? getRecentCommits(session.accessToken, username) : Promise.resolve([]),
    prisma.pomodoroSession.findMany({
      where: {
        userId: session.user.id,
        completedAt: { gte: thirtyDaysAgo },
      },
      orderBy: { completedAt: "asc" },
    }),
  ]);

  const commitActivity = groupCommitsByDay(commits);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Statistics</h1>
      <StatsCharts
        commitActivity={commitActivity}
        pomodoroSessions={pomodoroSessions}
      />
    </div>
  );
}
