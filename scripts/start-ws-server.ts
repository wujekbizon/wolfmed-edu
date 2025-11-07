#!/usr/bin/env tsx
/**
 * Teaching Playground WebSocket Server
 *
 * This script starts the WebSocket server for real-time communication
 * between teachers and students in the Teaching Playground.
 *
 * Features:
 * - Real-time chat
 * - Video/audio streaming via WebRTC
 * - Room management
 * - Participant tracking
 *
 * Usage:
 *   pnpm ws-server
 *   # or
 *   tsx scripts/start-ws-server.ts
 */

import { startWebSocketServer } from '@teaching-playground/core/dist/server.js';
import * as dotenv from 'dotenv';

// Load environment variables - try .env.local first, then .env
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

const PORT = parseInt(process.env.WS_PORT || '3001', 10);

async function main() {
  try {
    console.log('🚀 Starting Teaching Playground WebSocket Server...');
    console.log(`📡 Port: ${PORT}`);
    console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔒 CORS Origins: ${process.env.ALLOWED_ORIGINS || 'http://localhost:3000'}`);

    const server = await startWebSocketServer(PORT);

    console.log('✅ WebSocket Server is running!');
    console.log(`🔗 Connect clients to: ws://localhost:${PORT}`);
    console.log('💡 Press Ctrl+C to stop the server\n');

    // Graceful shutdown
    process.on('SIGINT', () => {
      console.log('\n⏹️  Shutting down WebSocket server...');
      server.close(() => {
        console.log('✅ Server closed gracefully');
        process.exit(0);
      });
    });

    process.on('SIGTERM', () => {
      console.log('\n⏹️  Shutting down WebSocket server...');
      server.close(() => {
        console.log('✅ Server closed gracefully');
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('❌ Failed to start WebSocket server:', error);
    process.exit(1);
  }
}

main();
