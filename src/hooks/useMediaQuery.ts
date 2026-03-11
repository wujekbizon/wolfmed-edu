import { useEffect, useState } from 'react'

/**
 * Reactively tracks a CSS media query.
 * Returns true when the query matches, false otherwise.
 * Safe for SSR — returns false until hydrated on the client.
 *
 * Usage:
 *   const isMobile = useMediaQuery('(max-width: 1023px)')
 *   const isTouch  = useMediaQuery('(pointer: coarse)')
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const mql = window.matchMedia(query)
    setMatches(mql.matches)

    const onChange = (e: MediaQueryListEvent) => setMatches(e.matches)
    mql.addEventListener('change', onChange)

    return () => mql.removeEventListener('change', onChange)
  }, [query])

  return matches
}
