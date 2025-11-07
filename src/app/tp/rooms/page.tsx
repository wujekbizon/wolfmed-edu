import { Suspense } from 'react'
import { getRooms } from '@/actions/teachingPlayground'
import { RoomList } from '../components/RoomList'
import { RoomsLoadingState } from '../components/RoomsLoadingState'

async function RoomListContainer() {
  const rooms = await getRooms()
  return <RoomList rooms={rooms} />
}

export default async function RoomsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-semibold text-zinc-100">Available Rooms</h1>
      </div>
      <Suspense fallback={<RoomsLoadingState/>}>
        <RoomListContainer />
      </Suspense>
    </div>
  )
} 