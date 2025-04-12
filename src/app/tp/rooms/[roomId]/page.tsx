import { Suspense } from 'react'
import { fileData } from '@/server/fetchData'
import { RoomLoadingState } from '../../components/RoomLoadingState'
import RoomView from '../../components/RoomView'

async function RoomContainer({ roomId }: { roomId: string }) {
  const rooms = await fileData.getAllRooms()
  const room = rooms.find(r => r.id === roomId)
  
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