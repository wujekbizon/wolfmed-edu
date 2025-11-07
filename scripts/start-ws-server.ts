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

import { createServer } from 'http';
import { RealTimeCommunicationSystem } from '@teaching-playground/core/dist/systems/comms/RealTimeCommunicationSystem.js';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

const PORT = parseInt(process.env.WS_PORT || '3001', 10);
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS || 'http://localhost:3000';

async function main() {
  try {
    console.log('🚀 Starting Teaching Playground WebSocket Server...');
    console.log(`📡 Port: ${PORT}`);
    console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔒 CORS Origins: ${ALLOWED_ORIGINS}`);

    // Create HTTP server
    const server = createServer((req, res) => {
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end('Teaching Playground WebSocket Server is running');
    });

    // Initialize real-time communication system
    const commsSystem = new RealTimeCommunicationSystem({
      allowedOrigins: ALLOWED_ORIGINS
    });

    commsSystem.initialize(server);

    // Start listening
    server.listen(PORT, () => {
      console.log('✅ WebSocket Server is running!');
      console.log(`🔗 Connect clients to: ws://localhost:${PORT}`);
      console.log(`📡 HTTP health check: http://localhost:${PORT}`);
      console.log('💡 Press Ctrl+C to stop the server\n');
    });

    // Graceful shutdown handlers
    const shutdown = (signal: string) => {
      console.log(`\n⏹️  ${signal} received. Shutting down WebSocket server...`);
      server.close(() => {
        console.log('✅ Server closed gracefully');
        process.exit(0);
      });

      // Force close after 5 seconds
      setTimeout(() => {
        console.error('❌ Forced shutdown after timeout');
        process.exit(1);
      }, 5000);
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));

  } catch (error) {
    console.error('❌ Failed to start WebSocket server:', error);
    process.exit(1);
  }
}

main();
