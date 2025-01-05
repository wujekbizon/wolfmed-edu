import { RoomConfig } from '@/interfaces/room.interface'

export class RoomManagementSystem {
  constructor(private config?: RoomConfig) {}

  async createRoom(options: { name: string; [key: string]: any }) {
    return { id: 'room1', ...options }
  }
}
