import { useState, useEffect, useRef } from 'react'

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

function toSeconds(t: TimeLeft) {
  return t.days * 24 * 60 * 60 + t.hours * 60 * 60 + t.minutes * 60 + t.seconds
}

function fromSeconds(s: number): TimeLeft {
  return {
    days: Math.floor(s / (24 * 60 * 60)),
    hours: Math.floor((s % (24 * 60 * 60)) / (60 * 60)),
    minutes: Math.floor((s % (60 * 60)) / 60),
    seconds: s % 60,
  }
}

/**
 * Custom hook for managing countdown timer state.
 * Anchors to a real end timestamp via useRef so the displayed time stays
 * accurate even if the browser throttles the tab or skips ticks.
 * Stops at zero and cleans up the interval on unmount.
 *
 * @param initialTime Initial time values for the countdown
 * @returns Current time left in the countdown
 */
export function useCountdown(initialTime: TimeLeft) {
  const [timeLeft, setTimeLeft] = useState(initialTime)
  // Store the absolute end time so each tick reads real elapsed wall-clock time
  // rather than decrementing by 1 — prevents drift when ticks are delayed.
  const endTimeRef = useRef(Date.now() + toSeconds(initialTime) * 1000)

  useEffect(() => {
    const timer = setInterval(() => {
      const remaining = Math.max(0, Math.floor((endTimeRef.current - Date.now()) / 1000))
      setTimeLeft(fromSeconds(remaining))

      if (remaining === 0) clearInterval(timer)
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  return timeLeft
}
