# Frontend Implementation Documentation

**Last Updated**: 2025-11-08
**Package Version**: @teaching-playground/core v1.2.0
**Status**: ✅ MVP Foundation Complete (v1.1.3 - v1.3.0)

---

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Completed Features](#completed-features)
3. [Component Documentation](#component-documentation)
4. [Hooks Documentation](#hooks-documentation)
5. [Integration Guide](#integration-guide)
6. [Testing Notes](#testing-notes)

---

## Architecture Overview

### Industry-Standard Pattern
```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (React)                      │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  RoomView (Main Component)                          │   │
│  │  ├─ useRoomConnection (WebSocket state)             │   │
│  │  ├─ useWebRTC (Media streaming)                     │   │
│  │  ├─ VideoGrid (Layout management)                   │   │
│  │  │  └─ VideoTile[] (Individual video displays)      │   │
│  │  ├─ RoomControls (Audio/Video/Screen share)         │   │
│  │  ├─ RoomChat (Text messaging)                       │   │
│  │  └─ RoomParticipants (Participant list)             │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↓ WebSocket + WebRTC
┌─────────────────────────────────────────────────────────────┐
│              @teaching-playground/core Package               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  RoomConnection (Client API)                        │   │
│  │  ├─ WebSocket Events (Signaling)                    │   │
│  │  ├─ RTCPeerConnection Management                    │   │
│  │  ├─ STUN Server Configuration                       │   │
│  │  └─ Screen Sharing API                              │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↓ Socket.IO
┌─────────────────────────────────────────────────────────────┐
│                    Backend (Node.js)                         │
│  ├─ WebSocket Signaling Relay                               │
│  ├─ Room State Management                                   │
│  └─ Event Broadcasting                                      │
└─────────────────────────────────────────────────────────────┘
```

### Key Architectural Decisions

1. **Package-Managed WebRTC**: The `@teaching-playground/core` package handles all WebRTC complexity internally
   - Frontend calls high-level methods: `setupPeerConnection()`, `createOffer()`
   - Package manages RTCPeerConnection lifecycle
   - Simplifies frontend to ~360 lines (down from initial ~500 lines)

2. **Event-Driven Communication**: Clean event interfaces
   - `remote_stream_added` / `remote_stream_removed` (instead of low-level signaling)
   - `screen_share_started` / `screen_share_stopped`
   - `room_cleared` for cleanup notifications

3. **State Management**:
   - **Database**: Persistent data (lectures, rooms)
   - **WebSocket**: Ephemeral data (participants, streams, messages)
   - **Zustand**: UI-only state (layout preferences, modals)

---

## Completed Features

### ✅ v1.1.3 - Room Cleanup UI

**Purpose**: Prevent stale data from previous sessions showing when entering a room.

**Components**:
- `RoomCleanupNotice.tsx` - Notification component
- `RoomView.tsx` - Event handling integration

**Implementation**:
```typescript
// src/app/tp/components/RoomView.tsx
useEffect(() => {
  if (!connection) return

  const handleRoomCleared = ({ roomId, reason }: { roomId: string; reason: string }) => {
    console.log(`Room ${roomId} was cleared: ${reason}`)
    setCleanupReason(reason)
    setShowCleanupNotice(true)
  }

  connection.on('room_cleared', handleRoomCleared)

  return () => {
    connection.off('room_cleared', handleRoomCleared)
  }
}, [connection])
```

**Backend Event** (from package v1.1.3):
```typescript
// Emitted by RealTimeCommunicationSystem.clearRoom()
{
  event: 'room_cleared',
  data: {
    roomId: string,
    reason: string  // "Lecture ended", "Lecture cancelled", etc.
  }
}
```

**User Experience**:
- Blue notification appears in top-right corner
- Shows cleanup reason
- Auto-dismisses after 5 seconds
- Manual dismiss with X button
- Smooth slide-in animation

---

### ✅ v1.2.0 - WebRTC Video Streaming

**Purpose**: Peer-to-peer video/audio communication for 2-6 participants.

**Components**:
- `VideoGrid.tsx` - Layout manager (3 modes: gallery/speaker/sidebar)
- `VideoTile.tsx` - Individual video display with overlays
- `useWebRTC.ts` - WebRTC state management hook
- `RoomView.tsx` - Integration layer

**Architecture**: Package-managed peer connections (simplified from initial implementation)

#### VideoGrid Component

**File**: `src/app/tp/components/VideoGrid.tsx`

**Layouts**:
1. **Gallery** - Equal-size grid for all participants
   - 1 participant: 1 column
   - 2 participants: 2 columns
   - 3-4 participants: 2×2 grid
   - 5-6 participants: 3×2 grid
   - 7-9 participants: 3×3 grid
   - 10-12 participants: 4×3 grid

2. **Speaker** - Main speaker with thumbnail strip
   - Large video for active speaker
   - Horizontal thumbnail strip at bottom (h-32, w-40)
   - Click thumbnail to switch active speaker

3. **Sidebar** - Main speaker with vertical sidebar
   - Large video for active speaker
   - Vertical sidebar on right (w-64)
   - Scrollable when many participants

**Props**:
```typescript
interface VideoGridProps {
  participants: Participant[]
  layout: VideoLayout  // 'gallery' | 'speaker' | 'sidebar'
  activeSpeakerId?: string | undefined
  onParticipantClick?: (participantId: string) => void
}
```

**Responsive Design**:
- Desktop: All layouts available
- Tablet: Gallery and speaker work well
- Mobile: Gallery recommended (auto-stacks)

#### VideoTile Component

**File**: `src/app/tp/components/VideoTile.tsx`

**Features**:
- **Video Display**: Renders MediaStream in `<video>` element
- **Avatar Fallback**: Shows initials when video disabled
- **Connection Quality**: Colored dot (green/yellow/red)
- **Speaking Indicator**: Green glowing border when speaking
- **Mute Indicators**: Red badges for audio/video off
- **Local Badge**: Blue "You" badge for current user
- **Screen Share Badge**: Purple "Screen" badge (v1.3.0)
- **Click to Pin**: Click to set as active speaker

**Props**:
```typescript
interface VideoTileProps {
  participant: Participant
  onClick?: () => void
  isHighlighted?: boolean  // Border highlight for active speaker
  className?: string
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
  isScreenSharing?: boolean  // v1.3.0
}
```

**Visual Indicators**:
```
┌─────────────────────────────────────┐
│ 🟢 You  📺 Screen          [Top-Left] │
│                                     │
│         [Video or Avatar]           │
│                                     │
│ John Doe              🔇 📹  [Bottom] │
└─────────────────────────────────────┘
  └─ Green ring when speaking
  └─ Blue border when pinned
```

#### useWebRTC Hook

**File**: `src/hooks/useWebRTC.ts`

**Purpose**: Manages WebRTC state and package integration (simplified in v1.2.0 refactor)

**Package Integration** (v1.2.0):
```typescript
// User joins - setup peer connection
connection.on('user_joined', async ({ user }) => {
  if (localStream) {
    await connection.setupPeerConnection(user.id, localStream)
    await connection.createOffer(user.id)
  }
})

// Receive remote stream (package handles WebRTC negotiation)
connection.on('remote_stream_added', ({ peerId, stream }) => {
  // Display stream in VideoTile
  updateParticipant(peerId, { stream })
})

// Stream removed
connection.on('remote_stream_removed', ({ peerId }) => {
  updateParticipant(peerId, { stream: undefined })
})
```

**API**:
```typescript
const {
  // State
  participants,           // Participant[]
  localStream,           // MediaStream | null
  isVideoEnabled,        // boolean
  isAudioEnabled,        // boolean
  isScreenSharing,       // boolean (v1.3.0)
  connectionStatus,      // 'connecting' | 'connected' | 'disconnected'

  // Methods
  startLocalStream,      // (constraints) => Promise<MediaStream>
  stopLocalStream,       // () => void
  toggleVideo,           // () => void
  toggleAudio,           // () => void
  startScreenShare,      // () => Promise<void> (v1.3.0)
  stopScreenShare,       // () => Promise<void> (v1.3.0)
} = useWebRTC({ roomId, userId, connection, enabled })
```

**Voice Activity Detection**:
- Uses Web Audio API AnalyserNode
- Monitors frequency data for speaking detection
- Threshold: average frequency > 20
- Applied to both local and remote streams
- Updates `participant.isSpeaking` in real-time

**Simplified Implementation** (vs initial version):
- **Removed**: Manual RTCPeerConnection management
- **Removed**: Direct offer/answer/ICE handling
- **Added**: Package event integration (`remote_stream_added`, etc.)
- **Result**: 360 lines (down from 500 lines)

#### RoomView Integration

**File**: `src/app/tp/components/RoomView.tsx`

**Setup**:
```typescript
// Initialize WebRTC
const webrtc = useWebRTC({
  roomId: room.id,
  userId: roomUser.id,
  connection,
  enabled: state.isConnected && room.features.hasVideo
})

// Combine local + remote participants for video display
const videoParticipants = useMemo(() => {
  const participants = [...webrtc.participants]

  if (webrtc.localStream) {
    participants.unshift({
      id: roomUser.id,
      username: roomUser.username,
      stream: webrtc.localStream,
      isLocal: true,
      audioEnabled: webrtc.isAudioEnabled,
      videoEnabled: webrtc.isVideoEnabled,
      isScreenSharing: webrtc.isScreenSharing
    })
  }

  return participants
}, [webrtc.participants, webrtc.localStream, webrtc.isAudioEnabled,
    webrtc.isVideoEnabled, webrtc.isScreenSharing, roomUser.id, roomUser.username])
```

**Layout Controls**:
```typescript
// Layout selector buttons
<div className="flex gap-2">
  <button onClick={() => setVideoLayout('gallery')}>Gallery</button>
  <button onClick={() => setVideoLayout('speaker')}>Speaker</button>
  <button onClick={() => setVideoLayout('sidebar')}>Sidebar</button>
</div>

// Participant count display
<div className="text-sm text-zinc-400">
  {videoParticipants.length} {videoParticipants.length === 1 ? 'participant' : 'participants'}
</div>
```

**Active Speaker Detection**:
```typescript
useEffect(() => {
  const speakingParticipant = videoParticipants.find(p => p.isSpeaking)
  if (speakingParticipant && speakingParticipant.id !== activeSpeakerId) {
    setActiveSpeakerId(speakingParticipant.id)
  }
}, [videoParticipants, activeSpeakerId])
```

---

### ✅ v1.3.0 - Screen Sharing

**Purpose**: Allow teachers to share their screen during lectures.

**Package Integration**:
```typescript
// Package handles screen capture internally
await connection.startScreenShare()  // Replaces camera with screen
await connection.stopScreenShare()   // Switches back to camera
```

**Components Updated**:
1. **RoomControls** - Added screen share button
2. **VideoTile** - Added screen share indicator
3. **useWebRTC** - Added screen sharing state management

#### RoomControls Updates

**File**: `src/app/tp/components/RoomControls.tsx:169-195`

**Screen Share Button**:
```typescript
{canStream && onStartScreenShare && onStopScreenShare && (
  <button
    onClick={() => isScreenSharing ? onStopScreenShare() : onStartScreenShare()}
    disabled={!isConnected || !localStream}
    className={`p-3 rounded-full ${
      isScreenSharing
        ? 'bg-purple-600 hover:bg-purple-700'    // Active: purple
        : 'bg-zinc-600 hover:bg-zinc-500'        // Inactive: gray
    }`}
    title={isScreenSharing ? "Stop Screen Share" : "Start Screen Share"}
  >
    <svg>{/* Monitor icon */}</svg>
  </button>
)}
```

**Permissions**: Only teachers can screen share (matches streaming permissions)

**Props Added**:
```typescript
interface RoomControlsProps {
  // ... existing props
  onStartScreenShare?: () => void | Promise<void>
  onStopScreenShare?: () => void | Promise<void>
  isScreenSharing?: boolean
}
```

#### VideoTile Screen Share Indicator

**File**: `src/app/tp/components/VideoTile.tsx:152-160`

**Purple "Screen" Badge**:
```typescript
{participant.isScreenSharing && (
  <span className="px-2 py-0.5 bg-purple-600 text-white text-xs rounded-md font-medium flex items-center gap-1">
    <svg className="w-3 h-3">{/* Monitor icon */}</svg>
    Screen
  </span>
)}
```

**Positioning**: Top-left corner, displayed alongside "You" badge

#### useWebRTC Screen Sharing Methods

**File**: `src/hooks/useWebRTC.ts:125-164`

**Implementation**:
```typescript
const startScreenShare = useCallback(async () => {
  if (!connection) return

  try {
    await (connection as any).startScreenShare()
    setState(prev => ({ ...prev, isScreenSharing: true }))
  } catch (error) {
    console.error('Failed to start screen sharing:', error)
    throw error
  }
}, [connection])

const stopScreenShare = useCallback(async () => {
  if (!connection) return

  try {
    await (connection as any).stopScreenShare()
    setState(prev => ({ ...prev, isScreenSharing: false }))
  } catch (error) {
    console.error('Failed to stop screen sharing:', error)
    throw error
  }
}, [connection])
```

**Event Handling**:
```typescript
// Package emits events when screen sharing state changes
connection.on('screen_share_started', () => {
  setState(prev => ({ ...prev, isScreenSharing: true }))
})

connection.on('screen_share_stopped', () => {
  setState(prev => ({ ...prev, isScreenSharing: false }))
})
```

**User Experience**:
- Click screen share button → Browser prompts to select screen/window
- Screen replaces camera feed in VideoTile
- Purple "Screen" badge appears
- Browser "Stop Sharing" button also works (package handles this)
- Video automatically reverts to camera when stopped

---

## Component Documentation

### File Structure
```
src/
├── app/tp/components/
│   ├── RoomView.tsx                    # Main room component
│   ├── RoomControls.tsx                # Media controls
│   ├── RoomChat.tsx                    # Text chat
│   ├── RoomParticipants.tsx            # Participant list
│   ├── RoomCleanupNotice.tsx           # Cleanup notification (v1.1.3)
│   ├── VideoGrid.tsx                   # Video layout manager (v1.2.0)
│   └── VideoTile.tsx                   # Individual video display (v1.2.0)
└── hooks/
    ├── useRoomConnection.ts            # WebSocket state
    └── useWebRTC.ts                    # WebRTC state (v1.2.0)
```

### Component Hierarchy
```
RoomView
├── RoomCleanupNotice (v1.1.3)
├── Layout Controls (Gallery/Speaker/Sidebar buttons)
├── VideoGrid (v1.2.0)
│   └── VideoTile[] (with screen share indicator v1.3.0)
├── RoomControls (with screen share button v1.3.0)
├── RoomParticipants
└── RoomChat
```

---

## Hooks Documentation

### useRoomConnection

**File**: `src/hooks/useRoomConnection.ts`

**Purpose**: Manages WebSocket connection and room state

**API**:
```typescript
const {
  state: {
    isConnected,      // boolean
    participants,     // RoomParticipant[]
    messages,         // RoomMessage[]
    stream,           // { isActive, streamerId, quality } | null
    systemMessage,    // string | null
  },
  localStream,        // MediaStream | null
  remoteStreams,      // Map<string, MediaStream>
  sendMessage,        // (content: string) => void
  startStream,        // (quality) => void
  stopStream,         // () => void
  exitRoom,           // () => Promise<void>
  connection,         // RoomConnection | null
} = useRoomConnection({ roomId, user, serverUrl })
```

**Events Handled**:
- `connected` / `disconnected`
- `room_state` - Initial room state
- `user_joined` / `user_left`
- `message` - New chat message
- `message_history` - Historical messages
- `room_cleared` - Room cleanup (v1.1.3)

### useWebRTC

**File**: `src/hooks/useWebRTC.ts`

**Purpose**: Manages WebRTC media streaming (refactored in v1.2.0)

**API**: (See v1.2.0 section above)

**Key Changes in v1.2.0 Refactor**:
- Now uses package events instead of manual peer connection management
- Simplified from 500 lines to 360 lines
- Package handles all WebRTC complexity
- Frontend only manages local stream and voice activity detection

---

## Integration Guide

### Step 1: Room Entry
```typescript
// 1. User navigates to /tp/rooms/[roomId]
// 2. RoomView loads room data from database
// 3. useRoomConnection establishes WebSocket connection
// 4. Backend sends room_state event
// 5. useWebRTC initializes (if hasVideo feature enabled)
```

### Step 2: Start Video
```typescript
// User clicks "Start Streaming" button in RoomControls
const constraints = {
  video: { width: 1920, height: 1080 },  // 'high' quality
  audio: true
}
const stream = await webrtc.startLocalStream(constraints)

// Stream displayed in local VideoTile
// Other participants receive 'user_joined' event
```

### Step 3: Join WebRTC Mesh
```typescript
// When remote user joins:
connection.on('user_joined', async ({ user }) => {
  // Package automatically:
  // 1. Creates RTCPeerConnection
  // 2. Adds local stream tracks
  // 3. Creates SDP offer
  // 4. Sends offer via WebSocket
  await connection.setupPeerConnection(user.id, localStream)
  await connection.createOffer(user.id)
})

// When remote stream ready:
connection.on('remote_stream_added', ({ peerId, stream }) => {
  // Display in VideoTile
})
```

### Step 4: Screen Sharing (Teacher Only)
```typescript
// Teacher clicks screen share button
await webrtc.startScreenShare()

// Package automatically:
// 1. Calls getDisplayMedia()
// 2. Replaces video track in all peer connections
// 3. Emits 'screen_share_started' event

// Stop screen sharing
await webrtc.stopScreenShare()
// Automatically reverts to camera feed
```

### Step 5: Room Exit
```typescript
// User clicks "Exit Room"
await exitRoom()

// Cleanup:
// 1. Stops local stream (camera/mic)
// 2. Closes all peer connections
// 3. Disconnects WebSocket
// 4. Navigates to /tp/rooms
```

---

## Testing Notes

### TypeScript Compliance
- ✅ All strict mode checks passing
- ✅ `exactOptionalPropertyTypes` compliance
- ✅ No any types except for package method calls (startScreenShare, etc.)

### Browser Compatibility
- **Chrome/Edge**: Full support (recommended)
- **Firefox**: Full support
- **Safari**: WebRTC supported, test screen sharing
- **Mobile**: getUserMedia requires HTTPS

### Testing Scenarios

#### 1. Room Cleanup (v1.1.3)
```
Test: Lecture ends while student in room
Expected:
- Blue notification appears "Room Cleared: Lecture ended"
- Auto-dismisses after 5 seconds
- Can manually dismiss with X button
```

#### 2. Video Streaming (v1.2.0)
```
Test: 2 users join room and start video
Expected:
- Both see each other's video
- Speaking indicators work
- Can toggle audio/video
- Can switch layouts (Gallery/Speaker/Sidebar)
- Connection quality indicators update
```

#### 3. Screen Sharing (v1.3.0)
```
Test: Teacher shares screen
Expected:
- Screen replaces camera in VideoTile
- Purple "Screen" badge appears
- Students see screen feed
- Stop button reverts to camera
- Browser "Stop Sharing" also works
```

### Performance Considerations
- **2-4 participants**: Excellent (P2P mesh ideal)
- **5-6 participants**: Good (multiple peer connections)
- **7-10 participants**: Moderate (CPU/bandwidth intensive)
- **10+ participants**: Consider SFU architecture (v2.0 roadmap)

### Known Limitations
1. **P2P Mesh**: Doesn't scale beyond ~10 participants
2. **NAT Traversal**: Requires STUN servers (using Google's public STUN)
3. **Firewall Issues**: Some corporate firewalls block WebRTC
4. **Mobile Safari**: Screen sharing not supported on iOS

---

## Next Steps (v1.4.x - v1.9.x)

Per roadmap (docs/ROADMAP.md), the MVP foundation is complete. Next phase focuses on production polish:

### v1.4.0 - Recording (2 weeks)
- Record button in RoomControls
- Recording indicator in VideoTile
- Server-side recording (MediaRecorder API)
- Download/playback UI

### v1.5.0 - Advanced Chat (1 week)
- File sharing
- Emoji reactions
- @mentions
- Read receipts

### v1.6.0 - Interactive Whiteboard (3 weeks)
- Canvas-based drawing
- Real-time synchronization
- Shape tools, text, images
- Save/export whiteboard

### v1.7.0 - Breakout Rooms (2 weeks)
- Create sub-rooms
- Move participants
- Broadcast messages to all rooms
- Rejoin main room

### v1.8.0 - Polling & Q&A (1 week)
- Live polls with real-time results
- Q&A queue management
- Upvoting questions

### v1.9.0 - Advanced Moderation (1 week)
- Kick/ban participants
- Mute all students
- Disable features per room
- Activity monitoring

---

## Appendix: Event Reference

### WebSocket Events (Handled by Frontend)

#### v1.1.3 Events
```typescript
room_cleared: {
  roomId: string
  reason: string
}
```

#### v1.2.0 Events
```typescript
user_joined: {
  user: { id: string, username: string }
}

user_left: {
  userId: string
}

remote_stream_added: {
  peerId: string
  stream: MediaStream
}

remote_stream_removed: {
  peerId: string
}
```

#### v1.3.0 Events
```typescript
screen_share_started: {}

screen_share_stopped: {}
```

### Package Methods (Called by Frontend)

#### v1.2.0 Methods
```typescript
connection.setupPeerConnection(peerId: string, localStream: MediaStream): Promise<void>
connection.createOffer(peerId: string): Promise<void>
```

#### v1.3.0 Methods
```typescript
connection.startScreenShare(): Promise<void>
connection.stopScreenShare(): Promise<void>
connection.isScreenSharing(): boolean
```

---

**Document Version**: 2.0
**Last Updated**: 2025-11-08
**Contributors**: Claude (AI), Teaching Playground Team
