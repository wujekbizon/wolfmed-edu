'use client'

import { useEffect } from 'react'
import { markForumSeenAction } from '@/actions/forum-notifications'
import type { ForumSeenScope } from '@/types/forumPostsTypes'

export default function MarkForumSeen({
  scope,
  hasUnread,
}: {
  scope: ForumSeenScope
  hasUnread: boolean
}) {
  useEffect(() => {
    if (!hasUnread) return
    markForumSeenAction(scope)
  }, [scope, hasUnread])

  return null
}
