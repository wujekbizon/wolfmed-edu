import { useActionState } from 'react'
import { endLecture } from '@/actions/teachingPlayground'
import { useToastMessage } from '@/hooks/useToastMessage'
import { EMPTY_FORM_STATE } from '@/constants/formState'
import type { Lecture } from '@teaching-playground/core'

export default function EndLectureForm(props: { event: Lecture }) {
  const [state, action] = useActionState(endLecture, EMPTY_FORM_STATE)

  const noScriptFallback = useToastMessage(state)
  return (
    <form action={action} className="inline">
      <input type="hidden" name="lectureId" value={props.event.id} />
      <button
        type="submit"
        className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600"
        disabled={props.event.status !== 'in-progress'}
      >
        End
      </button>
      {noScriptFallback}
    </form>
  )
}
