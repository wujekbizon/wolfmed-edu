# @teaching-playground/core Backend Hotfix Requirements

## Package Version
Current: `v1.3.1`
Recommended hotfix version: `v1.3.2`

---

## Issue #1: room_state Event Missing Existing Participants (CRITICAL)

### Problem
When a user joins a room where other participants already exist, the `room_state` event only includes the new user, not the existing participants.

### Evidence from Logs

**Scenario**: Teacher joins room first, then student joins.

**Teacher's perspective** (joined first):
- Receives `room_state` with 2 participants correctly
- Can see both teacher and student

**Student's perspective** (joined late):
```javascript
Room participants from state: Array(1)
  0: {
    id: 'user_35CHlksJp30UR5okOLTnBu3yAeM',  // Student's own ID
    username: 'grzegorz.wolfinger@gmail.com',
    role: 'student',
    // ... only the student themselves
  }
```

The student should also see the teacher in this array, but doesn't.

### Expected Behavior
When a client receives the `room_state` event (triggered by joining a room), it should include **ALL participants currently in the room**, not just the new joiner.

### Backend Fix Required
In `RoomConnection` or room state management:

```typescript
// When emitting room_state to a newly joined client
socket.on('join_room', async (data) => {
  const { roomId, userId } = data

  // Get ALL participants currently in the room (not just the new user)
  const allParticipants = await getRoomParticipants(roomId) // Should include existing users

  // Emit room_state with complete participant list
  socket.emit('room_state', {
    stream: roomState.stream,
    participants: allParticipants  // ← MUST include everyone, not just new joiner
  })
})
```

### Test Case
1. User A (teacher) joins room → receives `room_state` with 1 participant (themselves)
2. User B (student) joins same room → receives `room_state` with **2 participants** (themselves + User A)
3. User C joins → receives `room_state` with **3 participants** (themselves + User A + User B)

---

## Issue #2: Kick Participant Not Working

### Problem
When teacher clicks "Kick Participant" button and confirms the dialog, nothing happens. No error on backend, participant stays in room.

### Frontend Implementation (for reference)
```typescript
// In RoomParticipants.tsx
const handleKickParticipant = (participantId: string) => {
  if (window.confirm(`Are you sure you want to remove this participant from the room?`)) {
    onKickParticipant(participantId, 'Removed by teacher')
  }
}

// This calls kickParticipant from useRoomConnection
kickParticipant(targetUserId, reason)

// Which emits:
connection.emit('kick_participant', {
  roomId,
  targetUserId,
  requesterId: currentUser.id,
  reason
})
```

### Expected Behavior
1. Teacher emits `kick_participant` event with `{ roomId, targetUserId, requesterId, reason }`
2. Backend validates teacher has permission
3. Backend removes target user from room
4. Backend emits `participant_kicked` to all room members
5. Backend emits `kicked_from_room` to the kicked user
6. Kicked user's connection is disconnected

### Backend Verification Needed
Check if the `kick_participant` event handler is properly:
- Receiving the event
- Validating teacher permissions
- Removing participant from room state
- Emitting the response events
- Disconnecting the kicked user's socket

### Test Case
1. Teacher in room with student
2. Teacher clicks kick button for student
3. Confirms dialog
4. Student should receive `kicked_from_room` event
5. Student should be disconnected
6. Student should be removed from room participants list
7. All remaining participants should receive `participant_kicked` event

---

## Issue #3: Mute Participant Status (UNTESTED - Needs Verification)

### Current Implementation
Teacher can emit `mute_participant` and `mute_all_participants` events. Need to verify:
- Does backend properly handle these events?
- Does backend emit `muted_by_teacher` to target user?
- Does backend emit `mute_all` to all participants?

### Expected Flow
```
Teacher → emit('mute_participant', { targetUserId })
  → Backend validates permission
  → Backend emits('muted_by_teacher', { requestedBy, timestamp }) to target
  → Target's audio should be disabled (client-side handling)

Teacher → emit('mute_all_participants')
  → Backend validates permission
  → Backend emits('mute_all', { requestedBy, timestamp }) to all non-teachers
  → All students' audio should be disabled (client-side handling)
```

---

## WebSocket Server Logs Analysis

From the logs provided:
```
Client connected: cV3kIllxtaeZt8-iAAAC
User grzegorz.wolfinger@gmail.com joined room room_lecture_1762613742460
Sent 0 messages to cV3kIllxtaeZt8-iAAAC for room room_lecture_1762613742460

Client connected: MIBBfVUK3r7lFx3jAAAF
User wujekbizon@gmail.com joined room room_lecture_1762613742460
Sent 0 messages to MIBBfVUK3r7lFx3jAAAF for room room_lecture_1762613742460
```

**Observations:**
- Both users successfully connect
- Both users join the room
- Message history is sent (0 messages is correct for new room)
- **Missing**: No log showing `room_state` being emitted to each user

**Recommendation**: Add logging to confirm:
```typescript
console.log(`Emitting room_state to ${socketId} with ${participants.length} participants`)
```

---

## Recommended Hotfix Priority

### P0 (Critical - Blocks basic functionality)
1. **Issue #1**: Fix `room_state` to include all existing participants

### P1 (High - Core feature broken)
2. **Issue #2**: Fix `kick_participant` functionality

### P2 (Medium - Needs testing)
3. **Issue #3**: Verify and fix mute functionality if broken

---

## Testing Checklist for Backend Team

- [ ] User A joins room → logs show room_state with 1 participant
- [ ] User B joins room → logs show room_state with 2 participants (A + B)
- [ ] User B's client receives both participants in room_state event
- [ ] Teacher kicks student → student receives kicked_from_room event
- [ ] Student is disconnected within 2 seconds of being kicked
- [ ] Teacher mutes student → student receives muted_by_teacher event
- [ ] Teacher mutes all → all students receive mute_all event

---

## Additional Context

### Event Structure (v1.3.1)
Current event structures being used:

**user_joined:**
```typescript
{ userId: string, socketId: string }
```

**user_left:**
```typescript
{ socketId: string }
```

**room_state:**
```typescript
{
  stream: StreamState | null,
  participants: Array<{
    id: string,           // user ID
    username: string,
    role: 'teacher' | 'student' | 'admin',
    displayName?: string,
    email?: string,
    status: string,
    socketId: string,     // socket ID for WebRTC matching
    joinedAt: string,
    canStream: boolean,
    canChat: boolean,
    canScreenShare: boolean,
    isStreaming?: boolean,
    handRaised?: boolean,
    handRaisedAt?: string
  }>
}
```

### Critical Fields
- `participants[].id` - User ID (for authorization/identification)
- `participants[].socketId` - Socket ID (for WebRTC peer connections)
- Both fields are required for proper participant tracking

---

## Contact
If backend team needs clarification on any of these issues, frontend implementation details, or test scenarios, please reach out.
