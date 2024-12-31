'use client'

import { useActionState } from 'react'
import { EMPTY_FORM_STATE } from '@/constants/formState'
import { deleteCommentAction } from '@/actions/actions'
import { useToastMessage } from '@/hooks/useToastMessage'
import DeleteIcon from '@/components/icons/DeleteIcon'

type Props = {
  postId: string
  commentId: string
  authorId: string
}

export default function DeleteCommentButton({ postId, commentId, authorId }: Props) {
  const [state, action] = useActionState(deleteCommentAction, EMPTY_FORM_STATE)
  const noScriptFallback = useToastMessage(state)

  return (
    <>
      <form action={action}>
        <input type="hidden" name="postId" value={postId} />
        <input type="hidden" name="commentId" value={commentId} />
        <input type="hidden" name="authorId" value={authorId} />
        <button
          type="submit"
          className="text-zinc-500 border border-zinc-800 hover:border-zinc-600 py-1 bg-zinc-900/40 rounded-lg flex items-center justify-center hover:text-red-500 transition-colors"
          title="Usuń komentarz"
        >
          <DeleteIcon width={14} height={14} color="red" />
        </button>
      </form>
      {noScriptFallback}
    </>
  )
}
