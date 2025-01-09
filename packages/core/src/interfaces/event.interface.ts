export interface EventConfig {
  timezone?: string
  [key: string]: any
}

export interface EventOptions {
  name: string
  date: string
  roomId: string
}

export interface Lecture {
  id: string
  name: string
  date: string
  roomId: string
  type: 'lecture'
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled' | 'delayed'
  communicationStatus?: {
    websocket: boolean
    webrtc: boolean
    resources: {
      allocated: boolean
      type: string
    }
  }
  participants?: {
    id: string
    role: 'teacher' | 'student'
    status: 'online' | 'offline'
  }[]
  teacherId: string
  createdBy: string
  description?: string
  maxParticipants?: number
  metadata?: {
    createdAt: string
    lastModified: string
    cancelledAt?: string
    cancelledBy?: string
    cancellationReason?: string
  }
  startTime?: string
  endTime?: string
  scheduledDuration?: number
}
