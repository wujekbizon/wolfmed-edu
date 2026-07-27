import { useQueryClient, type QueryKey } from '@tanstack/react-query'
import { useOnFormSuccess } from '@/hooks/useOnFormSuccess'
import type { FormState } from '@/types/actionTypes'

export function useInvalidateOnSuccess(state: FormState, queryKeys: QueryKey[]) {
  const queryClient = useQueryClient()

  useOnFormSuccess(state, () => {
    for (const queryKey of queryKeys) {
      queryClient.invalidateQueries({ queryKey })
    }
  })
}
