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

    await db
      .update(testSessions)
      .set({ status: 'EXPIRED', finishedAt: now })
      .where(
        and(
          eq(testSessions.id, sessionId),
          eq(testSessions.userId, userId),
          eq(testSessions.status, 'ACTIVE')
        )
      )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Beacon Expire] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
