'use server'

import { auth } from '@clerk/nextjs/server'
import { db } from '@/server/db/index'
import { forumReadState } from '@/server/db/schema'
import { checkRateLimit } from '@/lib/rateLimit'
import { fromErrorToFormState, toFormState } from '@/helpers/toFormState'
import { MarkForumSeenSchema } from '@/server/schema'
import { FORUM_NOTIFICATIONS_EPOCH } from '@/constants/forumNotifications'
import { FormState } from '@/types/actionTypes'
import type { ForumSeenScope } from '@/types/forumPostsTypes'

export async function markForumSeenAction(
  scope: ForumSeenScope
): Promise<FormState> {
  const { userId } = await auth()
  if (!userId) return toFormState('ERROR', 'Brak autoryzacji.')

  const rateLimit = await checkRateLimit(userId, 'forum:seen')
  if (!rateLimit.success) return toFormState('ERROR', '')

  const validationResult = MarkForumSeenSchema.safeParse({ scope })
  if (!validationResult.success) {
    return fromErrorToFormState(validationResult.error)
  }

  const now = new Date()
  const isPosts = validationResult.data.scope === 'posts'
  const seenColumn = isPosts
    ? { lastSeenPostsAt: now }
    : { lastSeenCommentsAt: now }

  // On the first insert the untouched column would default to now(), which
  // would clear the other badge the user hasn't actually looked at yet.
  const untouchedColumn = isPosts
    ? { lastSeenCommentsAt: FORUM_NOTIFICATIONS_EPOCH }
    : { lastSeenPostsAt: FORUM_NOTIFICATIONS_EPOCH }

  try {
    await db
      .insert(forumReadState)
      .values({ userId, ...seenColumn, ...untouchedColumn, updatedAt: now })
      .onConflictDoUpdate({
        target: forumReadState.userId,
        set: { ...seenColumn, updatedAt: now },
      })
  } catch (error) {
    return fromErrorToFormState(error)
  }

  return toFormState('SUCCESS', '')
}
