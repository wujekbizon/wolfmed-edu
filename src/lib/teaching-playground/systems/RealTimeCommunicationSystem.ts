import { EventEmitter } from 'events'
import { CommsConfig } from '../interfaces'

interface RoomMessage {
  userId: string
  username: string
  content: string
  timestamp: string
}

interface StreamState {
  isActive: boolean
  streamerId: string | null
  quality: 'low' | 'medium' | 'high'
}

export default class RealTimeCommunicationSystem extends EventEmitter {
  // private io: SocketIOServer | null = null
  private rooms: Map<string, Set<string>> = new Map()
  private streams: Map<string, StreamState> = new Map()
  private messages: Map<string, RoomMessage[]> = new Map()

  constructor(private config?: CommsConfig) {
    super()
  }

}
