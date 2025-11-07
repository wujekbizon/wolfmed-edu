'use client'

import { useActionState } from 'react'
import { EMPTY_FORM_STATE } from '@/constants/formState'
import { updateLecture } from '@/actions/teachingPlayground'
import FieldError from '@/components/FieldError'
import Label from '@/components/ui/Label'
import { Lecture } from '@teaching-playground/core'
import { usePlaygroundStore } from '@/store/usePlaygroundStore'
import { useEffect } from 'react'
import { useToastMessage } from '@/hooks/useToastMessage'

interface UpdateLectureFormProps {
  lecture: Lecture
}

export default function UpdateLectureForm({ lecture }: UpdateLectureFormProps) {
  const [state, action] = useActionState(updateLecture, EMPTY_FORM_STATE)
  const { setSelectedLecture } = usePlaygroundStore()

  const noScriptFallback = useToastMessage(state)

  useEffect(() => {
    if (state.status === 'SUCCESS') {
      setSelectedLecture(null)
    }
  }, [state.status, setSelectedLecture])

  return (
    <form action={action}>
      <input type="hidden" name="lectureId" value={lecture.id} />
      <div className="space-y-4">
        <div>
          <Label htmlFor="name" label="Name" className="text-gray-700" />
          <input
            type="text"
            name="name"
            id="name"
            defaultValue={state.values?.name || lecture.name}
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
            defaultValue={state.values?.date || lecture.date}
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
            defaultValue={state.values?.roomId || lecture.roomId}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          />
          <FieldError name="roomId" formState={state} />
        </div>

        <div>
          <Label htmlFor="description" label="Description" className="text-gray-700" />
          <textarea
            name="description"
            id="description"
            defaultValue={state.values?.description || lecture.description}
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
            defaultValue={state.values?.maxParticipants || lecture.maxParticipants}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          />
          <FieldError name="maxParticipants" formState={state} />
        </div>

        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={() => setSelectedLecture(null)}
            className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
          >
            Cancel
          </button>
          <button type="submit" className="px-4 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600">
            Update
          </button>
        </div>
      </div>
      {noScriptFallback}
    </form>
  )
}
