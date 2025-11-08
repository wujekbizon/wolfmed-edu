# Teaching Playground - Development Roadmap

**Purpose**: Complete roadmap from MVP to production-ready video platform

**Architecture Philosophy**: Follow industry standards from Zoom, Google Meet, Microsoft Teams

**Last Updated**: 2025-11-08

---

## Current Status (v1.2.0)

✅ **MVP Foundation Complete** (v1.1.3 - v1.3.0):
- Room creation and management
- User join/leave with WebSocket
- Chat messaging with rate limiting
- Participant tracking (WebSocket memory)
- Industry-standard architecture (DB = persistent, WS = ephemeral)
- Automatic room cleanup (30min inactivity)
- **Room cleanup on lecture end** (v1.1.3) ✅
- **WebRTC video/audio streaming** (v1.2.0) ✅
- **Screen sharing** (v1.3.0) ✅

🎯 **Next Phase**: Production Polish (v1.4.x - v1.9.x)
- Recording, advanced chat, whiteboard, breakout rooms

---

## Development Phases

### Phase 1: MVP Foundation (v1.1.x - v1.3.0) ✅ COMPLETED

**Goal**: Production-ready 1-on-1 or small group (4-6 people) teaching platform

**Status**: ✅ All features implemented and tested

---

#### v1.1.3 - Room Cleanup ✅ COMPLETED
**Priority**: CRITICAL - Bug fix
**Duration**: 1 week
**Completed**: 2025-11-08

**Backend Tasks**:
- [x] Add `clearRoom()` method to RealTimeCommunicationSystem
- [x] Call `clearRoom()` when lecture ends (completed/cancelled)
- [x] Emit `room_cleared` event to all clients
- [x] Test with multiple concurrent lectures

**Frontend Tasks**:
- [x] Handle `room_cleared` event
- [x] Reset state when entering "available" room
- [x] Show notification when room is cleared (RoomCleanupNotice component)
- [x] Add loading state for room entry

**Implementation Details**:
- **Component**: `RoomCleanupNotice.tsx` - Blue notification with auto-dismiss
- **Integration**: `RoomView.tsx` - Event handling and state management
- **User Experience**: Notification appears when backend clears room, auto-dismisses after 5s

**Success Criteria**: ✅ No old data visible in reused rooms

---

#### v1.2.0 - WebRTC Media Streaming ✅ COMPLETED
**Priority**: CRITICAL - Core feature
**Duration**: 2-3 weeks
**Completed**: 2025-11-08

**Backend Tasks**:
- [x] Implement peer connection setup in RoomConnection (`setupPeerConnection()`)
- [x] Add WebRTC signaling relay in RealTimeCommunicationSystem
- [x] Handle offer/answer exchange
- [x] Handle ICE candidate exchange
- [x] Add connection state tracking
- [x] Implement peer connection cleanup
- [x] Emit `remote_stream_added` / `remote_stream_removed` events

**Frontend Tasks**:
- [x] Video grid layout component (VideoGrid.tsx - 3 layouts: gallery/speaker/sidebar)
- [x] Multi-participant video display (VideoTile.tsx with overlays)
- [x] Auto-layout based on participant count (1-12 participants)
- [x] Video quality indicators (connection quality dots)
- [x] Connection status per participant
- [x] Mute/unmute controls (audio/video toggles)
- [x] Camera on/off controls
- [x] Voice activity detection (speaking indicators)
- [x] useWebRTC hook for state management

**Implementation Details**:
- **Package Integration**: Uses `@teaching-playground/core` v1.2.0 events
- **Architecture**: Package handles peer connections, frontend manages UI
- **Components**: VideoGrid, VideoTile, useWebRTC hook
- **Layouts**: Gallery (grid), Speaker (main + thumbnails), Sidebar (main + vertical list)
- **Voice Detection**: Web Audio API for speaking indicators

**Technical Details**:

**WebRTC Flow**:
```
1. Teacher clicks "Start Stream"
   ↓
2. getUserMedia() → Get camera/mic
   ↓
3. For each student in room:
   - Create RTCPeerConnection
   - Add local tracks
   - Create offer
   - Send via WebSocket
   ↓
4. Student receives offer
   ↓
5. Student creates answer
   - Setup RTCPeerConnection
   - Set remote description (offer)
   - Create answer
   - Send via WebSocket
   ↓
6. Exchange ICE candidates
   ↓
7. P2P connection established
   ↓
8. Video/audio flows directly between peers
```

**STUN/TURN Configuration**:
```typescript
const iceServers = {
  iceServers: [
    // Public STUN servers (free, for testing)
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },

    // For production, add TURN server:
    {
      urls: 'turn:your-turn-server.com:3478',
      username: 'user',
      credential: 'password'
    }
  ]
}
```

**Testing**:
```
Test Case 1: Two-Way Video
1. Teacher starts stream
2. Student joins
3. Both see each other's video
4. Audio works both directions

Test Case 2: Multiple Students
1. Teacher starts stream
2. 3 students join sequentially
3. All students see teacher
4. Teacher sees all students

Test Case 3: Network Recovery
1. Connection established
2. Simulate network interruption
3. Verify: Reconnection attempt
4. Verify: ICE restart if needed

Test Case 4: Cleanup
1. Student leaves
2. Verify: Peer connection closed
3. Verify: No memory leak
```

**Performance Targets**:
- Connection establishment: < 3 seconds
- P2P latency: < 200ms
- Video quality: 720p @ 30fps (high quality mode)
- CPU usage: < 50% for 4-person call

**Success Criteria**: ✅ Reliable video/audio streaming for up to 6 participants

---

#### v1.3.0 - Screen Sharing ✅ COMPLETED
**Priority**: HIGH - Key teaching feature
**Duration**: 1 week
**Completed**: 2025-11-08

**Backend Tasks**:
- [x] Add `startScreenShare()` method to RoomConnection
- [x] Add `stopScreenShare()` method
- [x] Handle track replacement in peer connections
- [x] Emit `screen_share_started` / `screen_share_stopped` events
- [x] Handle browser "Stop Sharing" button automatically

**Frontend Tasks**:
- [x] Screen share toggle button (teacher only - purple theme)
- [x] Show screen in VideoTile when sharing
- [x] Purple "Screen" badge indicator
- [x] Handle browser "Stop Sharing" button
- [x] Integrate with RoomControls and useWebRTC hook

**Implementation Details**:
- **Component Updates**: RoomControls (button), VideoTile (indicator), useWebRTC (state)
- **Package Integration**: Uses `connection.startScreenShare()` / `stopScreenShare()`
- **User Experience**: Purple button/badge, automatic camera revert on stop
- **Permissions**: Teacher-only feature (matches streaming permissions)
- **Browser Support**: Chrome/Edge/Firefox (Safari iOS not supported)

**Testing Scenarios**:
```
✅ Test Case 1: Basic Screen Share
1. Teacher shares screen
2. Students see screen content
3. Purple "Screen" badge appears
4. Teacher stops sharing
5. Automatically reverts to camera

✅ Test Case 2: Browser Stop Button
1. Teacher shares screen
2. Teacher clicks browser "Stop Sharing"
3. Package emits screen_share_stopped event
4. UI automatically updates
5. Camera feed restored
```

**Success Criteria**: ✅ Seamless screen share with camera fallback

---

### Phase 2: Production Polish (v1.4.x - v1.9.x)

#### v1.4.0 - Recording (2 weeks)
**Priority**: MEDIUM

**Features**:
- [ ] Local recording (MediaRecorder API)
- [ ] Server-side recording (FFmpeg)
- [ ] Recording start/stop controls
- [ ] Save to cloud storage (S3, GCS)
- [ ] Playback interface

#### v1.5.0 - Advanced Chat (1 week)
**Priority**: MEDIUM

**Features**:
- [ ] File sharing
- [ ] Emoji reactions
- [ ] Private messages
- [ ] Chat moderation (teacher can delete)
- [ ] Export chat history

#### v1.6.0 - Whiteboard (2-3 weeks)
**Priority**: MEDIUM

**Features**:
- [ ] Collaborative drawing canvas
- [ ] Basic shapes (line, rectangle, circle)
- [ ] Text annotation
- [ ] Eraser
- [ ] Save/export whiteboard

#### v1.7.0 - Hand Raise & Q&A (1 week)
**Priority**: MEDIUM

**Features**:
- [ ] Hand raise button for students
- [ ] Queue visualization
- [ ] Teacher acknowledge/dismiss
- [ ] Q&A panel
- [ ] Upvote questions

#### v1.8.0 - Breakout Rooms (2-3 weeks)
**Priority**: LOW - Complex feature

**Features**:
- [ ] Create breakout rooms
- [ ] Assign students
- [ ] Timer for activities
- [ ] Teacher can join any room
- [ ] Broadcast message to all rooms

#### v1.9.0 - Advanced Settings (1 week)
**Priority**: LOW

**Features**:
- [ ] Audio/video device selection
- [ ] Quality presets (low/medium/high)
- [ ] Bandwidth usage indicator
- [ ] Advanced network stats
- [ ] Virtual backgrounds (optional)

---

### Phase 3: Enterprise Scale (v2.x)

#### v2.0.0 - SFU Migration (4-6 weeks)
**Priority**: For scaling beyond 10 participants

**Why SFU?**:
```
P2P (Current):
- Works well for 2-6 participants
- Each user sends to every other user
- 5 participants = 4 outgoing streams each = 20 total
- Bandwidth: N×(N-1)

SFU (Selective Forwarding Unit):
- Central server routes streams
- Each user sends 1 stream to server
- Server sends to all others
- 5 participants = 5 streams total
- Bandwidth: N
```

**Implementation Options**:
1. **Mediasoup** (Recommended)
   - TypeScript/JavaScript
   - Excellent performance
   - Active development

2. **Janus**
   - C implementation
   - Very mature
   - Higher learning curve

3. **Jitsi Videobridge**
   - Open source
   - Used by Jitsi Meet
   - Full featured

**Backend Tasks**:
- [ ] Setup Mediasoup server
- [ ] Migrate from P2P to SFU
- [ ] Update signaling for SFU
- [ ] Implement simulcast (send multiple qualities)
- [ ] Add load balancing

**Frontend Tasks**:
- [ ] Minimal changes (abstracted in RoomConnection)
- [ ] Quality selection per participant
- [ ] Better grid layouts for 10+ people

**Success Criteria**: ✅ Support 50+ participants smoothly

---

#### v2.1.0 - Analytics & Monitoring (2 weeks)
**Priority**: MEDIUM - For production

**Features**:
- [ ] Connection quality metrics
- [ ] Participant engagement tracking
- [ ] Recording analytics
- [ ] Error reporting (Sentry integration)
- [ ] Performance dashboards

#### v2.2.0 - Admin Dashboard (2-3 weeks)
**Priority**: MEDIUM

**Features**:
- [ ] User management
- [ ] Lecture scheduling
- [ ] Usage statistics
- [ ] System health monitoring
- [ ] Billing integration (if needed)

---

## Architecture Overview

### Current Architecture (v1.x - P2P)

```
┌─────────────────────────────────────────────────────────┐
│ CLIENT (Browser)                                        │
├─────────────────────────────────────────────────────────┤
│ React Components                                        │
│   ↓                                                     │
│ useRoomConnection Hook                                 │
│   ↓                                                     │
│ RoomConnection (from package)                          │
│   ↓                                                     │
│ WebSocket (Socket.IO) ← Signaling                      │
│ RTCPeerConnection    ← Media (P2P)                     │
└─────────────────────────────────────────────────────────┘
                    ↕ WebSocket
┌─────────────────────────────────────────────────────────┐
│ SERVER (Node.js)                                        │
├─────────────────────────────────────────────────────────┤
│ RealTimeCommunicationSystem                            │
│   - Relays WebRTC signals (offer/answer/ICE)          │
│   - Manages room state                                 │
│   - Handles chat messages                              │
│                                                         │
│ JsonDatabase                                           │
│   - Stores lectures, rooms (persistent)                │
│                                                         │
│ Note: Media flows P2P, NOT through server             │
└─────────────────────────────────────────────────────────┘
```

### Future Architecture (v2.x - SFU)

```
┌─────────────────────────────────────────────────────────┐
│ CLIENT (Browser)                                        │
├─────────────────────────────────────────────────────────┤
│ React Components                                        │
│   ↓                                                     │
│ RoomConnection (abstracted, same API)                  │
│   ↓                                                     │
│ WebSocket ← Signaling                                  │
│ RTCPeerConnection → Media to SFU                       │
└─────────────────────────────────────────────────────────┘
                    ↕ WebSocket          ↕ WebRTC
┌─────────────────────────────────────────────────────────┐
│ SIGNALING SERVER (Node.js)                             │
│   - RealTimeCommunicationSystem                        │
│   - Routes signaling messages                          │
└─────────────────────────────────────────────────────────┘
                           ↕
┌─────────────────────────────────────────────────────────┐
│ MEDIA SERVER (Mediasoup)                               │
│   - Receives streams from all participants             │
│   - Forwards to other participants                     │
│   - Handles simulcast, quality switching               │
└─────────────────────────────────────────────────────────┘
```

---

## Testing Strategy

### Unit Testing
**Tools**: Jest, Testing Library

**Coverage Targets**:
- Utilities: 80%
- Business logic: 70%
- Components: 60%

**Critical Tests**:
- Room management operations
- Participant join/leave
- Message sending/receiving
- WebRTC offer/answer handling

### Integration Testing
**Tools**: Playwright, Cypress

**Test Scenarios**:
- Multi-user room interactions
- WebRTC connection establishment
- Screen share flow
- Room cleanup on lecture end

### E2E Testing
**Tools**: Playwright with multiple browsers

**Test Scenarios**:
```
Scenario 1: Complete Teaching Session
1. Teacher creates lecture
2. Students join (3 users)
3. Teacher shares screen
4. Students chat
5. Teacher ends lecture
6. Verify cleanup

Scenario 2: Connection Recovery
1. Establish connections
2. Simulate network drop
3. Verify reconnection
4. Verify state restoration

Scenario 3: Peak Load
1. 50 students join simultaneously
2. All request video
3. Measure connection time
4. Verify no failures
```

### Performance Testing
**Tools**: Lighthouse, WebPageTest

**Metrics**:
- Initial load time: < 2s
- Time to interactive: < 3s
- WebRTC connection: < 3s
- CPU usage: < 50% (4-person call)
- Memory usage: < 500MB

---

## How Video Platforms Work - Industry Comparison

### Small Meetings (2-10 people) - P2P
**Used by**: Google Meet (< 5), FaceTime

**Architecture**: Peer-to-peer
**Pros**: Low latency, no server costs
**Cons**: Bandwidth scales O(n²)

### Medium Meetings (10-50 people) - SFU
**Used by**: Zoom, Google Meet, Microsoft Teams

**Architecture**: Selective Forwarding Unit
**Pros**: Scales better, simulcast support
**Cons**: Needs media server

### Large Events (50+ people) - MCU
**Used by**: Webex, BlueJeans

**Architecture**: Multipoint Control Unit (compositing)
**Pros**: Low client bandwidth
**Cons**: High server CPU, higher latency

### Our Approach:
- **v1.x**: P2P (like Google Meet small calls)
- **v2.x**: SFU (like Zoom)
- **v3.x**: MCU for large events (if needed)

---

## Timeline Estimates

### Optimistic (Full-time, experienced team):
- v1.1.3: 1 week
- v1.2.0: 2 weeks
- v1.3.0: 1 week
- **MVP Total**: 4 weeks

### Realistic (Part-time, learning curve):
- v1.1.3: 1-2 weeks
- v1.2.0: 3-4 weeks (WebRTC is complex)
- v1.3.0: 1-2 weeks
- **MVP Total**: 6-8 weeks

### Conservative (Safe estimate):
- v1.1.3: 2 weeks
- v1.2.0: 4-6 weeks
- v1.3.0: 2 weeks
- **MVP Total**: 8-10 weeks

---

## Resources & Learning

### WebRTC Learning:
- [WebRTC for the Curious](https://webrtcforthecurious.com/) - Best conceptual guide
- [MDN WebRTC API](https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API)
- [Google WebRTC Samples](https://webrtc.github.io/samples/)

### Reference Implementations:
- [Simple Peer](https://github.com/feross/simple-peer) - Simplified WebRTC wrapper
- [PeerJS](https://peerjs.com/) - Another abstraction
- [Jitsi Meet](https://github.com/jitsi/jitsi-meet) - Full open source platform

### Tools:
- `chrome://webrtc-internals/` - Debug WebRTC connections
- [Twilio STUN/TURN](https://www.twilio.com/stun-turn) - Free tier available
- [Mediasoup Demo](https://mediasoup.org/documentation/v3/mediasoup-demo/) - SFU reference

---

## Success Metrics

### MVP Success (v1.3.0):
- ✅ Teacher can stream video to 4+ students
- ✅ All participants can see/hear each other
- ✅ Screen share works reliably
- ✅ Chat messaging works
- ✅ Room cleanup prevents data leaks
- ✅ Connection success rate > 95%

### Production Success (v2.0.0):
- ✅ Support 50+ participants
- ✅ Recording functionality
- ✅ < 1% error rate
- ✅ 99.9% uptime
- ✅ < 200ms latency
- ✅ Monitoring and analytics

---

## Next Steps

### Immediate (This Week):
1. ✅ Create API contract document
2. ✅ Create roadmap document
3. [ ] Backend team: Review and start v1.1.3
4. [ ] Frontend team: Start v1.1.3 UI (room cleanup)

### Short Term (Next 2 Weeks):
1. [ ] Complete v1.1.3 (room cleanup)
2. [ ] Backend team: Start v1.2.0 (WebRTC)
3. [ ] Frontend team: Design video grid UI

### Medium Term (Next Month):
1. [ ] Complete v1.2.0 (WebRTC streaming)
2. [ ] Begin v1.3.0 (screen sharing)
3. [ ] Comprehensive testing

**Questions?** Reach out to coordinate backend/frontend integration!
