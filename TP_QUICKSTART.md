# Teaching Playground - Quick Start Guide (v1.1.0)

## 🚀 One-Time Setup

### 1. Install Package v1.1.0
```bash
pnpm update @teaching-playground/core
```

### 2. Apply Migration
```bash
# Follow the checklist in MIGRATION_TO_v1.1.0.md
# Or use this quick script:

# Remove HTTP cleanup endpoint
# Remove message deduplication workaround
# Remove participant DB fetching
# Update event handlers
```

### 3. Environment Setup
Already configured in `.env`:
```bash
WS_PORT=3001
NEXT_PUBLIC_WS_URL=ws://localhost:3001
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
```

---

## 🎬 Running the Application

### Terminal 1: WebSocket Server
```bash
pnpm ws-server
```

**Expected Output:**
```
🚀 Starting Teaching Playground WebSocket Server...
📡 Port: 3001
✅ WebSocket Server is running!
🔗 Connect clients to: ws://localhost:3001
```

### Terminal 2: Next.js Dev Server
```bash
pnpm dev
```

**Expected Output:**
```
▲ Next.js 16.0.0
- Local:        http://localhost:3000
✓ Ready in 2.3s
```

---

## 🧪 Testing Flow

### Step 1: Create Teacher User
1. Sign up or log in
2. Open Clerk dashboard → Users
3. Find your user → Metadata
4. Add: `"role": "teacher"`

### Step 2: Create Lecture
1. Go to `/tp`
2. Click "Create New Lecture"
3. Fill form:
   - Name: "Test Lecture"
   - Date: Tomorrow at 10:00 AM
   - Room ID: (auto-generated)
   - Description: "MVP test"
   - Max Participants: 30
4. Click "Create"

### Step 3: Enter Room
1. Find lecture in list
2. Click "Enter Room"
3. **Watch console logs:**
   ```
   Server welcome: Welcome to room_lecture_xxx, user_xxx
   Connection state changed: CONNECTED
   Received message history: 0 messages
   Room participants from state: [{ id, username, role: 'teacher', ... }]
   ```

### Step 4: Start Stream
1. Click green "Start Streaming" button
2. Allow camera/mic permissions
3. **Verify:**
   - Video appears
   - Buttons are enabled (blue)
   - Console: `Stream ID: your-email@gmail.com`
   - Console: `Is user a streamer: true`

### Step 5: Test Chat
1. Type: "Test message 1"
2. Click Send
3. **Verify:**
   - Message appears once (NOT twice!)
   - Console: `[message_received] ✅ Adding message`
   - Message has `messageId` property

4. Send 5 more messages quickly
5. **Verify:**
   - 6th message shows rate limit error

### Step 6: Check Participants
**Verify:**
- Count shows: "Participants (1)"
- Your name displayed
- Badge shows "Teacher"
- Icons show: video, chat, screen share permissions

### Step 7: End Lecture
1. Go back to `/tp`
2. Click "End Lecture" button
3. **Watch console logs:**
   ```
   Cleared all participants from room room_lecture_xxx
   ✅ WebSocket server cleaned up room room_lecture_xxx
   ```

### Step 8: Re-enter Room
1. Try entering the same room
2. **Verify:**
   - Messages are GONE (empty chat)
   - Participants are GONE (count = 0)
   - Stream is stopped
   - **This proves cleanup works!**

---

## ✅ Success Criteria

### Chat Works
- [ ] Messages send instantly
- [ ] NO duplication on first message
- [ ] Each message has unique messageId
- [ ] Rate limit kicks in after 5 messages

### Participants Work
- [ ] Teacher shows as "Teacher" role
- [ ] Count is accurate
- [ ] Full name/email displayed
- [ ] Permission icons correct

### Video Works
- [ ] Camera feed appears
- [ ] Mic toggle works
- [ ] Camera toggle works
- [ ] Stop stream works
- [ ] Stream ID matches username

### Cleanup Works
- [ ] Ending lecture clears database participants
- [ ] Ending lecture clears WebSocket messages
- [ ] Re-entering shows clean room
- [ ] No stale data persists

---

## 🐛 Troubleshooting

### Issue: "Cannot read property 'role' of undefined"
**Fix:** Participant data not loading properly
```bash
# Check console for:
console.log('Participants from WebSocket:', participants)

# Should see full objects, not socket IDs
```

### Issue: "Messages still duplicating"
**Fix:** Package might still be v1.0.x
```bash
pnpm list @teaching-playground/core

# Must show 1.1.0 or higher
```

### Issue: "Room cleanup not working"
**Fix:** Check if HTTP endpoint was removed
```bash
# Should NOT see in console:
"Cleanup requested for room: ..."

# Should see:
"Cleared all participants from room..."
```

### Issue: "Buttons still disabled"
**Fix:** Check streamerId comparison
```bash
# Console should show:
Stream ID: your-email@gmail.com
User username: your-email@gmail.com
Is user a streamer: true  # Must be true!
```

### Issue: "WebSocket won't connect"
**Fix:**
```bash
# Check WebSocket server is running on 3001
netstat -an | grep 3001

# Check NEXT_PUBLIC_WS_URL in .env
cat .env | grep WS_URL
# Should be: ws://localhost:3001
```

---

## 📊 Console Log Reference

### Good Logs (Everything Working)
```
Server welcome: Welcome to room_lecture_xxx, user_xxx
Connection state changed: CONNECTED
Received message history: 0 messages
Participants from WebSocket: [{ id: 'user_xxx', username: 'email@...', role: 'teacher', ... }]
Stream ID: your-email@gmail.com
User username: your-email@gmail.com
Is user a streamer: true
[message_received] ✅ Adding message, new count will be: 1
Room room_lecture_xxx status updated to available
Cleared all participants from room room_lecture_xxx
```

### Bad Logs (Issues Detected)
```
❌ Is user a streamer: false  # Button will be disabled
❌ Participants from WebSocket: ['socketId123']  # Should be objects!
❌ [message_received] ⚠️ Duplicate detected  # Should only happen if actually duplicate
❌ Failed to fetch participants  # Shouldn't need to fetch in v1.1.0
❌ Failed to cleanup WebSocket room  # HTTP endpoint shouldn't be called
```

---

## 🎉 MVP Launch Checklist

Before considering MVP complete:

### Core Features
- [ ] Teachers can create lectures ✅
- [ ] Teachers can enter rooms ✅
- [ ] Teachers can start video stream ✅
- [ ] Chat works without duplication ✅
- [ ] Participants display correctly ✅
- [ ] Room cleanup works ✅

### User Experience
- [ ] No confusing errors
- [ ] Loading states clear
- [ ] Buttons work as expected
- [ ] No UI flashing/flickering
- [ ] Responsive on desktop

### Technical
- [ ] No console errors
- [ ] WebSocket stable
- [ ] Database operations atomic
- [ ] Memory not leaking
- [ ] Rate limiting working

### Polish
- [ ] Error messages helpful
- [ ] Success notifications clear
- [ ] Graceful degradation
- [ ] Logout doesn't break state

---

## 🚀 Next Steps After MVP

1. **Add Students:** Test with student accounts
2. **Multi-user Testing:** Multiple students in one room
3. **Load Testing:** 10+ concurrent users
4. **Production Deploy:**
   - Use wss:// for WebSocket
   - Add SSL certificates
   - Configure production CORS
5. **Monitoring:** Add logging/analytics
6. **Polish:** Improve UI/UX

---

## 📞 Need Help?

Check these files:
- `TP_MVP_STATUS.md` - Overall status
- `MIGRATION_TO_v1.1.0.md` - Detailed migration steps
- Package README - API documentation

Console logs are your friend! Look for:
- `[message_received]` - Chat debug logs
- `Participants from WebSocket` - Participant debug logs
- `Stream ID` / `Is user a streamer` - Stream control debug logs
- `Cleared all participants` - Cleanup debug logs
