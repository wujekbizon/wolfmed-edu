// Re-export types for backward compatibility
export type {
  ProgressStage,
  LogAudience,
  LogEntry,
  ProgressData,
} from '@/types/progressTypes'

// Re-export constants for backward compatibility
export {
  STAGE_PROGRESS,
  STAGE_MESSAGES,
} from '@/constants/progress'

// Re-export helpers for backward compatibility
export {
  getStageMessage,
} from '@/helpers/progress-helpers'

// SSE formatting utilities
export function formatSSEMessage(
  id: number,
  event: string,
  data: Record<string, unknown>,
  retry?: number
): string {
  let message = ''

  if (retry !== undefined) {
    message += `retry: ${retry}\n`
  }

  message += `id: ${id}\n`
  message += `event: ${event}\n`
  message += `data: ${JSON.stringify(data)}\n\n`

  return message
}

export function formatKeepAlive(): string {
  return `: keep-alive\n\n`
}
