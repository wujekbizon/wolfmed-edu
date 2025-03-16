import { TeachingPlaygroundConfig } from '../interfaces/teaching-playground.interface'
import { RealTimeCommunicationSystem } from '../systems/comms/RealTimeCommunicationSystem'
import { DataManagementSystem } from '../systems/data/DataManagementSystem'
import { EventManagementSystem } from '../systems/event/EventManagementSystem'
import { RoomManagementSystem } from '../systems/room/RoomManagementSystem'
import { Lecture } from '../interfaces/event.interface'
import { SystemError } from '../interfaces'
import { User, TeacherProfile } from '../interfaces/user.interface'

export default class TeachingPlayground {
  private roomSystem: RoomManagementSystem
  private commsSystem: RealTimeCommunicationSystem
  private eventSystem: EventManagementSystem
  private dataSystem: DataManagementSystem
  private currentUser: User | null = null

  constructor(config: TeachingPlaygroundConfig) {
    this.roomSystem = new RoomManagementSystem(config.roomConfig)
    this.commsSystem = new RealTimeCommunicationSystem(config.commsConfig)
    this.eventSystem = new EventManagementSystem(config.eventConfig)
    this.dataSystem = new DataManagementSystem(config.dataConfig)

    console.log('Teaching Playground initialized with all systems.')
  }

  // Room Management
  async createClassroom(options: { name: string; [key: string]: any }) {
    const room = await this.roomSystem.createRoom(options)
    this.commsSystem.setupForRoom(room.id)
    return room
  }

  // User Management
  setCurrentUser(user: User): void {
    this.currentUser = user
  }

  private ensureUserAuthorized(requiredRole: 'teacher' | 'student' | 'admin'): void {
    if (!this.currentUser) {
      throw new SystemError('UNAUTHORIZED', 'No user logged in')
    }
    if (this.currentUser.role !== requiredRole && this.currentUser.role !== 'admin') {
      throw new SystemError('FORBIDDEN', `Only ${requiredRole}s can perform this action`)
    }
  }

  // Enhanced Event Management
  async scheduleLecture(options: {
    name: string
    date: string
    roomId: string
    description?: string
    maxParticipants?: number
  }): Promise<Lecture> {
    try {
      this.ensureUserAuthorized('teacher')

      // Create the event with teacher information
      const event = await this.eventSystem.createEvent({
        ...options,
        teacherId: this.currentUser!.id,
        createdBy: this.currentUser!.name,
      })

      // Setup communication resources
      await this.commsSystem.allocateResources(event.id)

      // Save additional event metadata
      await this.dataSystem.saveData(`event_meta_${event.id}`, {
        createdAt: new Date().toISOString(),
        createdBy: this.currentUser!.id,
        lastModified: new Date().toISOString(),
      })

      return event
    } catch (error) {
      throw new SystemError('LECTURE_SCHEDULING_FAILED', 'Failed to schedule lecture', error)
    }
  }

  async getTeacherLectures(options?: {
    status?: 'scheduled' | 'in-progress' | 'completed' | 'cancelled'
    fromDate?: string
    toDate?: string
  }): Promise<Lecture[]> {
    try {
      this.ensureUserAuthorized('teacher')

      return await this.eventSystem.listEvents({
        type: 'lecture',
        teacherId: this.currentUser!.id,
        ...options,
      })
    } catch (error) {
      throw new SystemError('LECTURE_LIST_FAILED', 'Failed to fetch teacher lectures', error)
    }
  }

  async updateLecture(
    lectureId: string,
    updates: {
      name?: string
      date?: string
      description?: string
      maxParticipants?: number
    }
  ): Promise<Lecture> {
    try {
      this.ensureUserAuthorized('teacher')

      // Verify lecture ownership
      const lecture = await this.eventSystem.getEvent(lectureId)
      if (lecture.teacherId !== this.currentUser!.id) {
        throw new SystemError('FORBIDDEN', 'You can only update your own lectures')
      }

      return await this.eventSystem.updateEvent(lectureId, updates)
    } catch (error) {
      throw new SystemError('LECTURE_UPDATE_FAILED', 'Failed to update lecture', error)
    }
  }

  async cancelLecture(lectureId: string, reason?: string): Promise<void> {
    try {
      this.ensureUserAuthorized('teacher')

      // Verify lecture ownership
      const lecture = await this.eventSystem.getEvent(lectureId)
      if (lecture.teacherId !== this.currentUser!.id) {
        throw new SystemError('FORBIDDEN', 'You can only cancel your own lectures')
      }

      await this.eventSystem.cancelEvent(lectureId)
      await this.commsSystem.deallocateResources(lectureId)
      await this.dataSystem.saveData(`event_cancellation_${lectureId}`, {
        cancelledAt: new Date().toISOString(),
        cancelledBy: this.currentUser!.id,
        reason,
      })
    } catch (error) {
      throw new SystemError('LECTURE_CANCELLATION_FAILED', 'Failed to cancel lecture', error)
    }
  }

  async listLectures(roomId?: string): Promise<Lecture[]> {
    try {
      const lectures = await this.eventSystem.listEvents({
        type: 'lecture',
        ...(roomId !== undefined && { roomId }),
      })

      // Enrich with communication status
      return await Promise.all(
        lectures.map(async (lecture) => ({
          ...lecture,
          communicationStatus: await this.commsSystem.getResourceStatus(lecture.id),
        }))
      )
    } catch (error) {
      console.error('Failed to list lectures:', error)
      throw new SystemError('LECTURE_LIST_FAILED', 'Failed to fetch lectures')
    }
  }

  async getLectureDetails(lectureId: string): Promise<Lecture> {
    try {
      const lecture = await this.eventSystem.getEvent(lectureId)
      const commsStatus = await this.commsSystem.getResourceStatus(lectureId)
      const participants = [...(await this.roomSystem.getRoomParticipants(lecture.roomId))]

      return {
        ...lecture,
        communicationStatus: commsStatus,
        participants,
      }
    } catch (error) {
      console.error('Failed to get lecture details:', error)
      throw new SystemError('LECTURE_DETAILS_FAILED', 'Failed to fetch lecture details')
    }
  }

  // Communication
  setupCommunication(roomId: string): void {
    console.log(`Setting up communication for room: ${roomId}`)
  }

  disconnectCommunication(roomId: string): void {
    console.log(`Disconnecting communication for room: ${roomId}`)
  }

  // Data Handling
  async saveState(): Promise<void> {
    console.log('Saving state')
  }

  async loadState(): Promise<void> {
    console.log('Loading state')
  }

  // System Health
  getSystemStatus(): { [key: string]: string } {
    return {
      roomSystem: 'healthy',
      commsSystem: 'healthy',
      eventSystem: 'healthy',
      dataSystem: 'healthy',
    }
  }

  restartSystem(system: 'room' | 'comms' | 'event' | 'data'): void {
    console.log(`Restarting system: ${system}`)
  }

  // Lifecycle
  shutdown(): void {
    console.log('Shutting down all systems')
  }

  initialize(config: TeachingPlaygroundConfig): void {
    console.log('Reinitializing with new config')
  }
}
