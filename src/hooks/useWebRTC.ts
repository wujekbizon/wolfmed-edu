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
      const stream = await navigator.mediaDevices.getUserMedia(constraints)

      localStreamRef.current = stream

      const videoTracks = stream.getVideoTracks()
      const audioTracks = stream.getAudioTracks()

      setState(prev => ({
        ...prev,
        localStream: stream,
        isVideoEnabled: videoTracks.length > 0 && videoTracks[0]?.enabled,
        isAudioEnabled: audioTracks.length > 0 && audioTracks[0]?.enabled
      }))

      // v1.4.4 FIX: Recreate peer connections with new stream
      // When stream restarts, we need to setup new peer connections with the new tracks
      if (connection) {
        const currentParticipants = await new Promise<typeof state.participants>((resolve) => {
          setState(prev => {
            resolve(prev.participants)
            return prev
          })
        })

        for (const participant of currentParticipants) {
          // Skip local participant and self
          if (participant.isLocal || participant.id === userId) {
            continue
          }

          if ((connection as any).setupPeerConnection) {
            try {
              await (connection as any).setupPeerConnection(participant.id, stream)

              // Create offer to send our new stream
              if ((connection as any).createOffer) {
                await (connection as any).createOffer(participant.id)
              }
            } catch (error) {
              console.error(`[v1.4.4] Failed to setup peer with new stream for ${participant.username}:`, error)
            }
          }
        }
      }

      return stream
    } catch (error) {
      console.error('Failed to start local media stream:', error)
      throw error
    }
  }, [connection, userId])

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

      // v1.4.4 FIX: Close peer connections when stopping stream
      // This ensures they get recreated with new tracks when stream restarts
      if (connection && (connection as any).closePeerConnection) {
        setState(prev => {
          prev.participants.forEach(async (participant) => {
            // Skip local participant and self
            if (!participant.isLocal && participant.id !== userId) {
              try {
                await (connection as any).closePeerConnection(participant.id)
              } catch (error) {
                console.error(`[v1.4.4] Failed to close peer for ${participant.id}:`, error)
              }
            }
          })
          return prev
        })
      }
    }
  }, [connection, userId])

  /**
   * Toggle video track
   */
  const toggleVideo = useCallback(() => {
    if (!localStreamRef.current) return

    const videoTrack = localStreamRef.current.getVideoTracks()[0]
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled
      setState(prev => ({ ...prev, isVideoEnabled: videoTrack.enabled }))
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
      // Package handles screen sharing internally
      await (connection as any).startScreenShare()
      setState(prev => ({ ...prev, isScreenSharing: true }))
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
      await (connection as any).stopScreenShare()
      setState(prev => ({ ...prev, isScreenSharing: false }))
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

    // Handle user joined - setup peer connection (v1.2.0)
    const handleUserJoined = async (data: any) => {
      // v1.4.4: Backend now properly emits userId in user_joined event ✅
      const userId = data.userId
      const socketId = data.socketId
      const username = data.username || 'Unknown User'
      const role = data.role

      if (!socketId) {
        console.error('[WebRTC] user_joined event missing socketId:', data)
        return
      }

      if (!userId) {
        console.error('[WebRTC] user_joined event missing userId - this should not happen in v1.4.4+:', data)
        return
      }

      // IMPORTANT: Use socketId for peer connections since ICE candidates come with socketId
      const peerId = socketId

      // Add participant to state (only if not already present)
      setState(prev => {
        if (prev.participants.some(p => p.id === peerId)) {
          return prev
        }

        return {
          ...prev,
          participants: [
            ...prev.participants,
            {
              id: peerId,
              username,
              isLocal: false,
              connectionQuality: 'good'
            }
          ]
        }
      })

      // ALWAYS setup peer connection, even without local stream (v1.4.2 fix)
      // Backend now supports null streams - this allows receive-only connections
      // Students can join without camera and still receive teacher's video
      if ((connection as any).setupPeerConnection) {
        try {
          // Pass null/undefined if we don't have a stream yet
          await (connection as any).setupPeerConnection(peerId, localStreamRef.current || null)

          // Only create offer if WE have a stream (we're the initiator)
          // Otherwise, we'll receive and answer their offer
          if (localStreamRef.current && (connection as any).createOffer) {
            await (connection as any).createOffer(peerId)
          }
        } catch (error) {
          console.error(`Failed to setup peer connection for ${username}:`, error)
        }
      }
    }

    // Handle remote stream added (v1.2.0)
    const handleRemoteStreamAdded = ({ peerId, stream }: { peerId: string; stream: MediaStream }) => {
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
    const handleUserLeft = (data: any) => {
      // v1.3.1 package sends { socketId } for user_left event
      const socketId = data.socketId

      if (!socketId) {
        console.error('user_left event missing socketId:', data)
        return
      }

      // Use socketId as peerId (consistent with handleUserJoined)
      const peerId = socketId

      setState(prev => ({
        ...prev,
        participants: prev.participants.filter(p => p.id !== peerId)
      }))

      // Cleanup voice activity detection
      analyserNodesRef.current.delete(peerId)
      speakingStateRef.current.delete(peerId)
    }

    // Handle screen share started (v1.3.0)
    const handleScreenShareStarted = () => {
      setState(prev => ({ ...prev, isScreenSharing: true }))
    }

    // Handle screen share stopped (v1.3.0)
    const handleScreenShareStopped = () => {
      setState(prev => ({ ...prev, isScreenSharing: false }))
    }

    // Handle being muted by teacher (v1.4.4 Bug Fix)
    const handleMutedByTeacher = ({ requestedBy, reason, timestamp }: { requestedBy: string, reason?: string, timestamp: string }) => {
      console.log(`[WebRTC] Muted by teacher ${requestedBy} at ${timestamp}${reason ? `: ${reason}` : ''}`)

      if (localStreamRef.current) {
        const audioTracks = localStreamRef.current.getAudioTracks()
        audioTracks.forEach(track => {
          track.enabled = false
        })

        setState(prev => ({
          ...prev,
          isAudioEnabled: false
        }))
      }
    }

    // Handle mute all participants (v1.4.4 Bug Fix)
    const handleMuteAll = ({ requestedBy, timestamp }: { requestedBy: string, timestamp: string }) => {
      console.log(`[WebRTC] All participants muted by ${requestedBy} at ${timestamp}`)

      if (localStreamRef.current) {
        const audioTracks = localStreamRef.current.getAudioTracks()
        audioTracks.forEach(track => {
          track.enabled = false
        })

        setState(prev => ({
          ...prev,
          isAudioEnabled: false
        }))
      }
    }

    // Handle being kicked from room (v1.4.4 Bug Fix)
    const handleKickedFromRoom = ({ roomId, reason, kickedBy, timestamp }: { roomId: string, reason: string, kickedBy: string, timestamp: string }) => {
      console.log(`[WebRTC] Kicked from room ${roomId} by ${kickedBy}: ${reason}`)

      // Stop local stream
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop())
        localStreamRef.current = null
      }

      // Close all peer connections
      if (connection && (connection as any).closePeerConnection) {
        setState(prev => {
          prev.participants.forEach(async (participant) => {
            if (!participant.isLocal) {
              try {
                await (connection as any).closePeerConnection(participant.id)
              } catch (error) {
                console.error(`[WebRTC] Failed to close peer for ${participant.id}:`, error)
              }
            }
          })
          return prev
        })
      }

      // Clear all participants and reset state
      setState({
        participants: [],
        localStream: null,
        isVideoEnabled: false,
        isAudioEnabled: false,
        isScreenSharing: false,
        connectionStatus: 'disconnected'
      })

      // Cleanup voice activity detection
      analyserNodesRef.current.clear()
      speakingStateRef.current.clear()
    }

    // Handle room cleared (v1.4.4 Bug Fix)
    const handleRoomCleared = ({ roomId }: { roomId: string }) => {
      console.log(`[WebRTC] Room ${roomId} has been cleared (lecture ended)`)

      // Stop local stream
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop())
        localStreamRef.current = null
      }

      // Close all peer connections
      if (connection && (connection as any).closePeerConnection) {
        setState(prev => {
          prev.participants.forEach(async (participant) => {
            if (!participant.isLocal) {
              try {
                await (connection as any).closePeerConnection(participant.id)
              } catch (error) {
                console.error(`[WebRTC] Failed to close peer for ${participant.id}:`, error)
              }
            }
          })
          return prev
        })
      }

      // Clear all participants and reset state
      setState({
        participants: [],
        localStream: null,
        isVideoEnabled: false,
        isAudioEnabled: false,
        isScreenSharing: false,
        connectionStatus: 'disconnected'
      })

      // Cleanup voice activity detection
      analyserNodesRef.current.clear()
      speakingStateRef.current.clear()
    }

    // Handle join room error (v1.4.4 Bug Fix)
    const handleJoinRoomError = ({ error, roomId }: { error: string, roomId?: string }) => {
      console.error(`[WebRTC] Failed to join room${roomId ? ` ${roomId}` : ''}: ${error}`)

      // Stop local stream if it was started
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop())
        localStreamRef.current = null
      }

      // Reset state
      setState({
        participants: [],
        localStream: null,
        isVideoEnabled: false,
        isAudioEnabled: false,
        isScreenSharing: false,
        connectionStatus: 'disconnected'
      })
    }

    // v1.4.3 CRITICAL FIX: Handle room_state for late joiners
    // When user joins a room with existing participants, they receive room_state
    // instead of individual user_joined events. We need to setup peer connections
    // for all existing participants.
    const handleRoomState = async (data: any) => {
      const participants = data.participants || []

      if (participants.length === 0) return

      // Setup peer connections for all existing participants (except self)
      for (const participant of participants) {
        const socketId = participant.socketId
        const username = participant.username || 'Unknown User'
        const participantUserId = participant.id || socketId

        if (!socketId) {
          continue
        }

        // v1.4.4 FIX: Skip creating peer connection to ourselves!
        if (participantUserId === userId) {
          continue
        }

        // Skip if already in state (from previous user_joined)
        const alreadyExists = await new Promise<boolean>((resolve) => {
          setState(prev => {
            resolve(prev.participants.some(p => p.id === socketId))
            return prev
          })
        })

        if (alreadyExists) {
          continue
        }

        // Add to state
        setState(prev => ({
          ...prev,
          participants: [
            ...prev.participants,
            {
              id: socketId,
              username,
              isLocal: false,
              connectionQuality: 'good' as const
            }
          ]
        }))

        // Setup peer connection (receive-only initially)
        if ((connection as any).setupPeerConnection) {
          try {
            await (connection as any).setupPeerConnection(socketId, localStreamRef.current || null)

            // Only create offer if WE have a stream (we're the initiator)
            if (localStreamRef.current && (connection as any).createOffer) {
              await (connection as any).createOffer(socketId)
            }
          } catch (error) {
            console.error(`[v1.4.3 FIX] Failed to setup peer connection for ${username}:`, error)
          }
        }
      }
    }

    // Register event listeners
    connection.on('user_joined', handleUserJoined)
    connection.on('room_state', handleRoomState) // v1.4.3 CRITICAL FIX
    connection.on('remote_stream_added', handleRemoteStreamAdded)
    connection.on('remote_stream_removed', handleRemoteStreamRemoved)
    connection.on('user_left', handleUserLeft)
    connection.on('screen_share_started', handleScreenShareStarted)
    connection.on('screen_share_stopped', handleScreenShareStopped)
    connection.on('muted_by_teacher', handleMutedByTeacher) // v1.4.4 Bug Fix
    connection.on('mute_all', handleMuteAll) // v1.4.4 Bug Fix
    connection.on('kicked_from_room', handleKickedFromRoom) // v1.4.4 Bug Fix
    connection.on('room_cleared', handleRoomCleared) // v1.4.4 Bug Fix
    connection.on('join_room_error', handleJoinRoomError) // v1.4.4 Bug Fix

    return () => {
      if (connection.removeAllListeners) {
        connection.removeAllListeners('user_joined')
        connection.removeAllListeners('room_state') // v1.4.3 cleanup
        connection.removeAllListeners('remote_stream_added')
        connection.removeAllListeners('remote_stream_removed')
        connection.removeAllListeners('user_left')
        connection.removeAllListeners('screen_share_started')
        connection.removeAllListeners('screen_share_stopped')
        connection.removeAllListeners('muted_by_teacher') // v1.4.4 cleanup
        connection.removeAllListeners('mute_all') // v1.4.4 cleanup
        connection.removeAllListeners('kicked_from_room') // v1.4.4 cleanup
        connection.removeAllListeners('room_cleared') // v1.4.4 cleanup
        connection.removeAllListeners('join_room_error') // v1.4.4 cleanup
      }
    }
  }, [connection, enabled, setupVoiceActivityDetection])

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
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
