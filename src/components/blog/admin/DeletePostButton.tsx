'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { deleteBlogPost } from '@/server/actions/blogActions'
import toast from 'react-hot-toast'

interface DeletePostButtonProps {
  postId: string
  postTitle: string
}

export default function DeletePostButton({
  postId,
  postTitle,
}: DeletePostButtonProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const result = await deleteBlogPost({ id: postId })
      if (result.success) {
        toast.success('Post został usunięty')
        router.refresh()
      } else {
        toast.error(result.error || 'Nie udało się usunąć posta')
      }
    } catch (error) {
      console.error('Error deleting post:', error)
      toast.error('Wystąpił błąd podczas usuwania posta')
    } finally {
      setIsDeleting(false)
      setShowConfirm(false)
    }
  }

  if (showConfirm) {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="text-xs px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
        >
          {isDeleting ? 'Usuwanie...' : 'Potwierdź'}
        </button>
        <button
          onClick={() => setShowConfirm(false)}
          disabled={isDeleting}
          className="text-xs px-2 py-1 bg-zinc-200 text-zinc-700 rounded hover:bg-zinc-300 disabled:opacity-50"
        >
          Anuluj
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => setShowConfirm(true)}
      className="text-red-600 hover:text-red-900"
    >
      Usuń
    </button>
  )
}
