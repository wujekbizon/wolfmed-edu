/**
 * Connection Guard
 * Prevents excessive database connections and implements circuit breaker pattern
 */

type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN'

interface CircuitBreakerConfig {
  failureThreshold: number
  resetTimeout: number
  monitoringWindow: number
}

class CircuitBreaker {
  private state: CircuitState = 'CLOSED'
  private failureCount: number = 0
  private lastFailureTime: number = 0
  private successCount: number = 0
  private readonly config: CircuitBreakerConfig

  constructor(config: Partial<CircuitBreakerConfig> = {}) {
    this.config = {
      failureThreshold: config.failureThreshold ?? 5,
      resetTimeout: config.resetTimeout ?? 60000, // 1 minute
      monitoringWindow: config.monitoringWindow ?? 10000 // 10 seconds
    }
  }

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    // Check if circuit is open
    if (this.state === 'OPEN') {
      const timeSinceLastFailure = Date.now() - this.lastFailureTime

      if (timeSinceLastFailure >= this.config.resetTimeout) {
        // Try to recover - move to HALF_OPEN
        this.state = 'HALF_OPEN'
        console.log('🔄 Circuit breaker moving to HALF_OPEN state')
      } else {
        throw new Error(
          `Database circuit breaker is OPEN. Service temporarily unavailable. ` +
          `Retry in ${Math.ceil((this.config.resetTimeout - timeSinceLastFailure) / 1000)}s`
        )
      }
    }

    try {
      const result = await operation()
      this.onSuccess()
      return result
    } catch (error) {
      this.onFailure()
      throw error
    }
  }

  private onSuccess(): void {
    this.failureCount = 0

    if (this.state === 'HALF_OPEN') {
      this.successCount++
      // After 3 successful requests in HALF_OPEN, close the circuit
      if (this.successCount >= 3) {
        this.state = 'CLOSED'
        this.successCount = 0
        console.log('✅ Circuit breaker CLOSED - service recovered')
      }
    }
  }

  private onFailure(): void {
    this.lastFailureTime = Date.now()
    this.failureCount++

    if (this.failureCount >= this.config.failureThreshold) {
      this.state = 'OPEN'
      console.error(
        `🚫 Circuit breaker OPEN after ${this.failureCount} failures. ` +
        `Will retry in ${this.config.resetTimeout / 1000}s`
      )
    }
  }

  getState(): CircuitState {
    return this.state
  }

  reset(): void {
    this.state = 'CLOSED'
    this.failureCount = 0
    this.successCount = 0
    this.lastFailureTime = 0
  }
}

// Global circuit breaker instance
export const databaseCircuitBreaker = new CircuitBreaker({
  failureThreshold: 5,
  resetTimeout: 60000, // 1 minute
  monitoringWindow: 10000 // 10 seconds
})

/**
 * Connection rate limiter to prevent connection storms
 */
class ConnectionRateLimiter {
  private requests: number[] = []
  private readonly maxRequestsPerWindow: number
  private readonly windowMs: number

  constructor(maxRequestsPerWindow: number = 50, windowMs: number = 1000) {
    this.maxRequestsPerWindow = maxRequestsPerWindow
    this.windowMs = windowMs
  }

  canProceed(): boolean {
    const now = Date.now()

    // Remove old requests outside the window
    this.requests = this.requests.filter(timestamp => now - timestamp < this.windowMs)

    if (this.requests.length >= this.maxRequestsPerWindow) {
      console.warn(
        `⚠️ Connection rate limit exceeded: ${this.requests.length}/${this.maxRequestsPerWindow} ` +
        `requests in ${this.windowMs}ms window`
      )
      return false
    }

    this.requests.push(now)
    return true
  }

  getMetrics() {
    const now = Date.now()
    const recentRequests = this.requests.filter(timestamp => now - timestamp < this.windowMs)

    return {
      requestsInWindow: recentRequests.length,
      maxRequests: this.maxRequestsPerWindow,
      utilizationPercent: (recentRequests.length / this.maxRequestsPerWindow) * 100
    }
  }
}

// Global rate limiter instance
export const connectionRateLimiter = new ConnectionRateLimiter(50, 1000)

/**
 * Guards a database operation with circuit breaker and rate limiting
 */
export async function guardedDatabaseOperation<T>(
  operation: () => Promise<T>,
  operationName: string = 'Database operation'
): Promise<T> {
  // Check rate limit
  if (!connectionRateLimiter.canProceed()) {
    throw new Error(
      `Too many concurrent database requests. Please slow down. ` +
      `Current load: ${connectionRateLimiter.getMetrics().utilizationPercent.toFixed(1)}%`
    )
  }

  // Execute with circuit breaker
  return databaseCircuitBreaker.execute(async () => {
    return await operation()
  })
}

/**
 * Get connection health status
 */
export function getConnectionHealth() {
  const rateLimiterMetrics = connectionRateLimiter.getMetrics()
  const circuitState = databaseCircuitBreaker.getState()

  return {
    healthy: circuitState === 'CLOSED' && rateLimiterMetrics.utilizationPercent < 80,
    circuitState,
    rateLimiter: rateLimiterMetrics,
    warnings: [] as string[]
  }
}
