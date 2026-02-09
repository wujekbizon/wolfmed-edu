'use client'

/**
 * useRagProgress - SSE-based progress tracking hook for RAG operations
 *
 * Connects to /api/rag/progress via Server-Sent Events to receive real-time
 * progress updates during RAG queries. Manages connection lifecycle and
 * separates user-friendly logs from technical logs.
 *
 * Usage:
 *   const { startListening, progress, userLogs } = useRagProgress()
 *   // Call startListening() when submitting a RAG query
 *   // Progress updates will stream in real-time
 */

import { useCallback, useRef, useEffect, useMemo } from 'react'
import { useProgressStore } from '@/store/useProgressStore'
import type { SSEProgressData, SSELogData, UseRagProgressReturn } from '@/types/progressTypes'

export function useRagProgress(): UseRagProgressReturn {
  const {
    jobId,
    stage,
    message,
    progress,
    tool,
    logs,
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

  const userLogs = useMemo(
    () => logs.filter((log) => log.audience === 'user' || !log.audience),
    [logs]
  )
  const technicalLogs = useMemo(
    () => logs.filter((log) => log.audience === 'technical'),
    [logs]
  )

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
