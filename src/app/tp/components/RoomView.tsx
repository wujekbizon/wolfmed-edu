'use client'

import { Room, type User } from '@teaching-playground/core'
import { usePlaygroundStore } from '@/store/usePlaygroundStore'
import { useRoomConnection } from '@/hooks/useRoomConnection'
import RoomChat from './RoomChat'
import RoomStream from './RoomStream'
import RoomParticipants from './RoomParticipants'
import RoomControls from './RoomControls'

interface RoomViewProps {
  room: Room
}

export default function RoomView({ room }: RoomViewProps) {
  // Create a dummy user with your credentials from .env
  const dummyUser: User = {
    id: 'teacher_123',
    username: process.env.NEXT_PUBLIC_TEACHER_USERNAME || 'wujekbizon',
    email: `${process.env.NEXT_PUBLIC_TEACHER_USERNAME || 'wujekbizon'}@example.com`,
    role: 'teacher' as const,
    status: 'online' as const,
    displayName: process.env.NEXT_PUBLIC_TEACHER_USERNAME || 'wujekbizon'
  }

  const { state, sendMessage, startStream, stopStream } = useRoomConnection({
    roomId: room.id,
    user: dummyUser,
    serverUrl: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001'
  })

  return (
    <div className="h-[calc(100vh-12rem)] grid grid-cols-12 gap-4">
      {/* Main content area */}
      <div className="col-span-9 space-y-4">
        {/* Room header */}
        <div className="bg-zinc-800 rounded-lg p-4 border border-zinc-700">
          <h1 className="text-xl font-semibold text-zinc-100">{room.name}</h1>
          {room.currentLecture && (
            <div className="mt-2 text-sm text-zinc-400">
              <p>Current Lecture: {room.currentLecture.name}</p>
              <p>Status: {room.currentLecture.status}</p>
            </div>
          )}
          <div className="mt-2 text-sm">
            <span className={`inline-flex items-center px-2 py-1 rounded-full ${state.isConnected ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
              {state.isConnected ? '🟢 Connected' : '🔴 Disconnected'}
            </span>
          </div>
        </div>

        {/* Stream area */}
        <div className="bg-zinc-800 rounded-lg border border-zinc-700 overflow-hidden" style={{ height: 'calc(100% - 7rem)' }}>
          <RoomStream 
            room={room} 
            stream={state.stream}
            onStartStream={startStream}
            onStopStream={stopStream}
          />
        </div>

        {/* Controls */}
        <RoomControls 
          room={room}
          isConnected={state.isConnected}
          stream={state.stream}
        />
      </div>

      {/* Sidebar */}
      <div className="col-span-3 space-y-4">
        {/* Participants */}
        <div className="bg-zinc-800 rounded-lg border border-zinc-700 h-1/2">
          <RoomParticipants 
            roomId={room.id} 
            participants={state.participants}
          />
        </div>

        {/* Chat */}
        <div className="bg-zinc-800 rounded-lg border border-zinc-700 h-1/2">
          <RoomChat 
            messages={state.messages}
            onSendMessage={sendMessage}
            isEnabled={room.features.hasChat && state.isConnected}
          />
        </div>
      </div>
    </div>
  )
} 