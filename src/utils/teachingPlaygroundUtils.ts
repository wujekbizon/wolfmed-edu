import { JsonDatabase, Lecture, Room } from '@teaching-playground/core'

// Use singleton JsonDatabase instance
const db = JsonDatabase.getInstance()

/**
 * Creates or updates a room based on a lecture.
 * Each lecture gets its own dedicated room with appropriate configuration.
 * 
 * @param lecture - The lecture object containing details like name, capacity, etc.
 * @returns Promise<Room> - The created or updated room
 */
export async function manageRoomForLecture(lecture: Lecture): Promise<Room> {
  try {
    console.log(`Managing room for lecture: ${lecture.name} (${lecture.id})`)
    
    // Generate consistent room ID
    const roomId = `room_${lecture.id}`
    
    // Create room configuration based on lecture details
    const room: Room = {
      id: roomId,
      name: `Room for ${lecture.name}`,
      capacity: lecture.maxParticipants || 30,
      status: lecture.status === 'in-progress' ? 'occupied' : 'scheduled',
      features: {
        hasVideo: true,
        hasAudio: true,
        hasChat: true,
        hasWhiteboard: true,
        hasScreenShare: true,
      },
      currentLecture: {
        id: lecture.id,
        name: lecture.name,
        teacherId: lecture.teacherId,
        status: lecture.status
      },
      // v1.1.2: Participants no longer stored in database, only in WebSocket memory
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    console.log('Generated room object:', room);
    // Check if room already exists and update it, or create new one
    const existingRoom = await db.findOne('rooms', { id: roomId }) as Room | null
    if (existingRoom) {
      console.log(`Updating existing room: ${roomId}`)
      const updatedRoom = await db.update('rooms', { id: roomId }, room) as Room
      console.log('Room updated:', updatedRoom);
      return updatedRoom
    }
    
    console.log(`Creating new room: ${roomId}`)
    const newRoom = await db.insert('rooms', room) as Room
    console.log('New room created:', newRoom);
    return newRoom
  } catch (error) {
    console.error('Failed to manage room for lecture:', error)
    throw error
  }
}

/**
 * Removes rooms that are associated with expired or cancelled lectures.
 * This helps keep the rooms collection clean and up-to-date.
 */
export async function cleanupExpiredRooms(): Promise<void> {
  try {
    console.log('Starting cleanup of expired rooms')
    const events = await db.find('events', {}) as Lecture[]
    const rooms = await db.find('rooms', {}) as Room[]

    for (const room of rooms) {
      if (!room.currentLecture) continue

      const lecture = events.find((event: Lecture) => event.id === room.currentLecture?.id)
      const lectureDate = lecture ? new Date(lecture.date) : null
      const now = new Date()

      // Remove room if:
      // 1. Associated lecture doesn't exist
      // 2. Lecture is cancelled
      // 3. Lecture date has passed (24 hours grace period)
      if (!lecture || 
          lecture.status === 'cancelled' || 
          (lectureDate && (now.getTime() - lectureDate.getTime() > 24 * 60 * 60 * 1000))) {
        await db.delete('rooms', { id: room.id })
        console.log(`Removed room ${room.id} - Reason: ${
          !lecture ? 'Lecture not found' : 
          lecture.status === 'cancelled' ? 'Lecture cancelled' : 
          'Lecture expired'
        }`)
      }
    }
    console.log('Room cleanup completed')
  } catch (error) {
    console.error('Failed to cleanup expired rooms:', error)
    throw error
  }
}

/**
 * Updates room status based on lecture status changes.
 * Ensures room status stays synchronized with its associated lecture.
 * 
 * @param lectureId - The ID of the lecture whose status changed
 * @param status - The new status of the lecture
 */
export async function updateRoomStatus(lectureId: string, status: Lecture['status']): Promise<void> {
  try {
    console.log(`Updating room status for lecture ${lectureId} to ${status}`)
    const room = await db.findOne('rooms', { 'currentLecture.id': lectureId }) as Room | null
    if (!room) {
      console.log(`No room found for lecture ${lectureId}`)
      return
    }

    // Map lecture status to room status
    const roomStatus = status === 'in-progress' ? 'occupied' 
      : status === 'completed' || status === 'cancelled' ? 'available'
      : 'scheduled'

    // Prepare update data
    const updateData: Partial<Room> = {
      status: roomStatus,
      updatedAt: new Date().toISOString()
    }

    // Only include currentLecture if not completed or cancelled
    if (status !== 'completed' && status !== 'cancelled' && room.currentLecture) {
      updateData.currentLecture = {
        ...room.currentLecture,
        status
      }
    }

    // Update room with new status
    await db.update('rooms', { id: room.id }, updateData)
    console.log(`Updated room ${room.id} status to ${roomStatus}`)
  } catch (error) {
    console.error('Failed to update room status:', error)
    throw error
  }
}

/**
 * Gets all rooms with their associated lectures.
 * Useful for displaying room list with current lecture information.
 */
export async function getRoomsWithLectures(): Promise<Room[]> {
  try {
    const rooms = await db.find('rooms', {}) as Room[]
    const events = await db.find('events', {}) as Lecture[]

    return rooms.map(room => {
      if (!room.currentLecture) return room

      const associatedLecture = events.find(event => event.id === room.currentLecture?.id)
      if (!associatedLecture) {
        // If the lecture no longer exists, remove the reference
        const { currentLecture, ...roomWithoutLecture } = room
        return roomWithoutLecture
      }

      // Update the lecture information
      return {
        ...room,
        currentLecture: {
          ...room.currentLecture,
          status: associatedLecture.status
        }
      }
    })
  } catch (error) {
    console.error('Failed to get rooms with lectures:', error)
    throw error
  }
}

/**
 * Gets a specific room by ID with its current lecture information.
 * 
 * @param roomId - The ID of the room to fetch
 */
export async function getRoomById(roomId: string): Promise<Room | null> {
  try {
    const room = await db.findOne('rooms', { id: roomId }) as Room | null
    if (!room) return null

    if (room.currentLecture) {
      const lecture = await db.findOne('events', { id: room.currentLecture.id }) as Lecture | null
      if (lecture) {
        return {
          ...room,
          currentLecture: {
            ...room.currentLecture,
            status: lecture.status
          }
        }
      }

      // If lecture not found, remove the reference
      const { currentLecture, ...roomWithoutLecture } = room
      return roomWithoutLecture
    }

    return room
  } catch (error) {
    console.error(`Failed to get room ${roomId}:`, error)
    throw error
  }
} 