# Backend Package Bug Report - @teaching-playground/core

## ✅ **RESOLVED IN v1.4.4**

**Status**: Fixed
**Fixed In**: v1.4.4 (2025-11-09)
**Originally Reported**: v1.4.3

---

## 🎉 **The Fix**

The backend team fixed the missing `userId` field in the `user_joined` event!

### What Changed in v1.4.4:

**Before (v1.4.3 - BROKEN):**
```typescript
socket.to(roomId).emit('user_joined', participant)
// participant object has 'id' field, but event consumers expected 'userId'
```

**After (v1.4.4 - FIXED):**
```typescript
socket.to(roomId).emit('user_joined', {
  userId: participant.id,        // ✅ ADDED!
  username: participant.username,
  socketId: participant.socketId,
  role: participant.role,
  displayName: participant.displayName,
  status: participant.status
})
```

---

## 📊 **Verification**

### Expected Console Logs (v1.4.4):
```
[WebRTC v1.4.4] User grzegorz.wolfinger@gmail.com (userId: user_35CHlksJp30UR5okOLTnBu3yAeM, role: student, socketId: wNEg9ZeNV8fK1EchAAAC) joined, setting up peer connection
```

**No more warnings!** ✅

### Tests Added (Backend):
- `Hotfix.v1.4.4-userId.test.ts` (5 tests)
- ✅ Verifies userId field is present
- ✅ Confirms userId matches user's id
- ✅ Validates broadcast to all existing participants

---

## 🔄 **Migration from v1.4.3 to v1.4.4**

### Frontend Changes Required:
1. Update `package.json`: `"@teaching-playground/core": "1.4.4"`
2. Remove workarounds for missing userId
3. Update event handlers to expect userId field

### Breaking Changes:
None - this is a bug fix that adds missing data

---

## 📝 **Original Bug Report** (for historical reference)

### Bug Summary
The `user_joined` WebSocket event was missing the `userId` field, which was documented in v1.3.1+ changelog but not actually being emitted.

### Impact
- Frontend couldn't properly identify users
- `socketId` changes on reconnect, `userId` is stable
- Frontend had to use fallback: `userId || user?.id || socketId`

### Root Cause
The server was emitting the entire `participant` object, which had an `id` field instead of `userId`. Frontend expected `userId` field explicitly.

---

## ✅ **Resolution Checklist**

- [x] Backend added `userId` to user_joined emission
- [x] Frontend updated to v1.4.4
- [x] Frontend removed workaround code
- [x] Tests verify userId is present
- [x] No console warnings in production

---

**This bug is now RESOLVED. Thank you backend team!** 🎉
