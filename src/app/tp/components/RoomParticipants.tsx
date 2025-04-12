'use client'

import { useEffect, useState, useCallback } from 'react'
import { RoomParticipant } from '@teaching-playground/core'
import { usePlaygroundStore } from '@/store/usePlaygroundStore'

interface RoomParticipantsProps {
  roomId: string
  participants?: Array<RoomParticipant>
}

export default function RoomParticipants({ roomId, participants: initialParticipants }: RoomParticipantsProps) {
  const [participants, setParticipants] = useState<RoomParticipant[]>(initialParticipants || [])
  const playground = usePlaygroundStore((state) => state.playground)

  // Function to fetch participants directly from the database
  const fetchParticipants = useCallback(async () => {
    try {
      if (!playground) return

      // Use the JsonDatabase via RoomManagementSystem to get participants
      const roomParticipants = await playground.roomSystem.getRoomParticipants(roomId)
      
      // Log for debugging
      console.log(`Fetched ${roomParticipants.length} participants for room ${roomId}:`, 
        roomParticipants.map(p => `${p.username} (${p.id}${p.isStreaming ? ', streaming' : ''})`).join(', '))
      
      setParticipants(roomParticipants)
    } catch (error) {
      console.error('Failed to load participants:', error)
    }
  }, [playground, roomId])

  // Initial load and setup polling
  useEffect(() => {
    // Load participants immediately
    fetchParticipants()
    
    // Polling interval (once per second to ensure we catch all changes quickly)
    const interval = setInterval(fetchParticipants, 1000)
    
    // Cleanup
    return () => {
      clearInterval(interval)
    }
  }, [fetchParticipants])

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b border-zinc-700">
        <h3 className="font-medium text-zinc-200">
          Participants ({participants.length})
        </h3>
      </div>

      <div className="flex-1 overflow-y-auto">
        {participants.length === 0 ? (
          <div className="flex items-center justify-center h-full text-zinc-500">
            No participants yet
          </div>
        ) : (
          <ul className="divide-y divide-zinc-700">
            {participants.map((participant) => (
              <li key={participant.id} className="p-3 flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full ${participant.isStreaming ? 'bg-green-500' : 'bg-blue-500'} flex items-center justify-center text-white font-medium`}>
                  {participant.username.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center">
                    <p className="text-zinc-200 font-medium truncate">
                      {participant.username}
                    </p>
                    {participant.isStreaming && (
                      <span className="ml-2 px-1.5 py-0.5 bg-green-500/20 text-green-400 text-xs rounded">
                        Streaming
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-500">
                    {participant.role === 'teacher' ? 'Teacher' : 'Student'} • Joined {new Date(participant.joinedAt).toLocaleTimeString()}
                  </p>
                </div>
                <div className="flex gap-1">
                  {participant.canStream && (
                    <span className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center" title="Can stream">
                      <svg className="w-4 h-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </span>
                  )}
                  {participant.canChat && (
                    <span className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center" title="Can chat">
                      <svg className="w-4 h-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </span>
                  )}
                  {participant.canScreenShare && (
                    <span className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center" title="Can share screen">
                      <svg className="w-4 h-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
} 