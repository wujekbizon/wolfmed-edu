'use client'

import { useDashboardStore } from '@/store/useDashboardStore'

export default function DeletePostButton({ postId }: { postId: string }) {
  const { openDeletePostModal } = useDashboardStore()

  return (
    <button
      type="button"
      onClick={() => openDeletePostModal(postId)}
      className="text-red-600 hover:text-red-900 font-medium"
    >
      Usuń
    </button>
  )
}
