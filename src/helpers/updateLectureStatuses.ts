import { Lecture, JsonDatabase } from '@teaching-playground/core'
import { determineLectureStatus } from '@/utils/lectureStatus'

// Use singleton JsonDatabase instance
const db = JsonDatabase.getInstance()

export async function updateLectureStatuses(events: Lecture[]): Promise<Lecture[]> {
  // Collect all status updates
  const updates = events.reduce<Array<{ id: string; status: Lecture['status'] }>>((acc, event) => {
    if (event.status === 'cancelled' || event.status === 'completed') return acc

    const currentStatus = determineLectureStatus(event.date)
    if (currentStatus !== event.status) {
      acc.push({
        id: event.id,
        status: currentStatus,
        ...(currentStatus === 'in-progress' && { startTime: new Date().toISOString() }),
        ...(currentStatus === 'completed' && { endTime: new Date().toISOString() }),
      })
    }
    return acc
  }, [])

  if (updates.length > 0) {
    try {
      // Batch update all events in a single operation
      await Promise.all(updates.map((update) => db.update('events', { id: update.id }, update)))
    } catch (error) {
      console.error('Failed to batch update lecture statuses:', error)
    }
  }

  return await db.find('events')
}
