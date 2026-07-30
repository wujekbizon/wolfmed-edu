/**
 * Users who have never opened the forum have no read-state row, so their
 * watermark falls back to their account creation date. For accounts that
 * predate this feature that would surface every historical post at once —
 * this floor keeps the first badge honest.
 */
export const FORUM_NOTIFICATIONS_EPOCH = new Date('2026-07-30T00:00:00Z')

export const FORUM_NOTIFICATION_BADGE_CAP = 9

export const ADMIN_FORUM_PAGE_SIZE = 20
