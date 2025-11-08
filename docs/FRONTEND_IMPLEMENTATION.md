# Frontend Implementation Plan

**Strategy**: Build UI/UX assuming package APIs exist. Use mock implementations for testing until backend is ready.

---

## Phase 1: Room Cleanup UI (v1.1.3)

### Components to Create/Update

#### 1. RoomView.tsx - Enhanced State Management
```typescript
// Add room cleanup handling
useEffect(() => {
  // Listen for room_cleared event
  connection.on('room_cleared', ({ roomId, reason }) => {
    setShowCleanupNotice(true)
    setCleanupReason(reason)

    // Clear all local state
    setState({
      messages: [],
      participants: [],
      stream: null,
      systemMessage: `Room was cleared: ${reason}`
    })

    // Auto-hide notice after 5 seconds
    setTimeout(() => setShowCleanupNotice(false), 5000)
  })
}, [connection])

// Reset state when entering "available" room
useEffect(() => {
  if (room.status === 'available') {
    setState({
      messages: [],
      participants: [],
      stream: null,
      isConnected: false
    })
  }
}, [room.status])
```

#### 2. RoomCleanupNotice.tsx - New Component
```typescript
interface RoomCleanupNoticeProps {
  visible: boolean
  reason: string
  onDismiss: () => void
}

export function RoomCleanupNotice({ visible, reason, onDismiss }: RoomCleanupNoticeProps) {
  if (!visible) return null

  return (
    <div className="fixed top-4 right-4 bg-blue-600 text-white px-4 py-3 rounded-lg shadow-lg animate-slide-in">
      <div className="flex items-center gap-3">
        <svg className="w-5 h-5" /* info icon */>
        <div>
          <p className="font-medium">Room Cleared</p>
          <p className="text-sm opacity-90">{reason}</p>
        </div>
        <button onClick={onDismiss} className="ml-4">
          <svg className="w-4 h-4" /* close icon */>
        </button>
      </div>
    </div>
  )
}
```

#### 3. RoomLoadingState.tsx - New Component
```typescript
export function RoomLoadingState() {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto" />
        <p className="mt-4 text-zinc-400">Preparing room...</p>
        <p className="text-sm text-zinc-500">Clearing previous session data</p>
      </div>
    </div>
  )
}
```

---

## Phase 2: WebRTC Video Streaming UI (v1.2.0)

### Components to Create

#### 1. VideoGrid.tsx - Main Video Layout
```typescript
interface VideoGridProps {
  localStream: MediaStream | null
  remoteStreams: Map<string, MediaStream>
  participants: RoomParticipant[]
  layout: 'gallery' | 'speaker' | 'sidebar'
}

export function VideoGrid({
  localStream,
  remoteStreams,
  participants,
  layout
}: VideoGridProps) {
  const gridClass = {
    gallery: 'grid grid-cols-2 md:grid-cols-3 gap-4',
    speaker: 'flex flex-col',
    sidebar: 'grid grid-cols-4 gap-4'
  }

  return (
    <div className={gridClass[layout]}>
      {/* Local video */}
      <VideoTile
        stream={localStream}
        participant={currentUser}
        isLocal={true}
      />

      {/* Remote videos */}
      {Array.from(remoteStreams.entries()).map(([peerId, stream]) => {
        const participant = participants.find(p => p.socketId === peerId)
        return (
          <VideoTile
            key={peerId}
            stream={stream}
            participant={participant}
            isLocal={false}
          />
        )
      })}
    </div>
  )
}
```

#### 2. VideoTile.tsx - Individual Video Display
```typescript
interface VideoTileProps {
  stream: MediaStream | null
  participant?: RoomParticipant
  isLocal: boolean
}

export function VideoTile({ stream, participant, isLocal }: VideoTileProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [audioLevel, setAudioLevel] = useState(0)
  const [connectionQuality, setConnectionQuality] = useState<'good' | 'fair' | 'poor'>('good')

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream
    }
  }, [stream])

  // Monitor audio level for visual indicator
  useEffect(() => {
    if (!stream) return

    const audioContext = new AudioContext()
    const audioSource = audioContext.createMediaStreamSource(stream)
    const analyser = audioContext.createAnalyser()
    audioSource.connect(analyser)

    const dataArray = new Uint8Array(analyser.frequencyBinCount)
    const checkLevel = () => {
      analyser.getByteFrequencyData(dataArray)
      const level = dataArray.reduce((a, b) => a + b) / dataArray.length
      setAudioLevel(level)
      requestAnimationFrame(checkLevel)
    }
    checkLevel()

    return () => audioContext.close()
  }, [stream])

  return (
    <div className="relative bg-zinc-800 rounded-lg overflow-hidden aspect-video">
      {/* Video element */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={isLocal} // Mute local to prevent echo
        className="w-full h-full object-cover"
      />

      {/* Overlay info */}
      <div className="absolute bottom-2 left-2 flex items-center gap-2">
        {/* Name badge */}
        <div className="bg-black/60 px-2 py-1 rounded text-white text-sm">
          {participant?.displayName || participant?.username}
          {isLocal && ' (You)'}
        </div>

        {/* Audio indicator */}
        {audioLevel > 10 && (
          <div className="bg-green-500 w-6 h-6 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-white" /* microphone icon */>
          </div>
        )}

        {/* Connection quality */}
        <ConnectionQualityIndicator quality={connectionQuality} />
      </div>

      {/* No video placeholder */}
      {!stream && (
        <div className="absolute inset-0 flex items-center justify-center bg-zinc-700">
          <div className="text-center">
            <div className="w-16 h-16 bg-zinc-600 rounded-full mx-auto mb-2 flex items-center justify-center">
              <span className="text-2xl text-white">
                {participant?.displayName?.[0] || '?'}
              </span>
            </div>
            <p className="text-zinc-400">No video</p>
          </div>
        </div>
      )}
    </div>
  )
}
```

#### 3. ConnectionQualityIndicator.tsx
```typescript
interface ConnectionQualityIndicatorProps {
  quality: 'excellent' | 'good' | 'fair' | 'poor'
}

export function ConnectionQualityIndicator({ quality }: ConnectionQualityIndicatorProps) {
  const colors = {
    excellent: 'bg-green-500',
    good: 'bg-blue-500',
    fair: 'bg-yellow-500',
    poor: 'bg-red-500'
  }

  const bars = {
    excellent: 4,
    good: 3,
    fair: 2,
    poor: 1
  }

  return (
    <div className="flex items-end gap-0.5 h-4">
      {[1, 2, 3, 4].map((bar) => (
        <div
          key={bar}
          className={`w-1 rounded-sm transition-colors ${
            bar <= bars[quality] ? colors[quality] : 'bg-zinc-600'
          }`}
          style={{ height: `${bar * 25}%` }}
        />
      ))}
    </div>
  )
}
```

#### 4. VideoLayoutSelector.tsx
```typescript
export function VideoLayoutSelector({
  currentLayout,
  onLayoutChange
}: {
  currentLayout: 'gallery' | 'speaker' | 'sidebar'
  onLayoutChange: (layout: 'gallery' | 'speaker' | 'sidebar') => void
}) {
  return (
    <div className="flex gap-2 p-2 bg-zinc-800 rounded-lg">
      <button
        onClick={() => onLayoutChange('gallery')}
        className={`p-2 rounded ${currentLayout === 'gallery' ? 'bg-blue-500' : 'bg-zinc-700'}`}
        title="Gallery View"
      >
        <svg /* grid icon */>
      </button>

      <button
        onClick={() => onLayoutChange('speaker')}
        className={`p-2 rounded ${currentLayout === 'speaker' ? 'bg-blue-500' : 'bg-zinc-700'}`}
        title="Speaker View"
      >
        <svg /* single large icon */>
      </button>

      <button
        onClick={() => onLayoutChange('sidebar')}
        className={`p-2 rounded ${currentLayout === 'sidebar' ? 'bg-blue-500' : 'bg-zinc-700'}`}
        title="Sidebar View"
      >
        <svg /* sidebar icon */>
      </button>
    </div>
  )
}
```

#### 5. useWebRTC.ts - WebRTC Hook
```typescript
export function useWebRTC(
  connection: RoomConnection,
  roomId: string,
  user: User
) {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null)
  const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(new Map())
  const [isStreamActive, setIsStreamActive] = useState(false)

  // Get local media
  const startLocalStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      })

      setLocalStream(stream)
      return stream
    } catch (error) {
      console.error('Failed to get media:', error)
      throw error
    }
  }

  // Setup peer connections when new user joins
  useEffect(() => {
    if (!localStream || !connection) return

    const handleUserJoined = async ({ socketId }: { socketId: string }) => {
      console.log(`Setting up peer connection with ${socketId}`)

      // Setup peer connection
      await connection.setupPeerConnection(socketId, localStream)

      // If we're the teacher, initiate connection
      if (user.role === 'teacher') {
        await connection.createOffer(socketId)
      }
    }

    connection.on('user_joined', handleUserJoined)

    return () => {
      connection.off('user_joined', handleUserJoined)
    }
  }, [connection, localStream, user.role])

  // Handle remote streams
  useEffect(() => {
    if (!connection) return

    const handleRemoteStreamAdded = ({ peerId, stream }: { peerId: string, stream: MediaStream }) => {
      console.log(`Remote stream added from ${peerId}`)
      setRemoteStreams(prev => new Map(prev).set(peerId, stream))
    }

    const handleRemoteStreamRemoved = ({ peerId }: { peerId: string }) => {
      console.log(`Remote stream removed from ${peerId}`)
      setRemoteStreams(prev => {
        const next = new Map(prev)
        next.delete(peerId)
        return next
      })
    }

    connection.on('remote_stream_added', handleRemoteStreamAdded)
    connection.on('remote_stream_removed', handleRemoteStreamRemoved)

    return () => {
      connection.off('remote_stream_added', handleRemoteStreamAdded)
      connection.off('remote_stream_removed', handleRemoteStreamRemoved)
    }
  }, [connection])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop())
      }
    }
  }, [localStream])

  return {
    localStream,
    remoteStreams,
    isStreamActive,
    startLocalStream,
    setIsStreamActive
  }
}
```

#### 6. Updated RoomView.tsx
```typescript
export default function RoomView({ room }: RoomViewProps) {
  const { user } = useUser()
  const [layout, setLayout] = useState<'gallery' | 'speaker' | 'sidebar'>('gallery')

  const {
    localStream,
    remoteStreams,
    isStreamActive,
    startLocalStream
  } = useWebRTC(connection, room.id, roomUser)

  const handleStartStream = async () => {
    try {
      const stream = await startLocalStream()
      // Now call package's startStream
      await connection.startStream('high')
    } catch (error) {
      console.error('Failed to start stream:', error)
    }
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Layout selector */}
      <div className="mb-4">
        <VideoLayoutSelector
          currentLayout={layout}
          onLayoutChange={setLayout}
        />
      </div>

      {/* Video grid */}
      <VideoGrid
        localStream={localStream}
        remoteStreams={remoteStreams}
        participants={state.participants}
        layout={layout}
      />

      {/* Controls */}
      <RoomControls
        room={room}
        isConnected={state.isConnected}
        stream={state.stream}
        localStream={localStream}
        onStartStream={handleStartStream}
        onStopStream={stopStream}
      />

      {/* Sidebar with chat and participants */}
      <div className="grid grid-cols-2 gap-4 mt-4">
        <RoomParticipants participants={state.participants} />
        <RoomChat messages={state.messages} onSendMessage={sendMessage} />
      </div>
    </div>
  )
}
```

---

## Phase 3: Screen Sharing UI (v1.3.0)

### Components to Create/Update

#### 1. ScreenShareButton.tsx
```typescript
export function ScreenShareButton({
  isSharing,
  onToggle,
  disabled
}: {
  isSharing: boolean
  onToggle: () => void
  disabled: boolean
}) {
  return (
    <button
      onClick={onToggle}
      disabled={disabled}
      className={`p-3 rounded-full ${
        isSharing
          ? 'bg-blue-500 hover:bg-blue-600'
          : 'bg-zinc-700 hover:bg-zinc-600'
      } ${disabled && 'opacity-50 cursor-not-allowed'}`}
      title={isSharing ? 'Stop Screen Share' : 'Share Screen'}
    >
      {isSharing ? (
        <svg className="w-6 h-6 text-white" /* stop share icon */>
      ) : (
        <svg className="w-6 h-6 text-white" /* screen share icon */>
      )}
    </button>
  )
}
```

#### 2. Updated RoomControls.tsx
```typescript
export default function RoomControls({ ... }: RoomControlsProps) {
  const [isScreenSharing, setIsScreenSharing] = useState(false)

  const handleScreenShare = async () => {
    try {
      if (isScreenSharing) {
        connection.stopScreenShare()
        setIsScreenSharing(false)
      } else {
        await connection.startScreenShare()
        setIsScreenSharing(true)
      }
    } catch (error) {
      console.error('Screen share error:', error)
    }
  }

  return (
    <div className="flex items-center justify-center space-x-4">
      {/* Audio */}
      <button onClick={toggleAudio}>...</button>

      {/* Video */}
      <button onClick={toggleVideo}>...</button>

      {/* Screen Share */}
      {canStream && (
        <ScreenShareButton
          isSharing={isScreenSharing}
          onToggle={handleScreenShare}
          disabled={!isConnected || !localStream}
        />
      )}

      {/* Stream toggle */}
      {canStream && (
        <button onClick={toggleStream}>...</button>
      )}
    </div>
  )
}
```

#### 3. ScreenShareIndicator.tsx
```typescript
export function ScreenShareIndicator({ username }: { username: string }) {
  return (
    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
      <svg className="w-5 h-5 animate-pulse" /* screen icon */>
      <span className="font-medium">{username} is sharing their screen</span>
    </div>
  )
}
```

---

## Mock Implementations (For Testing Before Backend Ready)

### MockRoomConnection.ts
```typescript
export class MockRoomConnection {
  private mockSocket: any
  private mockPeerConnections: Map<string, RTCPeerConnection> = new Map()

  async setupPeerConnection(peerId: string, localStream: MediaStream) {
    console.log('[MOCK] Setting up peer connection with', peerId)

    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Create real RTCPeerConnection for testing
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    })

    this.mockPeerConnections.set(peerId, pc)
    return pc
  }

  async createOffer(peerId: string) {
    console.log('[MOCK] Creating offer for', peerId)
    await new Promise(resolve => setTimeout(resolve, 500))
  }

  async handleOffer(fromPeerId: string, offer: any) {
    console.log('[MOCK] Handling offer from', fromPeerId)
    await new Promise(resolve => setTimeout(resolve, 500))
  }

  async startScreenShare() {
    console.log('[MOCK] Starting screen share')

    // Use real getDisplayMedia for testing
    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: true
    })

    return stream
  }

  stopScreenShare() {
    console.log('[MOCK] Stopping screen share')
  }
}
```

---

## UI/UX Design Principles

### Visual Hierarchy
1. **Video** - Primary focus, largest area
2. **Controls** - Always visible, bottom center
3. **Participants** - Sidebar, shows who's in room
4. **Chat** - Sidebar, secondary communication

### Responsive Layouts

**Desktop (1920x1080)**:
```
┌─────────────────────────────────────────┐
│  Video Grid (3x2 gallery)               │
│                                         │
│  ┌────┐ ┌────┐ ┌────┐                  │
│  │    │ │    │ │    │                  │
│  └────┘ └────┘ └────┘                  │
│  ┌────┐ ┌────┐ ┌────┐                  │
│  │    │ │    │ │    │                  │
│  └────┘ └────┘ └────┘                  │
│                                         │
│       [Controls Bar]                    │
├──────────────────┬──────────────────────┤
│  Participants    │   Chat               │
│  - Teacher       │   [Messages]         │
│  - Student 1     │                      │
│  - Student 2     │   [Input]            │
└──────────────────┴──────────────────────┘
```

**Tablet (1024x768)**:
```
┌─────────────────────────────────────┐
│  Video Grid (2x2 gallery)           │
│  ┌────────┐ ┌────────┐              │
│  │        │ │        │              │
│  └────────┘ └────────┘              │
│  ┌────────┐ ┌────────┐              │
│  │        │ │        │              │
│  └────────┘ └────────┘              │
│                                     │
│         [Controls]                  │
│                                     │
│  [Chat Tab] [Participants Tab]      │
└─────────────────────────────────────┘
```

**Mobile (375x667)**:
```
┌───────────────┐
│   Main Video  │
│   (Speaker)   │
│               │
│               │
│               │
├───────────────┤
│ [Thumbnails]  │
│ ○ ○ ○ ○       │
├───────────────┤
│  [Controls]   │
└───────────────┘
```

### Color Scheme (Matches Current Design)
- Background: `zinc-900`
- Cards: `zinc-800`
- Borders: `zinc-700`
- Text: `zinc-100` (primary), `zinc-400` (secondary)
- Accents: `blue-500` (primary), `green-500` (success), `red-500` (error)

### Accessibility
- ARIA labels on all buttons
- Keyboard navigation support
- Screen reader friendly
- High contrast mode support
- Focus indicators

---

## Testing Frontend Before Backend Ready

### 1. Use Mock Data
```typescript
const mockParticipants = [
  { id: '1', username: 'teacher', role: 'teacher', ... },
  { id: '2', username: 'student1', role: 'student', ... },
  { id: '3', username: 'student2', role: 'student', ... }
]

const mockMessages = [
  { userId: '1', username: 'teacher', content: 'Welcome!', timestamp: '...' },
  { userId: '2', username: 'student1', content: 'Hi!', timestamp: '...' }
]
```

### 2. Local Media Testing
```typescript
// Test getUserMedia
const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })

// Test screen share
const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true })
```

### 3. RTCPeerConnection Testing
```typescript
// Create two peer connections locally
const pc1 = new RTCPeerConnection()
const pc2 = new RTCPeerConnection()

// Simulate offer/answer exchange
const offer = await pc1.createOffer()
await pc1.setLocalDescription(offer)
await pc2.setRemoteDescription(offer)

const answer = await pc2.createAnswer()
await pc2.setLocalDescription(answer)
await pc1.setRemoteDescription(answer)
```

---

## File Structure

```
src/
├── components/
│   └── teaching-playground/
│       ├── video/
│       │   ├── VideoGrid.tsx
│       │   ├── VideoTile.tsx
│       │   ├── ConnectionQualityIndicator.tsx
│       │   └── VideoLayoutSelector.tsx
│       ├── controls/
│       │   ├── RoomControls.tsx
│       │   ├── ScreenShareButton.tsx
│       │   └── MediaControlButton.tsx
│       ├── notifications/
│       │   ├── RoomCleanupNotice.tsx
│       │   └── ScreenShareIndicator.tsx
│       └── loading/
│           └── RoomLoadingState.tsx
├── hooks/
│   ├── useRoomConnection.ts (existing)
│   └── useWebRTC.ts (new)
└── mocks/
    └── MockRoomConnection.ts
```

---

## Next Steps

1. **Week 1**: Room cleanup UI
   - [ ] Create RoomCleanupNotice
   - [ ] Add cleanup event handling
   - [ ] Test with room state reset

2. **Week 2-3**: WebRTC video UI
   - [ ] Create VideoGrid component
   - [ ] Create VideoTile component
   - [ ] Implement useWebRTC hook
   - [ ] Test with local peer connections

3. **Week 4**: Screen sharing UI
   - [ ] Add screen share button
   - [ ] Implement screen share toggle
   - [ ] Test with getDisplayMedia

4. **Integration**: Connect with backend when ready
   - [ ] Replace mocks with real package
   - [ ] Test multi-user scenarios
   - [ ] Performance optimization

**Ready to start building!** 🚀
