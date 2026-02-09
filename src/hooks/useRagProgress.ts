'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'
import type { ProgressStage, LogEntry } from '@/lib/progress-events'

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
}

type ConnectionState = 'idle' | 'connecting' | 'open' | 'closed' | 'error'

interface UseRagProgressReturn {
  jobId: string
  stage: ProgressStage
  message: string
  progress: number
  tool: string | null
  logs: LogEntry[]
  connectionState: ConnectionState
  isComplete: boolean
  error: string | null
  startListening: () => void
  stopListening: () => void
  reset: () => void
}

export function useRagProgress(): UseRagProgressReturn {
  const [jobId] = useState(() => uuidv4())
  const [stage, setStage] = useState<ProgressStage>('idle')
  const [message, setMessage] = useState('Oczekiwanie...')
  const [progress, setProgress] = useState(0)
  const [tool, setTool] = useState<string | null>(null)
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [connectionState, setConnectionState] = useState<ConnectionState>('idle')
  const [isComplete, setIsComplete] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const eventSourceRef = useRef<EventSource | null>(null)
  const lastEventTimeRef = useRef<number>(Date.now())

  const startListening = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
    }

    setConnectionState('connecting')
    setIsComplete(false)
    setError(null)
    setStage('idle')
    setProgress(0)
    setLogs([])
    setTool(null)

    const eventSource = new EventSource(`/api/rag/progress?jobId=${jobId}`)
    eventSourceRef.current = eventSource

    eventSource.onopen = () => {
      setConnectionState('open')
      lastEventTimeRef.current = Date.now()
    }

    eventSource.addEventListener('progress', (e) => {
      lastEventTimeRef.current = Date.now()
      try {
        const data: SSEProgressData = JSON.parse(e.data)
        setStage(data.stage)
        setMessage(data.message)
        setProgress(data.progress)
        if (data.tool) {
          setTool(data.tool)
        }
      } catch {
        // Ignore parse errors
      }
    })

    eventSource.addEventListener('log', (e) => {
      lastEventTimeRef.current = Date.now()
      try {
        const data: SSELogData = JSON.parse(e.data)
        setLogs((prev) => [...prev, data])
      } catch {
        // Ignore parse errors
      }
    })

    eventSource.addEventListener('complete', () => {
      lastEventTimeRef.current = Date.now()
      setStage('complete')
      setMessage('Gotowe')
      setProgress(100)
      setIsComplete(true)
      setConnectionState('closed')
      eventSource.close()
    })

    // Custom error event from server (job failed)
    eventSource.addEventListener('error', (e: Event) => {
      lastEventTimeRef.current = Date.now()
      const messageEvent = e as MessageEvent
      if (messageEvent.data) {
        try {
          const data = JSON.parse(messageEvent.data)
          setError(data.message || 'Wystąpił błąd')
          setStage('error')
          setConnectionState('error')
          eventSource.close()
        } catch {
          // Not a valid JSON error event, ignore
        }
      }
    })

    // Native EventSource error (connection issues)
    eventSource.onerror = () => {
      if (eventSource.readyState === EventSource.CLOSED) {
        // Stream closed - this is normal when job completes
        setConnectionState('closed')
      } else if (eventSource.readyState === EventSource.CONNECTING) {
        setConnectionState('connecting') // Reconnecting
      }
    }
  }, [jobId])

  const stopListening = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
      eventSourceRef.current = null
    }
    setConnectionState('closed')
  }, [])

  const reset = useCallback(() => {
    stopListening()
    setStage('idle')
    setMessage('Oczekiwanie...')
    setProgress(0)
    setTool(null)
    setLogs([])
    setConnectionState('idle')
    setIsComplete(false)
    setError(null)
  }, [stopListening])

  // Cleanup on unmount
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
    logs,
    connectionState,
    isComplete,
    error,
    startListening,
    stopListening,
    reset,
  }
}
