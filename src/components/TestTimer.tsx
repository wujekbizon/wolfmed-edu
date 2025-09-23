'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { expireSession } from '@/actions/actions'

interface TestTimerProps {
  durationMinutes: number
  sessionId: string
}

export default function TestTimer({ durationMinutes, sessionId }: TestTimerProps) {
  const [timeLeft, setTimeLeft] = useState(durationMinutes * 60)
  const [isWarning, setIsWarning] = useState(false)
  const router = useRouter()

  useEffect(() => {
    let timer: NodeJS.Timeout

    const handleExpiration = async () => {
      if (sessionId) {
        await expireSession(sessionId)
      }
    }

    timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime === 0) {
          clearInterval(timer)
          handleExpiration()
          return 0
        }
        // Set warning when 5 minutes remaining
        if (prevTime === 300) {
          setIsWarning(true)
        }
        return prevTime - 1
      })
    }, 1000)

    return () => {
      clearInterval(timer)
    }
  }, [sessionId])

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60

  const timerClasses = `font-mono text-lg font-bold px-4 py-2 rounded-lg ${isWarning ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`

  return (
    <div className={timerClasses}>
      {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
    </div>
  )
}