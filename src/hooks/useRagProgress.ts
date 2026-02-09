'use client'

import { useCallback, useRef, useEffect } from 'react'
import { useProgressStore, selectUserLogs, selectTechnicalLogs } from '@/store/useProgressStore'
import type { ProgressStage, LogEntry, LogAudience } from '@/types/progressTypes'

interface SSEProgressData {
  stage: ProgressStage
  message: string
  progress: number
  total: number
  tool?: string
}

interface SSELogData {
  level: 'info' | 'warn' | 'error'
  message: string
  timestamp: string
  audience?: LogAudience
}

type ConnectionState = 'idle' | 'connecting' | 'open' | 'closed' | 'error'

interface UseRagProgressReturn {
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

export function useRagProgress(): UseRagProgressReturn {
  const {
    jobId,
    stage,
    message,
    progress,
    tool,
    connectionState,
    isComplete,
    error,
    setConnectionState,
    updateProgress,
    addLog,
    setComplete,
    setError,
    reset: resetStore,
  } = useProgressStore()

  const userLogs = useProgressStore(selectUserLogs)
  const technicalLogs = useProgressStore(selectTechnicalLogs)

  const eventSourceRef = useRef<EventSource | null>(null)

  const startListening = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
    }

    setConnectionState('connecting')
    resetStore()

    const eventSource = new EventSource(`/api/rag/progress?jobId=${jobId}`)
    eventSourceRef.current = eventSource

    eventSource.onopen = () => {
      setConnectionState('open')
    }

    eventSource.addEventListener('progress', (e) => {
      try {
        const data: SSEProgressData = JSON.parse(e.data)
        updateProgress({
          stage: data.stage,
          message: data.message,
          progress: data.progress,
          ...(data.tool && { tool: data.tool }),
        })
      } catch {
        // Ignore parse errors
      }
    })

    eventSource.addEventListener('log', (e) => {
      try {
        const data: SSELogData = JSON.parse(e.data)
        addLog({
          level: data.level,
          message: data.message,
          timestamp: data.timestamp,
          ...(data.audience && { audience: data.audience }),
        })
      } catch {
        // Ignore parse errors
      }
    })

    eventSource.addEventListener('complete', () => {
      setComplete()
      eventSource.close()
    })

    eventSource.addEventListener('error', (e: Event) => {
      const messageEvent = e as MessageEvent
      if (messageEvent.data) {
        try {
          const data = JSON.parse(messageEvent.data)
          setError(data.message || 'Wystąpił błąd')
          eventSource.close()
        } catch {
          // Not a valid JSON error event
        }
      }
    })

    eventSource.onerror = () => {
      if (eventSource.readyState === EventSource.CLOSED) {
        setConnectionState('closed')
      } else if (eventSource.readyState === EventSource.CONNECTING) {
        setConnectionState('connecting')
      }
    }
  }, [jobId, setConnectionState, resetStore, updateProgress, addLog, setComplete, setError])

  const stopListening = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
      eventSourceRef.current = null
    }
    setConnectionState('closed')
  }, [setConnectionState])

  const reset = useCallback(() => {
    stopListening()
    resetStore()
  }, [stopListening, resetStore])

  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
      }
    }
  }, [])

  return {
    jobId,
    stage,
    message,
    progress,
    tool,
    userLogs,
    technicalLogs,
    connectionState,
    isComplete,
    error,
    startListening,
    stopListening,
    reset,
  }
}
