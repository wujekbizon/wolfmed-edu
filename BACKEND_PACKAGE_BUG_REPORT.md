# Backend Package Bug Report - @teaching-playground/core v1.4.3

## 🐛 **Critical Bug: user_joined Event Missing userId Field**

### Reported By
Frontend Team - wolfmed-edu

### Package Version
`@teaching-playground/core v1.4.3`

### Date
2025-11-09

---

## 📋 **Bug Summary**

The `user_joined` WebSocket event is missing the `userId` field, which is documented in the v1.3.1+ changelog but not actually being emitted by the server.

---

## 🔍 **Current Behavior (BROKEN)**

### Server Emits:
```javascript
socket.to(roomId).emit('user_joined', {
  username: 'grzegorz.wolfinger@gmail.com',
  socketId: 'wNEg9ZeNV8fK1EchAAAC'
})
```

### Frontend Receives:
```javascript
{
  username: 'grzegorz.wolfinger@gmail.com',
  socketId: 'wNEg9ZeNV8fK1EchAAAC',
  userId: undefined  // ❌ MISSING!
}
```

### Console Output:
```
[WebRTC] BACKEND BUG: user_joined event missing userId field
[WebRTC] User grzegorz.wolfinger@gmail.com (userId: MISSING, socketId: wNEg9ZeNV8fK1EchAAAC) joined
```

---

## ✅ **Expected Behavior (FROM YOUR CHANGELOG)**

According to your own v1.3.1 changelog:

> **Expected (per v1.3.1+ changelog):**
> ```javascript
> { userId: 'user_35CHlksJp30UR5okOLTnBu3yAeM', username: '...', socketId: '...' }
> ```

### Server Should Emit:
```javascript
socket.to(roomId).emit('user_joined', {
  userId: participant.id,        // ← MISSING IN v1.4.3!
  username: participant.username,
  socketId: participant.socketId
})
```

---

## 📝 **Evidence from YOUR Server Logs**

```
Emitting 'user_joined' to 1 existing participants: [
  {
    username: 'grzegorz.wolfinger@gmail.com',
    socketId: 'wNEg9ZeNV8fK1EchAAAC'
    // userId: MISSING! ❌
  }
]
```

**The participant object HAS the id field:**
```javascript
Room room_lecture_1762678428482 now has 2 participants: [
  {
    id: 'user_35CHlksJp30UR5okOLTnBu3yAeM',     // ← You HAVE this!
    username: 'grzegorz.wolfinger@gmail.com',
    socketId: 'wNEg9ZeNV8fK1EchAAAC'
  }
]
```

**But you're NOT emitting it!**

---

## 🛠️ **Required Fix**

### Location
`@teaching-playground/core/src/services/RealTimeCommunicationSystem.ts`

### Current Code (BROKEN):
```typescript
// In handleJoinRoom() method
socket.to(roomId).emit('user_joined', {
  username: participant.username,
  socketId: participant.socketId
  // ❌ Missing userId!
})
```

### Fixed Code (REQUIRED):
```typescript
// In handleJoinRoom() method
socket.to(roomId).emit('user_joined', {
  userId: participant.id,        // ← ADD THIS LINE!
  username: participant.username,
  socketId: participant.socketId
})
```

---

## 🎯 **Why This Matters**

1. **Your Own Changelog Says It Should Work**
   - v1.3.1 changelog documents `userId` in user_joined
   - But v1.4.3 doesn't actually emit it

2. **Frontend Can't Identify Users Properly**
   - We use `userId` for tracking participants
   - `socketId` changes on reconnect
   - `userId` is stable across sessions

3. **Consistency with room_state Event**
   - `room_state` includes `participant.id`
   - `user_joined` should match this structure

---

## 🧪 **How to Test the Fix**

### Step 1: Update RealTimeCommunicationSystem.ts
```typescript
// Find the handleJoinRoom method
async handleJoinRoom(roomId: string, user: User) {
  // ... existing code ...

  // BEFORE (BROKEN):
  socket.to(roomId).emit('user_joined', {
    username: participant.username,
    socketId: participant.socketId
  })

  // AFTER (FIXED):
  socket.to(roomId).emit('user_joined', {
    userId: participant.id,        // ← ADD THIS!
    username: participant.username,
    socketId: participant.socketId
  })
}
```

### Step 2: Rebuild Package
```bash
npm run build
npm version patch  # Bump to v1.4.4
npm publish
```

### Step 3: Verify Frontend Receives userId
Frontend should log:
```
[WebRTC] User grzegorz.wolfinger@gmail.com (userId: user_35CHlksJp30UR5okOLTnBu3yAeM, socketId: wNEg9ZeNV8fK1EchAAAC) joined
```

**No warning about missing userId** ✅

---

## 📦 **Files to Modify in Package**

### Primary File:
```
@teaching-playground/core/src/services/RealTimeCommunicationSystem.ts
```

### Method:
```typescript
private handleJoinRoom(socket: Socket, data: { roomId: string; user: User })
```

### Line to Change:
The `socket.to(roomId).emit('user_joined', ...)` call

---

## 🚨 **Impact**

### Severity: **MEDIUM**
- Not breaking (frontend can work around it)
- But inconsistent with your own documentation
- Makes frontend code more fragile

### Affected Versions:
- v1.4.3 ✅ (confirmed broken)
- v1.4.2 ❓ (likely broken)
- v1.4.1 ❓ (likely broken)
- v1.3.1+ ❓ (should work per changelog, but probably broken)

---

## 📞 **Contact**

**Frontend Team**: wolfmed-edu
**Package**: `@teaching-playground/core`
**Bug Confirmed**: Yes (see server logs above)
**Workaround Applied**: No (we want you to fix it properly)

---

## ✅ **Acceptance Criteria**

The bug is fixed when:

1. ✅ Server emits `userId` in `user_joined` event
2. ✅ Frontend receives `userId` without warnings
3. ✅ Console shows: `userId: user_xxx` (not `userId: MISSING`)
4. ✅ No workarounds needed in frontend

---

## 📄 **Related**

- **Changelog**: v1.3.1 says this should work
- **Server Logs**: Prove you have the data but don't emit it
- **Frontend Code**: `src/hooks/useWebRTC.ts:283-285`

---

**TL;DR:** Add `userId: participant.id` to the `user_joined` event emission. You have the data, you're just not sending it!
