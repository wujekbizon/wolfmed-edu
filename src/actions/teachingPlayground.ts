'use server'

import { CreateLectureSchema, UpdateLectureSchema } from '@/server/schema'
import { revalidatePath } from 'next/cache'
import { fromErrorToFormState, toFormState } from '../helpers/toFormState'
import { FormState } from '@/types/actionTypes'
import { auth } from '@clerk/nextjs/server'
import { Lecture, JsonDatabase, EventManagementSystem } from '@teaching-playground/core'
import { manageRoomForLecture, cleanupExpiredRooms } from '@/utils/teachingPlaygroundUtils'

// Use singleton JsonDatabase instance
const db = JsonDatabase.getInstance()
const eventSystem = new EventManagementSystem()

export async function createLecture(formState: FormState, formData: FormData): Promise<FormState> {
  // TODO: user will need to have teacher permisssions
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthorized')

  const values = {
    name: formData.get('name') as string,
    date: formData.get('date') as string,
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
    // Create the lecture with a unique ID
    const lectureId = `lecture_${Date.now()}`
    const roomId = `room_${lectureId}`

    // Create the lecture object
    const lecture: Lecture = {
      id: lectureId,
      ...validationResult.data,
      roomId, // Use the consistent room ID
      type: 'lecture',
      status: 'scheduled',
      teacherId: 'teacher_123',
      createdBy: 'John Doe',
    }

    // Save the lecture to the database
    await db.insert('events', lecture)

    // Create or update the associated room
    await manageRoomForLecture(lecture)

    // Clean up any expired rooms
    await cleanupExpiredRooms()

  } catch (error) {
    return {
      ...fromErrorToFormState(error),
      values,
    }
  }

  revalidatePath('/tp')
  return toFormState('SUCCESS', 'Wykład został utworzony pomyślnie! ')
}

export async function cancelLecture(formState: FormState, formData: FormData) {
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthorized')

  const lectureId = formData.get('lectureId') as string

  if (!lectureId) {
    return toFormState('ERROR', 'Lecture ID is required')
  }

  try {
    const updated = await db.update('events', { id: lectureId }, { status: 'cancelled' })
    if (!updated) {
      return toFormState('ERROR', 'Lecture not found')
    }
  } catch (error) {
    return fromErrorToFormState(error)
  }

  revalidatePath('/tp')
  return toFormState('SUCCESS', 'Lecture cancelled successfully')
}

export async function updateLecture(formState: FormState, formData: FormData): Promise<FormState> {
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthorized')

  const values = {
    lectureId: formData.get('lectureId') as string,
    name: formData.get('name') as string,
    date: formData.get('date') as string,
    roomId: formData.get('roomId') as string,
    description: formData.get('description') as string,
    maxParticipants: Number(formData.get('maxParticipants')),
  }

  const validationResult = UpdateLectureSchema.safeParse(values)
  if (!validationResult.success) {
    return {
      ...fromErrorToFormState(validationResult.error),
      values,
    }
  }

  try {
    const { lectureId, ...updateData } = values
    const updated = await db.update('events', { id: lectureId }, updateData)
    if (!updated) {
      return toFormState('ERROR', 'Lecture not found')
    }
  } catch (error) {
    return {
      ...fromErrorToFormState(error),
      values,
    }
  }

  revalidatePath('/tp')
  return toFormState('SUCCESS', 'Lecture updated successfully')
}

export async function updateLectureStatus(lectureId: string, status: Lecture['status']) {
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthorized')

  try {
    await eventSystem.updateEventStatus(lectureId, status)
  } catch (error) {
    console.error('Error updating lecture status:', error)
    throw error
  }
}

export async function endLecture(formState: FormState, formData: FormData) {
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthorized')

  const lectureId = formData.get('lectureId') as string

  try {
    await eventSystem.updateEventStatus(lectureId, 'completed')
  } catch (error) {
    return fromErrorToFormState(error)
  }

  // Force revalidation
  revalidatePath('/tp')
  return toFormState('SUCCESS', 'Lecture completed successfully')
}

// Server action to get all events
export async function getLectures(): Promise<Lecture[]> {
  try {
    const events = await db.find('events', { type: 'lecture' })
    return events
  } catch (error) {
    console.error('Failed to fetch lectures:', error)
    return []
  }
}

