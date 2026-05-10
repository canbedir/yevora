'use server'

import { revalidatePath } from 'next/cache'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function createNote(title: string, content: string) {
  const session = await getServerSession(authOptions)
  if (!session) throw new Error('Unauthorized')

  const note = await prisma.note.create({
    data: { title, content, userId: session.user.id },
  })

  revalidatePath('/notes')
  return note
}

export async function updateNote(id: string, title: string, content: string) {
  const session = await getServerSession(authOptions)
  if (!session) throw new Error('Unauthorized')

  const note = await prisma.note.update({
    where: { id, userId: session.user.id },
    data: { title, content },
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
