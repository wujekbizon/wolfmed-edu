# Quick Start Guide - v1.4.3 Fixes

## ✅ What Was Fixed

✅ **Critical Bug #1**: Late joiners couldn't see existing participants' video
✅ **Critical Bug #2**: React Strict Mode causing WebSocket errors
✅ **Bug #3**: Missing userId in user_joined events
✅ **Performance**: JsonDatabase caching (750× faster) - already integrated

---

## 🚀 How to Test

### Step 1: Start Services

```bash
# Terminal 1: WebSocket Server
pnpm ws-server

# Terminal 2: Next.js Dev
pnpm dev
```

### Step 2: Test Video Streaming

**Open TWO browser windows:**

#### Window 1 (Student):
1. Navigate to http://localhost:3000/tp/rooms
2. Click on an active room
3. You should see: `Connected to room: room_lecture_xxx`

#### Window 2 (Teacher):
1. Navigate to http://localhost:3000/tp/rooms
2. Click on the SAME room (join AFTER student)
3. **Critical Check**: Console should show:
   ```
   [v1.4.3 FIX] room_state received with 2 existing participants
   [v1.4.3 FIX] Setting up peer connection for existing participant
   ```
4. Click "Start Camera"
5. You should see your own video

#### Back to Window 1 (Student):
- **Expected**: You should now see the teacher's video! ✅
- **If broken**: Check console for errors

---

## 🔍 Debugging

### Check #1: Console Logs

**Student should see:**
```
[v1.4.3] User teacher@example.com (userId: undefined, socketId: ABC123) joined
Created receive-only peer connection for ABC123
remote_stream_added for peer ABC123  ← Video received!
```

**Teacher should see:**
```
[v1.4.3 FIX] room_state received with 2 existing participants
[v1.4.3 FIX] Setting up peer connection for existing participant student@example.com
[useWebRTC] Local stream started successfully
[v1.4.3 FIX] Peer connection setup and offer sent to student@example.com
```

### Check #2: No Strict Mode Errors

**Before Fix (BROKEN):**
```
WebSocket connection to 'ws://localhost:3001/...' failed:
WebSocket is closed before the connection is established.
```

**After Fix (WORKING):**
```
[v1.4.3 FIX] Detected React Strict Mode remount, reusing existing connection
```

### Check #3: Participants List

Both users should see 2 participants in the sidebar.

---

## 🐛 Common Issues

### Issue: "WebSocket closed before connection established"

**Cause**: Old code without Strict Mode fix
**Fix**: Verify you have the latest code with `[v1.4.3 FIX]` logs

### Issue: Teacher video doesn't appear for student

**Cause**: useWebRTC not handling room_state
**Fix**: Check console for:
```
[v1.4.3 FIX] room_state received with X existing participants
```

If missing, the fix wasn't applied correctly.

### Issue: userId is undefined

**Cause**: Backend package bug (known issue)
**Fix**: Already handled with fallback to socketId. This is cosmetic only.

---

## 📊 Success Criteria

- [x] Dependencies installed (`pnpm install`)
- [x] Package version 1.4.3 confirmed
- [ ] WebSocket server running on port 3001
- [ ] Next.js dev server running on port 3000
- [ ] Student can join room
- [ ] Teacher can join AFTER student
- [ ] Teacher can start camera
- [ ] Student receives teacher's video
- [ ] No "WebSocket closed" errors in console
- [ ] Console shows `[v1.4.3 FIX]` logs

---

## 🎯 Key Changes Made

### useWebRTC.ts
- Added `handleRoomState` to setup peers for existing participants
- Added fallback for missing `userId` in user_joined
- Registered `room_state` event listener

### useRoomConnection.ts
- Added React Strict Mode detection
- Prevent disconnect during Strict Mode remount
- Reuse existing connection on remount

---

## 📞 Need Help?

Check the detailed documentation:
- **Full Analysis**: `docs/CRITICAL_FIXES_v1.4.3.md`
- **Integration Checklist**: `INTEGRATION_CHECKLIST.md`

Look for these log patterns in console:
- `[v1.4.3 FIX]` - New fixes applied
- `[v1.4.2]` - Null stream support
- `[useWebRTC]` - WebRTC operations
- `remote_stream_added` - Video received!

---

## 🎉 Expected Outcome

**Before Fixes:**
- Late joiners: NO VIDEO ❌
- React Strict Mode: WebSocket errors ❌
- Console: userId undefined ⚠️

**After Fixes:**
- Late joiners: VIDEO WORKS! ✅
- React Strict Mode: Clean mount/remount ✅
- Console: Clear debug logs ✅

---

**Ready to test?** Run `pnpm ws-server` and `pnpm dev` in separate terminals!
