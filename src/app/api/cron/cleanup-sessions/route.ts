import { db } from '@/server/db/index'
import { testSessions } from '@/server/db/schema'
import { eq, lt, and } from 'drizzle-orm'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  // We verify that the request is from Vercel Cron
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const now = new Date()

    const result = await db
      .update(testSessions)
      .set({ status: 'EXPIRED' })
      .where(
        and(
          eq(testSessions.status, 'ACTIVE'),
          lt(testSessions.expiresAt, now)
        )
      )
      .returning({ id: testSessions.id })

    console.log(`[Cron] Cleaned up ${result.length} expired sessions`)

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