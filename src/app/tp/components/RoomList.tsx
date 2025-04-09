import { Room } from '@/types/room'
import { RoomCard } from './RoomCard'

interface RoomListProps {
  rooms: Room[]
}

export function RoomList({ rooms }: RoomListProps) {
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