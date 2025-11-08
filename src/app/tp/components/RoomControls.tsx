'use client'

import { useState, useEffect } from 'react'
import type { Room, User } from '@teaching-playground/core'
import { useUser } from '@clerk/nextjs'

interface RoomControlsProps {
  room: Room
  isConnected: boolean
  stream: {
    isActive: boolean
    streamerId: string | null
    quality: 'low' | 'medium' | 'high'
  } | null
  localStream: MediaStream | null
  onStartStream?: (quality?: 'low' | 'medium' | 'high') => void | Promise<MediaStream>
  onStopStream?: () => void
  onToggleVideo?: () => void
  onToggleAudio?: () => void
  isVideoEnabled?: boolean
  isAudioEnabled?: boolean
  onStartScreenShare?: () => void | Promise<void>
  onStopScreenShare?: () => void | Promise<void>
  isScreenSharing?: boolean
  // Participant Controls (v1.3.1)
  currentUser?: User
  participants?: Array<{
    id: string
    username: string
    role: "teacher" | "student" | "admin"
    handRaised?: boolean
    handRaisedAt?: string
  }>
  onRaiseHand?: () => void
  onLowerHand?: () => void
  onMuteAllParticipants?: () => void
}

export default function RoomControls({
  room,
  isConnected,
  stream,
  localStream,
  onStartStream,
  onStopStream,
  onToggleVideo,
  onToggleAudio,
  isVideoEnabled: externalVideoEnabled,
  isAudioEnabled: externalAudioEnabled,
  onStartScreenShare,
  onStopScreenShare,
  isScreenSharing = false,
  // Participant Controls (v1.3.1)
  currentUser,
  participants = [],
  onRaiseHand,
  onLowerHand,
  onMuteAllParticipants
}: RoomControlsProps) {
  const [audioEnabled, setAudioEnabled] = useState(true)
  const [videoEnabled, setVideoEnabled] = useState(true)
  const { user } = useUser()

  const username = user?.username || user?.emailAddresses[0]?.emailAddress || 'Guest'
  const userRole = user?.publicMetadata?.role as 'teacher' | 'student' | 'admin' || 'student'

  // Check if the user has permission to stream
  const canStream = userRole === 'teacher'

  // For WebRTC mode (v1.2.0+), we don't need the old streaming API
  // Media controls should work based on localStream, not old stream state
  const hasLocalStream = !!localStream

  // Use external state if provided (from WebRTC hook), otherwise track internally
  const actualAudioEnabled = externalAudioEnabled !== undefined ? externalAudioEnabled : audioEnabled
  const actualVideoEnabled = externalVideoEnabled !== undefined ? externalVideoEnabled : videoEnabled

  // Keep track of enabled states based on actual track states
  useEffect(() => {
    if (localStream && externalAudioEnabled === undefined && externalVideoEnabled === undefined) {
      const audioTrack = localStream.getAudioTracks()[0]
      const videoTrack = localStream.getVideoTracks()[0]

      if (audioTrack) {
        setAudioEnabled(audioTrack.enabled)
      }
      if (videoTrack) {
        setVideoEnabled(videoTrack.enabled)
      }
    }
  }, [localStream, externalAudioEnabled, externalVideoEnabled])

  // Toggle audio
  const toggleAudio = () => {
    if (onToggleAudio) {
      // Use external callback (WebRTC hook)
      onToggleAudio()
    } else {
      // Fallback to internal logic
      if (!localStream) return
      const audioTrack = localStream.getAudioTracks()[0]
      if (audioTrack) {
        const newState = !audioEnabled
        audioTrack.enabled = newState
        setAudioEnabled(newState)
      }
    }
  }

  // Toggle video
  const toggleVideo = () => {
    if (onToggleVideo) {
      // Use external callback (WebRTC hook)
      onToggleVideo()
    } else {
      // Fallback to internal logic
      if (!localStream) return
      const videoTrack = localStream.getVideoTracks()[0]
      if (videoTrack) {
        const newState = !videoEnabled
        videoTrack.enabled = newState
        setVideoEnabled(newState)
      }
    }
  }

  // Start/Stop camera/mic (WebRTC mode)
  const toggleCamera = async () => {
    if (!canStream) return

    if (hasLocalStream) {
      // Stop local stream
      onStopStream?.()
    } else {
      // Start local stream
      try {
        await onStartStream?.('high')
      } catch (error) {
        console.error('Failed to start camera:', error)
      }
    }
  }

  // WebRTC mode: Camera button enabled when connected, media buttons when stream exists
  const isCameraButtonDisabled = !isConnected
  const isMediaButtonDisabled = !isConnected || !hasLocalStream

  // Participant Controls (v1.3.1)
  const currentUserParticipant = participants.find(p => p.id === currentUser?.id)
  const isHandRaised = currentUserParticipant?.handRaised || false
  const isTeacherOrAdmin = userRole === 'teacher' || userRole === 'admin'

  return (
    <div className="bg-zinc-800 rounded-lg border border-zinc-700 p-4">
      <div className="flex items-center justify-center space-x-4">
        {/* Audio control */}
        <button
          onClick={toggleAudio}
          disabled={isMediaButtonDisabled}
          className={`p-3 rounded-full ${
            actualAudioEnabled
              ? 'bg-blue-500 hover:bg-blue-600'
              : 'bg-red-500 hover:bg-red-600'
          } ${isMediaButtonDisabled && 'opacity-50 cursor-not-allowed'}`}
          title={actualAudioEnabled ? "Mute Audio" : "Unmute Audio"}
        >
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {actualAudioEnabled ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            )}
          </svg>
        </button>

        {/* Video control */}
        <button
          onClick={toggleVideo}
          disabled={isMediaButtonDisabled}
          className={`p-3 rounded-full ${
            actualVideoEnabled
              ? 'bg-blue-500 hover:bg-blue-600'
              : 'bg-red-500 hover:bg-red-600'
          } ${isMediaButtonDisabled && 'opacity-50 cursor-not-allowed'}`}
          title={actualVideoEnabled ? "Stop Video" : "Start Video"}
        >
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {actualVideoEnabled ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            )}
          </svg>
        </button>

        {/* Camera control - Start/Stop local stream (v1.2.0 WebRTC) */}
        {canStream && (
          <button
            onClick={toggleCamera}
            disabled={isCameraButtonDisabled}
            className={`p-3 rounded-full ${
              hasLocalStream
                ? 'bg-red-500 hover:bg-red-600'
                : 'bg-green-500 hover:bg-green-600'
            } ${isCameraButtonDisabled && 'opacity-50 cursor-not-allowed'}`}
            title={hasLocalStream ? "Stop Camera" : "Start Camera"}
          >
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {hasLocalStream ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              )}
            </svg>
          </button>
        )}

        {/* Screen share control (v1.3.0) - only for teachers */}
        {canStream && onStartScreenShare && onStopScreenShare && (
          <button
            onClick={() => {
              if (isScreenSharing) {
                onStopScreenShare()
              } else {
                onStartScreenShare()
              }
            }}
            disabled={!isConnected || !localStream}
            className={`p-3 rounded-full ${
              isScreenSharing
                ? 'bg-purple-600 hover:bg-purple-700'
                : 'bg-zinc-600 hover:bg-zinc-500'
            } ${(!isConnected || !localStream) && 'opacity-50 cursor-not-allowed'}`}
            title={isScreenSharing ? "Stop Screen Share" : "Start Screen Share"}
          >
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {isScreenSharing ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              )}
            </svg>
          </button>
        )}

        {/* Mute All Participants (v1.3.1) - teachers/admins only */}
        {isTeacherOrAdmin && onMuteAllParticipants && (
          <button
            onClick={onMuteAllParticipants}
            disabled={!isConnected}
            className={`p-3 rounded-full bg-orange-600 hover:bg-orange-700 ${
              !isConnected && 'opacity-50 cursor-not-allowed'
            }`}
            title="Mute All Participants"
          >
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
            </svg>
          </button>
        )}

        {/* Hand Raise (v1.3.1) - students */}
        {!isTeacherOrAdmin && onRaiseHand && onLowerHand && (
          <button
            onClick={isHandRaised ? onLowerHand : onRaiseHand}
            disabled={!isConnected}
            className={`p-3 rounded-full ${
              isHandRaised
                ? 'bg-yellow-500 hover:bg-yellow-600'
                : 'bg-zinc-600 hover:bg-zinc-500'
            } ${!isConnected && 'opacity-50 cursor-not-allowed'}`}
            title={isHandRaised ? "Lower Hand" : "Raise Hand"}
          >
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" />
            </svg>
          </button>
        )}
      </div>

      {/* Connection status */}
      <div className="mt-4 text-center text-sm text-zinc-400">
        {isConnected ? (
          <>
            {hasLocalStream ? (
              <span className="text-green-400">
                Camera active {isScreenSharing && '• Screen sharing'}
              </span>
            ) : (
              canStream ? 'Click camera button to start' : 'Waiting for teacher'
            )}
          </>
        ) : (
          'Connecting...'
        )}
      </div>
    </div>
  )
} 