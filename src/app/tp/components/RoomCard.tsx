'use client'

import { Room } from '@/types/room'
import type { Lecture } from '@teaching-playground/core'
import { useRouter } from 'next/navigation'
import clsx from 'clsx'

interface RoomCardProps {
  room: Room
  currentLecture?: Lecture
}

export function RoomCard({ room, currentLecture }: RoomCardProps) {
  const router = useRouter()

  const statusColors = {
    available: 'bg-green-500/10 text-green-400',
    occupied: 'bg-blue-500/10 text-blue-400',
    scheduled: 'bg-yellow-500/10 text-yellow-400',
    maintenance: 'bg-red-500/10 text-red-400',
  } as const

  const handleRoomClick = () => {
    if (room.status === 'occupied' && currentLecture) {
      router.push(`/tp/rooms/${room.id}/session/${currentLecture.id}`)
    } else {
      router.push(`/tp/rooms/${room.id}`)
    }
  }

  return (
    <div
      onClick={handleRoomClick}
      className="bg-zinc-800 border border-zinc-700 rounded-lg p-4 hover:border-zinc-600 transition-colors cursor-pointer"
    >
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-medium text-zinc-100">{room.name}</h3>
          <p className="text-sm text-zinc-400 mt-1">
            Capacity: {room.capacity} participants
          </p>
        </div>
        <span
          className={clsx(
            'px-2 py-1 rounded-md text-xs font-medium',
            statusColors[room.status]
          )}
        >
          {room.status}
        </span>
      </div>

      <div className="mt-4 space-y-2">
        <div className="flex flex-wrap gap-2">
          {room.features.hasVideo && (
            <span className="px-2 py-1 bg-zinc-700/50 rounded-md text-xs text-zinc-300">
              Video Conference
            </span>
          )}
          {room.features.hasWhiteboard && (
            <span className="px-2 py-1 bg-zinc-700/50 rounded-md text-xs text-zinc-300">
              Whiteboard
            </span>
          )}
          {room.features.hasScreenShare && (
            <span className="px-2 py-1 bg-zinc-700/50 rounded-md text-xs text-zinc-300">
              Screen Sharing
            </span>
          )}
        </div>

        {currentLecture && (
          <div className="mt-4 p-3 bg-zinc-700/20 rounded-md">
            <p className="text-sm font-medium text-zinc-300">Current Session</p>
            <p className="text-sm text-zinc-400 mt-1">{currentLecture.name}</p>
            <div className="flex items-center mt-2">
              <div className={clsx(
                'w-2 h-2 rounded-full mr-2',
                currentLecture.communicationStatus?.websocket ? 'bg-green-400' : 'bg-red-400'
              )} />
              <span className="text-xs text-zinc-400">
                WebSocket {currentLecture.communicationStatus?.websocket ? "connected" : "disconnected"}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 