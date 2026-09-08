import 'server-only'
import { sql } from 'drizzle-orm'
import { db } from '@/server/db/index'
import { getMemoryQueryWords } from '@/helpers/getMemoryQueryWords'
import { FUSED_SCORE_FLOOR } from './config'
import type { MemorySearchInput, MemorySearchSource, ScoredMemoryRow } from '@/types/memoryRetrievalTypes'

export async function searchMemoryCandidates(source: MemorySearchSource, input: MemorySearchInput) {
  const words = getMemoryQueryWords(input.query)
  const terms = words.length ? words : [input.query]
  const lexicalScore = sql`greatest(${sql.join(terms.map((term) =>
    sql`word_similarity(${term}, ${source.content})`), sql`, `)})`
  const fields = sql`${source.id} AS id, ${source.content} AS content,
    ${source.recordedAt} AS "recordedAt", ${source.topicKey} AS "topicKey"`
  const topicScope = input.topics.length
    ? sql`AND ${source.topicKey} IN (${sql.join(input.topics.map((topic) => sql`${topic.key}`), sql`, `)})`
    : sql``
  const scoped = sql`FROM ${source.table} WHERE ${source.scope} ${topicScope}`
  const vector = input.queryVector
    ? db.execute<ScoredMemoryRow>(sql`SELECT ${fields},
        1 - (${source.embedding} <=> ${JSON.stringify(input.queryVector)}::vector) AS score
        ${scoped} AND ${source.embedding} IS NOT NULL
        ORDER BY ${source.embedding} <=> ${JSON.stringify(input.queryVector)}::vector, ${source.id}
        LIMIT ${input.limit * 4}`)
    : Promise.resolve({ rows: [] as ScoredMemoryRow[] })
  const lexical = db.execute<ScoredMemoryRow>(sql`SELECT ${fields}, ${lexicalScore} AS score
    ${scoped} AND ${lexicalScore} > 0.1
    ORDER BY score DESC, ${source.recordedAt} DESC, ${source.id} LIMIT ${input.limit * 4}`)
  const exact = input.topics.length
    ? db.execute<ScoredMemoryRow>(sql`SELECT ${fields}, 1 AS score ${scoped}
        ORDER BY ${source.recordedAt} DESC, ${source.id} LIMIT ${input.limit}`)
    : Promise.resolve({ rows: [] as ScoredMemoryRow[] })
  const results = await Promise.allSettled([vector, lexical, exact])
  const rows = results.map((result) => {
    if (result.status === 'rejected') {
      console.error('[memory] retrieval channel failed:', result.reason)
      return []
    }
    return result.value.rows.map((row) => ({
      ...row, score: Number(row.score), recordedAt: new Date(row.recordedAt),
    }))
  })
  const [vectorRows = [], lexicalRows = [], topicRows = []] = rows
  const failed = results.some((result) => result.status === 'rejected')
  if (vectorRows.some((row) => row.score >= FUSED_SCORE_FLOOR) ||
    lexicalRows.some((row) => row.score >= FUSED_SCORE_FLOOR) ||
    topicRows.length || !words.length) {
    return { vectorRows, lexicalRows, topicRows, failed, literal: false }
  }
  try {
    const literalRows = await db.execute<ScoredMemoryRow>(sql`SELECT ${fields}, 0.5 AS score
      ${scoped} AND (${sql.join(words.map((word) =>
        sql`${source.content} ILIKE ${'%' + word + '%'}`), sql` AND `)})
      ORDER BY ${source.recordedAt} DESC, ${source.id} LIMIT ${input.limit}`)
    return {
      vectorRows, lexicalRows: [...lexicalRows.filter((row) =>
        !literalRows.rows.some((literal) => literal.id === row.id)), ...literalRows.rows.map((row) => ({
        ...row, score: Number(row.score), recordedAt: new Date(row.recordedAt),
      }))], topicRows, failed, literal: true,
    }
  } catch (error) {
    console.error('[memory] literal fallback failed:', error)
    return { vectorRows, lexicalRows, topicRows, failed: true, literal: false }
  }
}
