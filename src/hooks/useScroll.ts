import { useState, useEffect } from 'react'

interface ScrollState {
  isScrolled: boolean
  scrollDirection: 'up' | 'down' | null
}

export function useScroll(threshold: number = 50, container?: HTMLElement | null) {
  const [scrollState, setScrollState] = useState<ScrollState>({
    isScrolled: false,
    scrollDirection: null,
  })

  useEffect(() => {
    const target: HTMLElement | Window = container ?? window

    let lastScrollY =
      target instanceof Window ? window.scrollY : (target as HTMLElement).scrollTop

    let ticking = false

    const updateScrollState = () => {
      const currentScrollY =
        target instanceof Window ? window.scrollY : (target as HTMLElement).scrollTop

      const direction = currentScrollY > lastScrollY ? 'down' : 'up'
      const isScrolled = currentScrollY > threshold

      setScrollState(prev => {
        if (prev.isScrolled === isScrolled && prev.scrollDirection === direction) return prev
        return { isScrolled, scrollDirection: direction }
      })

      lastScrollY = currentScrollY
      ticking = false
    }

    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(updateScrollState)
        ticking = true
      }
    }

    target.addEventListener('scroll', onScroll, { passive: true })
    return () => target.removeEventListener('scroll', onScroll)
  }, [threshold, container])

  return scrollState
}
