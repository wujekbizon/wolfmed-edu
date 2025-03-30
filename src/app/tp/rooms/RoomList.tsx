'use client'

import { useQuery } from '@tanstack/react-query'
import { Room } from '@/types/room'
import { Lecture } from '@teaching-playground/core'
import { RoomCard } from './RoomCard'

async function fetchRooms(): Promise<Room[]> {
  // TODO: Replace with actual API call
  const response = await fetch('/api/rooms')
  if (!response.ok) throw new Error('Failed to fetch rooms')
  return response.json()
}

async function fetchCurrentLectures(): Promise<Lecture[]> {
  // TODO: Replace with actual API call
  const response = await fetch('/api/lectures/current')
  if (!response.ok) throw new Error('Failed to fetch current lectures')
  return response.json()
}

export function RoomList() {
  // Fetch rooms with React Query
  const { data: rooms = [] } = useQuery({
    queryKey: ['rooms'],
    queryFn: fetchRooms,
    staleTime: 1000 * 60, // 1 minute
    refetchInterval: 1000 * 30, // Refetch every 30 seconds
  })

  // Fetch current lectures
  const { data: currentLectures = [] } = useQuery({
    queryKey: ['currentLectures'],
    queryFn: fetchCurrentLectures,
    staleTime: 1000 * 60,
    refetchInterval: 1000 * 30,
  })

  // Match rooms with their current lectures
  const roomsWithLectures = rooms.map(room => ({
    room,
    currentLecture: currentLectures.find(lecture => lecture.roomId === room.id)
  }))

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {roomsWithLectures.map(({ room, currentLecture }) => (
        <RoomCard 
          key={room.id} 
          room={room} 
          {...(currentLecture && { currentLecture })}
        />
      ))}
    </div>
  )
} 