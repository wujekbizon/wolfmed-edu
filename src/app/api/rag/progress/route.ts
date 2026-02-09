import { getJob, getEvents } from '@/lib/progress-store'
import { formatSSEMessage, formatKeepAlive } from '@/lib/progress-events'

const KEEP_ALIVE_INTERVAL = 15000 // 15 seconds
const DEFAULT_RETRY = 3000 // 3 seconds
const JOB_WAIT_TIMEOUT = 10000 // 10 seconds to wait for job creation

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const jobId = searchParams.get('jobId')

  if (!jobId) {
    return new Response('Missing jobId', { status: 400 })
  }

  const job = getJob(jobId)

  // If job is already complete, return 204 to stop reconnection
  if (job?.status === 'complete' || job?.status === 'error') {
    return new Response(null, { status: 204 })
  }

  // Handle reconnection with Last-Event-ID
  const lastEventIdHeader = request.headers.get('Last-Event-ID')
  const lastEventId = lastEventIdHeader ? parseInt(lastEventIdHeader, 10) : 0

  const encoder = new TextEncoder()
  let keepAliveTimer: ReturnType<typeof setInterval> | null = null
  let isStreamClosed = false
  let lastSentEventId = lastEventId

  const stream = new ReadableStream({
    start(controller) {
      // Send initial retry directive
      controller.enqueue(encoder.encode(`retry: ${DEFAULT_RETRY}\n\n`))

      // Send any missed events on reconnection
      const missedEvents = getEvents(jobId, lastEventId)
      for (const event of missedEvents) {
        const message = formatSSEMessage(event.id, event.type, event.data)
        controller.enqueue(encoder.encode(message))
        lastSentEventId = event.id
      }

      // Set up keep-alive
      keepAliveTimer = setInterval(() => {
        if (isStreamClosed) {
          if (keepAliveTimer) clearInterval(keepAliveTimer)
          return
        }

        try {
          controller.enqueue(encoder.encode(formatKeepAlive()))
        } catch {
          // Stream closed
          if (keepAliveTimer) clearInterval(keepAliveTimer)
        }
      }, KEEP_ALIVE_INTERVAL)

      // Track when we started waiting for job
      const startTime = Date.now()

      // Poll for new events
      const pollInterval = setInterval(() => {
        if (isStreamClosed) {
          clearInterval(pollInterval)
          return
        }

        const currentJob = getJob(jobId)

        // Job doesn't exist yet - wait for it (with timeout)
        if (!currentJob) {
          if (Date.now() - startTime > JOB_WAIT_TIMEOUT) {
            // Timeout waiting for job - close stream
            clearInterval(pollInterval)
            if (keepAliveTimer) clearInterval(keepAliveTimer)
            try {
              controller.close()
            } catch {
              // Already closed
            }
          }
          return // Keep waiting
        }

        const newEvents = getEvents(jobId, lastSentEventId)
        for (const event of newEvents) {
          try {
            const message = formatSSEMessage(event.id, event.type, event.data)
            controller.enqueue(encoder.encode(message))
            lastSentEventId = event.id
          } catch {
            // Stream closed
            clearInterval(pollInterval)
            return
          }
        }

        // Close stream when job is done
        if (currentJob.status === 'complete' || currentJob.status === 'error') {
          clearInterval(pollInterval)
          if (keepAliveTimer) clearInterval(keepAliveTimer)
          try {
            controller.close()
          } catch {
            // Already closed
          }
        }
      }, 100) // Poll every 100ms
    },
    cancel() {
      isStreamClosed = true
      if (keepAliveTimer) clearInterval(keepAliveTimer)
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no', // Disable nginx buffering
    },
  })
}
