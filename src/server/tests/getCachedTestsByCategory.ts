import 'server-only'
import { cacheLife, cacheTag } from 'next/cache'
import { queryTestsByCategory } from '@/server/tests/queryTestsByCategory'

export async function getCachedTestsByCategory(category: string) {
  'use cache: remote'
  cacheLife('days')
  cacheTag('tests', `tests:category:${category}`)
  return queryTestsByCategory(category)
}
