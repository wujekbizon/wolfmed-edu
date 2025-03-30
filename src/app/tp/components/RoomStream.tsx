'use client'

import { useEffect, useRef } from 'react'
import { Room } from '@teaching-playground/core'

interface RoomStreamProps {
  room: Room
  stream: {
    isActive: boolean
    streamerId: string | null
    quality: 'low' | 'medium' | 'high'
  } | null
  onStartStream: (quality?: 'low' | 'medium' | 'high') => void
  onStopStream: () => void
}

export default function RoomStream({ room, stream, onStartStream, onStopStream }: RoomStreamProps) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (!stream || !stream.isActive || !videoRef.current) return

    const videoElement = videoRef.current;

    // For now, we'll use a mock video stream
    // In the future, this will be replaced with real WebRTC implementation
    const mockStream = () => {
      const canvas = document.createElement('canvas')
      canvas.width = 640
      canvas.height = 480
      const ctx = canvas.getContext('2d')
      
      if (!ctx) return

      // Create a mock video stream with animated content
      setInterval(() => {
        ctx.fillStyle = '#1f2937'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        
        // Draw some animated shapes
        const time = Date.now() / 1000
        ctx.fillStyle = '#3b82f6'
        ctx.beginPath()
        ctx.arc(
          canvas.width/2 + Math.cos(time) * 100,
          canvas.height/2 + Math.sin(time) * 100,
          20,
          0,
          2 * Math.PI
        )
        ctx.fill()
        
        // Add some text
        ctx.fillStyle = '#ffffff'
        ctx.font = '24px sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText('Mock Stream', canvas.width/2, 40)
        ctx.font = '18px sans-serif'
        ctx.fillText(`Room: ${room.name}`, canvas.width/2, 70)
      }, 1000/30) // 30fps

      return canvas.captureStream(30)
    }

    const mockVideoStream = mockStream()
    if (mockVideoStream && videoElement) {
      videoElement.srcObject = mockVideoStream
    }

    return () => {
      if (videoElement) {
        videoElement.srcObject = null
      }
    }
  }, [stream, room.name])

  if (!stream || !stream.isActive) {
    return (
      <div className="flex items-center justify-center h-full bg-zinc-900">
        <div className="text-zinc-500 text-center">
          <svg 
            className="w-12 h-12 mx-auto mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={1.5} 
              d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
          <p className="text-lg font-medium">Stream is inactive</p>
          <p className="text-sm mt-1">Waiting for the stream to start...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full h-full bg-zinc-900">
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        autoPlay
        playsInline
        muted
      />
    </div>
  )
} 