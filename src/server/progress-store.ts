import type { EventType, JobProgress, ProgressEvent, LogAudience, LogLevel } from '@/types/progressTypes'
import { STAGE_MESSAGES, JOB_TTL } from '@/constants/progress'

// Use globalThis to ensure singleton across Next.js module boundaries
// NOTE: This only works in development. For production, use Redis (Upstash).
const globalForProgress = globalThis as unknown as {
  progressStore: Map<string, JobProgress> | undefined
}

const progressStore = globalForProgress.progressStore ?? new Map<string, JobProgress>()

if (process.env.NODE_ENV !== 'production') {
  globalForProgress.progressStore = progressStore
}

export function createJob(jobId: string): void {
  progressStore.set(jobId, {
    events: [],
    status: 'active',
    lastEventId: 0,
    createdAt: Date.now(),
  })
}

export function emitEvent(
  jobId: string,
  type: EventType,
  data: Record<string, unknown>
): void {
  const job = progressStore.get(jobId)
  if (!job) return

  const event: ProgressEvent = {
    id: ++job.lastEventId,
    type,
    data,
    timestamp: Date.now(),
  }
  job.events.push(event)
}

export function emitProgress(
  jobId: string,
  stage: string,
  progress: number,
  message?: string,
  extra?: Record<string, unknown>
): void {
  const stageMessage = STAGE_MESSAGES[stage as keyof typeof STAGE_MESSAGES] ?? stage
  emitEvent(jobId, 'progress', {
    stage,
    progress,
    total: 100,
    message: message ?? stageMessage,
    ...extra,
  })
}

export function emitLog(
  jobId: string,
  level: LogLevel,
  message: string,
  audience: LogAudience = 'user'
): void {
  emitEvent(jobId, 'log', {
    level,
    message,
    audience,
    timestamp: new Date().toISOString(),
  })
}

export function logUser(jobId: string, message: string): void {
  emitLog(jobId, 'info', message, 'user')
}

export function logTechnical(
  jobId: string,
  category: string,
  message: string,
  level: LogLevel = 'info'
): void {
  emitLog(jobId, level, `[${category}] ${message}`, 'technical')
}

export function logError(jobId: string, userMessage: string, technicalMessage: string): void {
  emitLog(jobId, 'error', userMessage, 'user')
  emitLog(jobId, 'error', technicalMessage, 'technical')
}

export function completeJob(jobId: string): void {
  const job = progressStore.get(jobId)
  if (!job) return

  job.status = 'complete'
  emitLog(jobId, 'info', 'Zakończono pomyślnie', 'user')
  emitLog(jobId, 'info', '[DONE] Job completed successfully', 'technical')
  emitEvent(jobId, 'complete', { success: true })
}

export function errorJob(jobId: string, userMessage: string, technicalMessage?: string): void {
  const job = progressStore.get(jobId)
  if (!job) return

  job.status = 'error'
  emitLog(jobId, 'error', userMessage, 'user')
  emitLog(jobId, 'error', technicalMessage || userMessage, 'technical')
  emitEvent(jobId, 'error', { message: userMessage, technicalMessage })
}

export function getJob(jobId: string): JobProgress | undefined {
  return progressStore.get(jobId)
}

export function getEvents(jobId: string, fromId = 0): ProgressEvent[] {
  const job = progressStore.get(jobId)
  if (!job) return []

  return job.events.filter((e) => e.id > fromId)
}

export function deleteJob(jobId: string): void {
  progressStore.delete(jobId)
}

// Cleanup old jobs every minute
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const [jobId, job] of progressStore) {
      if (now - job.createdAt > JOB_TTL) {
        progressStore.delete(jobId)
      }
    }
  }, 60 * 1000)
}
