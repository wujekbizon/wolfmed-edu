import { useState, useEffect, useMemo } from 'react'
import { useDebouncedValue } from './useDebounceValue'

export const useRandomPositions = (count: number = 6) => {
  const [positions, setPositions] = useState<Array<{ top: string; left: string }>>([])
  const [svgSize, setSvgSize] = useState<{ width: number; height: number }>({ width: 36, height: 36 })
  const [windowSize, setWindowSize] = useState<number>(0)

  const debouncedWindowSize = useDebouncedValue(windowSize, 200)

  const generateRandomPositions = useMemo(() => {
    return () => {
      const newPositions = []
      for (let i = 0; i < count; i++) {
        newPositions.push({
          top: `${Math.random() * 70 + 10}%`,
          left: `${Math.random() * 70 + 10}%`, 
        })
      }
      return newPositions
    }
  }, [count])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setWindowSize(window.innerWidth)

      const handleResize = () => {
        setWindowSize(window.innerWidth)
      }

      window.addEventListener('resize', handleResize)
      return () => {
        window.removeEventListener('resize', handleResize)
      }
    }
  }, [])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const width = debouncedWindowSize
      let size
      if (width < 768) {
        size = { width: 20, height: 20 }
      } else if (width < 1024) {
        size = { width: 28, height: 28 }
      } else {
        size = { width: 36, height: 36 }
      }
      setSvgSize(size)
      setPositions(generateRandomPositions())
    }
  }, [debouncedWindowSize, generateRandomPositions])

  return { positions, svgSize }
}
