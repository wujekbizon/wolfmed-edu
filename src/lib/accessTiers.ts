import { AccessTier } from "@/types/categoryType"

// Tier hierarchy - higher number = more access
export const TIER_HIERARCHY: Record<AccessTier, number> = {
  free: 0,
  basic: 1,
  premium: 2,
  pro: 3,
}

/**
 * Check if user's access tier is sufficient for required tier
 * @param userTier - The user's current access tier
 * @param requiredTier - The tier required to access content
 * @returns true if user has access, false otherwise
 */
export function hasAccessToTier(
  userTier: AccessTier | string,
  requiredTier: AccessTier
): boolean {
  const userLevel = TIER_HIERARCHY[userTier as AccessTier] ?? 0
  const requiredLevel = TIER_HIERARCHY[requiredTier]
  return userLevel >= requiredLevel
}
