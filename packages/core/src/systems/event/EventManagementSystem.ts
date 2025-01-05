import { EventConfig } from '@/interfaces/event.interface'

export class EventManagementSystem {
  constructor(private config?: EventConfig) {}

  async createEvent(options: { name: string; date: string; roomId: string }) {
    return { id: 'event1', ...options }
  }
}
