import { FORUM_NOTIFICATIONS_EPOCH } from '@/constants/forumNotifications'

export function forumWatermark(lastSeenAt: Date | null): Date {
  if (!lastSeenAt) return FORUM_NOTIFICATIONS_EPOCH
  return lastSeenAt > FORUM_NOTIFICATIONS_EPOCH
    ? lastSeenAt
    : FORUM_NOTIFICATIONS_EPOCH
}
