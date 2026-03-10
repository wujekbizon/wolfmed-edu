import { useEffect } from 'react'

export function useBeaconCleanup(sessionId: string | null) {
  useEffect(() => {
    if (!sessionId) return

    // NOTE: Session expiry only works correctly in production builds.
    // In development, sessions expire immediately — always test with `pnpm build && pnpm start`.
    const expireSession = () => {
      navigator.sendBeacon(
        '/api/session/expire',
        new Blob([JSON.stringify({ sessionId })], { type: 'application/json' })
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
