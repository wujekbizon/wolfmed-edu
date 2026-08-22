import { useQuery } from '@tanstack/react-query'
import { checkPremiumAccessAction } from '@/actions/course-actions'
import { premiumAccessKey, PREMIUM_STALE_TIME } from '@/constants/access'

// Shared query key + staleTime keep the DB-backed check to one request per session.
export function usePremiumAccess(): boolean {
  const { data } = useQuery({
    queryKey: premiumAccessKey(),
    queryFn: () => checkPremiumAccessAction(),
    staleTime: PREMIUM_STALE_TIME,
  })

  return data ?? false
}
