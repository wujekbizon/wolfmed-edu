import { JsonDatabase } from "../db/JsonDatabase";
import { ErrorCode, EventConfig, Lecture, SystemError } from "../interfaces";

export default class EventManagementSystem {
  private db: JsonDatabase

  constructor(private config?: EventConfig) {
    this.db = JsonDatabase.getInstance()
  }

  async updateEventStatus(eventId: string, newStatus: Lecture['status']): Promise<Lecture> {
    try {
      const event = (await this.db.findOne('events', { id: eventId })) as Lecture
      if (!event) {
        throw new SystemError('EVENT_NOT_FOUND', `Event ${eventId} not found`)
      }

      const allowedTransitions: Record<Lecture['status'], Lecture['status'][]> = {
        scheduled: ['in-progress', 'cancelled', 'delayed'],
        delayed: ['in-progress', 'cancelled'],
        'in-progress': ['completed', 'cancelled'],
        completed: [], // Final state
        cancelled: [], // Final state
      }

      if (!allowedTransitions[event.status]?.includes(newStatus)) {
        throw new SystemError(
          'INVALID_STATUS_TRANSITION' as ErrorCode,
          `Cannot transition from ${event.status} to ${newStatus}`
        )
      }

      const updates: Partial<Lecture> = {
        status: newStatus,
        ...(newStatus === 'in-progress' && { startTime: new Date().toISOString() }),
        ...(newStatus === 'completed' && { endTime: new Date().toISOString() }),
      }

      const updated = await this.db.update('events', { id: eventId }, updates)
      if (!updated) {
        throw new SystemError('EVENT_UPDATE_FAILED', 'Failed to update event status')
      }
      
      // Update the room status based on the lecture status
      const room = await this.db.findOne('rooms', { id: event.roomId })
      if (room && room.currentLecture?.id === eventId) {
        let roomStatus = room.status
        if (newStatus === 'in-progress') {
          roomStatus = 'occupied'
        } else if (newStatus === 'completed' || newStatus === 'cancelled') {
          roomStatus = 'available'
        }
        
        // Update room status and lecture reference
        await this.db.update('rooms', { id: event.roomId }, {
          status: roomStatus,
          currentLecture: newStatus === 'completed' || newStatus === 'cancelled' 
            ? undefined 
            : { ...room.currentLecture, status: newStatus },
          updatedAt: new Date().toISOString()
        })
        
        console.log(`Room ${event.roomId} status updated to ${roomStatus} after lecture status change to ${newStatus}`)
      }

      return updated
    } catch (error) {
      if (error instanceof SystemError) throw error
      throw new SystemError('EVENT_UPDATE_FAILED', 'Failed to update event status', error)
    }
  }
  
}
