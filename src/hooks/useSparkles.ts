import { useState, useEffect, useCallback } from 'react'

interface Sparkle {
  id: number
  left: number
  size: number
  intensity: number
  color: string
  delay: number
}

export const useSparkles = (count: number = 30) => {
  const [sparkles, setSparkles] = useState<Sparkle[]>([])

  const getRandomColor = useCallback(() => {
    const colors = [
      'rgba(248, 113, 113', // red-400
      'rgba(251, 146, 146', // red-300
      'rgba(254, 178, 178', // red-200
    ]
    return colors[Math.floor(Math.random() * colors.length)] || 'rgba(248, 113, 113'
  }, [])

  useEffect(() => {
    // Create initial sparkles with staggered delays
    const newSparkles = Array.from({ length: count }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      size: Math.random() * 1.5 + 1.5,
      intensity: Math.random() * 0.3 + 0.4,
      color: getRandomColor(),
      delay: (i / count) * 6, // Stagger delays across full animation duration
    }))
    setSparkles(newSparkles)
  }, [count, getRandomColor])

  return sparkles
}
