export interface EventConfig {
  timezone?: string
  [key: string]: any
}

export interface EventOptions {
  name: string
  date: string
  roomId: string
}
