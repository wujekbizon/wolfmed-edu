'use client'

import { useActionState, useEffect } from 'react'
import { EMPTY_FORM_STATE } from '@/constants/formState'
import { createLecture } from '@/actions/teachingPlayground'
import FieldError from '@/components/FieldError'
import Label from '@/components/Label'
import { usePlaygroundStore } from '@/store/usePlaygroundStore'
import { useToastMessage } from '@/hooks/useToastMessage'

export default function CreateLectureForm() {
  const [state, action] = useActionState(createLecture, EMPTY_FORM_STATE)
  const { setCreateModalOpen } = usePlaygroundStore()

  const noScriptFallback = useToastMessage(state)

  useEffect(() => {
    if (state.status === 'SUCCESS') {
      setCreateModalOpen(false)
    }
  }, [state.status])

  return (
    <form action={action}>
      <div className="space-y-4">
        <div>
          <Label htmlFor="name" label="Name" className="text-gray-700" />
          <input
            type="text"
            name="name"
            id="name"
            defaultValue={state.values?.name || ''}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          />
          <FieldError name="name" formState={state} />
        </div>

        <div>
          <Label htmlFor="date" label="Date" className="text-gray-700" />
          <input
            type="datetime-local"
            name="date"
            id="date"
            defaultValue={state.values?.date || ''}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          />
          <FieldError name="date" formState={state} />
        </div>

        <div>
          <Label htmlFor="roomId" label="Room ID" className="text-gray-700" />
          <input
            type="text"
            name="roomId"
            id="roomId"
            defaultValue={state.values?.roomId || 'room_1'}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          />
          <FieldError name="roomId" formState={state} />
        </div>

        <div>
          <Label htmlFor="description" label="Description" className="text-gray-700" />
          <textarea
            name="description"
            id="description"
            defaultValue={state.values?.description || ''}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          />
          <FieldError name="description" formState={state} />
        </div>

        <div>
          <Label htmlFor="maxParticipants" label="Max Participants" className="text-gray-700" />
          <input
            type="number"
            name="maxParticipants"
            id="maxParticipants"
            defaultValue={state.values?.maxParticipants || 30}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          />
          <FieldError name="maxParticipants" formState={state} />
        </div>

        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={() => setCreateModalOpen(false)}
            className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
          >
            Cancel
          </button>
          <button type="submit" className="px-4 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600">
            Create
          </button>
        </div>
      </div>
      {noScriptFallback}
    </form>
  )
}
