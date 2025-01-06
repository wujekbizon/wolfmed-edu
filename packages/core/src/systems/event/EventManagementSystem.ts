import { SystemError, EventConfig, Lecture, EventOptions } from '../../interfaces'
import { JsonDatabase } from '../../utils/JsonDatabase'

export class EventManagementSystem {
  private db: JsonDatabase

  constructor(private config?: EventConfig) {
    this.db = new JsonDatabase()
  }

  async createEvent(options: EventOptions & { teacherId: string; createdBy: string }): Promise<Lecture> {
    try {
      const event: Lecture = {
        id: `lecture_${Date.now()}`,
        ...options,
        type: 'lecture',
        status: 'scheduled',
        teacherId: options.teacherId,
        createdBy: options.createdBy,
      }

      await this.db.insert('events', event)
      return event
    } catch (error) {
      throw new SystemError('EVENT_CREATION_FAILED', 'Failed to create event', error)
    }
  }

  async cancelEvent(eventId: string): Promise<void> {
    try {
      const updated = await this.db.update('events', { id: eventId }, { status: 'cancelled' })

      if (!updated) {
        throw new SystemError('EVENT_NOT_FOUND', `Event ${eventId} not found`)
      }
    } catch (error) {
      throw new SystemError('EVENT_CANCELLATION_FAILED', 'Failed to cancel event', error)
    }
  }

  async getEvent(eventId: string): Promise<Lecture> {
    try {
      const event = await this.db.findOne('events', { id: eventId })

      if (!event) {
        throw new SystemError('EVENT_NOT_FOUND', `Event ${eventId} not found`)
      }

      return event
    } catch (error) {
      throw new SystemError('EVENT_FETCH_FAILED', 'Failed to fetch event', error)
    }
  }

  async listEvents(filter: { type: string; roomId?: string; teacherId?: string; status?: string }): Promise<Lecture[]> {
    try {
      const query: Record<string, any> = { type: filter.type }
      if (filter.roomId) query.roomId = filter.roomId
      if (filter.teacherId) query.teacherId = filter.teacherId
      if (filter.status) query.status = filter.status

      return await this.db.find('events', query)
    } catch (error) {
      throw new SystemError('EVENT_LIST_FAILED', 'Failed to list events', error)
    }
  }

  async updateEvent(eventId: string, updates: Partial<Lecture>): Promise<Lecture> {
    try {
      const updated = await this.db.update('events', { id: eventId }, updates)

      if (!updated) {
        throw new SystemError('EVENT_NOT_FOUND', `Event ${eventId} not found`)
      }

      return updated
    } catch (error) {
      throw new SystemError('EVENT_UPDATE_FAILED', 'Failed to update event', error)
    }
  }
}
