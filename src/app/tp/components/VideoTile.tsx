'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import clsx from 'clsx'

interface Participant {
  id: string
  username: string
  stream?: MediaStream
  isLocal?: boolean
  isSpeaking?: boolean
  connectionQuality?: 'excellent' | 'good' | 'poor'
  audioEnabled?: boolean
  videoEnabled?: boolean
  isScreenSharing?: boolean
}

interface VideoTileProps {
  participant: Participant
  onClick?: () => void
  isHighlighted?: boolean
  className?: string
}

export default function VideoTile({
  participant,
  onClick,
  isHighlighted = false,
  className
}: VideoTileProps) {
  const videoElementRef = useRef<HTMLVideoElement | null>(null)
  const [hasVideo, setHasVideo] = useState(false)
  const lastEnabledStateRef = useRef<boolean | null>(null)
  // v1.4.4 Sprint 1: Volume and fullscreen controls
  const [volume, setVolume] = useState(1) // 0 to 1
  const [showControls, setShowControls] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const containerRef = useRef<HTMLDivElement | null>(null)

  // Callback ref to attach stream when video element is mounted
  const videoRef = useCallback((videoElement: HTMLVideoElement | null) => {
    console.log(`[VideoTile] Callback ref fired for ${participant.username}:`, {
      hasVideoElement: !!videoElement,
      hasStream: !!participant.stream,
      streamId: participant.stream?.id
    })

    videoElementRef.current = videoElement

    if (!videoElement) {
      console.log(`[VideoTile] Video element unmounted for ${participant.username}`)
      return
    }

    if (!participant.stream) {
      console.warn(`[VideoTile] No stream available for ${participant.username}`)
      // v1.4.4 FIX: Clear srcObject to prevent showing frozen last frame
      if (videoElement.srcObject) {
        videoElement.srcObject = null
        console.log(`[VideoTile] Cleared srcObject for ${participant.username}`)
      }
      setHasVideo(false)
      return
    }

    console.log(`[VideoTile] Attaching stream for ${participant.username}:`, {
      streamId: participant.stream.id,
      videoTracks: participant.stream.getVideoTracks().map(t => ({
        id: t.id,
        enabled: t.enabled,
        muted: t.muted,
        readyState: t.readyState
      })),
      isLocal: participant.isLocal
    })

    videoElement.srcObject = participant.stream

    // Check if stream has video tracks
    const videoTracks = participant.stream.getVideoTracks()
    const hasVideoTrack = videoTracks.length > 0 && videoTracks[0]?.enabled === true
    setHasVideo(hasVideoTrack)

    console.log(`[VideoTile] ${participant.username} stream attached, hasVideo:`, hasVideoTrack)
  }, [participant.stream, participant.username, participant.isLocal])

  // Monitor video track enabled state - ONLY update when it changes to prevent re-render loops
  useEffect(() => {
    if (!participant.stream) return

    const videoTrack = participant.stream.getVideoTracks()[0]
    if (!videoTrack) return

    const checkVideoState = () => {
      const currentEnabled = videoTrack.enabled
      // Only update if the value actually changed
      if (lastEnabledStateRef.current !== currentEnabled) {
        console.log(`[VideoTile] ${participant.username} track enabled changed:`, lastEnabledStateRef.current, '->', currentEnabled)
        lastEnabledStateRef.current = currentEnabled
        setHasVideo(currentEnabled)
      }
    }

    // Check immediately
    checkVideoState()

    // Listen for track ended event
    videoTrack.addEventListener('ended', checkVideoState)

    // Poll track enabled state since MediaStreamTrack doesn't fire events when enabled changes
    const pollInterval = setInterval(checkVideoState, 500)

    return () => {
      videoTrack.removeEventListener('ended', checkVideoState)
      clearInterval(pollInterval)
      lastEnabledStateRef.current = null
    }
  }, [participant.stream, participant.username])

  // v1.4.4 Sprint 1: Apply volume to video element
  useEffect(() => {
    if (videoElementRef.current && !participant.isLocal) {
      videoElementRef.current.volume = volume
    }
  }, [volume, participant.isLocal])

  // v1.4.4 Sprint 1: Fullscreen handlers
  const toggleFullscreen = useCallback(async () => {
    if (!containerRef.current) return

    try {
      if (!isFullscreen) {
        await containerRef.current.requestFullscreen()
        setIsFullscreen(true)
      } else {
        await document.exitFullscreen()
        setIsFullscreen(false)
      }
    } catch (error) {
      console.error('[VideoTile] Fullscreen error:', error)
    }
  }, [isFullscreen])

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  // Get connection quality color
  const getConnectionColor = (quality?: 'excellent' | 'good' | 'poor') => {
    switch (quality) {
      case 'excellent':
        return 'bg-green-500'
      case 'good':
        return 'bg-yellow-500'
      case 'poor':
        return 'bg-red-500'
      default:
        return 'bg-zinc-500'
    }
  }

  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const showVideo = hasVideo && participant.videoEnabled !== false
  const audioEnabled = participant.audioEnabled !== false

  // Debug: Log rendering state
  console.log(`[VideoTile] ${participant.username} render:`, {
    hasVideo,
    'participant.videoEnabled': participant.videoEnabled,
    showVideo,
    hasStream: !!participant.stream,
    isLocal: participant.isLocal
  })

  return (
    <div
      ref={containerRef}
      onClick={onClick}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
      className={clsx(
        'relative w-full h-full bg-zinc-800 rounded-lg overflow-hidden group',
        'border-2 transition-all duration-200',
        isHighlighted ? 'border-blue-500' : 'border-transparent',
        participant.isSpeaking && 'ring-2 ring-green-400 ring-offset-2 ring-offset-zinc-900',
        onClick && 'cursor-pointer hover:border-zinc-600',
        className
      )}
    >
      {/* Video element */}
      {showVideo ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={participant.isLocal}
          className="absolute inset-0 w-full h-full object-cover z-0"
          onLoadedMetadata={(e) => {
            console.log(`[VideoTile] Video metadata loaded for ${participant.username}:`, {
              videoWidth: e.currentTarget.videoWidth,
              videoHeight: e.currentTarget.videoHeight,
              readyState: e.currentTarget.readyState
            })
          }}
          onPlay={() => console.log(`[VideoTile] Video playing for ${participant.username}`)}
          onError={(e) => console.error(`[VideoTile] Video error for ${participant.username}:`, e)}
          onSuspend={() => console.log(`[VideoTile] Video suspended for ${participant.username}`)}
          onWaiting={() => console.log(`[VideoTile] Video waiting for ${participant.username}`)}
          onCanPlay={() => console.log(`[VideoTile] Video can play for ${participant.username}`)}
        />
      ) : (
        /* Avatar fallback when video is off */
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-zinc-700 to-zinc-800 z-0">
          <div className="w-20 h-20 rounded-full bg-zinc-600 flex items-center justify-center text-2xl font-bold text-zinc-200">
            {getInitials(participant.username)}
          </div>
        </div>
      )}

      {/* Overlay with participant info */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none z-10">
        {/* Top indicators */}
        <div className="absolute top-2 left-2 flex items-center gap-2">
          {/* Connection quality indicator */}
          {participant.connectionQuality && (
            <div
              className={clsx(
                'w-2 h-2 rounded-full',
                getConnectionColor(participant.connectionQuality)
              )}
              title={`Connection: ${participant.connectionQuality}`}
            />
          )}

          {/* Local indicator */}
          {participant.isLocal && (
            <span className="px-2 py-0.5 bg-blue-600 text-white text-xs rounded-md font-medium">
              You
            </span>
          )}

          {/* Screen sharing indicator (v1.3.0) */}
          {participant.isScreenSharing && (
            <span className="px-2 py-0.5 bg-purple-600 text-white text-xs rounded-md font-medium flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v10a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm2 1v8h10V5H5z" clipRule="evenodd" />
              </svg>
              Screen
            </span>
          )}
        </div>

        {/* Bottom info bar */}
        <div className="absolute bottom-0 left-0 right-0 p-2 flex items-center justify-between">
          {/* Participant name */}
          <span className="text-white text-sm font-medium truncate">
            {participant.username}
          </span>

          {/* Audio/Video status icons */}
          <div className="flex items-center gap-1 ml-2 flex-shrink-0">
            {/* Microphone icon */}
            {!audioEnabled && (
              <div className="p-1 bg-red-600 rounded-full" title="Microphone muted">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}

            {/* Video icon */}
            {!showVideo && (
              <div className="p-1 bg-red-600 rounded-full" title="Camera off">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Speaking indicator - glowing border animation */}
      {participant.isSpeaking && (
        <div className="absolute inset-0 border-4 border-green-400 rounded-lg animate-pulse pointer-events-none" />
      )}

      {/* v1.4.4 Sprint 1: Volume and Fullscreen Controls */}
      {showControls && (
        <div className="absolute top-2 right-2 flex items-center gap-2 z-20 pointer-events-auto">
          {/* Volume Control (only for remote participants) */}
          {!participant.isLocal && participant.stream && (
            <div className="flex items-center gap-2 bg-black/70 backdrop-blur-sm rounded-lg px-3 py-2">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setVolume(volume === 0 ? 1 : 0)
                }}
                className="p-1 hover:bg-white/10 rounded transition-colors"
                title={volume === 0 ? "Unmute" : "Mute"}
              >
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  {volume === 0 ? (
                    <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  ) : (
                    <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
                  )}
                </svg>
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={(e) => {
                  e.stopPropagation()
                  setVolume(parseFloat(e.target.value))
                }}
                onClick={(e) => e.stopPropagation()}
                className="w-20 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer
                  [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3
                  [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:cursor-pointer
                  [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:rounded-full
                  [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer"
                title={`Volume: ${Math.round(volume * 100)}%`}
              />
            </div>
          )}

          {/* Fullscreen Button */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              toggleFullscreen()
            }}
            className="p-2 bg-black/70 backdrop-blur-sm hover:bg-black/90 rounded-lg transition-colors"
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          >
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {isFullscreen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              )}
            </svg>
          </button>
        </div>
      )}
    </div>
  )
}
