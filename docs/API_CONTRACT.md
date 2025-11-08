# Teaching Playground Package - API Contract v1.x

**Purpose**: This document defines the API contract between frontend and backend teams.

**Approach**: Frontend will be built assuming these APIs exist. Backend team implements to match these specifications.

---

## Table of Contents

1. [v1.1.3 - Room Cleanup](#v113---room-cleanup)
2. [v1.2.0 - WebRTC Media Streaming](#v120---webrtc-media-streaming)
3. [v1.3.0 - Screen Sharing](#v130---screen-sharing)
4. [Testing Requirements](#testing-requirements)

---

## v1.1.3 - Room Cleanup

### Problem
When a lecture ends, old messages/participants remain visible if a user enters the room again.

### Solution
Add cleanup methods that clear ephemeral data when lecture ends.

### Backend Implementation Required

#### 1. RealTimeCommunicationSystem - New Method

```typescript
/**
 * Clears all ephemeral data for a specific room
 * Called when lecture ends (completed/cancelled)
 */
public clearRoom(roomId: string): void {
  // Clear participants from memory
  this.roomParticipants.delete(roomId)

  // Clear message history from memory
  this.messageHistory.delete(roomId)

  // Clear active streams
  this.activeStreams.delete(roomId)

  // Clear WebRTC connections
  this.peerConnections.get(roomId)?.forEach(pc => pc.close())
  this.peerConnections.delete(roomId)

  // Emit event to all clients in this room
  this.io.to(roomId).emit('room_cleared', {
    roomId,
    reason: 'Lecture ended'
  })

  console.log(`Cleared room ${roomId} - all ephemeral data removed`)
}
```

#### 2. EventManagementSystem - Enhancement

```typescript
/**
 * Update existing method to call clearRoom when lecture ends
 */
async updateEventStatus(eventId: string, newStatus: Lecture['status']): Promise<Lecture> {
  const lecture = await this.db.findOne('events', { id: eventId })

  // ... existing update logic ...

  // NEW: Clear room when lecture ends
  if (newStatus === 'completed' || newStatus === 'cancelled') {
    const roomId = `room_${eventId}`

    // Get comms system instance and clear the room
    const commsSystem = this.getCommsSystem() // You'll need to provide access
    commsSystem.clearRoom(roomId)

    console.log(`Lecture ${eventId} ended - room ${roomId} cleared`)
  }

  return updatedLecture
}
```

### Frontend Expectations

**New Event to Listen**:
```typescript
connection.on('room_cleared', ({ roomId, reason }) => {
  console.log(`Room ${roomId} was cleared: ${reason}`)

  // Frontend will:
  // - Clear all local state (messages, participants)
  // - Show notification to user
  // - Optionally redirect to room list
})
```

**Behavior**:
- When user enters an "available" room, frontend will reset state
- If `room_cleared` event is received, user is notified
- WebSocket connection can stay open, but room data is reset

---

## v1.2.0 - WebRTC Media Streaming

### Overview
This is THE critical feature. Enables actual video/audio streaming between participants.

### Architecture

```
Teacher (Broadcaster)
  ↓ getUserMedia() → Get camera/mic stream
  ↓ setupPeerConnection() → Create RTCPeerConnection for each student
  ↓ createOffer() → Generate SDP offer
  ↓ WebSocket → Send offer to student via signaling server

Student (Receiver)
  ← WebSocket → Receive offer from teacher
  ← handleOffer() → Set remote description
  ← createAnswer() → Generate SDP answer
  ← WebSocket → Send answer back to teacher

Both Exchange ICE Candidates
  ↔ WebSocket → Exchange network candidates for NAT traversal
  ↔ RTCPeerConnection → Establish P2P connection
  ✓ Video/Audio flows directly between peers
```

### Backend Implementation Required

#### 1. RoomConnection (Client-Side) - New Methods

```typescript
export class RoomConnection {
  private peerConnections: Map<string, RTCPeerConnection> = new Map()
  private remoteStreams: Map<string, MediaStream> = new Map()

  /**
   * Setup WebRTC peer connection with another participant
   * @param peerId - Socket ID of the remote peer
   * @param localStream - Local media stream to send
   */
  async setupPeerConnection(
    peerId: string,
    localStream: MediaStream
  ): Promise<RTCPeerConnection> {
    const iceServers = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    }

    const pc = new RTCPeerConnection(iceServers)

    // Add local tracks to connection
    localStream.getTracks().forEach(track => {
      pc.addTrack(track, localStream)
    })

    // Handle incoming remote tracks
    pc.ontrack = (event) => {
      console.log(`Received remote track from ${peerId}`)
      this.remoteStreams.set(peerId, event.streams[0])

      // Emit to frontend
      this.emit('remote_stream_added', {
        peerId,
        stream: event.streams[0]
      })
    }

    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        this.socket.emit('webrtc:ice-candidate', {
          targetPeerId: peerId,
          candidate: event.candidate
        })
      }
    }

    // Handle connection state changes
    pc.onconnectionstatechange = () => {
      console.log(`Peer connection state with ${peerId}: ${pc.connectionState}`)

      if (pc.connectionState === 'disconnected' ||
          pc.connectionState === 'failed' ||
          pc.connectionState === 'closed') {
        this.remoteStreams.delete(peerId)
        this.emit('remote_stream_removed', { peerId })
      }
    }

    this.peerConnections.set(peerId, pc)
    return pc
  }

  /**
   * Create WebRTC offer and send to peer
   * @param peerId - Target peer socket ID
   */
  async createOffer(peerId: string): Promise<void> {
    const pc = this.peerConnections.get(peerId)
    if (!pc) {
      throw new Error(`No peer connection found for ${peerId}`)
    }

    const offer = await pc.createOffer({
      offerToReceiveAudio: true,
      offerToReceiveVideo: true
    })

    await pc.setLocalDescription(offer)

    this.socket.emit('webrtc:offer', {
      targetPeerId: peerId,
      offer: pc.localDescription
    })

    console.log(`Sent WebRTC offer to ${peerId}`)
  }

  /**
   * Handle incoming WebRTC offer from peer
   * @param fromPeerId - Peer who sent the offer
   * @param offer - SDP offer
   */
  async handleOffer(
    fromPeerId: string,
    offer: RTCSessionDescriptionInit
  ): Promise<void> {
    const pc = this.peerConnections.get(fromPeerId)
    if (!pc) {
      throw new Error(`No peer connection found for ${fromPeerId}`)
    }

    await pc.setRemoteDescription(new RTCSessionDescription(offer))

    const answer = await pc.createAnswer()
    await pc.setLocalDescription(answer)

    this.socket.emit('webrtc:answer', {
      targetPeerId: fromPeerId,
      answer: pc.localDescription
    })

    console.log(`Sent WebRTC answer to ${fromPeerId}`)
  }

  /**
   * Handle incoming WebRTC answer from peer
   * @param fromPeerId - Peer who sent the answer
   * @param answer - SDP answer
   */
  async handleAnswer(
    fromPeerId: string,
    answer: RTCSessionDescriptionInit
  ): Promise<void> {
    const pc = this.peerConnections.get(fromPeerId)
    if (!pc) {
      throw new Error(`No peer connection found for ${fromPeerId}`)
    }

    await pc.setRemoteDescription(new RTCSessionDescription(answer))
    console.log(`Received WebRTC answer from ${fromPeerId}`)
  }

  /**
   * Handle incoming ICE candidate from peer
   * @param fromPeerId - Peer who sent the candidate
   * @param candidate - ICE candidate
   */
  async handleIceCandidate(
    fromPeerId: string,
    candidate: RTCIceCandidateInit
  ): Promise<void> {
    const pc = this.peerConnections.get(fromPeerId)
    if (!pc) {
      console.warn(`No peer connection found for ${fromPeerId}`)
      return
    }

    await pc.addIceCandidate(new RTCIceCandidate(candidate))
    console.log(`Added ICE candidate from ${fromPeerId}`)
  }

  /**
   * Cleanup peer connection
   * @param peerId - Peer to disconnect from
   */
  closePeerConnection(peerId: string): void {
    const pc = this.peerConnections.get(peerId)
    if (pc) {
      pc.close()
      this.peerConnections.delete(peerId)
      this.remoteStreams.delete(peerId)
    }
  }

  /**
   * Get remote stream for a specific peer
   * @param peerId - Peer socket ID
   */
  getRemoteStream(peerId: string): MediaStream | undefined {
    return this.remoteStreams.get(peerId)
  }

  /**
   * Get all remote streams
   */
  getAllRemoteStreams(): Map<string, MediaStream> {
    return this.remoteStreams
  }
}
```

#### 2. RoomConnection - Setup Event Listeners in Constructor

```typescript
constructor(roomId: string, user: User, serverUrl: string) {
  // ... existing constructor code ...

  // WebRTC signaling event listeners
  this.socket.on('webrtc:offer', async ({ fromPeerId, offer }) => {
    console.log(`Received WebRTC offer from ${fromPeerId}`)
    await this.handleOffer(fromPeerId, offer)
  })

  this.socket.on('webrtc:answer', async ({ fromPeerId, answer }) => {
    console.log(`Received WebRTC answer from ${fromPeerId}`)
    await this.handleAnswer(fromPeerId, answer)
  })

  this.socket.on('webrtc:ice-candidate', async ({ fromPeerId, candidate }) => {
    console.log(`Received ICE candidate from ${fromPeerId}`)
    await this.handleIceCandidate(fromPeerId, candidate)
  })

  // Handle user_joined - setup peer connection
  this.socket.on('user_joined', ({ userId, socketId }) => {
    console.log(`User ${userId} joined, socket: ${socketId}`)
    // Frontend will decide whether to initiate peer connection
    this.emit('user_joined', { userId, socketId })
  })

  // Handle user_left - cleanup peer connection
  this.socket.on('user_left', ({ socketId }) => {
    console.log(`User left, socket: ${socketId}`)
    this.closePeerConnection(socketId)
    this.emit('user_left', { socketId })
  })
}
```

#### 3. RealTimeCommunicationSystem (Server) - WebRTC Signaling Relay

```typescript
/**
 * Server ONLY relays WebRTC signals between peers
 * Actual media flows P2P between clients
 */
class RealTimeCommunicationSystem {
  setupWebRTCSignaling(socket: Socket, io: Server) {
    // Relay offer to target peer
    socket.on('webrtc:offer', ({ targetPeerId, offer }) => {
      console.log(`Relaying WebRTC offer: ${socket.id} → ${targetPeerId}`)

      io.to(targetPeerId).emit('webrtc:offer', {
        fromPeerId: socket.id,
        offer
      })
    })

    // Relay answer to target peer
    socket.on('webrtc:answer', ({ targetPeerId, answer }) => {
      console.log(`Relaying WebRTC answer: ${socket.id} → ${targetPeerId}`)

      io.to(targetPeerId).emit('webrtc:answer', {
        fromPeerId: socket.id,
        answer
      })
    })

    // Relay ICE candidate to target peer
    socket.on('webrtc:ice-candidate', ({ targetPeerId, candidate }) => {
      console.log(`Relaying ICE candidate: ${socket.id} → ${targetPeerId}`)

      io.to(targetPeerId).emit('webrtc:ice-candidate', {
        fromPeerId: socket.id,
        candidate
      })
    })
  }
}
```

### Frontend Expectations

**Events Frontend Will Emit**:
```typescript
// Send WebRTC offer to peer
socket.emit('webrtc:offer', {
  targetPeerId: string,
  offer: RTCSessionDescriptionInit
})

// Send WebRTC answer to peer
socket.emit('webrtc:answer', {
  targetPeerId: string,
  answer: RTCSessionDescriptionInit
})

// Send ICE candidate to peer
socket.emit('webrtc:ice-candidate', {
  targetPeerId: string,
  candidate: RTCIceCandidateInit
})
```

**Events Frontend Will Listen**:
```typescript
// Receive WebRTC offer from peer
connection.on('webrtc:offer', ({ fromPeerId, offer }) => {
  // Automatically handle and send answer
})

// Receive WebRTC answer from peer
connection.on('webrtc:answer', ({ fromPeerId, answer }) => {
  // Set remote description
})

// Receive ICE candidate from peer
connection.on('webrtc:ice-candidate', ({ fromPeerId, candidate }) => {
  // Add to peer connection
})

// Remote stream added
connection.on('remote_stream_added', ({ peerId, stream }) => {
  // Display in <video> element
})

// Remote stream removed
connection.on('remote_stream_removed', ({ peerId }) => {
  // Remove <video> element
})
```

**Frontend Usage Flow**:
```typescript
// 1. Get local media
const stream = await navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true
})

// 2. When new participant joins, setup peer connection
connection.on('user_joined', async ({ socketId }) => {
  if (isTeacher) {
    // Teacher initiates connection
    await connection.setupPeerConnection(socketId, stream)
    await connection.createOffer(socketId)
  }
})

// 3. When offer received (student side)
connection.on('webrtc:offer', async ({ fromPeerId, offer }) => {
  await connection.setupPeerConnection(fromPeerId, stream)
  // Answer is automatically sent in handleOffer()
})

// 4. Display remote streams
connection.on('remote_stream_added', ({ peerId, stream }) => {
  const videoElement = document.getElementById(`peer-${peerId}`)
  videoElement.srcObject = stream
})
```

---

## v1.3.0 - Screen Sharing

### Overview
Allow teachers to share their screen instead of camera feed.

### Backend Implementation Required

#### RoomConnection - New Methods

```typescript
export class RoomConnection {
  private screenShareStream: MediaStream | null = null
  private originalVideoTrack: MediaStreamTrack | null = null

  /**
   * Start screen sharing
   * Replaces camera video with screen video in all peer connections
   */
  async startScreenShare(): Promise<MediaStream> {
    try {
      // Get screen share stream
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          cursor: 'always',
          displaySurface: 'monitor'
        },
        audio: false
      })

      this.screenShareStream = screenStream
      const screenTrack = screenStream.getVideoTracks()[0]

      // Replace video track in all peer connections
      this.peerConnections.forEach((pc, peerId) => {
        const sender = pc.getSenders().find(s => s.track?.kind === 'video')
        if (sender) {
          // Save original camera track
          this.originalVideoTrack = sender.track
          // Replace with screen track
          sender.replaceTrack(screenTrack)
        }
      })

      // Handle screen share stop (user clicks "Stop Sharing" in browser)
      screenTrack.onended = () => {
        this.stopScreenShare()
      }

      this.emit('screen_share_started')

      return screenStream
    } catch (error) {
      console.error('Failed to start screen share:', error)
      throw error
    }
  }

  /**
   * Stop screen sharing
   * Switches back to camera video
   */
  stopScreenShare(): void {
    if (!this.screenShareStream) return

    // Stop screen tracks
    this.screenShareStream.getTracks().forEach(track => track.stop())

    // Switch back to camera in all peer connections
    if (this.originalVideoTrack) {
      this.peerConnections.forEach(pc => {
        const sender = pc.getSenders().find(s => s.track?.kind === 'video')
        if (sender) {
          sender.replaceTrack(this.originalVideoTrack!)
        }
      })
    }

    this.screenShareStream = null
    this.originalVideoTrack = null

    this.emit('screen_share_stopped')
  }

  /**
   * Check if currently screen sharing
   */
  isScreenSharing(): boolean {
    return this.screenShareStream !== null
  }
}
```

### Frontend Expectations

**New Events**:
```typescript
// Screen share started
connection.on('screen_share_started', () => {
  // Update UI to show "Sharing Screen" status
})

// Screen share stopped
connection.on('screen_share_stopped', () => {
  // Update UI to show "Camera" status
})
```

**Frontend Usage**:
```typescript
// Start screen share
const toggleScreenShare = async () => {
  if (connection.isScreenSharing()) {
    connection.stopScreenShare()
  } else {
    await connection.startScreenShare()
  }
}
```

---

## Testing Requirements

### Unit Tests

Backend team should create tests for:

```typescript
describe('RoomConnection - WebRTC', () => {
  it('should create peer connection with correct ICE servers', async () => {
    const pc = await connection.setupPeerConnection('peer1', mockStream)
    expect(pc).toBeInstanceOf(RTCPeerConnection)
  })

  it('should send offer via socket', async () => {
    await connection.createOffer('peer1')
    expect(mockSocket.emit).toHaveBeenCalledWith('webrtc:offer', expect.any(Object))
  })

  it('should handle incoming offer and send answer', async () => {
    await connection.handleOffer('peer1', mockOffer)
    expect(mockSocket.emit).toHaveBeenCalledWith('webrtc:answer', expect.any(Object))
  })

  it('should cleanup peer connection on user leave', () => {
    connection.closePeerConnection('peer1')
    expect(connection.peerConnections.has('peer1')).toBe(false)
  })
})

describe('RealTimeCommunicationSystem - Signaling', () => {
  it('should relay offer from sender to receiver', () => {
    socket.emit('webrtc:offer', { targetPeerId: 'peer2', offer: mockOffer })
    expect(io.to).toHaveBeenCalledWith('peer2')
  })

  it('should clear room on lecture end', () => {
    commsSystem.clearRoom('room_123')
    expect(commsSystem.roomParticipants.has('room_123')).toBe(false)
  })
})
```

### Integration Tests

Test full WebRTC flow:

```typescript
describe('WebRTC Integration', () => {
  it('should establish P2P connection between two users', async () => {
    // User A joins
    const userA = new RoomConnection('room1', teacherUser, 'ws://localhost:3001')
    await userA.connect()

    // User B joins
    const userB = new RoomConnection('room1', studentUser, 'ws://localhost:3001')
    await userB.connect()

    // User A starts stream
    const streamA = await getUserMedia()
    await userA.setupPeerConnection(userB.socket.id, streamA)
    await userA.createOffer(userB.socket.id)

    // Wait for connection
    await waitFor(() => {
      const streamB = userB.getRemoteStream(userA.socket.id)
      expect(streamB).toBeDefined()
    })
  })
})
```

### Manual Testing Checklist

- [ ] Two users can establish video connection
- [ ] Audio works both ways
- [ ] Screen share switches from camera
- [ ] Screen share stops when browser button clicked
- [ ] Connection survives network hiccups
- [ ] Room cleanup removes all WebRTC connections
- [ ] Multiple participants (3+) can all see each other

---

## Notes for Backend Team

### Important Considerations

1. **STUN/TURN Servers**: Currently using Google's free STUN. For production, consider:
   - Twilio Network Traversal Service
   - Your own TURN server (coturn)
   - Both STUN and TURN for best connectivity

2. **Peer Connection Limits**: P2P works well up to ~4-6 participants. For larger classes, consider SFU (v2.0 roadmap).

3. **Error Handling**: WebRTC can fail for many reasons (permissions, network, codec support). Provide clear error messages.

4. **Cleanup**: CRITICAL to cleanup peer connections when users leave or room ends. Memory leaks are common.

5. **Browser Support**: WebRTC support is excellent in modern browsers, but test on:
   - Chrome/Edge (best support)
   - Firefox (good support)
   - Safari (good but some quirks)

### Questions for Backend Team?

If anything is unclear, please reach out:
- How should STUN/TURN servers be configured?
- Should we support fallback to server relay if P2P fails?
- Any specific error handling requirements?
- Performance monitoring needs?

---

## Version History

- **v1.0** (2025-11-08): Initial API contract
- **v1.1** (TBD): Updates based on integration testing
