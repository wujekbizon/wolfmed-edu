import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

const HEARTBEAT_INTERVAL = 2 * 60 * 1000

export function useSessionHeartbeat(sessionId: string | null) {
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const router = useRouter()

  useEffect(() => {
    if (!sessionId) return

    const sendHeartbeat = async () => {
      try {
        const res = await fetch('/api/session/heartbeat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId })
        })

        if (res.status === 404) {
          router.push('/panel/testy')
        }
      } catch (error) {
        console.error('[Heartbeat] Failed to send:', error)
      }
    }

    sendHeartbeat()

    intervalRef.current = setInterval(sendHeartbeat, HEARTBEAT_INTERVAL)

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        sendHeartbeat()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange)

      navigator.sendBeacon('/api/session/expire', JSON.stringify({ sessionId }))
    }
  }, [sessionId, router])
}
