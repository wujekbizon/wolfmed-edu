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
import { toast } from 'react-hot-toast'

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
    connection,
    // Participant Controls (v1.3.1)
    raiseHand,
    lowerHand,
    muteAllParticipants,
    muteParticipant,
    kickParticipant,
    // Recording Controls (v1.4.0)
    startRecording,
    stopRecording,
    isRecording,
    recordingDuration
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

  // Recording indicator state (v1.4.0) - for students to see when teacher is recording
  const [isLectureRecording, setIsLectureRecording] = useState(false)

  // Build video participants from room state + WebRTC streams (v1.4.1)
  // state.participants now includes ALL participants (backend fix in v1.4.1)
  const videoParticipants = useMemo(() => {
    // Start with room state participants (authoritative source - fixed in v1.4.1)
    const participants = state.participants.map(p => {
      // Find matching WebRTC participant by socketId to get stream data
      const webrtcParticipant = webrtc.participants.find(wp => wp.id === p.socketId)

      return {
        id: p.id, // User ID for consistency
        username: p.username,
        stream: webrtcParticipant?.stream,
        isLocal: false,
        audioEnabled: webrtcParticipant?.audioEnabled,
        videoEnabled: webrtcParticipant?.videoEnabled,
        isSpeaking: webrtcParticipant?.isSpeaking,
        connectionQuality: webrtcParticipant?.connectionQuality
      }
    })

    // Add local user with their stream
    if (webrtc.localStream) {
      const localParticipant = {
        id: roomUser.id,
        username: roomUser.username,
        stream: webrtc.localStream,
        isLocal: true,
        audioEnabled: webrtc.isAudioEnabled,
        videoEnabled: webrtc.isVideoEnabled,
        isScreenSharing: webrtc.isScreenSharing
      }

      // Add or update local user in participants list
      if (!participants.some(p => p.id === roomUser.id)) {
        participants.unshift(localParticipant)
      } else {
        const index = participants.findIndex(p => p.id === roomUser.id)
        participants[index] = { ...participants[index], ...localParticipant }
      }
    }

    return participants
  }, [state.participants, webrtc.participants, webrtc.localStream, webrtc.isAudioEnabled, webrtc.isVideoEnabled, webrtc.isScreenSharing, roomUser.id, roomUser.username])

  // Detect active speaker
  useEffect(() => {
    const speakingParticipant = videoParticipants.find(p => p.isSpeaking)
    if (speakingParticipant && speakingParticipant.id !== activeSpeakerId) {
      setActiveSpeakerId(speakingParticipant.id)
    }
  }, [videoParticipants, activeSpeakerId])

  const handleExitRoom = async () => {
    try {
      await exitRoom()
    } catch (error) {
      console.error('Error during room exit:', error)
    }
    router.push('/tp/rooms')
  }

  // Handle room_cleared event from backend (v1.1.3)
  useEffect(() => {
    if (!connection) return

    const handleRoomCleared = ({ roomId, reason }: { roomId: string; reason: string }) => {
      setCleanupReason(reason)
      setShowCleanupNotice(true)
    }

    connection.on('room_cleared', handleRoomCleared)

    return () => {
      connection.off('room_cleared', handleRoomCleared)
    }
  }, [connection])

  // Handle kicked_from_room event - redirect immediately (v1.4.6)
  useEffect(() => {
    if (!connection) return

    const handleKickedFromRoom = ({ roomId, reason, kickedBy }: { roomId: string; reason: string; kickedBy: string }) => {
      console.log(`[RoomView] Kicked from room ${roomId} by ${kickedBy}: ${reason}`)
      // Show error notification
      toast.error(`You have been removed from the room: ${reason}`)
      // Exit room and redirect immediately
      exitRoom().catch(err => console.error('Error exiting room after being kicked:', err))
      setTimeout(() => router.push('/tp'), 1000) // Brief delay to show toast
    }

    connection.on('kicked_from_room', handleKickedFromRoom)

    return () => {
      connection.off('kicked_from_room', handleKickedFromRoom)
    }
  }, [connection, exitRoom, router])

  // Handle join_room_error event - redirect immediately (v1.4.6)
  useEffect(() => {
    if (!connection) return

    const handleJoinRoomError = ({ code, message, lectureStatus }: { code: string; message: string; lectureStatus?: string }) => {
      console.error(`[RoomView] Failed to join room: ${message} (code: ${code}, lectureStatus: ${lectureStatus})`)
      // Show error notification with lecture status context
      const errorMessage = lectureStatus
        ? `Cannot join room: This lecture is ${lectureStatus}`
        : message
      toast.error(errorMessage)
      // Redirect to lectures page
      setTimeout(() => router.push('/tp'), 2000) // Brief delay to show toast
    }

    connection.on('join_room_error', handleJoinRoomError)

    return () => {
      connection.off('join_room_error', handleJoinRoomError)
    }
  }, [connection, router])

  // Handle recording broadcast events (v1.4.0)
  useEffect(() => {
    if (!connection) return

    const handleLectureRecordingStarted = ({ teacherId, timestamp }: { teacherId: string, timestamp: string }) => {
      console.log(`[RoomView] Teacher ${teacherId} started recording at ${timestamp}`)
      setIsLectureRecording(true)
      if (roomUser.role === 'student') {
        toast.info('Teacher started recording this lecture', { duration: 3000 })
      }
    }

    const handleLectureRecordingStopped = ({ teacherId, duration }: { teacherId: string, duration: number }) => {
      console.log(`[RoomView] Teacher ${teacherId} stopped recording, duration: ${duration}s`)
      setIsLectureRecording(false)
      if (roomUser.role === 'student') {
        const mins = Math.floor(duration / 60)
        const secs = duration % 60
        toast.info(`Recording stopped (${mins}:${secs.toString().padStart(2, '0')})`, { duration: 3000 })
      }
    }

    connection.on('lecture_recording_started', handleLectureRecordingStarted)
    connection.on('lecture_recording_stopped', handleLectureRecordingStopped)

    return () => {
      connection.off('lecture_recording_started', handleLectureRecordingStarted)
      connection.off('lecture_recording_stopped', handleLectureRecordingStopped)
    }
  }, [connection, roomUser.role])

  // Reset state when entering an "available" room (prevents old data from showing)
  useEffect(() => {
    if (room.status === 'available') {
      // State is managed by useRoomConnection, so nothing to do here
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

      {/* Recording Indicator (v1.4.0) */}
      {(isRecording || isLectureRecording) && (
        <div className="fixed top-4 right-4 z-50 bg-red-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-pulse">
          <div className="w-3 h-3 bg-white rounded-full animate-ping" />
          <div>
            <div className="font-semibold">Recording in Progress</div>
            {isRecording && (
              <div className="text-sm font-mono">
                {Math.floor(recordingDuration / 60)}:{(recordingDuration % 60).toString().padStart(2, '0')}
              </div>
            )}
          </div>
        </div>
      )}

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
              onStartScreenShare={webrtc.startScreenShare}
              onStopScreenShare={webrtc.stopScreenShare}
              isScreenSharing={webrtc.isScreenSharing}
              // Participant Controls (v1.3.1)
              currentUser={roomUser}
              participants={state.participants}
              onRaiseHand={raiseHand}
              onLowerHand={lowerHand}
              onMuteAllParticipants={muteAllParticipants}
              // Recording Controls (v1.4.0)
              onStartRecording={startRecording}
              onStopRecording={stopRecording}
              isRecording={isRecording}
              recordingDuration={recordingDuration}
            />
          </div>

          <div className="flex flex-col h-[calc(100vh-14rem)]">
            <div className="flex-1 overflow-hidden grid grid-rows-2 gap-6">
              <div className="row-span-1 bg-zinc-800 rounded-lg border border-zinc-700 overflow-hidden">
                <RoomParticipants
                  roomId={room.id}
                  participants={state.participants as RoomParticipant[]}
                  currentUserId={roomUser.id}
                  currentUserRole={roomUser.role}
                  onMuteParticipant={muteParticipant}
                  onKickParticipant={kickParticipant}
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