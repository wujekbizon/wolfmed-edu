import { deleteTestAction } from '@/actions/actions'
import { EMPTY_FORM_STATE } from '@/constants/formState'
import { useActionState, useEffect } from 'react'
import SubmitButton from './SubmitButton'
import { useStore } from '@/store/useStore'
import { useToastMessage } from '@/hooks/useToastMessage'
import FieldError from './FieldError'

export default function CompletedTestDeleteModal({ testId }: { testId: string | undefined }) {
  const { closeDeleteModal } = useStore()
  const [state, action] = useActionState(deleteTestAction, EMPTY_FORM_STATE)

  const noScriptFallback = useToastMessage(state)

  useEffect(() => {
    if (state.status === 'SUCCESS') {
      closeDeleteModal()
    }
  }, [state.status === 'SUCCESS'])

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-white p-10 rounded-xl text-center">
        <h2 className="text-base sm:text-lg font-semibold mb-4">Czy napewno chesz usunąć ten test?</h2>

        <form action={action}>
          <input type="hidden" name="testId" value={testId} />
          <FieldError name="testId" formState={state} />
          <div className="flex items-center justify-between gap-4">
            <button
              type="button"
              className="bg-gray-300 py-2 px-4 rounded hover:bg-gray-400"
              onClick={closeDeleteModal}
            >
              Wróc
            </button>
            <SubmitButton label="Usuń" loading="Usuwam..." />
            {noScriptFallback}
          </div>
        </form>
      </div>
    </div>
  )
}
