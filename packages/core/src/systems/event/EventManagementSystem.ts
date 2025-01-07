import { SystemError, EventConfig, Lecture, EventOptions } from '../../interfaces'
import { CreateLectureSchema, UpdateLectureSchema } from '../../../../../src/server/schema'
import { JsonDatabase } from '../../utils/JsonDatabase'

export class EventManagementSystem {
  private db: JsonDatabase

  constructor(private config?: EventConfig) {
    this.db = new JsonDatabase()
  }

  async createEvent(options: EventOptions & { teacherId: string; createdBy: string }): Promise<Lecture> {
    try {
      // Log the incoming data
      console.log('Creating event with options:', options)

      const validationResult = CreateLectureSchema.safeParse(options)
      if (!validationResult.success) {
        console.error('Validation error:', validationResult.error.flatten())
        throw new SystemError('EVENT_VALIDATION_FAILED', 'Invalid lecture data', validationResult.error.flatten())
      }

      const event: Lecture = {
        id: `lecture_${Date.now()}`,
        ...validationResult.data,
        type: 'lecture',
        status: 'scheduled',
        teacherId: options.teacherId,
        createdBy: options.createdBy,
      }

      // Log the event before insertion
      console.log('Event to be inserted:', event)

      await this.db.insert('events', event)
      return event
    } catch (error) {
      // Log the full error
      console.error('Event creation error:', error)
      if (error instanceof SystemError) throw error
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
      // Validate updates
      const validationResult = UpdateLectureSchema.safeParse(updates)
      if (!validationResult.success) {
        throw new SystemError(
          'EVENT_VALIDATION_FAILED',
          'Invalid lecture update data',
          validationResult.error.flatten()
        )
      }

      const updated = await this.db.update('events', { id: eventId }, validationResult.data)
      if (!updated) {
        throw new SystemError('EVENT_NOT_FOUND', `Event ${eventId} not found`)
      }

      return updated
    } catch (error) {
      if (error instanceof SystemError) throw error
      throw new SystemError('EVENT_UPDATE_FAILED', 'Failed to update event', error)
    }
  }
}
