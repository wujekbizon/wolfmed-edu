'use server'

import { CreateLectureSchema } from '@/server/schema'
import { JsonDatabase } from '../../packages/core/src/utils/JsonDatabase'
import { revalidatePath } from 'next/cache'
import { fromErrorToFormState, toFormState } from '../helpers/toFormState'
import { FormState } from '@/types/actionTypes'
import { auth } from '@clerk/nextjs/server'

const db = new JsonDatabase()

export async function createLecture(formState: FormState, formData: FormData): Promise<FormState> {
  // TODO: user will need to have teacher permisssions
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthorized')

  const values = {
    name: formData.get('name') as string,
    date: formData.get('date') as string,
    roomId: formData.get('roomId') as string,
    description: formData.get('description') as string,
    maxParticipants: Number(formData.get('maxParticipants')),
  }

  const validationResult = CreateLectureSchema.safeParse(values)
  if (!validationResult.success) {
    return {
      ...fromErrorToFormState(validationResult.error),
      values,
    }
  }

  try {
    const lecture = {
      id: `lecture_${Date.now()}`,
      ...validationResult.data,
      type: 'lecture',
      status: 'scheduled',
      teacherId: 'teacher_123',
      createdBy: 'John Doe',
    }

    await db.insert('events', lecture)
  } catch (error) {
    return {
      ...fromErrorToFormState(error),
      values,
    }
  }

  revalidatePath('/tp')
  return toFormState('SUCCESS', 'Wykład został utworzony pomyślnie! ')
}
