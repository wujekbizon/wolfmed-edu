import { db } from '@/server/db/index'
import { materials } from '@/server/db/schema'
import { inArray, asc } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import { syncMaterialChunks } from '@/server/library/sync-material'
import { EXTRACTION_SWEEP_BATCH } from '@/server/library/config'

// Backstop, not the main path. Extraction normally runs straight after upload
// via after(); this catches the cases that path cannot: the function torn down
// mid-call, a transient Gemini failure, or a material uploaded before the
// feature existed. Retries 'pending' and 'failed'; never 'unindexable', which
// is terminal.
export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const stalled = await db
      .select({
        id: materials.id,
        userId: materials.userId,
      })
      .from(materials)
      .where(inArray(materials.indexStatus, ['pending', 'failed']))
      .orderBy(asc(materials.createdAt))
      .limit(EXTRACTION_SWEEP_BATCH)

    // Sequential on purpose: each iteration is a model call against a file up
    // to 4 MB, and running the batch in parallel is how one sweep exhausts the
    // function's memory.
    for (const material of stalled) {
      await syncMaterialChunks(material.userId, material.id)
    }

    return NextResponse.json({
      success: true,
      processed: stalled.length,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('[Cron] Library indexing failed:', error)
    return NextResponse.json({ error: 'Indexing failed' }, { status: 500 })
  }
}
