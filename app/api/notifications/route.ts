import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { getTodaySummary, toPublicQueueItem } from "@/lib/today";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.accessToken || !session.user?.id) {
    return NextResponse.json({ items: [], count: 0 }, { status: 401 });
  }

  const summary = await getTodaySummary({
    userId: session.user.id,
    accessToken: session.accessToken,
    githubUsername: session.user.githubUsername,
  });
  const items = summary.queueItems.slice(0, 6);

  return NextResponse.json({
    items: items.map(toPublicQueueItem),
    count: items.length,
    generatedAt: new Date().toISOString(),
  });
}
