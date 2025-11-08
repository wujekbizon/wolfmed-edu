'use server'

import { CreateLectureSchema, UpdateLectureSchema } from '@/server/schema'
import { revalidatePath } from 'next/cache'
import { fromErrorToFormState, toFormState } from '../helpers/toFormState'
import { FormState } from '@/types/actionTypes'
import { auth, currentUser } from '@clerk/nextjs/server'
import { requireTeacherAction } from '@/lib/teacherHelpers'
import { manageRoomForLecture, cleanupExpiredRooms } from '@/utils/teachingPlaygroundUtils'
import { EventManagementSystem, Lecture, User, JsonDatabase, TeachingPlayground } from '@teaching-playground/core'
import { createServerPlaygroundInstance } from '@/helpers/createServerPlaygroundInstance'

// Use singleton JsonDatabase instance
const db = JsonDatabase.getInstance()

// Use EventManagementSystem instance
const eventSystem = new EventManagementSystem()

export async function initializeTeachingPlayground():Promise<TeachingPlayground | null> {
  try {
    const user = await currentUser()

    if (!user) {
      return null
    }

    const playground = createServerPlaygroundInstance()

    const role = user.publicMetadata?.role as 'teacher' | 'student' | 'admin' || 'student';

    const serverUser: User = {
      id: user.id,
      username: user.username || user.emailAddresses[0]?.emailAddress || 'Guest',
      role: role,
      email: user.emailAddresses[0]?.emailAddress ?? null,
      displayName: user.fullName || user.username || null,
      status: 'online',
    }
    playground.setCurrentUser(serverUser)
   
    return playground
  } catch (error) {
    console.error("Server Action: Error in initializeTeachingPlayground:", error);
    return null; 
  }
}

export async function getRoomParticipantsFromServer(roomId: string): Promise<User[]> {
  try {
    const playground = await initializeTeachingPlayground();
    if (!playground) {
      throw new Error("Failed to initialize TeachingPlayground on server.");
    }
    // v1.1.2: This now queries WebSocket memory, not database
    const participants = await playground.roomSystem.getRoomParticipants(roomId);
    return participants;
  } catch (error) {
    console.error("Server Action: Error in getRoomParticipantsFromServer:", error);
    return [];
  }
}

export async function createLecture(formState: FormState, formData: FormData): Promise<FormState> {
  // Require teacher/admin access
  const teacher = await requireTeacherAction()

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
    // Create the lecture with a unique ID
    const lectureId = `lecture_${Date.now()}`
    const roomId = `room_${lectureId}`

    // Create the lecture object with actual teacher data
    const lecture: Lecture = {
      id: lectureId,
      ...validationResult.data,
      roomId,
      type: 'lecture',
      status: 'scheduled',
      teacherId: teacher.userId,
      createdBy: teacher.name,
    }

    // Save the lecture to the database
    await db.insert('events', lecture)

    // Create or update the associated room
    await manageRoomForLecture(lecture)
    console.log('Room management completed for lecture:', lectureId);

    // Clean up any expired rooms
    await cleanupExpiredRooms()
    console.log('Expired rooms cleanup completed.');

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
  // Require teacher/admin access
  await requireTeacherAction()

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
  // Require teacher/admin access
  await requireTeacherAction()

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
  // Require teacher/admin access
  await requireTeacherAction()

  try {
    await eventSystem.updateEventStatus(lectureId, status)
  } catch (error) {
    console.error('Error updating lecture status:', error)
    throw error
  }
}

export async function endLecture(formState: FormState, formData: FormData) {
  // Require teacher/admin access
  await requireTeacherAction()

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

// Server action to get all rooms
export async function getRooms() {
  try {
    const rooms = await db.find('rooms', {})
    return rooms
  } catch (error) {
    console.error('Failed to fetch rooms:', error)
    return []
  }
}

// Server action to get room by ID
export async function getRoomById(roomId: string) {
  try {
    const room = await db.findOne('rooms', { id: roomId })
    if (!room) return null

    // If room has a current lecture, fetch the full lecture data
    if (room.currentLecture) {
      const lecture = await db.findOne('events', { id: room.currentLecture.id })
      if (lecture) {
        return {
          ...room,
          currentLecture: lecture
        }
      }
    }

    return room
  } catch (error) {
    console.error('Failed to fetch room:', error)
    return null
  }
}

