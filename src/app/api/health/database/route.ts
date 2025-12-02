import { NextResponse } from 'next/server'
import { getPoolStats } from '@/server/db/index'
import { getConnectionHealth } from '@/lib/connectionGuard'

/**
 * Database Health Check Endpoint
 * GET /api/health/database
 *
 * Returns the current health status of the database connection pool
 */
export async function GET() {
  try {
    const poolStats = getPoolStats()
    const connectionHealth = getConnectionHealth()

    const response = {
      status: connectionHealth.healthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      pool: {
        totalConnections: poolStats.totalConnections,
        idleConnections: poolStats.idleConnections,
        activeConnections: poolStats.totalConnections - poolStats.idleConnections,
        waitingClients: poolStats.waitingClients,
        consecutiveErrors: poolStats.consecutiveErrors,
        utilizationPercent: ((poolStats.totalConnections - poolStats.idleConnections) / 5 * 100).toFixed(1)
      },
      circuitBreaker: {
        state: connectionHealth.circuitState,
        isHealthy: connectionHealth.healthy
      },
      rateLimiter: connectionHealth.rateLimiter,
      warnings: [] as string[]
    }

    // Add warnings
    if (poolStats.consecutiveErrors > 0) {
      response.warnings.push(`${poolStats.consecutiveErrors} consecutive database errors detected`)
    }

    if (poolStats.waitingClients > 0) {
      response.warnings.push(`${poolStats.waitingClients} clients waiting for connections`)
    }

    if (connectionHealth.rateLimiter.utilizationPercent > 80) {
      response.warnings.push(`High connection rate: ${connectionHealth.rateLimiter.utilizationPercent.toFixed(1)}% utilization`)
    }

    if (connectionHealth.circuitState !== 'CLOSED') {
      response.warnings.push(`Circuit breaker is ${connectionHealth.circuitState}`)
    }

    const statusCode = connectionHealth.healthy ? 200 : 503

    return NextResponse.json(response, { status: statusCode })
  } catch (error) {
    console.error('Health check failed:', error)

    return NextResponse.json(
      {
        status: 'error',
        message: 'Health check failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}
