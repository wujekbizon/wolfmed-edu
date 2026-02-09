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

export type ConnectionState = 'idle' | 'connecting' | 'open' | 'closed' | 'error'

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

export interface SSEProgressData {
  stage: ProgressStage
  message: string
  progress: number
  total: number
  tool?: string
}

export interface SSELogData {
  level: LogLevel
  message: string
  timestamp: string
  audience?: LogAudience
}

export interface UseRagProgressReturn {
  jobId: string
  stage: ProgressStage
  message: string
  progress: number
  tool: string | null
  userLogs: LogEntry[]
  technicalLogs: LogEntry[]
  connectionState: ConnectionState
  isComplete: boolean
  error: string | null
  startListening: () => void
  stopListening: () => void
  reset: () => void
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
