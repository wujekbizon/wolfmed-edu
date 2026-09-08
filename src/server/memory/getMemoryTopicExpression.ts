import { sql, type SQL } from 'drizzle-orm'

export function getMemoryTopicExpression(metadata: SQL): SQL<string | null> {
  return sql<string | null>`coalesce(
    'procedure:' || nullif(${metadata}->>'procedureId', ''),
    'diagnozy:' || nullif(${metadata}->>'diagnozaSlug', ''),
    'quiz:' || nullif(${metadata}->>'category', ''),
    'quiz:' || nullif(${metadata}->>'categoryKey', ''),
    nullif(${metadata}->>'key', '')
  )`
}
