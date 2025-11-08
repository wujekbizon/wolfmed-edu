import { useEffect, useRef, useState, useCallback } from 'react'
import type { RoomConnection } from '@teaching-playground/core'

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

interface UseWebRTCOptions {
  roomId: string
  userId: string
  connection: RoomConnection | null
  enabled: boolean
}

interface WebRTCState {
  participants: Participant[]
  localStream: MediaStream | null
  isVideoEnabled: boolean
  isAudioEnabled: boolean
  isScreenSharing: boolean
  connectionStatus: 'connecting' | 'connected' | 'disconnected'
}

export function useWebRTC({ roomId, userId, connection, enabled }: UseWebRTCOptions) {
  const [state, setState] = useState<WebRTCState>({
    participants: [],
    localStream: null,
    isVideoEnabled: false,
    isAudioEnabled: false,
    isScreenSharing: false,
    connectionStatus: 'disconnected'
  })

  // Store local stream reference
  const localStreamRef = useRef<MediaStream | null>(null)

  // Voice activity detection
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserNodesRef = useRef<Map<string, AnalyserNode>>(new Map())
  const speakingStateRef = useRef<Map<string, boolean>>(new Map())

  /**
   * Start local media stream
   */
  const startLocalStream = useCallback(async (constraints: MediaStreamConstraints = { video: true, audio: true }) => {
    try {
      console.log('Starting local media stream...')
      const stream = await navigator.mediaDevices.getUserMedia(constraints)

      localStreamRef.current = stream

      setState(prev => ({
        ...prev,
        localStream: stream,
        isVideoEnabled: stream.getVideoTracks().length > 0,
        isAudioEnabled: stream.getAudioTracks().length > 0
      }))

      // Set up voice activity detection for local stream
      if (stream.getAudioTracks().length > 0) {
        setupVoiceActivityDetection(userId, stream)
      }

      console.log('Local stream started successfully')
      return stream
    } catch (error) {
      console.error('Failed to start local media stream:', error)
      throw error
    }
  }, [userId])

  /**
   * Stop local media stream
   */
  const stopLocalStream = useCallback(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop())
      localStreamRef.current = null

      setState(prev => ({
        ...prev,
        localStream: null,
        isVideoEnabled: false,
        isAudioEnabled: false
      }))

      console.log('Local stream stopped')
    }
  }, [])

  /**
   * Toggle video track
   */
  const toggleVideo = useCallback(() => {
    if (!localStreamRef.current) return

    const videoTrack = localStreamRef.current.getVideoTracks()[0]
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled
      setState(prev => ({ ...prev, isVideoEnabled: videoTrack.enabled }))
      console.log(`Video ${videoTrack.enabled ? 'enabled' : 'disabled'}`)
    }
  }, [])

  /**
   * Toggle audio track
   */
  const toggleAudio = useCallback(() => {
    if (!localStreamRef.current) return

    const audioTrack = localStreamRef.current.getAudioTracks()[0]
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled
      setState(prev => ({ ...prev, isAudioEnabled: audioTrack.enabled }))
      console.log(`Audio ${audioTrack.enabled ? 'enabled' : 'disabled'}`)
    }
  }, [])

  /**
   * Start screen sharing (v1.3.0)
   */
  const startScreenShare = useCallback(async () => {
    if (!connection) {
      console.error('No connection available for screen sharing')
      return
    }

    try {
      console.log('[useWebRTC] User initiated screen share request')
      console.log('[useWebRTC] Call stack:', new Error().stack)
      // Package handles screen sharing internally
      await (connection as any).startScreenShare()
      setState(prev => ({ ...prev, isScreenSharing: true }))
      console.log('[useWebRTC] Screen sharing started successfully')
    } catch (error) {
      console.error('[useWebRTC] Failed to start screen sharing:', error)
      throw error
    }
  }, [connection])

  /**
   * Stop screen sharing (v1.3.0)
   */
  const stopScreenShare = useCallback(async () => {
    if (!connection) {
      console.error('No connection available to stop screen sharing')
      return
    }

    try {
      console.log('Stopping screen share...')
      await (connection as any).stopScreenShare()
      setState(prev => ({ ...prev, isScreenSharing: false }))
      console.log('Screen sharing stopped')
    } catch (error) {
      console.error('Failed to stop screen sharing:', error)
      throw error
    }
  }, [connection])

  /**
   * Voice activity detection setup
   */
  const setupVoiceActivityDetection = useCallback((participantId: string, stream: MediaStream) => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext()
    }

    const audioContext = audioContextRef.current
    const analyser = audioContext.createAnalyser()
    analyser.fftSize = 512
    analyser.smoothingTimeConstant = 0.8

    const source = audioContext.createMediaStreamSource(stream)
    source.connect(analyser)

    analyserNodesRef.current.set(participantId, analyser)

    // Monitor voice activity
    const dataArray = new Uint8Array(analyser.frequencyBinCount)
    const checkVoiceActivity = () => {
      analyser.getByteFrequencyData(dataArray)

      // Calculate average volume
      const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length
      const isSpeaking = average > 20 // Threshold for speaking detection

      // Only update state if speaking status changed
      const previousState = speakingStateRef.current.get(participantId)
      if (previousState !== isSpeaking) {
        speakingStateRef.current.set(participantId, isSpeaking)
        setState(prev => ({
          ...prev,
          participants: prev.participants.map(p =>
            p.id === participantId ? { ...p, isSpeaking } : p
          )
        }))
      }

      requestAnimationFrame(checkVoiceActivity)
    }

    checkVoiceActivity()
  }, [])

  /**
   * Set up WebRTC event listeners (using actual package events from v1.2.0)
   */
  useEffect(() => {
    if (!connection || !enabled) return

    console.log('Setting up WebRTC event listeners (package v1.2.0)')

    // Handle user joined - setup peer connection (v1.2.0)
    const handleUserJoined = async ({ user }: { user: { id: string; username: string } }) => {
      console.log(`User ${user.username} joined, setting up peer connection`)

      // Add participant to state
      setState(prev => ({
        ...prev,
        participants: [
          ...prev.participants,
          {
            id: user.id,
            username: user.username,
            isLocal: false,
            connectionQuality: 'good'
          }
        ]
      }))

      // Setup peer connection if we have a local stream
      if (localStreamRef.current && (connection as any).setupPeerConnection) {
        try {
          await (connection as any).setupPeerConnection(user.id, localStreamRef.current)
          await (connection as any).createOffer(user.id)
          console.log(`Peer connection setup complete for ${user.username}`)
        } catch (error) {
          console.error(`Failed to setup peer connection for ${user.username}:`, error)
        }
      }
    }

    // Handle remote stream added (v1.2.0)
    const handleRemoteStreamAdded = ({ peerId, stream }: { peerId: string; stream: MediaStream }) => {
      console.log(`Remote stream added for peer ${peerId}`)

      setState(prev => ({
        ...prev,
        participants: prev.participants.map(p =>
          p.id === peerId
            ? {
                ...p,
                stream,
                videoEnabled: stream.getVideoTracks().some(t => t.enabled),
                audioEnabled: stream.getAudioTracks().some(t => t.enabled)
              }
            : p
        )
      }))

      // Set up voice activity detection for remote stream
      if (stream.getAudioTracks().length > 0) {
        setupVoiceActivityDetection(peerId, stream)
      }
    }

    // Handle remote stream removed (v1.2.0)
    const handleRemoteStreamRemoved = ({ peerId }: { peerId: string }) => {
      console.log(`Remote stream removed for peer ${peerId}`)

      setState(prev => ({
        ...prev,
        participants: prev.participants.map(p => {
          if (p.id === peerId) {
            const { stream, ...rest } = p
            return rest
          }
          return p
        })
      }))

      // Cleanup voice activity detection
      analyserNodesRef.current.delete(peerId)
      speakingStateRef.current.delete(peerId)
    }

    // Handle participant left
    const handleUserLeft = ({ userId }: { userId: string }) => {
      console.log(`User ${userId} left`)

      setState(prev => ({
        ...prev,
        participants: prev.participants.filter(p => p.id !== userId)
      }))

      // Cleanup voice activity detection
      analyserNodesRef.current.delete(userId)
      speakingStateRef.current.delete(userId)
    }

    // Handle screen share started (v1.3.0)
    const handleScreenShareStarted = () => {
      console.log('Screen share started')
      setState(prev => ({ ...prev, isScreenSharing: true }))
    }

    // Handle screen share stopped (v1.3.0)
    const handleScreenShareStopped = () => {
      console.log('Screen share stopped')
      setState(prev => ({ ...prev, isScreenSharing: false }))
    }

    // Register event listeners
    connection.on('user_joined', handleUserJoined)
    connection.on('remote_stream_added', handleRemoteStreamAdded)
    connection.on('remote_stream_removed', handleRemoteStreamRemoved)
    connection.on('user_left', handleUserLeft)
    connection.on('screen_share_started', handleScreenShareStarted)
    connection.on('screen_share_stopped', handleScreenShareStopped)

    return () => {
      if (connection.removeAllListeners) {
        connection.removeAllListeners('user_joined')
        connection.removeAllListeners('remote_stream_added')
        connection.removeAllListeners('remote_stream_removed')
        connection.removeAllListeners('user_left')
        connection.removeAllListeners('screen_share_started')
        connection.removeAllListeners('screen_share_stopped')
      }
    }
  }, [connection, enabled, setupVoiceActivityDetection])

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      console.log('Cleaning up WebRTC resources')

      // Stop local stream
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop())
      }

      // Clean up audio context
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }

      // Clear references
      analyserNodesRef.current.clear()
      speakingStateRef.current.clear()
    }
  }, [])

  return {
    ...state,
    startLocalStream,
    stopLocalStream,
    toggleVideo,
    toggleAudio,
    startScreenShare,
    stopScreenShare
  }
}
