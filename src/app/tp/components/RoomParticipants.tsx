'use client'

import { useEffect, useState } from 'react'
import type { RoomParticipant } from '@teaching-playground/core'
import { usePlaygroundStore } from '@/store/usePlaygroundStore'

// Extended participant interface with v1.3.1 fields
interface ExtendedRoomParticipant extends RoomParticipant {
  handRaised?: boolean
  handRaisedAt?: string
}

interface RoomParticipantsProps {
  roomId: string
  participants?: Array<any> // Can be RoomParticipant objects or socket IDs (strings)
  // Participant Controls (v1.3.1)
  currentUserId?: string
  currentUserRole?: 'teacher' | 'student' | 'admin'
  onMuteParticipant?: (targetUserId: string) => void
  onKickParticipant?: (targetUserId: string, reason?: string) => void
}

export default function RoomParticipants({
  roomId,
  participants: wsParticipants,
  // Participant Controls (v1.3.1)
  currentUserId,
  currentUserRole,
  onMuteParticipant,
  onKickParticipant
}: RoomParticipantsProps) {
  // v1.1.0 sends full participant objects!
  const participants = (wsParticipants || []) as ExtendedRoomParticipant[]

  const isTeacherOrAdmin = currentUserRole === 'teacher' || currentUserRole === 'admin'

  useEffect(() => {
    console.log('Participants updated:', participants.length, participants)
  }, [participants])

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
                <div className={`w-8 h-8 rounded-full ${participant.isStreaming ? 'bg-green-500' : 'bg-blue-500'} flex items-center justify-center text-white font-medium relative`}>
                  {participant.username.charAt(0).toUpperCase()}
                  {/* Hand Raised Indicator (v1.3.1) */}
                  {participant.handRaised && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center" title={participant.handRaisedAt ? `Hand raised at ${new Date(participant.handRaisedAt).toLocaleTimeString()}` : 'Hand raised'}>
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" />
                      </svg>
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-zinc-200 font-medium truncate">
                      {participant.username}
                    </p>
                    {participant.isStreaming && (
                      <span className="px-1.5 py-0.5 bg-green-500/20 text-green-400 text-xs rounded">
                        Streaming
                      </span>
                    )}
                    {participant.handRaised && (
                      <span className="px-1.5 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs rounded flex items-center gap-1">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" />
                        </svg>
                        Hand raised
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-500">
                    {participant.role === 'teacher' ? 'Teacher' : 'Student'} • Joined {new Date(participant.joinedAt).toLocaleTimeString()}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  {/* Capability icons */}
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

                  {/* Teacher/Admin Controls (v1.3.1) - Don't show for current user */}
                  {isTeacherOrAdmin && participant.id !== currentUserId && (
                    <>
                      {/* Mute Participant */}
                      {onMuteParticipant && (
                        <button
                          onClick={() => onMuteParticipant(participant.id)}
                          className="w-7 h-7 rounded-full bg-orange-600 hover:bg-orange-700 flex items-center justify-center transition-colors"
                          title="Mute participant"
                        >
                          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                          </svg>
                        </button>
                      )}

                      {/* Kick Participant */}
                      {onKickParticipant && (
                        <button
                          onClick={() => {
                            if (confirm(`Are you sure you want to remove ${participant.username} from the room?`)) {
                              onKickParticipant(participant.id, 'Removed by teacher')
                            }
                          }}
                          className="w-7 h-7 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center transition-colors"
                          title="Remove participant"
                        >
                          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </>
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