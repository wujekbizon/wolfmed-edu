import { useActionState } from 'react'
import { cancelLecture } from '@/actions/teachingPlayground'
import { useToastMessage } from '@/hooks/useToastMessage'
import { EMPTY_FORM_STATE } from '@/constants/formState'
import type { Lecture } from '../../../../packages/core/src/interfaces/index'

export default function CancelLectureForm(props: { event: Lecture }) {
  const [state, action] = useActionState(cancelLecture, EMPTY_FORM_STATE)

  const noScriptFallback = useToastMessage(state)
  return (
    <form action={action} className="inline">
      <input type="hidden" name="lectureId" value={props.event.id} />
      <button
        type="submit"
        className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
        disabled={props.event.status === 'cancelled'}
      >
        Cancel
      </button>
    </form>
  )
}
