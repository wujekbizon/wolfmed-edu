import type { QueryClient, QueryKey } from '@tanstack/react-query'
import type { WolfekPreparedBatch } from '@/types/wolfekBatchTypes'

export function getWolfekPreparedBatch(client: QueryClient, key: QueryKey, load: () => Promise<WolfekPreparedBatch>) {
  return client.fetchQuery({ queryKey: key, queryFn: load, staleTime: Infinity, gcTime: Infinity, retry: false })
}
