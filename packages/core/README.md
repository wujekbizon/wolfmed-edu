# @teaching-playground/core

Core functionality for the Teaching Playground system, providing real-time communication, room management, and event handling capabilities.

## Architecture

The core package consists of several key systems:

- Room Management System
- Real-time Communication System (WebSocket + WebRTC)
- Event Management System
- Data Management System

## Installation

```bash
# Install all dependencies
pnpm install

# Add new dependencies
pnpm add <package-name> --filter @teaching-playground/core

# Add dev dependencies
pnpm add -D <package-name> --filter @teaching-playground/core

# Update dependencies
pnpm update --filter @teaching-playground/core
```

## Package Installation Commands

```bash
# WebSocket Layer
pnpm add socket.io socket.io-client @types/socket.io @types/socket.io-client --filter @teaching-playground/core

# WebRTC Layer
pnpm add simple-peer @types/simple-peer --filter @teaching-playground/core

# Type Safety & Validation
pnpm add zod @trpc/server @trpc/client --filter @teaching-playground/core

# Core Utilities
pnpm add eventemitter3 @types/eventemitter3 --filter @teaching-playground/core
pnpm add -D @types/node uuid @types/uuid --filter @teaching-playground/core
```

## Dependencies

### WebSocket Layer

- `socket.io` - Server-side WebSocket implementation
- `socket.io-client` - Client-side WebSocket implementation
- Purpose: Handles real-time messaging, signaling, and updates

### WebRTC Layer

- `simple-peer` - WebRTC peer connection management
- Purpose: Manages video/audio streaming and screen sharing

### Type Safety & Validation

- `zod` - Runtime schema validation
- `@trpc/server` & `@trpc/client` - Type-safe API layer
- Purpose: Ensures type safety and data validation across the system

### Core Utilities

- `eventemitter3` - Event system
- `uuid` - Unique identifier generation
- Purpose: Internal system communication and resource identification

## Project Structure

packages/core/
├── src/
│ ├── systems/
│ │ ├── room/ # Room management
│ │ ├── event/ # Event handling
│ │ ├── comms/ # WebSocket/WebRTC
│ │ └── data/ # Data management
│ ├── interfaces/ # Type definitions
│ ├── utils/ # Shared utilities
│ └── index.ts # Public API
├── tests/
├── README.md
├── package.json
└── tsconfig.json

## Development

```bash
Watch mode
pnpm dev
Build
pnpm build
Run tests
pnpm test
```

## Usage

```typescript
import { TeachingPlayground } from '@teaching-playground/core';
// Initialize the playground
const playground = new TeachingPlayground({
// configuration
});
// Create a classroom
const classroom = await playground.createClassroom({
name: 'Math 101',
// other options
});
```

## System Dependencies

1. Room Management System

   - Manages virtual rooms and participants
   - Handles room lifecycle and permissions

2. Real-time Communication System

   - WebSocket for messaging and signaling
   - WebRTC for media streaming
   - Handles connection management

3. Event Management System

   - Schedules and manages events
   - Handles notifications and updates

4. Data Management System
   - Manages data persistence
   - Handles state synchronization

## Contributing

1. Create a feature branch
2. Make your changes
3. Run tests
4. Submit a pull request

## License

Private - All rights reserved
