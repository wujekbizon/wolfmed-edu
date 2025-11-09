# WebRTC Peer Connection Issues - Additional Findings

## Issue #4: setupPeerConnection Cannot Handle Null Streams (BACKEND)

### Problem
The `@teaching-playground/core` package's `RoomConnection.setupPeerConnection()` method crashes when called with a `null` or `undefined` stream.

### Error
```
TypeError: Cannot read properties of null (reading 'getTracks')
at RoomConnection.setupPeerConnection (RoomConnection.js:426:21)
```

### Root Cause
The backend code tries to call `stream.getTracks()` without checking if stream is null:

```typescript
// Backend code (RoomConnection.js:426)
setupPeerConnection(peerId, stream) {
  const tracks = stream.getTracks() // ← Crashes if stream is null!
  // ... rest of setup
}
```

### Expected Behavior
`setupPeerConnection` should handle null/undefined streams gracefully:

```typescript
setupPeerConnection(peerId, stream) {
  // Create RTCPeerConnection even without tracks
  const pc = new RTCPeerConnection(this.iceServers)

  // Only add tracks if stream is provided
  if (stream) {
    const tracks = stream.getTracks()
    tracks.forEach(track => pc.addTrack(track, stream))
  }

  this.peerConnections.set(peerId, pc)
  return pc
}
```

### Use Case
This is needed for the following scenario:
1. Student joins room **without** starting their camera (no local stream)
2. Teacher joins and starts streaming
3. Student needs a peer connection to **receive** teacher's offer
4. Student should be able to create peer connection without having their own stream yet
5. Later, student can add tracks with `pc.addTrack()` when they start their camera

### Workaround (Frontend)
Frontend now only calls `setupPeerConnection` if it has a local stream. The backend should automatically handle incoming offers by creating peer connections on-demand.

### Impact
Without this fix, students who join without starting their camera first cannot receive video from teachers who join later.

---

## Issue #5: user_joined Not Emitted to Existing Participants?

### Problem
When a teacher joins a room where a student is already present, the student may not be notified via `user_joined` event.

### Evidence
User reported: "when teacher join in to the room student doesn't see that"

### Expected Behavior
When User B joins a room where User A already exists:

1. Backend emits `user_joined` to **all existing participants in the room** (User A)
2. User A receives the event and adds User B to their participant list
3. Backend sends `room_state` to User B with all participants (including User A)

### Current Behavior (Suspected)
- `user_joined` might only be emitted to the new joiner, not existing participants
- OR the event is emitted but doesn't trigger UI updates properly

### Testing Needed
1. Student joins room (doesn't start camera)
2. Teacher joins room (starts camera immediately)
3. Check Student's browser console for `user_joined` event
4. Check Student's participant list UI - should show teacher
5. Check backend logs - should show "Emitting user_joined to socket [student-socket-id]"

### Related Code
```typescript
// Backend - when user joins room
socket.on('join_room', ({ roomId, userId }) => {
  // Add user to room
  rooms.get(roomId).add(socket.id)

  // CRITICAL: Emit to ALL OTHER participants in room
  socket.to(roomId).emit('user_joined', {
    userId,
    socketId: socket.id,
    username: user.username
  })

  // Send room_state to the new joiner
  socket.emit('room_state', {
    participants: getAllParticipantsInRoom(roomId)
  })
})
```

---

## Summary

Both issues require backend fixes:

**Issue #4**: `setupPeerConnection` should accept null streams
**Issue #5**: Verify `user_joined` is emitted to existing room participants

Recommend including these in v1.4.2 hotfix along with the database caching fix.
