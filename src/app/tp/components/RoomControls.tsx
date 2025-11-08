'use client'

import { useState, useEffect } from 'react'
import type { Room } from '@teaching-playground/core'
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
  isAudioEnabled: externalAudioEnabled
}: RoomControlsProps) {
  const [audioEnabled, setAudioEnabled] = useState(true)
  const [videoEnabled, setVideoEnabled] = useState(true)
  const { user } = useUser()

  const username = user?.username || user?.emailAddresses[0]?.emailAddress || 'Guest'
  const userRole = user?.publicMetadata?.role as 'teacher' | 'student' | 'admin' || 'student'

  // Check if the current user is the streamer
  // The package uses username as streamerId, not user.id
  const isStreamer = stream?.streamerId === username
  console.log("Stream ID: ", stream?.streamerId)
  console.log("User username: ", username)
  console.log("Is user a streamer", isStreamer)
  // Check if the user has permission to stream
  const canStream = userRole === 'teacher'

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

  // Start/Stop streaming
  const toggleStream = () => {
    if (!canStream) return
    if (stream?.isActive) {
      if (isStreamer) {
        onStopStream?.()
      }
    } else {
      onStartStream?.('high')
    }
  }

  const isStreamButtonDisabled = !isConnected || (stream?.isActive && !isStreamer)
  const isMediaButtonDisabled = !isConnected || !localStream || !isStreamer

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

        {/* Stream control - only show for users who can stream */}
        {canStream && (
          <button
            onClick={toggleStream}
            disabled={isStreamButtonDisabled}
            className={`p-3 rounded-full ${
              stream?.isActive
                ? 'bg-red-500 hover:bg-red-600'
                : 'bg-green-500 hover:bg-green-600'
            } ${isStreamButtonDisabled && 'opacity-50 cursor-not-allowed'}`}
            title={stream?.isActive ? "Stop Streaming" : "Start Streaming"}
          >
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {stream?.isActive ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              )}
            </svg>
          </button>
        )}
      </div>

      {/* Connection status */}
      <div className="mt-4 text-center text-sm text-zinc-400">
        {isConnected ? (
          <>
            {stream?.isActive ? (
              <span className="text-green-400">
                {isStreamer ? 'You are streaming' : `${stream.streamerId} is streaming`}
              </span>
            ) : (
              canStream ? 'Ready to stream' : 'Waiting for teacher to start streaming'
            )}
          </>
        ) : (
          'Connecting...'
        )}
      </div>
    </div>
  )
} 