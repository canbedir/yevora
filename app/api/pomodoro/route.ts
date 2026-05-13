import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

function getOptionalString(value: unknown, maxLength: number) {
  if (typeof value !== 'string') return null

  const trimmedValue = value.trim()
  if (!trimmedValue) return null

  return trimmedValue.slice(0, maxLength)
}

function getOptionalUrl(value: unknown) {
  const trimmedValue = getOptionalString(value, 300)
  if (!trimmedValue) return null

  try {
    const url = new URL(trimmedValue)
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.toString() : null
  } catch {
    return null
  }
}

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
  const commitCount = Number(body.commitCount)
  const safeCommitCount = Number.isFinite(commitCount)
    ? Math.min(999, Math.max(0, Math.round(commitCount)))
    : 0
  const label = typeof body.label === 'string' && body.label.trim().length > 0
    ? body.label.trim()
    : null
  const repositoryName = getOptionalString(body.repositoryName, 120)
  const repositoryUrl = getOptionalUrl(body.repositoryUrl)
  const outputSummary = getOptionalString(body.outputSummary, 1200)

  const record = await prisma.pomodoroSession.create({
    data: {
      userId: session.user.id,
      duration: safeDuration,
      label,
      repositoryName,
      repositoryUrl,
      commitCount: safeCommitCount,
      outputSummary,
    },
  })

  return NextResponse.json(record)
}
