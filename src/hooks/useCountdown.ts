import { useState, useEffect, useCallback } from 'react'
import { calculateTimeLeft } from '@/utils/dateUtils'

export function useCountdown(initialTime: { days: number; hours: number; minutes: number; seconds: number }) {
  const [timeLeft, setTimeLeft] = useState(initialTime)

  const updateTime = useCallback(() => {
    setTimeLeft(calculateTimeLeft())
  }, [])

  useEffect(() => {
    // Initial update
    updateTime()

    // Update every second
    const timer = setInterval(updateTime, 1000)

    // Cleanup on unmount
    return () => clearInterval(timer)
  }, [updateTime])

  return timeLeft
}
