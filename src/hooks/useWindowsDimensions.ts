import { useEffect, useState } from 'react'

type WindowDimentions = {
  width: number
  height: number
}

export const useWindowDimensions = (): WindowDimentions => {
  const [windowDimensions, setWindowDimensions] = useState<WindowDimentions>({
    width: window.innerWidth,
    height: window.innerHeight,
  })
  useEffect(() => {
    // Check if window is defined (client-side)
    if (typeof window !== 'undefined') {
      const handleResize = (): void => {
        setWindowDimensions({
          width: window.innerWidth,
          height: window.innerHeight,
        })
      }

      handleResize() // Set initial dimensions on mount
      window.addEventListener('resize', handleResize) // Add resize listener

      // Clean up event listener on unmount
      return (): void => window.removeEventListener('resize', handleResize)
    }
  }, []) // Empty array ensures that effect is only run on mount

  return windowDimensions
}
