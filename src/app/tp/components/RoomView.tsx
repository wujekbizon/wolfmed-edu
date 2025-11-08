'use client'

import { useEffect, useState, useMemo } from 'react'
import type { Room, RoomParticipant, User } from '@teaching-playground/core'
import { useRoomConnection } from '@/hooks/useRoomConnection'
import { useWebRTC } from '@/hooks/useWebRTC'
import { useUser } from '@clerk/nextjs'
import RoomControls from './RoomControls'
import RoomChat from './RoomChat'
import RoomParticipants from './RoomParticipants'
import { RoomCleanupNotice } from './RoomCleanupNotice'
import VideoGrid, { type VideoLayout } from './VideoGrid'
import { useRouter } from 'next/navigation'

interface RoomViewProps {
  room: Room
}

export default function RoomView({ room }: RoomViewProps) {
  const { user, isLoaded } = useUser()
  const router = useRouter()

  // Wait for Clerk to load user data
  if (!isLoaded || !user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-zinc-400">Loading user data...</p>
        </div>
      </div>
    )
  }

  const userRole = user.publicMetadata?.role as 'teacher' | 'student' | 'admin' || 'student'

  const roomUser: User = {
    id: user.id,
    username: user.username || user.emailAddresses[0]?.emailAddress || 'Guest',
    role: userRole,
    status: 'online',
    email: user.emailAddresses[0]?.emailAddress ?? null,
    displayName: user.fullName || user.username || null
  }

  const {
    state,
    localStream,
    remoteStreams,
    sendMessage,
    startStream,
    stopStream,
    exitRoom,
    connection
  } = useRoomConnection({
    roomId: room.id,
    user: roomUser,
    serverUrl: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001'
  })

  // WebRTC for video/audio streaming (v1.2.0)
  const webrtc = useWebRTC({
    roomId: room.id,
    userId: roomUser.id,
    connection,
    enabled: state.isConnected && room.features.hasVideo
  })

  // Video layout state
  const [videoLayout, setVideoLayout] = useState<VideoLayout>('gallery')
  const [activeSpeakerId, setActiveSpeakerId] = useState<string | undefined>()

  // Room cleanup notification state
  const [showCleanupNotice, setShowCleanupNotice] = useState(false)
  const [cleanupReason, setCleanupReason] = useState('')

  console.log('Room participants from state:', state.participants)

  // Combine local user and WebRTC participants for video display
  const videoParticipants = useMemo(() => {
    const participants = [...webrtc.participants]

    // Add local user if they have a stream
    if (webrtc.localStream) {
      participants.unshift({
        id: roomUser.id,
        username: roomUser.username,
        stream: webrtc.localStream,
        isLocal: true,
        audioEnabled: webrtc.isAudioEnabled,
        videoEnabled: webrtc.isVideoEnabled
      })
    }

    return participants
  }, [webrtc.participants, webrtc.localStream, webrtc.isAudioEnabled, webrtc.isVideoEnabled, roomUser.id, roomUser.username])

  // Detect active speaker
  useEffect(() => {
    const speakingParticipant = videoParticipants.find(p => p.isSpeaking)
    if (speakingParticipant && speakingParticipant.id !== activeSpeakerId) {
      setActiveSpeakerId(speakingParticipant.id)
    }
  }, [videoParticipants, activeSpeakerId])

  const handleExitRoom = async () => {
    console.log('User initiated room exit')
    try {
      await exitRoom()
      console.log('Room exit completed successfully')
    } catch (error) {
      console.error('Error during room exit:', error)
    }
    router.push('/tp/rooms')
  }

  useEffect(() => {
    console.log('Connection state changed:', state.isConnected ? 'CONNECTED' : 'DISCONNECTED')
  }, [state.isConnected])

  // Handle room_cleared event from backend (v1.1.3)
  useEffect(() => {
    if (!connection) return

    const handleRoomCleared = ({ roomId, reason }: { roomId: string; reason: string }) => {
      console.log(`Room ${roomId} was cleared: ${reason}`)
      setCleanupReason(reason)
      setShowCleanupNotice(true)
    }

    connection.on('room_cleared', handleRoomCleared)

    return () => {
      connection.off('room_cleared', handleRoomCleared)
    }
  }, [connection])

  // Reset state when entering an "available" room (prevents old data from showing)
  useEffect(() => {
    if (room.status === 'available') {
      console.log('Entering available room - resetting state to prevent old data')
      // State is managed by useRoomConnection, so just log for now
      // The backend should ensure room is clean via clearRoom()
    }
  }, [room.status])

  return (
    <>
      {/* Room cleanup notification (v1.1.3) */}
      <RoomCleanupNotice
        visible={showCleanupNotice}
        reason={cleanupReason}
        onDismiss={() => setShowCleanupNotice(false)}
      />

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

        {state.systemMessage && (
          <div className="p-2 bg-blue-100 text-blue-800 rounded mb-4">
            {state.systemMessage}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Video Layout Controls */}
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <button
                  onClick={() => setVideoLayout('gallery')}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    videoLayout === 'gallery'
                      ? 'bg-blue-600 text-white'
                      : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
                  }`}
                >
                  Gallery
                </button>
                <button
                  onClick={() => setVideoLayout('speaker')}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    videoLayout === 'speaker'
                      ? 'bg-blue-600 text-white'
                      : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
                  }`}
                >
                  Speaker
                </button>
                <button
                  onClick={() => setVideoLayout('sidebar')}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    videoLayout === 'sidebar'
                      ? 'bg-blue-600 text-white'
                      : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
                  }`}
                >
                  Sidebar
                </button>
              </div>

              <div className="text-sm text-zinc-400">
                {videoParticipants.length} {videoParticipants.length === 1 ? 'participant' : 'participants'}
              </div>
            </div>

            {/* Video Grid (v1.2.0) */}
            <div className="h-[calc(100vh-20rem)]">
              <VideoGrid
                participants={videoParticipants}
                layout={videoLayout}
                activeSpeakerId={activeSpeakerId}
                onParticipantClick={(participantId) => {
                  // Pin participant as active speaker
                  setActiveSpeakerId(participantId)
                }}
              />
            </div>

            <RoomControls
              room={room}
              isConnected={state.isConnected}
              stream={state.stream}
              localStream={webrtc.localStream}
              onStartStream={async (quality) => {
                // Convert quality to MediaStreamConstraints
                const constraints: MediaStreamConstraints = {
                  video: quality === 'high' ? { width: 1920, height: 1080 } :
                         quality === 'medium' ? { width: 1280, height: 720 } :
                         { width: 640, height: 480 },
                  audio: true
                }
                return await webrtc.startLocalStream(constraints)
              }}
              onStopStream={webrtc.stopLocalStream}
              onToggleVideo={webrtc.toggleVideo}
              onToggleAudio={webrtc.toggleAudio}
              isVideoEnabled={webrtc.isVideoEnabled}
              isAudioEnabled={webrtc.isAudioEnabled}
            />
          </div>

          <div className="flex flex-col h-[calc(100vh-14rem)]">
            <div className="flex-1 overflow-hidden grid grid-rows-2 gap-6">
              <div className="row-span-1 bg-zinc-800 rounded-lg border border-zinc-700 overflow-hidden">
                <RoomParticipants
                  roomId={room.id}
                  participants={state.participants as RoomParticipant[]}
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
    </>
  )
} 