/**
 * Logging utility with environment-based log levels
 *
 * Usage:
 *   import { logger } from '@/utils/logger'
 *   logger.error('Critical error:', error)
 *   logger.warn('Warning message')
 *   logger.info('Info message')  // Only in development or debug mode
 *   logger.debug('Debug details')  // Only in debug mode
 */

type LogLevel = 'error' | 'warn' | 'info' | 'debug'

const LOG_LEVEL: LogLevel = (process.env.NEXT_PUBLIC_LOG_LEVEL as LogLevel) || 'error'

const LOG_LEVELS: Record<LogLevel, number> = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3
}

const shouldLog = (level: LogLevel): boolean => {
  return LOG_LEVELS[level] <= LOG_LEVELS[LOG_LEVEL]
}

export const logger = {
  /**
   * Log critical errors that need immediate attention
   * Always logged in all environments
   */
  error: (...args: any[]) => {
    if (shouldLog('error')) {
      console.error(...args)
    }
  },

  /**
   * Log warnings that might need attention
   * Logged when LOG_LEVEL is 'warn', 'info', or 'debug'
   */
  warn: (...args: any[]) => {
    if (shouldLog('warn')) {
      console.warn(...args)
    }
  },

  /**
   * Log informational messages (e.g., user actions, events)
   * Logged when LOG_LEVEL is 'info' or 'debug'
   */
  info: (...args: any[]) => {
    if (shouldLog('info')) {
      console.log(...args)
    }
  },

  /**
   * Log detailed debug information
   * Only logged when LOG_LEVEL is 'debug'
   */
  debug: (...args: any[]) => {
    if (shouldLog('debug')) {
      console.log(...args)
    }
  }
}

/**
 * Environment variable configuration:
 *
 * Production (default):
 *   NEXT_PUBLIC_LOG_LEVEL=error  (only errors)
 *
 * Development:
 *   NEXT_PUBLIC_LOG_LEVEL=info  (errors + warnings + info)
 *
 * Debug:
 *   NEXT_PUBLIC_LOG_LEVEL=debug  (all logs)
 */
