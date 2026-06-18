'use client'

import { useActionState, useEffect, useState } from 'react'
import { useFormStatus } from 'react-dom'
import { Heart } from 'lucide-react'
import { toggleBlogLikeAction, getBlogLikeState } from '@/actions/blog'
import { EMPTY_FORM_STATE } from '@/constants/formState'
import { useToastMessage } from '@/hooks/useToastMessage'

interface BlogLikeButtonProps {
  postId: string
  initialCount: number
}

function HeartButton({ liked, count }: { liked: boolean; count: number }) {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      aria-pressed={liked}
      aria-label={liked ? 'Usuń polubienie' : 'Polub artykuł'}
      className={`group inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed ${
        liked
          ? 'bg-[#BB86FC]/15 border-[#BB86FC]/40 text-[#BB86FC]'
          : 'bg-[#2A2A3F] border-[#3A3A5A] text-[#A5A5C3] hover:text-[#BB86FC] hover:border-[#BB86FC]/40'
      }`}
    >
      <Heart
        className={`w-4 h-4 transition-transform group-active:scale-125 ${liked ? 'fill-[#BB86FC]' : 'fill-none'}`}
      />
      <span className="tabular-nums">{count}</span>
    </button>
  )
}

export default function BlogLikeButton({ postId, initialCount }: BlogLikeButtonProps) {
  const [state, action] = useActionState(toggleBlogLikeAction, EMPTY_FORM_STATE)
  const noScriptFallback = useToastMessage(state)

  const [liked, setLiked] = useState(false)
  const [count, setCount] = useState(initialCount)

  // The detail page is statically rendered, so hydrate per-user state on mount.
  useEffect(() => {
    let active = true
    getBlogLikeState(postId).then((result) => {
      if (active) {
        setLiked(result.liked)
        setCount(result.count)
      }
    })
    return () => {
      active = false
    }
  }, [postId])

  // Reconcile with the exact server truth after each toggle.
  useEffect(() => {
    if (state.status === 'SUCCESS' && state.values) {
      if (typeof state.values.liked === 'boolean') setLiked(state.values.liked)
      if (typeof state.values.count === 'number') setCount(state.values.count)
    }
  }, [state])

  return (
    <form action={action}>
      <input type="hidden" name="postId" value={postId} />
      <HeartButton liked={liked} count={count} />
      {noScriptFallback}
    </form>
  )
}
