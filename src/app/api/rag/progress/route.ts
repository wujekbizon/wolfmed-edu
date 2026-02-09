import { getJob, getEvents } from '@/server/progress-store'
import { formatSSEMessage, formatKeepAlive } from '@/helpers/progress-helpers'
import { KEEP_ALIVE_INTERVAL, DEFAULT_SSE_RETRY, JOB_WAIT_TIMEOUT, SSE_POLL_INTERVAL } from '@/constants/progress'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const jobId = searchParams.get('jobId')

  if (!jobId) {
    return new Response('Missing jobId', { status: 400 })
  }

  const job = await getJob(jobId)

  if (job?.status === 'complete' || job?.status === 'error') {
    return new Response(null, { status: 204 })
  }

  const lastEventIdHeader = request.headers.get('Last-Event-ID')
  const lastEventId = lastEventIdHeader ? parseInt(lastEventIdHeader, 10) : 0

  const encoder = new TextEncoder()
  let keepAliveTimer: ReturnType<typeof setInterval> | null = null
  let pollTimer: ReturnType<typeof setInterval> | null = null
  let isStreamClosed = false
  let lastSentEventId = lastEventId

  const stream = new ReadableStream({
    async start(controller) {
      controller.enqueue(encoder.encode(`retry: ${DEFAULT_SSE_RETRY}\n\n`))

      const missedEvents = await getEvents(jobId, lastEventId)
      for (const event of missedEvents) {
        const message = formatSSEMessage(event.id, event.type, event.data)
        controller.enqueue(encoder.encode(message))
        lastSentEventId = event.id
      }

      keepAliveTimer = setInterval(() => {
        if (isStreamClosed) {
          if (keepAliveTimer) clearInterval(keepAliveTimer)
          return
        }
        try {
          controller.enqueue(encoder.encode(formatKeepAlive()))
        } catch {
          if (keepAliveTimer) clearInterval(keepAliveTimer)
        }
      }, KEEP_ALIVE_INTERVAL)

      const startTime = Date.now()

      const poll = async () => {
        if (isStreamClosed) {
          if (pollTimer) clearInterval(pollTimer)
          return
        }

        const currentJob = await getJob(jobId)

        if (!currentJob) {
          if (Date.now() - startTime > JOB_WAIT_TIMEOUT) {
            if (pollTimer) clearInterval(pollTimer)
            if (keepAliveTimer) clearInterval(keepAliveTimer)
            try {
              controller.close()
            } catch {
              // Already closed
            }
          }
          return
        }

        const newEvents = await getEvents(jobId, lastSentEventId)
        for (const event of newEvents) {
          try {
            const message = formatSSEMessage(event.id, event.type, event.data)
            controller.enqueue(encoder.encode(message))
            lastSentEventId = event.id
          } catch {
            if (pollTimer) clearInterval(pollTimer)
            return
          }
        }

        if (currentJob.status === 'complete' || currentJob.status === 'error') {
          if (pollTimer) clearInterval(pollTimer)
          if (keepAliveTimer) clearInterval(keepAliveTimer)
          try {
            controller.close()
          } catch {
            // Already closed
          }
        }
      }

      pollTimer = setInterval(() => {
        poll()
      }, SSE_POLL_INTERVAL)
    },
    cancel() {
      isStreamClosed = true
      if (keepAliveTimer) clearInterval(keepAliveTimer)
      if (pollTimer) clearInterval(pollTimer)
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  })
}
