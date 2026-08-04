import { useReducer } from 'react'
import type {
  ConnectionState,
  LogEntry,
  ProgressStage,
  SSELogData,
  SSEProgressData,
} from '@/types/progressTypes'

export interface ProgressState {
  jobId: string
  stage: ProgressStage
  message: string
  progress: number
  tool: string | null
  logs: LogEntry[]
  connectionState: ConnectionState
  isComplete: boolean
  error: string | null
}

export type ProgressAction =
  | { type: 'start'; jobId: string }
  | { type: 'connection'; connectionState: ConnectionState }
  | { type: 'progress'; data: SSEProgressData }
  | { type: 'log'; data: SSELogData }
  | { type: 'complete' }
  | { type: 'error'; message: string }
  | { type: 'reset' }

const IDLE: ProgressState = {
  jobId: '',
  stage: 'idle',
  message: 'Oczekiwanie...',
  progress: 0,
  tool: null,
  logs: [],
  connectionState: 'idle',
  isComplete: false,
  error: null,
}

function reducer(state: ProgressState, action: ProgressAction): ProgressState {
  switch (action.type) {
    case 'start':
      return { ...IDLE, jobId: action.jobId, connectionState: 'connecting' }

    case 'connection':
      return { ...state, connectionState: action.connectionState }

    case 'progress':
      return {
        ...state,
        stage: action.data.stage,
        message: action.data.message,
        progress: action.data.progress,
        ...(action.data.tool ? { tool: action.data.tool } : {}),
      }

    case 'log':
      return {
        ...state,
        logs: [
          ...state.logs,
          {
            level: action.data.level,
            message: action.data.message,
            timestamp: action.data.timestamp,
            audience: action.data.audience || 'user',
          },
        ],
      }

    case 'complete':
      return {
        ...state,
        stage: 'complete',
        message: 'Gotowe',
        progress: 100,
        isComplete: true,
        connectionState: 'closed',
      }

    case 'error':
      return { ...state, error: action.message, stage: 'error', connectionState: 'error' }

    case 'reset':
      return { ...IDLE, jobId: state.jobId }
  }
}

/**
 * Per-instance progress state for one in-flight generation.
 *
 * Deliberately local rather than a module-level store: two AI cells, or a cell
 * and a plan generating a lecture, run concurrently and each needs its own
 * stage, logs and job id. Sharing one store let whichever started last reset the
 * other's bar mid-run and finish by clearing it.
 */
export function useProgressState() {
  return useReducer(reducer, IDLE)
}
