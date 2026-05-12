import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const sessions = await prisma.pomodoroSession.findMany({
    where: {
      userId: session.user.id,
      completedAt: { gte: thirtyDaysAgo },
    },
    orderBy: { completedAt: 'desc' },
  })

  return NextResponse.json(sessions)
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const duration = Number(body.duration)
  const safeDuration = Number.isFinite(duration)
    ? Math.min(180, Math.max(1, Math.round(duration)))
    : 25
  const label = typeof body.label === 'string' && body.label.trim().length > 0
    ? body.label.trim()
    : null

  const record = await prisma.pomodoroSession.create({
    data: {
      userId: session.user.id,
      duration: safeDuration,
      label,
    },
  })

  return NextResponse.json(record)
}
