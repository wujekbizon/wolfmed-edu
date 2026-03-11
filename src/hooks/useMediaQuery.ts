import { useEffect, useState } from 'react'

/**
 * Reactively tracks a CSS media query using `window.matchMedia`.
 *
 * Subscribes to the `change` event on the `MediaQueryList` so the returned
 * value updates automatically when the viewport or device capabilities change
 * (e.g. window resize, connecting an external monitor, switching input mode).
 *
 * SSR-safe: always returns `false` on the server and during the first render,
 * then syncs to the real match value after hydration.
 *
 * @param query - A valid CSS media query string, e.g. `'(max-width: 1023px)'`
 *                or `'(pointer: coarse)'`.
 * @returns `true` while the media query matches, `false` otherwise.
 *
 * @example
 * const isMobile = useMediaQuery('(max-width: 1023px)')
 * const isTouch  = useMediaQuery('(pointer: coarse)')
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
