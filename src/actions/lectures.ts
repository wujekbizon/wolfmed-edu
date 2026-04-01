'use server'

import { auth } from '@clerk/nextjs/server'
import { UTApi } from 'uploadthing/server'
import { db } from '@/server/db/index'
import { userLimits } from '@/server/db/schema'
import { sql, eq } from 'drizzle-orm'
import { fromErrorToFormState, toFormState } from '@/helpers/toFormState'
import type { FormState } from '@/types/actionTypes'
import { checkRateLimit } from '@/lib/rateLimit'
import { revalidatePath } from 'next/cache'
import {
  insertLecture,
  deleteLectureById,
  updateLectureDuration,
  getUserStorageUsage,
} from '@/server/queries'
import type { Lecture } from '@/server/db/schema'

interface SaveLectureInput {
  userId: string
  title: string
  contentHash: string
  audioBuffer: Buffer
  scriptText: string
}

export async function saveLectureInternal(input: SaveLectureInput): Promise<Lecture> {
  const { userId, title, contentHash, audioBuffer, scriptText } = input

  const audioSize = audioBuffer.length

  // Check limit before uploading anything
  const { storageUsed, storageLimit } = await getUserStorageUsage(userId)
  if (storageUsed + audioSize > storageLimit) {
    throw new Error('Przekroczono limit miejsca. Usuń niektóre pliki aby zwolnić miejsce.')
  }

  const utapi = new UTApi()
  const audioFile = new File([new Uint8Array(audioBuffer)], `lecture-${Date.now()}.mp3`, { type: 'audio/mpeg' })
  const [uploadResult] = await utapi.uploadFiles([audioFile])

  if (!uploadResult?.data?.ufsUrl || !uploadResult.data.key) {
    throw new Error('Failed to upload lecture audio to storage')
  }

  try {
    const lecture = await db.transaction(async (tx) => {
      const existingLimit = await tx
        .select()
        .from(userLimits)
        .where(eq(userLimits.userId, userId))
        .limit(1)

      if (existingLimit.length === 0) {
        await tx.insert(userLimits).values({ userId, storageUsed: 0 })
      }

      await tx
        .update(userLimits)
        .set({ storageUsed: sql`${userLimits.storageUsed} + ${audioSize}` })
        .where(eq(userLimits.userId, userId))

      return insertLecture({
        userId,
        title,
        contentHash,
        audioKey: uploadResult.data!.key,
        audioUrl: uploadResult.data!.ufsUrl,
        scriptText,
      })
    })

    return lecture
  } catch (error) {
    await utapi.deleteFiles([uploadResult.data.key])
    throw error
  }
}

export async function deleteLectureAction(lectureId: string): Promise<FormState> {
  try {
    const { userId } = await auth()
    if (!userId) throw new Error('Unauthorized')

    const rateLimit = await checkRateLimit(userId, 'lecture:delete')
    if (!rateLimit.success) {
      const resetMinutes = Math.ceil((rateLimit.reset - Date.now()) / 60000)
      return toFormState('ERROR', `Zbyt wiele żądań. Spróbuj ponownie za ${resetMinutes} minut.`)
    }

    const deleted = await deleteLectureById(userId, lectureId)
    if (!deleted) {
      return toFormState('ERROR', 'Nie znaleziono wykładu.')
    }

    const utapi = new UTApi()
    await utapi.deleteFiles([deleted.audioKey])

    revalidatePath('/panel/nauka')
    return toFormState('SUCCESS', 'Wykład usunięty.')
  } catch (error) {
    return fromErrorToFormState(error)
  }
}

export async function updateLectureDurationAction(
  lectureId: string,
  duration: number
): Promise<void> {
  try {
    const { userId } = await auth()
    if (!userId) return
    await updateLectureDuration(userId, lectureId, Math.round(duration))
  } catch {
    // fire-and-forget
  }
}
