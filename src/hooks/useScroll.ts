import { useState, useEffect } from 'react'

interface ScrollState {
  isScrolled: boolean
  scrollDirection: 'up' | 'down' | null
  scrollY: number
}

export function useScroll(threshold: number = 50) {
  const [scrollState, setScrollState] = useState<ScrollState>({
    isScrolled: false,
    scrollDirection: null,
    scrollY: 0,
  })

  useEffect(() => {
    let lastScrollY = window.scrollY
    let ticking = false

    const updateScrollState = () => {
      const currentScrollY = window.scrollY
      const direction = currentScrollY > lastScrollY ? 'down' : 'up'
      const isScrolled = currentScrollY > threshold

      // Avoid state update if no changes in scroll state
      if (
        isScrolled !== scrollState.isScrolled ||
        direction !== scrollState.scrollDirection ||
        currentScrollY !== scrollState.scrollY
      ) {
        setScrollState({ isScrolled, scrollDirection: direction, scrollY: currentScrollY })
      }

      lastScrollY = currentScrollY
      ticking = false
    }

    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(updateScrollState)
        ticking = true
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [threshold, scrollState])

  return scrollState
}
