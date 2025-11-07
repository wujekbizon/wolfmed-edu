import { Suspense } from 'react'
import { getRoomById } from '@/actions/teachingPlayground'
import { RoomLoadingState } from '../../components/RoomLoadingState'
import RoomView from '../../components/RoomView'
import { currentUser } from '@clerk/nextjs/server'
import Link from 'next/link'

async function RoomContainer({ roomId }: { roomId: string }) {
  const room = await getRoomById(roomId)
  const user = await currentUser()

  const userRole = user?.publicMetadata?.role as 'teacher' | 'student' | 'admin' || 'student'

  if (!room) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-12rem)]">
        <div className="text-center">
          <div className="text-red-400 mb-4">
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
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-zinc-200 mb-2">
            Room not found
          </h2>
          <p className="text-zinc-400">
            Please check the room ID and try again
          </p>
        </div>
      </div>
    )
  }

  // Check if lecture has started (only for students)
  if (room.currentLecture && userRole === 'student') {
    const lectureDate = new Date(room.currentLecture.date)
    const now = new Date()
    const lectureStatus = room.currentLecture.status

    // Students can only join if lecture is in-progress or if it's past the scheduled time
    const canJoin = lectureStatus === 'in-progress' ||
                    (lectureStatus === 'scheduled' && now >= lectureDate)

    if (!canJoin) {
      const timeUntilStart = lectureDate.getTime() - now.getTime()
      const minutesUntilStart = Math.ceil(timeUntilStart / (1000 * 60))

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
            <Link
              href="/tp"
              className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Back to Lectures
            </Link>
          </div>
        </div>
      )
    }
  }

  return <RoomView room={room} />
}

export default async function RoomPage({ params }: { params: Promise<{ roomId: string } >}) {
  const { roomId } = await params
  
  return (
    <Suspense fallback={<RoomLoadingState />}>
      <RoomContainer roomId={roomId} />
    </Suspense>
  )
} 