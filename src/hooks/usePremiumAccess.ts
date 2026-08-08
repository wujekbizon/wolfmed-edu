import { useQuery } from '@tanstack/react-query'
import { checkPremiumAccessAction } from '@/actions/course-actions'
import { premiumAccessKey, PREMIUM_STALE_TIME } from '@/constants/access'

// Clerk's publicMetadata.ownedCourses carries bare course slugs with no tier,
// so a client component cannot tell basic from premium without asking the
// server. Shared query key + staleTime keep that to one lookup per session.
export function usePremiumAccess(): boolean {
  const { data } = useQuery({
    queryKey: premiumAccessKey(),
    queryFn: () => checkPremiumAccessAction(),
    staleTime: PREMIUM_STALE_TIME,
  })

  return data ?? false
}
