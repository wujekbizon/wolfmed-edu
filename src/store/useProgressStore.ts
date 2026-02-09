import { create } from 'zustand'
import { v4 as uuidv4 } from 'uuid'
import type { ProgressStage, LogEntry, LogAudience } from '@/types/progressTypes'

type ConnectionState = 'idle' | 'connecting' | 'open' | 'closed' | 'error'

interface ProgressState {
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

interface ProgressActions {
  setConnectionState: (state: ConnectionState) => void
  updateProgress: (data: {
    stage: ProgressStage
    message: string
    progress: number
    tool?: string
  }) => void
  addLog: (log: {
    level: 'info' | 'warn' | 'error'
    message: string
    timestamp: string
    audience?: LogAudience
  }) => void
  setComplete: () => void
  setError: (message: string) => void
  reset: () => void
  regenerateJobId: () => void
}

type ProgressStore = ProgressState & ProgressActions

const initialState: ProgressState = {
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

export const useProgressStore = create<ProgressStore>((set) => ({
  ...initialState,
  jobId: uuidv4(),

  setConnectionState: (connectionState) => set({ connectionState }),

  updateProgress: (data) =>
    set({
      stage: data.stage,
      message: data.message,
      progress: data.progress,
      ...(data.tool && { tool: data.tool }),
    }),

  addLog: (log) =>
    set((state) => ({
      logs: [
        ...state.logs,
        {
          level: log.level,
          message: log.message,
          timestamp: log.timestamp,
          audience: log.audience || 'user',
        },
      ],
    })),

  setComplete: () =>
    set({
      stage: 'complete',
      message: 'Gotowe',
      progress: 100,
      isComplete: true,
      connectionState: 'closed',
    }),

  setError: (message) =>
    set({
      error: message,
      stage: 'error',
      connectionState: 'error',
    }),

  reset: () =>
    set({
      stage: 'idle',
      message: 'Oczekiwanie...',
      progress: 0,
      tool: null,
      logs: [],
      connectionState: 'idle',
      isComplete: false,
      error: null,
    }),

  regenerateJobId: () => set({ jobId: uuidv4() }),
}))
