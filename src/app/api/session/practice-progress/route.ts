import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { checkRateLimit } from '@/lib/rateLimit'
import { persistPracticeProgress } from '@/server/savePracticeProgress'

export async function POST(request: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ success: false }, { status: 401 })

  try {
    const limit = await checkRateLimit(userId, 'test:practice:save')
    if (!limit.success) return NextResponse.json({ success: false }, { status: 429 })
    const result = await persistPracticeProgress(userId, await request.json())
    return NextResponse.json(result, { status: result.success ? 200 : 400 })
  } catch (error) {
    console.error('[Practice progress] Save failed:', error)
    return NextResponse.json({ success: false }, { status: 500 })
  }
}
