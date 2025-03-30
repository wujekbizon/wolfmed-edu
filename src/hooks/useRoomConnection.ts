import { useEffect, useRef, useState } from 'react'
import { RoomConnection, User } from '@teaching-playground/core'

interface UseRoomConnectionOptions {
  roomId: string
  user: User
  serverUrl: string
}

interface RoomState {
  isConnected: boolean
  messages: Array<{
    userId: string
    username: string
    content: string
    timestamp: string
  }>
  stream: {
    isActive: boolean
    streamerId: string | null
    quality: 'low' | 'medium' | 'high'
  } | null
  participants: Array<{
    id: string
    username: string
    role: string
    status: string
    canStream: boolean
    canChat: boolean
    canScreenShare: boolean
  }>
}

export function useRoomConnection({ roomId, user, serverUrl }: UseRoomConnectionOptions) {
  const connectionRef = useRef<RoomConnection | null>(null)
  const [state, setState] = useState<RoomState>({
    isConnected: false,
    messages: [],
    stream: null,
    participants: []
  })

  useEffect(() => {
    const connection = new RoomConnection(roomId, user, serverUrl)
    connectionRef.current = connection

    connection.on('connected', () => {
      setState(prev => ({ ...prev, isConnected: true }))
    })

    connection.on('disconnected', () => {
      setState(prev => ({ ...prev, isConnected: false }))
    })

    connection.on('room_state_updated', (roomState) => {
      setState(prev => ({
        ...prev,
        messages: roomState.messages,
        stream: roomState.stream,
        participants: roomState.participants
      }))
    })

    connection.on('message_received', (message) => {
      setState(prev => ({
        ...prev,
        messages: [...prev.messages, message]
      }))
    })

    connection.on('stream_started', (streamState) => {
      setState(prev => ({ ...prev, stream: streamState }))
    })

    connection.on('stream_stopped', () => {
      setState(prev => ({ ...prev, stream: null }))
    })

    connection.on('user_joined', ({ userId }) => {
      setState(prev => ({
        ...prev,
        participants: [...prev.participants, { id: userId, username: '', role: '', status: '', canStream: false, canChat: false, canScreenShare: false }]
      }))
    })

    connection.on('user_left', ({ socketId }) => {
      setState(prev => ({
        ...prev,
        participants: prev.participants.filter(p => p.id !== socketId)
      }))
    })

    connection.connect()

    return () => {
      connection.disconnect()
      connectionRef.current = null
    }
  }, [roomId, user, serverUrl])

  return {
    state,
    sendMessage: (content: string) => connectionRef.current?.sendMessage(content),
    startStream: (quality?: 'low' | 'medium' | 'high') => connectionRef.current?.startStream(quality),
    stopStream: () => connectionRef.current?.stopStream()
  }
} 