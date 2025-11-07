# Teaching Playground - Development Guide

This guide helps you set up and run the Teaching Playground feature in the Wolfmed application.

## Overview

The Teaching Playground is a virtual classroom system that enables:
- **Teachers** to create and conduct live lectures
- **Students** to join virtual classrooms and interact in real-time
- **Real-time video/audio streaming** via WebRTC
- **Live chat** functionality
- **Room management** with participant tracking

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Wolfmed Frontend                      │
│                  (Next.js @ :3000)                       │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │ /tp Pages    │  │  Components  │  │    Hooks     │ │
│  │              │  │              │  │              │ │
│  │ - Main       │  │ - RoomView   │  │ - useRoom    │ │
│  │ - Rooms      │  │ - RoomChat   │  │   Connection │ │
│  │ - [roomId]   │  │ - Controls   │  │              │ │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘ │
│         │                  │                  │         │
└─────────┼──────────────────┼──────────────────┼─────────┘
          │                  │                  │
          ├──────────────────┴──────────────────┘
          │
          │  HTTP / WebSocket / WebRTC
          │
┌─────────▼─────────────────────────────────────────────┐
│         @teaching-playground/core Package              │
│              (WebSocket Server @ :3001)                │
│                                                        │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────┐ │
│  │   Engine    │  │   Systems   │  │   Services   │ │
│  │             │  │             │  │              │ │
│  │ - Teaching  │  │ - Room Mgmt │  │ - WebRTC     │ │
│  │   Playground│  │ - Event Mgmt│  │ - Socket.IO  │ │
│  │             │  │ - Comms     │  │              │ │
│  └─────────────┘  └─────────────┘  └──────────────┘ │
└────────────────────────────────────────────────────────┘
```

## Prerequisites

Before running the Teaching Playground, ensure you have:

- Node.js 18+ installed
- pnpm package manager
- All environment variables configured (see below)

## Environment Configuration

### 1. Copy Environment Template

Create a `.env.local` file in the root directory with the following variables:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# Database
DATABASE_URL=your_database_url

# Stripe
STRIPE_SECRET_KEY=your_stripe_secret_key

# Teaching Playground WebSocket Server
NEXT_PUBLIC_WS_URL=http://localhost:3001
WS_PORT=3001

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001

# Node Environment
NODE_ENV=development

# Logging
LOG_LEVEL=info
```

### 2. Important Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_WS_URL` | WebSocket server URL (accessible from browser) | `http://localhost:3001` |
| `WS_PORT` | Port for WebSocket server | `3001` |
| `ALLOWED_ORIGINS` | CORS allowed origins (comma-separated) | `http://localhost:3000` |

## Running the Application

### Method 1: Run Separately (Recommended for Development)

Open **two terminal windows**:

**Terminal 1 - Next.js Frontend:**
```bash
pnpm dev
```

**Terminal 2 - WebSocket Server:**
```bash
pnpm ws-server
```

### Method 2: Run Concurrently (Alternative)

If you prefer running both in one terminal, install concurrently:

```bash
pnpm add -D concurrently
```

Add this to `package.json` scripts:
```json
"dev:all": "concurrently \"pnpm dev\" \"pnpm ws-server\" --names \"NEXT,WS\" --prefix-colors \"blue,green\""
```

Then run:
```bash
pnpm dev:all
```

## Accessing the Teaching Playground

1. **Start both servers** (frontend and WebSocket)
2. **Navigate to** `http://localhost:3000/tp`
3. **Sign in** with Clerk authentication
4. You should see the Teaching Playground dashboard

## User Roles

The system supports three user roles:

### Teacher
- Create and schedule lectures
- Start/stop video streams
- Manage participants
- Send messages in chat

### Student
- Join available rooms
- Watch live streams
- Participate in chat
- View lecture information

### Admin
- All teacher permissions
- Manage all rooms and lectures
- Monitor system status

### Setting User Roles

User roles are stored in Clerk's public metadata. To set a role:

1. Go to Clerk Dashboard
2. Navigate to Users
3. Select a user
4. Edit Public Metadata:
```json
{
  "role": "teacher"
}
```

Options: `"teacher"`, `"student"`, `"admin"`

## Features

### 1. Lecture Management

**Create a Lecture:**
```
1. Navigate to /tp
2. Click "Create Lecture" button
3. Fill in:
   - Lecture name
   - Date and time
   - Description
   - Max participants
4. Click "Create"
```

**View Lectures:**
- All scheduled lectures appear on the main dashboard
- Filter by status: Scheduled, In Progress, Completed

**Update/Cancel:**
- Click on a lecture card
- Select "Edit" or "Cancel"

### 2. Virtual Rooms

**Join a Room:**
```
1. Navigate to /tp/rooms
2. Click on an available room
3. You'll be redirected to /tp/rooms/[roomId]
4. Connection established automatically
```

**Room Features:**
- Video streaming (teachers)
- Live chat (all participants)
- Participant list
- Connection status indicator

### 3. Real-Time Communication

**Start Streaming (Teachers Only):**
```
1. Join a room
2. Click "Start Stream" button
3. Grant camera/microphone permissions
4. Select video quality (low/medium/high)
5. Stream begins automatically
```

**Chat:**
```
1. Type message in chat input
2. Press Enter or click Send
3. Messages appear in real-time for all participants
```

### 4. WebRTC Streaming

**Quality Levels:**
- **Low:** 640x480, ~500 kbps (for slow connections)
- **Medium:** 1280x720, ~1.5 Mbps (default)
- **High:** 1920x1080, ~3 Mbps (HD quality)

**Browser Support:**
- Chrome 80+ ✅
- Firefox 75+ ✅
- Safari 14+ ✅
- Edge 80+ ✅

## Troubleshooting

### WebSocket Connection Fails

**Symptoms:**
- "Connection failed" message
- Chat doesn't work
- No real-time updates

**Solutions:**
1. Ensure WebSocket server is running:
   ```bash
   pnpm ws-server
   ```
2. Check `NEXT_PUBLIC_WS_URL` matches server URL
3. Verify port 3001 is not in use:
   ```bash
   lsof -i :3001
   ```
4. Check browser console for errors

### Video Stream Not Showing

**Symptoms:**
- Black screen
- No video appears
- "Stream failed" error

**Solutions:**
1. Grant camera/microphone permissions
2. Check WebRTC compatibility in browser
3. Verify STUN servers are accessible
4. Test with: `chrome://webrtc-internals`
5. Try different video quality level

### Lecture Creation Fails

**Symptoms:**
- Error message on submit
- Validation errors

**Solutions:**
1. Verify user has teacher/admin role
2. Check date is in the future
3. Ensure room is available
4. Check browser console for detailed errors

### Chat Messages Not Appearing

**Symptoms:**
- Messages don't send
- Can't see other users' messages

**Solutions:**
1. Verify WebSocket connection is active
2. Check user is properly joined to room
3. Refresh the page
4. Check server logs for errors

## Testing

### Manual Testing Checklist

**Authentication:**
- [ ] Login with teacher account
- [ ] Login with student account
- [ ] Role permissions work correctly

**Lecture Management:**
- [ ] Create new lecture
- [ ] View lecture details
- [ ] Update lecture information
- [ ] Cancel lecture
- [ ] Filter lectures by status

**Room Functionality:**
- [ ] Join room as teacher
- [ ] Join room as student
- [ ] See participant list
- [ ] Connection status updates

**Streaming:**
- [ ] Start stream (teacher)
- [ ] Stop stream (teacher)
- [ ] View stream (student)
- [ ] Different quality levels work
- [ ] Audio is synchronized

**Chat:**
- [ ] Send message
- [ ] Receive messages from others
- [ ] Join/leave notifications appear
- [ ] Message history loads

## Production Deployment

### Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Use secure WebSocket (wss://)
- [ ] Configure production database
- [ ] Set up TURN servers for NAT traversal
- [ ] Enable proper CORS origins
- [ ] Set up monitoring and logging
- [ ] Configure rate limiting
- [ ] Enable HTTPS
- [ ] Test in production-like environment

### Environment Variables (Production)

```env
NODE_ENV=production
NEXT_PUBLIC_WS_URL=wss://ws.yourdomain.com
WS_PORT=3001
ALLOWED_ORIGINS=https://yourdomain.com
DATABASE_URL=postgresql://...
TURN_SERVER_URL=turn:turn.yourdomain.com:3478
TURN_USERNAME=your_turn_username
TURN_CREDENTIAL=your_turn_credential
```

## API Reference

### Server Actions

Located in `src/actions/teachingPlayground.ts`:

- `initializeTeachingPlayground()` - Initialize TP instance
- `createLecture(formData)` - Create new lecture
- `updateLecture(formData)` - Update existing lecture
- `cancelLecture(formData)` - Cancel lecture
- `endLecture(formData)` - End active lecture
- `getLectures()` - Get all lectures
- `addParticipantToServer(roomId, user)` - Add participant to room
- `removeParticipantFromServer(roomId, userId)` - Remove participant
- `getRoomParticipantsFromServer(roomId)` - Get room participants

### Hooks

**`useRoomConnection`** (`src/hooks/useRoomConnection.ts`)

```typescript
const {
  state,           // Connection state
  localStream,     // Local media stream
  remoteStreams,   // Remote media streams
  sendMessage,     // Send chat message
  startStream,     // Start video stream
  stopStream,      // Stop video stream
  exitRoom,        // Leave room
} = useRoomConnection({
  roomId: 'room_123',
  user: currentUser,
  serverUrl: 'http://localhost:3001'
});
```

**Events:**
- `connected` - WebSocket connected
- `disconnected` - WebSocket disconnected
- `message_received` - New chat message
- `stream_started` - Stream began
- `stream_stopped` - Stream ended
- `user_joined` - User joined room
- `user_left` - User left room

## File Structure

```
src/
├── app/
│   └── tp/                              # Teaching Playground routes
│       ├── page.tsx                     # Main dashboard
│       ├── layout.tsx                   # TP layout wrapper
│       ├── components/                  # TP components
│       │   ├── CreateLectureButton.tsx
│       │   ├── LectureCard.tsx
│       │   ├── PlaygroundControls.tsx
│       │   ├── RoomView.tsx
│       │   ├── RoomChat.tsx
│       │   ├── RoomControls.tsx
│       │   └── ...
│       └── rooms/
│           ├── page.tsx                 # Rooms list
│           └── [roomId]/
│               ├── layout.tsx
│               └── page.tsx             # Individual room
├── actions/
│   └── teachingPlayground.ts            # Server actions
├── hooks/
│   └── useRoomConnection.ts             # Room connection hook
├── store/
│   └── usePlaygroundStore.ts            # Zustand store
├── lib/
│   └── teaching-playground/             # Local implementations
│       ├── engine/
│       ├── systems/
│       ├── interfaces/
│       └── db/
├── helpers/
│   ├── createServerPlaygroundInstance.ts
│   └── updateLectureStatuses.ts
└── utils/
    └── teachingPlaygroundUtils.ts

scripts/
└── start-ws-server.ts                   # WebSocket server script

data/
└── test-data.json                       # Test data for development
```

## Resources

- **Package Documentation:** `node_modules/@teaching-playground/core/README.md`
- **WebRTC Guide:** https://webrtc.org/getting-started/overview
- **Socket.IO Docs:** https://socket.io/docs/v4/
- **SimplePeer Docs:** https://github.com/feross/simple-peer

## Support

For issues or questions:
- Check this guide first
- Review browser console errors
- Check WebSocket server logs
- Open an issue on the repository

---

**Last Updated:** 2025-11-07
**Version:** 1.0.0
