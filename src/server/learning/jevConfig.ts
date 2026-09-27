import 'server-only'
import { JevConfigSchema } from '@/server/schema'
import type { JevConfig } from '@/types/jevTypes'

export function getJevConfig(): JevConfig | null {
  const parsed = JevConfigSchema.safeParse({
    mode: process.env.TYPESAFE_JEV_MODE,
    apiKey: process.env.TYPESAFE_API_KEY,
    dailyLimit: process.env.TYPESAFE_JEV_DAILY_LIMIT,
    sessionLimit: process.env.TYPESAFE_JEV_SESSION_LIMIT,
    minConfidence: process.env.TYPESAFE_JEV_MIN_CONFIDENCE || undefined,
  })
  return parsed.success ? { ...parsed.data, minConfidence: parsed.data.minConfidence } : null
}
