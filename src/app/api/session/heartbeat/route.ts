import { db } from '@/server/db/index'
import { testSessions } from '@/server/db/schema'
import { auth } from '@clerk/nextjs/server'
import { eq, and } from 'drizzle-orm'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { sessionId } = body

    if (!sessionId) {
      return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 })
    }

    const now = new Date()

    const result = await db
      .update(testSessions)
      .set({ lastActivityAt: now })
      .where(
        and(
          eq(testSessions.id, sessionId),
          eq(testSessions.userId, userId),
          eq(testSessions.status, 'ACTIVE')
        )
      )
      .returning({ id: testSessions.id })

    if (result.length === 0) {
      return NextResponse.json({ error: 'Session not found or inactive' }, { status: 404 })
    }

    return NextResponse.json({ success: true, timestamp: now.toISOString() })
  } catch (error) {
    console.error('[Heartbeat] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
