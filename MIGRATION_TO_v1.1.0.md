# Frontend Migration Checklist: @teaching-playground/core v1.1.0

## Prerequisites

1. Package v1.1.0 must be published
2. Run: `pnpm update @teaching-playground/core`
3. Verify version: `pnpm list @teaching-playground/core` shows 1.1.0

---

## Changes Required

### ✅ REMOVE: Workarounds No Longer Needed

#### 1. Remove HTTP Cleanup Endpoint Hack

**File:** `src/lib/teaching-playground/systems/EventManagementSystem.ts`

**Remove this code (lines 80-94):**
```typescript
// Also clear WebSocket server's in-memory state
try {
  const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3001'
  const wsBaseUrl = wsUrl.replace('ws://', 'http://').replace('wss://', 'https://')
  const response = await fetch(`${wsBaseUrl}/rooms/${event.roomId}`, {
    method: 'DELETE',
  })
  if (response.ok) {
    console.log(`✅ WebSocket server cleaned up room ${event.roomId}`)
  } else {
    console.error(`Failed to cleanup WebSocket room: ${response.statusText}`)
  }
} catch (wsError) {
  console.error(`Failed to call WebSocket cleanup endpoint:`, wsError)
}
```

**Why:** Package now handles cleanup automatically

---

#### 2. Remove HTTP Cleanup Endpoint from WebSocket Server

**File:** `scripts/start-ws-server.ts`

**Remove lines 57-71:**
```typescript
// Handle DELETE /rooms/:roomId endpoint for cleanup
if (req.method === 'DELETE' && req.url?.startsWith('/rooms/')) {
  const roomId = req.url.split('/')[2];
  try {
    console.log(`🧹 Cleanup requested for room: ${roomId}`);
    await commsSystem.deallocateResources(roomId);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, roomId, message: 'Room cleaned up successfully' }));
  } catch (error) {
    console.error(`❌ Failed to cleanup room ${roomId}:`, error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: false, error: 'Failed to cleanup room' }));
  }
  return;
}
```

**Simplify to:**
```typescript
// Create HTTP server
const server = createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Teaching Playground WebSocket Server is running');
});
```

---

#### 3. Simplify Message Deduplication

**File:** `src/hooks/useRoomConnection.ts`

**Replace lines 178-201 with:**
```typescript
connection.on('message_received', (message: RoomMessage) => {
  if (!mountedRef.current) return;

  setState(prev => {
    // Use messageId for deduplication (v1.1.0 adds this)
    const isDuplicate = prev.messages.some(m => m.messageId === message.messageId);

    if (isDuplicate) {
      console.log('[message_received] Duplicate messageId, skipping');
      return prev;
    }

    return {
      ...prev,
      messages: [...prev.messages, message]
    };
  });
});
```

---

#### 4. Remove Participant Database Fetching

**File:** `src/app/tp/components/RoomParticipants.tsx`

**Replace lines 12-53 with:**
```typescript
export default function RoomParticipants({ roomId, participants: wsParticipants }: RoomParticipantsProps) {
  // v1.1.0 sends full participant objects, no DB fetch needed!
  const participants = wsParticipants || []

  // Log to verify we're getting full objects
  useEffect(() => {
    console.log('Participants from WebSocket:', participants)
    if (participants.length > 0) {
      console.log('First participant has role:', participants[0].role)
      console.log('First participant has username:', participants[0].username)
    }
  }, [participants])

  return (
    <div className="flex flex-col h-full">
      {/* ... rest of component */}
```

---

### 🔄 UPDATE: New Event Handlers

#### 5. Update room_state Handler

**File:** `src/hooks/useRoomConnection.ts`

**Replace handleRoomState (lines 154-174):**
```typescript
const handleRoomState = (stateUpdate: {
  stream: StreamState | null,
  // NO MESSAGES in v1.1.0!
  participants: Array<{
    id: string
    username: string
    role: "teacher" | "student" | "admin"
    displayName?: string
    email?: string
    status: string
    socketId: string
    joinedAt: string
    canStream: boolean
    canChat: boolean
    canScreenShare: boolean
    isStreaming?: boolean
  }>
}) => {
  setState(prev => ({
    ...prev,
    stream: stateUpdate.stream,
    participants: stateUpdate.participants || []
    // Messages removed - loaded separately
  }));

  // Request message history after room_state
  if (connectionRef.current) {
    connectionRef.current.socket?.emit('request_message_history', roomId)
  }
};
```

---

#### 6. Add message_history Handler

**File:** `src/hooks/useRoomConnection.ts`

**Add after room_state handler (around line 176):**
```typescript
connection.on('room_state', handleRoomState);

// NEW: Handle message history (v1.1.0)
connection.on('message_history', ({ messages }: { messages: RoomMessage[] }) => {
  if (!mountedRef.current) return;
  console.log('Received message history:', messages.length, 'messages');

  setState(prev => ({
    ...prev,
    messages: messages || []
  }));
});

connection.on('message_received', (message: RoomMessage) => {
```

---

#### 7. Add room_closed Handler

**File:** `src/hooks/useRoomConnection.ts`

**Add after room_cleared handler (around line 278):**
```typescript
connection.on('room_cleared', ({ roomId: clearedRoomId }: { roomId: string }) => {
  // ... existing code ...
});

// NEW: Handle automatic room closure (v1.1.0)
connection.on('room_closed', ({ roomId: closedRoomId, reason, timestamp }: {
  roomId: string,
  reason: string,
  timestamp: string
}) => {
  if (!mountedRef.current) return;
  console.log(`Room ${closedRoomId} was closed: ${reason} at ${timestamp}`);

  setState(prev => ({
    ...prev,
    systemMessage: `Room closed: ${reason}`,
    isConnected: false,
    participants: [],
    messages: []
  }));

  // Disconnect gracefully
  setTimeout(() => {
    if (connectionRef.current && mountedRef.current) {
      console.log('Disconnecting due to room closure');
      connectionRef.current.disconnect();
    }
  }, 3000);
});

await connection.connect();
```

---

### 🆕 ADD: New Features

#### 8. Add server_shutdown Handler

**File:** `src/hooks/useRoomConnection.ts`

**Add after room_closed handler:**
```typescript
// Handle graceful server shutdown (v1.1.0)
connection.on('server_shutdown', ({ message, timestamp }: {
  message: string,
  timestamp: string
}) => {
  if (!mountedRef.current) return;
  console.log('Server shutdown:', message);

  setState(prev => ({
    ...prev,
    systemMessage: `Server maintenance: ${message}. Will reconnect automatically.`,
    isConnected: false
  }));

  // Auto-reconnect after 5 seconds
  setTimeout(() => {
    if (mountedRef.current && connectionRef.current) {
      console.log('Attempting reconnect after server shutdown...');
      connectionRef.current.connect();
    }
  }, 5000);
});
```

---

#### 9. Update RoomMessage Interface

**File:** `src/hooks/useRoomConnection.ts`

**Update interface (lines 12-17):**
```typescript
interface RoomMessage {
  messageId: string     // NEW in v1.1.0
  sequence: number      // NEW in v1.1.0
  userId: string
  username: string
  content: string
  timestamp: string
}
```

---

## Testing Checklist

After migration, test:

- [ ] Room joining works
- [ ] Message history loads on join (check console)
- [ ] Messages appear immediately when sent
- [ ] NO message duplication
- [ ] Participants show correct roles (Teacher/Student)
- [ ] Participant count displays correctly
- [ ] Video streaming works
- [ ] Ending lecture clears room properly
- [ ] Re-entering room shows clean state (no old messages)
- [ ] Rate limiting works (send 6+ messages quickly)
- [ ] Room auto-closes after 30min inactivity

---

## Verification Commands

```bash
# Check installed version
pnpm list @teaching-playground/core

# Expected output:
# @teaching-playground/core 1.1.0

# Check for breaking changes in node_modules
grep -n "join_room" node_modules/@teaching-playground/core/dist/systems/comms/RealTimeCommunicationSystem.js

# Should see: socket.on('join_room', ({ roomId, user }) => {
# NOT: socket.on('join_room', (roomId, userId) => {
```

---

## Rollback Plan

If v1.1.0 causes issues:

```bash
# Revert to v1.0.x
pnpm add @teaching-playground/core@1.0.0

# Restore deleted code
git checkout HEAD~1 -- src/lib/teaching-playground/systems/EventManagementSystem.ts
git checkout HEAD~1 -- scripts/start-ws-server.ts
git checkout HEAD~1 -- src/hooks/useRoomConnection.ts
git checkout HEAD~1 -- src/app/tp/components/RoomParticipants.tsx
```

---

## Expected Benefits

After migration:
- ✅ No message duplication
- ✅ Participants show correct roles immediately
- ✅ Room cleanup works automatically
- ✅ No race conditions in database
- ✅ Video streaming fully functional
- ✅ Graceful handling of server shutdown
- ✅ Rate limiting prevents spam
- ✅ Cleaner, simpler frontend code

---

## Support

If issues arise:
1. Check console logs for error messages
2. Verify v1.1.0 is installed: `pnpm list @teaching-playground/core`
3. Test with the package's example code first
4. Compare with this migration guide
