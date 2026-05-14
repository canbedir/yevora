'use server'

import { revalidatePath } from 'next/cache'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

function normalizeNoteInput(title: string, content: string) {
  const safeTitle = title.trim().slice(0, 160)
  const safeContent = content.trim()

  if (!safeTitle || !safeContent) {
    throw new Error('A note needs a title and content')
  }

  return { title: safeTitle, content: safeContent }
}

export async function createNote(title: string, content: string) {
  const session = await getServerSession(authOptions)
  if (!session) throw new Error('Unauthorized')
  const noteInput = normalizeNoteInput(title, content)

  const note = await prisma.note.create({
    data: { ...noteInput, userId: session.user.id },
  })

  revalidatePath('/notes')
  return note
}

export async function updateNote(id: string, title: string, content: string) {
  const session = await getServerSession(authOptions)
  if (!session) throw new Error('Unauthorized')
  const noteInput = normalizeNoteInput(title, content)

  const note = await prisma.note.update({
    where: { id, userId: session.user.id },
    data: noteInput,
  })

  revalidatePath('/notes')
  return note
}

export async function deleteNote(id: string) {
  const session = await getServerSession(authOptions)
  if (!session) throw new Error('Unauthorized')

  await prisma.note.delete({
    where: { id, userId: session.user.id },
  })

  revalidatePath('/notes')
}
