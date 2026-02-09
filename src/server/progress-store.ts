import type { EventType, JobProgress, ProgressEvent, LogAudience, LogLevel } from '@/types/progressTypes'
import { STAGE_MESSAGES, JOB_TTL } from '@/constants/progress'
import { getRedis } from '@/lib/redis'

const REDIS_KEY_PREFIX = 'progress:'
const TTL_SECONDS = Math.floor(JOB_TTL / 1000)

// In-memory fallback when Redis is not configured
const memoryStore = new Map<string, JobProgress>()

async function getJobData(jobId: string): Promise<JobProgress | null> {
  const redis = getRedis()

  if (redis) {
    return await redis.get<JobProgress>(`${REDIS_KEY_PREFIX}${jobId}`)
  }

  return memoryStore.get(jobId) ?? null
}

async function saveJobData(jobId: string, job: JobProgress): Promise<void> {
  const redis = getRedis()

  if (redis) {
    await redis.set(`${REDIS_KEY_PREFIX}${jobId}`, job, { ex: TTL_SECONDS })
  } else {
    memoryStore.set(jobId, job)
  }
}

async function deleteJobData(jobId: string): Promise<void> {
  const redis = getRedis()

  if (redis) {
    await redis.del(`${REDIS_KEY_PREFIX}${jobId}`)
  } else {
    memoryStore.delete(jobId)
  }
}

export async function createJob(jobId: string): Promise<void> {
  const job: JobProgress = {
    events: [],
    status: 'active',
    lastEventId: 0,
    createdAt: Date.now(),
  }
  await saveJobData(jobId, job)
}

export async function emitEvent(
  jobId: string,
  type: EventType,
  data: Record<string, unknown>
): Promise<void> {
  const job = await getJobData(jobId)
  if (!job) return

  const event: ProgressEvent = {
    id: ++job.lastEventId,
    type,
    data,
    timestamp: Date.now(),
  }
  job.events.push(event)
  await saveJobData(jobId, job)
}

export async function emitProgress(
  jobId: string,
  stage: string,
  progress: number,
  message?: string,
  extra?: Record<string, unknown>
): Promise<void> {
  const stageMessage = STAGE_MESSAGES[stage as keyof typeof STAGE_MESSAGES] ?? stage
  await emitEvent(jobId, 'progress', {
    stage,
    progress,
    total: 100,
    message: message ?? stageMessage,
    ...extra,
  })
}

export async function emitLog(
  jobId: string,
  level: LogLevel,
  message: string,
  audience: LogAudience = 'user'
): Promise<void> {
  await emitEvent(jobId, 'log', {
    level,
    message,
    audience,
    timestamp: new Date().toISOString(),
  })
}

export async function logUser(jobId: string, message: string): Promise<void> {
  await emitLog(jobId, 'info', message, 'user')
}

export async function logTechnical(
  jobId: string,
  category: string,
  message: string,
  level: LogLevel = 'info'
): Promise<void> {
  await emitLog(jobId, level, `[${category}] ${message}`, 'technical')
}

export async function logError(jobId: string, userMessage: string, technicalMessage: string): Promise<void> {
  await emitLog(jobId, 'error', userMessage, 'user')
  await emitLog(jobId, 'error', technicalMessage, 'technical')
}

export async function completeJob(jobId: string): Promise<void> {
  const job = await getJobData(jobId)
  if (!job) return

  job.status = 'complete'
  await saveJobData(jobId, job)
  await emitLog(jobId, 'info', 'Zakończono pomyślnie', 'user')
  await emitLog(jobId, 'info', '[DONE] Job completed successfully', 'technical')
  await emitEvent(jobId, 'complete', { success: true })
}

export async function errorJob(jobId: string, userMessage: string, technicalMessage?: string): Promise<void> {
  const job = await getJobData(jobId)
  if (!job) return

  job.status = 'error'
  await saveJobData(jobId, job)
  await emitLog(jobId, 'error', userMessage, 'user')
  await emitLog(jobId, 'error', technicalMessage || userMessage, 'technical')
  await emitEvent(jobId, 'error', { message: userMessage, technicalMessage })
}

export async function getJob(jobId: string): Promise<JobProgress | undefined> {
  const job = await getJobData(jobId)
  return job ?? undefined
}

export async function getEvents(jobId: string, fromId = 0): Promise<ProgressEvent[]> {
  const job = await getJobData(jobId)
  if (!job) return []

  return job.events.filter((e) => e.id > fromId)
}

export async function deleteJob(jobId: string): Promise<void> {
  await deleteJobData(jobId)
}

// Cleanup old jobs from memory store (only needed for fallback)
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const [jobId, job] of memoryStore) {
      if (now - job.createdAt > JOB_TTL) {
        memoryStore.delete(jobId)
      }
    }
  }, 60 * 1000)
}
