'use client'

/**
 * useRagProgress - SSE-based progress tracking hook for RAG operations
 *
 * Connects to /api/rag/progress via Server-Sent Events to receive real-time
 * progress updates during RAG queries. Manages connection lifecycle and
 * separates user-friendly logs from technical logs.
 *
 * State is per-hook-instance, so concurrent generations in different cells do
 * not overwrite one another's progress.
 *
 * Usage:
 *   const { startListening, progress, userLogs } = useRagProgress()
 *   // Send the id startListening() returns with the request
 */

import { useCallback, useRef, useEffect, useMemo } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { useProgressState } from './useProgressState'
import type { SSEProgressData, SSELogData, UseRagProgressReturn } from '@/types/progressTypes'

export function useRagProgress(): UseRagProgressReturn {
  const [state, dispatch] = useProgressState()

  const userLogs = useMemo(
    () => state.logs.filter((log) => log.audience === 'user' || !log.audience),
    [state.logs]
  )
  const technicalLogs = useMemo(
    () => state.logs.filter((log) => log.audience === 'technical'),
    [state.logs]
  )

  const eventSourceRef = useRef<EventSource | null>(null)

  const startListening = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
    }

    // A fresh id per run. The endpoint returns 204 for a job it has already
    // completed, so reusing the id meant every run after the first opened a
    // stream that closed immediately and rendered no progress.
    const nextJobId = uuidv4()
    dispatch({ type: 'start', jobId: nextJobId })

    const eventSource = new EventSource(`/api/rag/progress?jobId=${nextJobId}`)
    eventSourceRef.current = eventSource

    eventSource.onopen = () => {
      dispatch({ type: 'connection', connectionState: 'open' })
    }

    eventSource.addEventListener('progress', (e) => {
      try {
        dispatch({ type: 'progress', data: JSON.parse(e.data) as SSEProgressData })
      } catch {
        // Ignore parse errors
      }
    })

    eventSource.addEventListener('log', (e) => {
      try {
        dispatch({ type: 'log', data: JSON.parse(e.data) as SSELogData })
      } catch {
        // Ignore parse errors
      }
    })

    eventSource.addEventListener('complete', () => {
      dispatch({ type: 'complete' })
      eventSource.close()
    })

    eventSource.addEventListener('error', (e: Event) => {
      const messageEvent = e as MessageEvent
      if (messageEvent.data) {
        try {
          const data = JSON.parse(messageEvent.data)
          dispatch({ type: 'error', message: data.message || 'Wystąpił błąd' })
          eventSource.close()
        } catch {
          // Not a valid JSON error event
        }
      }
    })

    eventSource.onerror = () => {
      if (eventSource.readyState === EventSource.CLOSED) {
        dispatch({ type: 'connection', connectionState: 'closed' })
      } else if (eventSource.readyState === EventSource.CONNECTING) {
        dispatch({ type: 'connection', connectionState: 'connecting' })
      }
    }

    return nextJobId
  }, [dispatch])

  const stopListening = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
      eventSourceRef.current = null
    }
    dispatch({ type: 'connection', connectionState: 'closed' })
  }, [dispatch])

  const reset = useCallback(() => {
    stopListening()
    dispatch({ type: 'reset' })
  }, [stopListening, dispatch])

  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
      }
    }
  }, [])

  return {
    jobId: state.jobId,
    stage: state.stage,
    message: state.message,
    progress: state.progress,
    tool: state.tool,
    userLogs,
    technicalLogs,
    connectionState: state.connectionState,
    isComplete: state.isComplete,
    error: state.error,
    startListening,
    stopListening,
    reset,
  }
}
