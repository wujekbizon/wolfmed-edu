/**
 * Database Error Handler
 * Provides centralized error handling for database operations
 * with specific handling for Neon connection limit errors
 */

export class DatabaseError extends Error {
  constructor(
    message: string,
    public code?: string,
    public isRecoverable: boolean = true
  ) {
    super(message)
    this.name = 'DatabaseError'
  }
}

export class ConnectionLimitError extends DatabaseError {
  constructor(message: string = 'Database connection limit reached. Please try again later.') {
    super(message, 'CONNECTION_LIMIT', false)
    this.name = 'ConnectionLimitError'
  }
}

export class ConnectionTimeoutError extends DatabaseError {
  constructor(message: string = 'Database connection timeout. Please try again.') {
    super(message, 'CONNECTION_TIMEOUT', true)
    this.name = 'ConnectionTimeoutError'
  }
}

export class QueryError extends DatabaseError {
  constructor(message: string) {
    super(message, 'QUERY_ERROR', true)
    this.name = 'QueryError'
  }
}

/**
 * Identifies if an error is related to connection limits
 */
export function isConnectionLimitError(error: unknown): boolean {
  if (error instanceof Error) {
    const errorMessage = error.message.toLowerCase()
    const errorString = String(error).toLowerCase()

    return (
      errorMessage.includes('too many connections') ||
      errorMessage.includes('connection limit') ||
      errorMessage.includes('econnrefused') ||
      errorMessage.includes('compute time quota') ||
      errorMessage.includes('out of memory') ||
      errorString.includes('53300') || // Neon error code for too many connections
      errorString.includes('08006') || // Connection failure
      errorString.includes('08001')    // Unable to establish connection
    )
  }
  return false
}

/**
 * Identifies if an error is a timeout
 */
export function isTimeoutError(error: unknown): boolean {
  if (error instanceof Error) {
    const errorMessage = error.message.toLowerCase()
    return (
      errorMessage.includes('timeout') ||
      errorMessage.includes('timed out') ||
      errorMessage.includes('etimedout')
    )
  }
  return false
}

/**
 * Wraps database errors with appropriate custom error types
 */
export function wrapDatabaseError(error: unknown): DatabaseError {
  if (error instanceof DatabaseError) {
    return error
  }

  if (isConnectionLimitError(error)) {
    return new ConnectionLimitError()
  }

  if (isTimeoutError(error)) {
    return new ConnectionTimeoutError()
  }

  if (error instanceof Error) {
    return new QueryError(error.message)
  }

  return new QueryError('An unknown database error occurred')
}

/**
 * Safely executes a database operation with error handling and retries
 */
export async function withDatabaseErrorHandling<T>(
  operation: () => Promise<T>,
  options: {
    maxRetries?: number
    retryDelay?: number
    operationName?: string
  } = {}
): Promise<T> {
  const { maxRetries = 2, retryDelay = 1000, operationName = 'Database operation' } = options

  let lastError: Error | undefined

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))

      // Don't retry on connection limit errors (not recoverable immediately)
      if (isConnectionLimitError(error)) {
        console.error(`${operationName} failed: Connection limit reached`)
        throw wrapDatabaseError(error)
      }

      // Retry on timeout or other recoverable errors
      if (attempt < maxRetries && (isTimeoutError(error) || isRecoverableError(error))) {
        console.warn(
          `${operationName} failed (attempt ${attempt + 1}/${maxRetries + 1}):`,
          error instanceof Error ? error.message : String(error)
        )
        await sleep(retryDelay * Math.pow(2, attempt)) // Exponential backoff
        continue
      }

      // Final attempt failed
      console.error(`${operationName} failed after ${attempt + 1} attempts:`, error)
      throw wrapDatabaseError(error)
    }
  }

  throw wrapDatabaseError(lastError!)
}

function isRecoverableError(error: unknown): boolean {
  if (error instanceof Error) {
    const message = error.message.toLowerCase()
    return (
      message.includes('timeout') ||
      message.includes('connection') ||
      message.includes('network')
    )
  }
  return false
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Logs database connection metrics
 */
export function logConnectionMetrics(metrics: {
  activeConnections?: number
  idleConnections?: number
  totalConnections?: number
  waitingClients?: number
}) {
  if (process.env.NODE_ENV === 'development') {
    console.log('📊 Database Connection Metrics:', {
      ...metrics,
      timestamp: new Date().toISOString()
    })
  }
}
