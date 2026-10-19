'use client'

import { useNaukaSearchParams } from '@/hooks/useNaukaSearchParams'
import { resolveNaukaTabs } from '@/helpers/resolveNaukaTabs'
import NaukaCategoriesSkeleton from './NaukaCategoriesSkeleton'
import NaukaCellsSkeleton from './NaukaCellsSkeleton'
import NaukaCardGridSkeleton from './NaukaCardGridSkeleton'

export default function NaukaHubSkeleton() {
  const searchParams = useNaukaSearchParams()
  const { active } = resolveNaukaTabs(searchParams.get('tab'), searchParams.get('library'), true)

  if (active === 'workspace') return <NaukaCellsSkeleton />
  if (active === 'library') return <NaukaCardGridSkeleton />
  return <NaukaCategoriesSkeleton />
}
