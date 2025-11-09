'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Room } from '@/types/room'
import { RoomCard } from './RoomCard'

interface RoomListProps {
  rooms: Room[]
}

export function RoomList({ rooms }: RoomListProps) {
  const router = useRouter()

  // Poll for updates every 30 seconds (reduced from 5s to minimize database load)
  // TODO: Remove when backend implements proper caching
  useEffect(() => {
    const interval = setInterval(() => {
      router.refresh() // Revalidate server component data
    }, 30000) // 30 seconds instead of 5

    return () => clearInterval(interval)
  }, [router])

  if (rooms.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-zinc-500 mb-4">
          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
        <p className="text-zinc-400 text-lg">No rooms available</p>
        <p className="text-zinc-500 text-sm mt-2">Rooms will appear here when lectures are scheduled</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {rooms.map((room) => (
        <RoomCard
          key={room.id}
          room={room}
        />
      ))}
    </div>
  )
}
