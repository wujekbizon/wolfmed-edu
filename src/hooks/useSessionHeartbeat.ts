import { useEffect, useRef } from 'react'

const HEARTBEAT_INTERVAL = 2 * 60 * 1000

export function useSessionHeartbeat(sessionId: string | null) {
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (!sessionId) return

    const sendHeartbeat = async () => {
      try {
        await fetch('/api/session/heartbeat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId }),
        })
      } catch (error) {
        console.error('[Heartbeat] Failed to send:', error)
      }
    }

    sendHeartbeat()

    // Then send every 2 minutes
    intervalRef.current = setInterval(sendHeartbeat, HEARTBEAT_INTERVAL)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [sessionId])
}
