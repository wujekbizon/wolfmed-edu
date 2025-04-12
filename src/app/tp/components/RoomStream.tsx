'use client'

import { useEffect, useRef, useState } from 'react'
import { Room } from '@teaching-playground/core'

interface RoomStreamProps {
  room: Room
  stream: {
    isActive: boolean
    streamerId: string | null
    quality: 'low' | 'medium' | 'high'
  } | null
  onStartStream?: (quality?: 'low' | 'medium' | 'high') => void
  onStopStream?: () => void
  localStream?: MediaStream | null
  remoteStreams?: Map<string, MediaStream>
}

export default function RoomStream({ 
  room, 
  stream,
  onStartStream,
  onStopStream,
  localStream,
  remoteStreams = new Map()
}: RoomStreamProps) {
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideosRef = useRef<Map<string, HTMLVideoElement>>(new Map())
  const [activeStreams, setActiveStreams] = useState<string[]>([])
  const previousRemoteStreamsRef = useRef<Map<string, MediaStream>>(new Map())

  // Handle local stream
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream
    }
  }, [localStream])

  // Handle remote streams
  useEffect(() => {
    const hasStreamsChanged = (
      previousStreams: Map<string, MediaStream>,
      currentStreams: Map<string, MediaStream>
    ): boolean => {
      if (previousStreams.size !== currentStreams.size) return true
      for (const [key, value] of previousStreams) {
        if (!currentStreams.has(key) || currentStreams.get(key) !== value) return true
      }
      return false
    }

    if (!hasStreamsChanged(previousRemoteStreamsRef.current, remoteStreams)) {
      return
    }

    // Update active streams list
    const currentPeers = Array.from(remoteStreams.keys())
    setActiveStreams(currentPeers)

    // Update or create video elements for each remote stream
    remoteStreams.forEach((stream, peerId) => {
      let videoElement = remoteVideosRef.current.get(peerId)
      
      if (!videoElement) {
        videoElement = document.createElement('video')
        videoElement.autoplay = true
        videoElement.playsInline = true
        remoteVideosRef.current.set(peerId, videoElement)
      }

      if (videoElement.srcObject !== stream) {
        videoElement.srcObject = stream
      }
    })

    // Remove disconnected peers
    remoteVideosRef.current.forEach((_, peerId) => {
      if (!remoteStreams.has(peerId)) {
        remoteVideosRef.current.delete(peerId)
      }
    })

    // Update previous streams reference
    previousRemoteStreamsRef.current = new Map(remoteStreams)
  }, [remoteStreams])

  return (
    <div className="relative w-full h-full bg-zinc-900">
      {/* Stream status overlay */}
      {!stream?.isActive && (
        <div className="absolute inset-0 flex items-center justify-center bg-zinc-900/80">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-zinc-100 mb-4">
              No active stream
            </h3>
            {room.features.hasVideo && (
              <p className="text-zinc-400">
                Start streaming to begin sharing your video
              </p>
            )}
          </div>
        </div>
      )}

      {/* Video grid */}
      <div className="grid h-full p-4">
        <div className={`grid gap-4 h-full auto-rows-fr ${
          activeStreams.length === 0 ? 'grid-cols-1' : 
          activeStreams.length <= 2 ? 'grid-cols-2' :
          'grid-cols-3'
        }`}>
          {/* Local video */}
          {localStream && (
            <div className={`relative bg-zinc-800 rounded-lg overflow-hidden flex items-center justify-center ${
              activeStreams.length === 0 ? 'col-span-full row-span-full' : ''
            }`}>
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="absolute min-w-full min-h-full object-cover"
              />
              <div className="absolute bottom-2 left-2 px-2 py-1 bg-zinc-900/80 rounded text-sm text-zinc-100">
                You
              </div>
            </div>
          )}

          {/* Remote videos */}
          {activeStreams.map((peerId) => (
            <div key={peerId} className="relative bg-zinc-800 rounded-lg overflow-hidden flex items-center justify-center">
              <video
                ref={(el) => {
                  if (el) {
                    remoteVideosRef.current.set(peerId, el)
                    if (remoteStreams.has(peerId)) {
                      el.srcObject = remoteStreams.get(peerId) || null
                    }
                  }
                }}
                autoPlay
                playsInline
                className="absolute min-w-full min-h-full object-cover"
              />
              <div className="absolute bottom-2 left-2 px-2 py-1 bg-zinc-900/80 rounded text-sm text-zinc-100">
                Participant {peerId}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 