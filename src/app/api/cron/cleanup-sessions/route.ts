import { db } from '@/server/db/index'
import { testSessions } from '@/server/db/schema'
import { eq, lt, and, or } from 'drizzle-orm'
import { NextResponse } from 'next/server'

const INACTIVITY_THRESHOLD_MINUTES = 5

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const now = new Date()
    const inactivityThreshold = new Date(now.getTime() - INACTIVITY_THRESHOLD_MINUTES * 60 * 1000)

    const result = await db
      .update(testSessions)
      .set({ status: 'EXPIRED', finishedAt: now })
      .where(
        and(
          eq(testSessions.status, 'ACTIVE'),
          or(
            // Natural expiration: expiresAt has passed
            lt(testSessions.expiresAt, now),
            // Inactivity expiration: no heartbeat for 5+ minutes
            lt(testSessions.lastActivityAt, inactivityThreshold)
          )
        )
      )
      .returning({ id: testSessions.id })
      
    return NextResponse.json({
      success: true,
      expiredCount: result.length,
      timestamp: now.toISOString(),
    })
  } catch (error) {
    console.error('[Cron] Session cleanup failed:', error)
    return NextResponse.json(
      { error: 'Cleanup failed' },
      { status: 500 }
    )
  }
}
