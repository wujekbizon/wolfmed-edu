'use client'

import { useEffect, useState } from 'react'
import { Room, User, RoomParticipant } from '@teaching-playground/core'
import { useAuthStore } from '@/store/useAuthStore'
import { useRoomConnection } from '@/hooks/useRoomConnection'
import { usePlaygroundStore } from '@/store/usePlaygroundStore'
import RoomControls from './RoomControls'
import RoomChat from './RoomChat'
import RoomParticipants from './RoomParticipants'
import { useRouter } from 'next/navigation'

interface RoomViewProps {
  room: Room
}

export default function RoomView({ room }: RoomViewProps) {
  const { username, userRole } = useAuthStore()
  const playground = usePlaygroundStore((state) => state.playground)
  const router = useRouter()
  const [initialParticipants, setInitialParticipants] = useState<RoomParticipant[]>(room.participants || [])
  
  // Fetch the latest participants from the database for initial render
  useEffect(() => {
    const fetchInitialParticipants = async () => {
      if (playground) {
        try {
          const participants = await playground.roomSystem.getRoomParticipants(room.id)
          console.log('Initial participants from database:', participants)
          setInitialParticipants(participants)
        } catch (error) {
          console.error('Failed to fetch initial participants:', error)
        }
      }
    }
    
    fetchInitialParticipants()
  }, [playground, room.id])
  
  const user: User = {
    id: userRole === 'teacher' ? 'teacher_123' : 'student_123',
    username: username || 'Anonymous',
    role: userRole as 'teacher' | 'student' || 'student',
    status: 'online'
  }

  const {
    state,
    localStream,
    remoteStreams,
    sendMessage,
    startStream,
    stopStream,
    exitRoom
  } = useRoomConnection({
    roomId: room.id,
    user,
    serverUrl: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001'
  })

  console.log('Room participants from state:', state.participants)
  
  const handleExitRoom = async () => {
    await exitRoom();
    router.push('/tp/rooms');
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-zinc-100">{room.name}</h1>
        <div className="flex space-x-4">
          <span className={`px-2 py-1 rounded-full text-xs ${state.isConnected ? 'bg-green-500' : 'bg-red-500'}`}>
            {state.isConnected ? 'Connected' : 'Disconnected'}
          </span>
          <button
            onClick={handleExitRoom}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md text-white text-sm font-medium transition-colors"
          >
            Exit Room
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Video Stream */}
          <div className="bg-zinc-900 rounded-lg border border-zinc-700 aspect-video relative overflow-hidden">
            {localStream && (
              <video
                ref={(ref) => {
                  if (ref) ref.srcObject = localStream;
                }}
                autoPlay
                muted
                playsInline
                className="absolute top-0 left-0 w-full h-full object-cover"
              />
            )}
            {!localStream && !Array.from(remoteStreams.values()).length && (
              <div className="flex items-center justify-center h-full">
                <p className="text-zinc-500">No video stream available</p>
              </div>
            )}
            {/* Remote streams would be displayed here */}
          </div>
          
          <RoomControls
            room={room}
            isConnected={state.isConnected}
            stream={state.stream}
            localStream={localStream}
            onStartStream={startStream}
            onStopStream={stopStream}
          />
        </div>
        
        <div className="flex flex-col h-[calc(100vh-14rem)]">
          <div className="flex-1 overflow-hidden grid grid-rows-2 gap-6">
            <div className="row-span-1 bg-zinc-800 rounded-lg border border-zinc-700 overflow-hidden">
              <RoomParticipants 
                roomId={room.id} 
                participants={initialParticipants}
              />
            </div>
            <div className="row-span-1 bg-zinc-800 rounded-lg border border-zinc-700 overflow-hidden">
              <RoomChat
                messages={state.messages}
                onSendMessage={sendMessage}
                isEnabled={state.isConnected && room.features.hasChat}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 