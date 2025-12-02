/**
 * Enhanced Database Connection with Error Handling
 * and Connection Management for Neon Free Tier
 */

import { Pool, Client, neonConfig } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-serverless'
import * as schema from './schema'
import {
  wrapDatabaseError,
  isConnectionLimitError,
  logConnectionMetrics,
} from '@/lib/dbErrorHandler'
import { guardedDatabaseOperation } from '@/lib/connectionGuard'

if (!process.env.NEON_DATABASE_URL) {
  throw new Error('NEON_DATABASE_URL is not defined')
}

// Configure Neon for better connection handling
neonConfig.fetchConnectionCache = true

// Optimized pool configuration for Neon Free Tier
const pool = new Pool({
  connectionString: process.env.NEON_DATABASE_URL,

  // Reduced max connections to prevent hitting free tier limits
  max: 5, // Reduced from 10 to be more conservative

  // Close idle connections more aggressively to free up resources
  idleTimeoutMillis: 20000, // 20 seconds (reduced from 30)

  // Timeout for acquiring a connection from the pool
  connectionTimeoutMillis: 10000,

  // Maximum number of times a connection can be reused
  maxUses: 7500,

  // Allow graceful degradation when connection fails
  allowExitOnIdle: true,
})

// Enhanced error tracking
let consecutiveErrors = 0
const MAX_CONSECUTIVE_ERRORS = 5

pool.on('error', (err: Error, client: Client) => {
  consecutiveErrors++

  console.error('💥 Unexpected error on idle database client:', {
    error: err.message,
    consecutiveErrors,
    timestamp: new Date().toISOString()
  })

  if (isConnectionLimitError(err)) {
    console.error(
      '🚨 CONNECTION LIMIT ERROR DETECTED! ' +
      'You may have exceeded Neon free tier limits. ' +
      'Consider upgrading or optimizing queries.'
    )
  }

  if (consecutiveErrors >= MAX_CONSECUTIVE_ERRORS) {
    console.error(
      `🚨 CRITICAL: ${consecutiveErrors} consecutive database errors detected! ` +
      'Database connection pool may be unhealthy.'
    )
  }
})

pool.on('connect', () => {
  // Reset error counter on successful connection
  consecutiveErrors = 0
})

// Create drizzle instance
export const db = drizzle(pool, { schema })

/**
 * Execute a database query with enhanced error handling and monitoring
 *
 * Optional wrapper for queries that need extra protection.
 * Use this for critical queries or those prone to connection issues.
 *
 * @example
 * ```ts
 * const users = await executeQuery(
 *   () => db.query.users.findMany(),
 *   'getAllUsers'
 * )
 * ```
 */
export async function executeQuery<T>(
  queryFn: () => Promise<T>,
  operationName: string = 'Query'
): Promise<T> {
  try {
    // Log connection metrics in development
    if (process.env.NODE_ENV === 'development') {
      logConnectionMetrics({
        totalConnections: pool.totalCount,
        idleConnections: pool.idleCount,
        waitingClients: pool.waitingCount,
      })
    }

    // Execute with circuit breaker and rate limiting
    return await guardedDatabaseOperation(queryFn, operationName)
  } catch (error) {
    // Wrap and throw database error
    throw wrapDatabaseError(error)
  }
}

/**
 * Get pool statistics for monitoring
 */
export function getPoolStats() {
  return {
    totalConnections: pool.totalCount,
    idleConnections: pool.idleCount,
    waitingClients: pool.waitingCount,
    consecutiveErrors,
  }
}

/**
 * Gracefully close database pool
 */
export async function closeDatabasePool() {
  try {
    await pool.end()
    console.log('✅ Database pool closed gracefully')
  } catch (error) {
    console.error('❌ Error closing database pool:', error)
  }
}

// Handle process termination
if (typeof process !== 'undefined') {
  process.on('SIGINT', async () => {
    await closeDatabasePool()
    process.exit(0)
  })

  process.on('SIGTERM', async () => {
    await closeDatabasePool()
    process.exit(0)
  })
}
