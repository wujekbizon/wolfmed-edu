import { Suspense } from 'react'
import { RoomList } from './RoomList'
import { RoomsLoadingState } from './RoomsLoadingState'

export default async function RoomsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-100">Teaching Rooms</h1>
        <p className="text-zinc-400 mt-1">
          Manage and monitor teaching rooms and their current sessions.
        </p>
      </div>

      <Suspense fallback={<RoomsLoadingState />}>
        <RoomList />
      </Suspense>
    </div>
  )
} 