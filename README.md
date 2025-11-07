## Wolfmed

Educational platform for medical training with integrated virtual classroom (Teaching Playground).

## Quick Start

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Configure Environment

Copy `.env.local.example` to `.env.local` (or use the existing `.env.local`) and configure:

```env
NEXT_PUBLIC_WS_URL=http://localhost:3001
WS_PORT=3001
# ... other variables
```

### 3. Run the Application

**Option A: Two Terminals (Recommended)**

Terminal 1 - Frontend:
```bash
pnpm dev
```

Terminal 2 - WebSocket Server:
```bash
pnpm ws-server
```

**Option B: Separate Processes**

The WebSocket server runs independently from the Next.js app. This allows you to:
- Restart frontend without affecting active classroom sessions
- Scale WebSocket server separately
- Monitor each service independently

### 4. Access the Application

- **Main App:** http://localhost:3000
- **Teaching Playground:** http://localhost:3000/tp
- **WebSocket Server:** ws://localhost:3001

## Teaching Playground

The Teaching Playground is a virtual classroom system enabling:
- Live video/audio streaming
- Real-time chat
- Room management
- Lecture scheduling

📖 **Full Documentation:** [docs/TEACHING_PLAYGROUND.md](docs/TEACHING_PLAYGROUND.md)

## Development with @teaching-playground/core

This project uses `@teaching-playground/core` package published on npm.

### Publishing Changes to NPM

When you're ready to publish your changes to the core package:

1. Navigate to the core package directory:
```bash
cd ../teaching-playground-core
```

2. Build the package:
```bash
pnpm build
```

3. Publish to npm:
```bash
pnpm publish --access public
```

4. Switch back to the main project directory and update to the new npm version:
```bash
cd ../wolfmed
pnpm core:npm
```

### Available Scripts

**Main Application:**
- `pnpm dev` - Start Next.js development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint

**Teaching Playground:**
- `pnpm ws-server` - Start WebSocket server for Teaching Playground

**Database:**
- `pnpm db:push` - Push database schema changes
- `pnpm db:studio` - Open Drizzle Studio

### Project Structure

```
wolfmed-edu/
├── src/
│   ├── app/
│   │   ├── tp/                 # Teaching Playground routes
│   │   │   ├── page.tsx        # TP dashboard
│   │   │   ├── components/     # TP components
│   │   │   └── rooms/          # Virtual classrooms
│   ├── actions/
│   │   └── teachingPlayground.ts  # Server actions
│   ├── hooks/
│   │   └── useRoomConnection.ts   # Room connection hook
│   ├── lib/
│   │   └── teaching-playground/   # Local implementations
│   └── store/
│       └── usePlaygroundStore.ts  # State management
├── scripts/
│   └── start-ws-server.ts      # WebSocket server
├── docs/
│   └── TEACHING_PLAYGROUND.md  # Full TP documentation
└── data/
    └── test-data.json          # Test data
```

### Troubleshooting

If you encounter any issues:

1. Make sure both projects are properly installed:
```bash
cd teaching-playground-core && pnpm install
cd ../wolfmed && pnpm install
```

2. Clear the Next.js cache if needed:
```bash
rm -rf .next
```

3. Ensure you're running the correct version:
```bash
pnpm list @teaching-playground/core
```

Edukacja medyczna może być jeszcze łatwiejsza.
