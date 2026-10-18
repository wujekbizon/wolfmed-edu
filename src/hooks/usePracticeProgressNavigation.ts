import { useEffect } from 'react'

export function usePracticeProgressNavigation(flush: () => Promise<void>, sendBeacon: () => void) {
  useEffect(() => {
    const timer = window.setInterval(() => void flush(), 10_000)
    const onVisibilityChange = () => { if (document.hidden) sendBeacon() }
    const onNavigationClick = (event: MouseEvent) => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
      const target = event.target
      if (!(target instanceof Element)) return
      const anchor = target.closest<HTMLAnchorElement>('a[href]')
      if (!anchor || anchor.target === '_blank' || anchor.hasAttribute('download')) return
      const destination = new URL(anchor.href)
      if (destination.origin !== window.location.origin) return
      if (destination.pathname === window.location.pathname && destination.search === window.location.search) return
      sendBeacon()
    }
    document.addEventListener('click', onNavigationClick, true)
    document.addEventListener('visibilitychange', onVisibilityChange)
    window.addEventListener('pagehide', sendBeacon)
    window.addEventListener('popstate', sendBeacon)
    return () => {
      window.clearInterval(timer)
      document.removeEventListener('click', onNavigationClick, true)
      document.removeEventListener('visibilitychange', onVisibilityChange)
      window.removeEventListener('pagehide', sendBeacon)
      window.removeEventListener('popstate', sendBeacon)
      sendBeacon()
    }
  }, [flush, sendBeacon])
}
