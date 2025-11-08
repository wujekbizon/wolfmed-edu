'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface WaitingRoomViewProps {
  lectureDate: Date
  minutesUntilStart: number
}

export function WaitingRoomView({ lectureDate, minutesUntilStart }: WaitingRoomViewProps) {
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(false)

  // Less aggressive polling - check every 30 seconds
  // Teacher starting the lecture will trigger revalidatePath automatically
  useEffect(() => {
    const interval = setInterval(() => {
      router.refresh()
    }, 30000)

    return () => clearInterval(interval)
  }, [router])

  const handleCheckAgain = () => {
    setIsChecking(true)
    router.refresh()
    // Reset button state after a brief moment
    setTimeout(() => setIsChecking(false), 1000)
  }

  return (
    <div className="flex items-center justify-center h-[calc(100vh-12rem)]">
      <div className="text-center max-w-md">
        <div className="text-yellow-400 mb-4">
          <svg
            className="w-12 h-12 mx-auto"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-zinc-200 mb-2">
          Lecture hasn't started yet
        </h2>
        <p className="text-zinc-400 mb-4">
          This lecture is scheduled to start in {minutesUntilStart} minute{minutesUntilStart !== 1 ? 's' : ''}.
        </p>
        <p className="text-sm text-zinc-500 mb-6">
          Scheduled time: {lectureDate.toLocaleString('pl-PL', {
            dateStyle: 'short',
            timeStyle: 'short'
          })}
        </p>
        <p className="text-xs text-zinc-600 mb-4">
          This page will automatically refresh when the lecture starts
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={handleCheckAgain}
            disabled={isChecking}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-800 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
          >
            {isChecking ? 'Checking...' : 'Check Again'}
          </button>
          <Link
            href="/tp/rooms"
            className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Back to Rooms
          </Link>
        </div>
      </div>
    </div>
  )
}
