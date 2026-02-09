type EventType = 'progress' | 'log' | 'complete' | 'error'

interface ProgressEvent {
  id: number
  type: EventType
  data: Record<string, unknown>
  timestamp: number
}

interface JobProgress {
  events: ProgressEvent[]
  status: 'active' | 'complete' | 'error'
  lastEventId: number
  createdAt: number
}

const JOB_TTL = 5 * 60 * 1000 // 5 minutes

// Use globalThis to ensure singleton across Next.js module boundaries
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
  emitEvent(jobId, 'progress', {
    stage,
    progress,
    total: 100,
    message: message ?? getStageMessage(stage),
    ...extra,
  })
}

export function emitLog(
  jobId: string,
  level: 'info' | 'warn' | 'error',
  message: string
): void {
  emitEvent(jobId, 'log', {
    level,
    message,
    timestamp: new Date().toISOString(),
  })
}

export function completeJob(jobId: string): void {
  const job = progressStore.get(jobId)
  if (!job) return

  job.status = 'complete'
  emitEvent(jobId, 'complete', { success: true })
}

export function errorJob(jobId: string, message: string, code?: string): void {
  const job = progressStore.get(jobId)
  if (!job) return

  job.status = 'error'
  emitEvent(jobId, 'error', { message, code })
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

function getStageMessage(stage: string): string {
  const messages: Record<string, string> = {
    idle: 'Oczekiwanie...',
    parsing: 'Analizuję zapytanie...',
    resolving: 'Rozwiązuję referencje...',
    fetching: 'Pobieram zawartość zasobów...',
    searching: 'Przeszukuję dokumenty...',
    calling_tool: 'Wywołuję narzędzie...',
    executing: 'Generuję zawartość...',
    finalizing: 'Finalizuję odpowiedź...',
    complete: 'Gotowe',
    error: 'Wystąpił błąd',
  }
  return messages[stage] ?? stage
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
