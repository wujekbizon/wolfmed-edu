export type ProgressStage =
  | 'idle'
  | 'parsing'
  | 'resolving'
  | 'fetching'
  | 'searching'
  | 'calling_tool'
  | 'executing'
  | 'finalizing'
  | 'complete'
  | 'error'

export type LogAudience = 'user' | 'technical'

export type LogLevel = 'info' | 'warn' | 'error'

export interface LogEntry {
  level: LogLevel
  message: string
  timestamp: string
  audience: LogAudience
}

export interface ProgressData {
  stage: ProgressStage
  message: string
  progress: number
  total: number
  tool?: string
}

export type EventType = 'progress' | 'log' | 'complete' | 'error'

export interface ProgressEvent {
  id: number
  type: EventType
  data: Record<string, unknown>
  timestamp: number
}

export interface JobProgress {
  events: ProgressEvent[]
  status: 'active' | 'complete' | 'error'
  lastEventId: number
  createdAt: number
}
