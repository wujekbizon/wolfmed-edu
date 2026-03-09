import { useState, useEffect } from 'react'

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

/**
 * Custom hook for managing countdown timer state.
 * Decrements the given time by one second per interval tick.
 * Stops at zero and cleans up the interval on unmount.
 *
 * @param initialTime Initial time values for the countdown
 * @returns Current time left in the countdown
 */
export function useCountdown(initialTime: TimeLeft) {
  const [timeLeft, setTimeLeft] = useState(initialTime)

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        // Convert all time units to total seconds for easier calculation
        const totalSeconds =
          prevTime.days * 24 * 60 * 60 + prevTime.hours * 60 * 60 + prevTime.minutes * 60 + prevTime.seconds - 1

        // Stop at zero
        if (totalSeconds < 0) {
          return { days: 0, hours: 0, minutes: 0, seconds: 0 }
        }

        // Convert total seconds back to days, hours, minutes, seconds
        return {
          days: Math.floor(totalSeconds / (24 * 60 * 60)),
          hours: Math.floor((totalSeconds % (24 * 60 * 60)) / (60 * 60)),
          minutes: Math.floor((totalSeconds % (60 * 60)) / 60),
          seconds: totalSeconds % 60,
        }
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  return timeLeft
}
