import { useEffect } from 'react'

export function useBeaconCleanup(sessionId: string | null) {
  useEffect(() => {
    if (!sessionId) return

    const expireSession = () => {
      navigator.sendBeacon(
        '/api/session/expire',
        JSON.stringify({ sessionId })
      )
    }

    const handleVisibilityChange = () => {
      if (document.hidden) {
        expireSession()
      }
    }

    const handlePageHide = () => {
      expireSession()
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('pagehide', handlePageHide)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('pagehide', handlePageHide)
    }
  }, [sessionId])
}
