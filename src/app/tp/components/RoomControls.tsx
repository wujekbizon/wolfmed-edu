'use client'

import { useState } from 'react'
import { Room, RoomState } from '@teaching-playground/core'
import { usePlaygroundStore } from '@/store/usePlaygroundStore'

interface RoomControlsProps {
  room: Room
  isConnected: boolean
  stream: {
    isActive: boolean
    streamerId: string | null
    quality: 'low' | 'medium' | 'high'
  } | null
}

export default function RoomControls({ room, isConnected, stream }: RoomControlsProps) {
  const [isLoading, setIsLoading] = useState(false)
  const playground = usePlaygroundStore((state) => state.playground)

  const handleStreamToggle = async () => {
    try {
      setIsLoading(true)
      if (!playground) return

      // In the future, this will handle real stream toggling
      // For now, we'll just mock the functionality
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Update room state would happen here
      console.log('Stream toggled')
    } catch (error) {
      console.error('Failed to toggle stream:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleChatToggle = async () => {
    try {
      setIsLoading(true)
      if (!playground) return

      // Mock chat toggle
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Update room state would happen here
      console.log('Chat toggled')
    } catch (error) {
      console.error('Failed to toggle chat:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-zinc-800 rounded-lg border border-zinc-700 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={handleStreamToggle}
            disabled={isLoading}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg font-medium
              transition-colors
              ${stream?.isActive
                ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                : 'bg-blue-500/10 text-blue-400 hover:bg-blue-500/20'
              }
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
            {stream?.isActive ? 'End Stream' : 'Start Stream'}
          </button>

          <button
            onClick={handleChatToggle}
            disabled={isLoading}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg font-medium
              transition-colors
              ${isConnected
                ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                : 'bg-blue-500/10 text-blue-400 hover:bg-blue-500/20'
              }
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            {isConnected ? 'Disable Chat' : 'Enable Chat'}
          </button>
        </div>

        <div className="flex items-center gap-2 text-zinc-400">
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
          <span>{room.participants?.length || 0} participants</span>
        </div>
      </div>
    </div>
  )
} 