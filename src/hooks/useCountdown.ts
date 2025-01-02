import { useState, useEffect, useCallback } from 'react'

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

export function useCountdown(initialTime: TimeLeft) {
  const [timeLeft, setTimeLeft] = useState(initialTime)

  const updateTime = useCallback(() => {
    setTimeLeft((prevTime) => {
      let totalSeconds =
        prevTime.days * 24 * 60 * 60 + prevTime.hours * 60 * 60 + prevTime.minutes * 60 + prevTime.seconds - 1

      if (totalSeconds < 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0 }
      }

      return {
        days: Math.floor(totalSeconds / (24 * 60 * 60)),
        hours: Math.floor((totalSeconds % (24 * 60 * 60)) / (60 * 60)),
        minutes: Math.floor((totalSeconds % (60 * 60)) / 60),
        seconds: totalSeconds % 60,
      }
    })
  }, [])

  useEffect(() => {
    // Update every second
    const timer = setInterval(updateTime, 1000)

    // Cleanup on unmount
    return () => clearInterval(timer)
  }, [updateTime])

  return timeLeft
}
