'use client'

import { useActionState } from 'react'
import { EMPTY_FORM_STATE } from '@/constants/formState'
import { deletePostAction } from '@/actions/actions'
import { useToastMessage } from '@/hooks/useToastMessage'
import DeleteIcon from '@/components/icons/DeleteIcon'

type Props = {
  postId: string
  authorId: string
}

export default function DeletePostButton({ postId, authorId }: Props) {
  const [state, action] = useActionState(deletePostAction, EMPTY_FORM_STATE)
  const noScriptFallback = useToastMessage(state)

  return (
    <>
      <form action={action}>
        <input type="hidden" name="postId" value={postId} />
        <input type="hidden" name="authorId" value={authorId} />
        <button
          //disabled
          type="submit"
          className="text-zinc-500 hover:bg-gray-900 transition-colors py-1 rounded disabled:cursor-not-allowed disabled:opacity-50"
        >
          <DeleteIcon width={18} height={18} color="red" />
        </button>
      </form>
      {noScriptFallback}
    </>
  )
}
