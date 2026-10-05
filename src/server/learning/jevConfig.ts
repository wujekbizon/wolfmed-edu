import 'server-only'
import { JEV_MIN_CONFIDENCE } from '@/constants/jev'
import { JevConfigSchema } from '@/server/schema'
import type { JevConfig } from '@/types/jevTypes'

export function getJevConfig(): JevConfig | null {
  const parsed = JevConfigSchema.safeParse({
    mode: 'active',
    apiKey: process.env.TYPESAFE_API_KEY,
    minConfidence: JEV_MIN_CONFIDENCE,
  })
  return parsed.success ? { ...parsed.data, minConfidence: parsed.data.minConfidence } : null
}
