import { useEffect, useRef, useState, useCallback } from 'react'
import type { EventEmitter } from 'events'

// STUN servers for NAT traversal
const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' }
  ]
}

interface Participant {
  id: string
  username: string
  stream?: MediaStream
  isLocal?: boolean
  isSpeaking?: boolean
  connectionQuality?: 'excellent' | 'good' | 'poor'
  audioEnabled?: boolean
  videoEnabled?: boolean
}

interface UseWebRTCOptions {
  roomId: string
  userId: string
  connection: EventEmitter | null
  enabled: boolean
}

interface WebRTCState {
  participants: Participant[]
  localStream: MediaStream | null
  isVideoEnabled: boolean
  isAudioEnabled: boolean
  connectionStatus: 'connecting' | 'connected' | 'disconnected'
}

export function useWebRTC({ roomId, userId, connection, enabled }: UseWebRTCOptions) {
  const [state, setState] = useState<WebRTCState>({
    participants: [],
    localStream: null,
    isVideoEnabled: false,
    isAudioEnabled: false,
    connectionStatus: 'disconnected'
  })

  // Store peer connections for each remote participant
  const peerConnectionsRef = useRef<Map<string, RTCPeerConnection>>(new Map())

  // Store remote streams
  const remoteStreamsRef = useRef<Map<string, MediaStream>>(new Map())

  // Store local stream reference
  const localStreamRef = useRef<MediaStream | null>(null)

  // Voice activity detection
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserNodesRef = useRef<Map<string, AnalyserNode>>(new Map())

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
   * Create peer connection for a remote participant
   */
  const createPeerConnection = useCallback((participantId: string): RTCPeerConnection => {
    console.log(`Creating peer connection for participant ${participantId}`)

    const pc = new RTCPeerConnection(ICE_SERVERS)

    // Add local stream tracks to the connection
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        pc.addTrack(track, localStreamRef.current!)
      })
    }

    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate && connection) {
        console.log(`Sending ICE candidate to ${participantId}`)
        connection.emit('webrtc:ice_candidate', {
          roomId,
          targetUserId: participantId,
          candidate: event.candidate
        })
      }
    }

    // Handle incoming remote stream
    pc.ontrack = (event) => {
      console.log(`Received remote track from ${participantId}`)
      const [remoteStream] = event.streams

      if (!remoteStream) {
        console.warn(`No remote stream received for ${participantId}`)
        return
      }

      remoteStreamsRef.current.set(participantId, remoteStream)

      // Set up voice activity detection for remote stream
      if (remoteStream.getAudioTracks().length > 0) {
        setupVoiceActivityDetection(participantId, remoteStream)
      }

      // Update participants state
      updateParticipantStream(participantId, remoteStream)
    }

    // Handle connection state changes
    pc.onconnectionstatechange = () => {
      console.log(`Peer connection state for ${participantId}: ${pc.connectionState}`)

      if (pc.connectionState === 'connected') {
        updateParticipantConnectionQuality(participantId, 'excellent')
      } else if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected') {
        updateParticipantConnectionQuality(participantId, 'poor')
      }
    }

    // Handle ICE connection state changes
    pc.oniceconnectionstatechange = () => {
      console.log(`ICE connection state for ${participantId}: ${pc.iceConnectionState}`)

      if (pc.iceConnectionState === 'failed') {
        console.warn(`ICE connection failed for ${participantId}, attempting restart`)
        pc.restartIce()
      }
    }

    peerConnectionsRef.current.set(participantId, pc)
    return pc
  }, [roomId, connection])

  /**
   * Create and send WebRTC offer
   */
  const createOffer = useCallback(async (participantId: string) => {
    try {
      let pc = peerConnectionsRef.current.get(participantId)
      if (!pc) {
        pc = createPeerConnection(participantId)
      }

      console.log(`Creating offer for ${participantId}`)
      const offer = await pc.createOffer()
      await pc.setLocalDescription(offer)

      if (connection) {
        connection.emit('webrtc:offer', {
          roomId,
          targetUserId: participantId,
          offer
        })
      }
    } catch (error) {
      console.error(`Failed to create offer for ${participantId}:`, error)
    }
  }, [roomId, connection, createPeerConnection])

  /**
   * Handle incoming WebRTC offer
   */
  const handleOffer = useCallback(async (fromUserId: string, offer: RTCSessionDescriptionInit) => {
    try {
      console.log(`Received offer from ${fromUserId}`)

      let pc = peerConnectionsRef.current.get(fromUserId)
      if (!pc) {
        pc = createPeerConnection(fromUserId)
      }

      await pc.setRemoteDescription(new RTCSessionDescription(offer))

      const answer = await pc.createAnswer()
      await pc.setLocalDescription(answer)

      if (connection) {
        connection.emit('webrtc:answer', {
          roomId,
          targetUserId: fromUserId,
          answer
        })
      }
    } catch (error) {
      console.error(`Failed to handle offer from ${fromUserId}:`, error)
    }
  }, [roomId, connection, createPeerConnection])

  /**
   * Handle incoming WebRTC answer
   */
  const handleAnswer = useCallback(async (fromUserId: string, answer: RTCSessionDescriptionInit) => {
    try {
      console.log(`Received answer from ${fromUserId}`)

      const pc = peerConnectionsRef.current.get(fromUserId)
      if (pc) {
        await pc.setRemoteDescription(new RTCSessionDescription(answer))
      }
    } catch (error) {
      console.error(`Failed to handle answer from ${fromUserId}:`, error)
    }
  }, [])

  /**
   * Handle incoming ICE candidate
   */
  const handleIceCandidate = useCallback(async (fromUserId: string, candidate: RTCIceCandidateInit) => {
    try {
      const pc = peerConnectionsRef.current.get(fromUserId)
      if (pc) {
        await pc.addIceCandidate(new RTCIceCandidate(candidate))
        console.log(`Added ICE candidate from ${fromUserId}`)
      }
    } catch (error) {
      console.error(`Failed to add ICE candidate from ${fromUserId}:`, error)
    }
  }, [])

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

      setState(prev => ({
        ...prev,
        participants: prev.participants.map(p =>
          p.id === participantId ? { ...p, isSpeaking } : p
        )
      }))

      requestAnimationFrame(checkVoiceActivity)
    }

    checkVoiceActivity()
  }, [])

  /**
   * Update participant stream in state
   */
  const updateParticipantStream = useCallback((participantId: string, stream: MediaStream) => {
    setState(prev => {
      const existingParticipant = prev.participants.find(p => p.id === participantId)

      if (existingParticipant) {
        return {
          ...prev,
          participants: prev.participants.map(p =>
            p.id === participantId
              ? {
                  ...p,
                  stream,
                  videoEnabled: stream.getVideoTracks().some(t => t.enabled),
                  audioEnabled: stream.getAudioTracks().some(t => t.enabled)
                }
              : p
          )
        }
      }

      return prev
    })
  }, [])

  /**
   * Update participant connection quality
   */
  const updateParticipantConnectionQuality = useCallback((
    participantId: string,
    quality: 'excellent' | 'good' | 'poor'
  ) => {
    setState(prev => ({
      ...prev,
      participants: prev.participants.map(p =>
        p.id === participantId ? { ...p, connectionQuality: quality } : p
      )
    }))
  }, [])

  /**
   * Close peer connection
   */
  const closePeerConnection = useCallback((participantId: string) => {
    const pc = peerConnectionsRef.current.get(participantId)
    if (pc) {
      pc.close()
      peerConnectionsRef.current.delete(participantId)
      console.log(`Closed peer connection for ${participantId}`)
    }

    remoteStreamsRef.current.delete(participantId)
    analyserNodesRef.current.delete(participantId)

    setState(prev => ({
      ...prev,
      participants: prev.participants.filter(p => p.id !== participantId)
    }))
  }, [])

  /**
   * Set up WebRTC event listeners
   */
  useEffect(() => {
    if (!connection || !enabled) return

    console.log('Setting up WebRTC event listeners')

    // Handle incoming offers
    connection.on('webrtc:offer', ({ fromUserId, offer }: { fromUserId: string; offer: RTCSessionDescriptionInit }) => {
      handleOffer(fromUserId, offer)
    })

    // Handle incoming answers
    connection.on('webrtc:answer', ({ fromUserId, answer }: { fromUserId: string; answer: RTCSessionDescriptionInit }) => {
      handleAnswer(fromUserId, answer)
    })

    // Handle incoming ICE candidates
    connection.on('webrtc:ice_candidate', ({ fromUserId, candidate }: { fromUserId: string; candidate: RTCIceCandidateInit }) => {
      handleIceCandidate(fromUserId, candidate)
    })

    // Handle participant joined - initiate WebRTC connection
    connection.on('participant_joined', ({ user }: { user: { id: string; username: string } }) => {
      console.log(`Participant ${user.username} joined, initiating WebRTC connection`)

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

      // Only create offer if we have a local stream
      if (localStreamRef.current) {
        createOffer(user.id)
      }
    })

    // Handle participant left
    connection.on('participant_left', ({ userId }: { userId: string }) => {
      console.log(`Participant ${userId} left`)
      closePeerConnection(userId)
    })

    return () => {
      if (connection.removeAllListeners) {
        connection.removeAllListeners('webrtc:offer')
        connection.removeAllListeners('webrtc:answer')
        connection.removeAllListeners('webrtc:ice_candidate')
        connection.removeAllListeners('participant_joined')
        connection.removeAllListeners('participant_left')
      }
    }
  }, [connection, enabled, handleOffer, handleAnswer, handleIceCandidate, createOffer, closePeerConnection])

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

      // Close all peer connections
      peerConnectionsRef.current.forEach((pc, participantId) => {
        pc.close()
        console.log(`Closed peer connection for ${participantId}`)
      })
      peerConnectionsRef.current.clear()

      // Clean up audio context
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }

      // Clear references
      remoteStreamsRef.current.clear()
      analyserNodesRef.current.clear()
    }
  }, [])

  return {
    ...state,
    startLocalStream,
    stopLocalStream,
    toggleVideo,
    toggleAudio,
    createOffer
  }
}
