'use client'

import { useActionState, useEffect } from 'react'
import { EMPTY_FORM_STATE } from '@/constants/formState'
import { createLecture } from '@/actions/teachingPlayground'
import FieldError from '@/components/FieldError'
import Label from '@/components/ui/Label'
import { usePlaygroundStore } from '@/store/usePlaygroundStore'
import { useToastMessage } from '@/hooks/useToastMessage'
import Input from '@/components/ui/Input'

export default function CreateLectureForm() {
  const [state, action] = useActionState(createLecture, EMPTY_FORM_STATE)
  const { setCreateModalOpen } = usePlaygroundStore()

  const noScriptFallback = useToastMessage(state)

  useEffect(() => {
    if (state.status === 'SUCCESS') {
      setCreateModalOpen(false)
    }
  }, [state.status, setCreateModalOpen])

  return (
    <form action={action}>
      <div className="space-y-4">
        <div>
          <Label htmlFor="name" label="Name" className="text-gray-400 text-sm" />
          <Input
            type="text"
            name="name"
            id="name"
            defaultValue={state.values?.name || ''}
            className="w-full px-4 py-2 bg-zinc-800 rounded-lg border border-zinc-700 text-zinc-100 placeholder:text-zinc-600 outline-none"
          />
          <FieldError name="name" formState={state} />
        </div>

        <div>
          <Label htmlFor="date" label="Date" className="text-gray-400 text-sm" />
          <Input
            type="datetime-local"
            name="date"
            id="date"
            defaultValue={state.values?.date || ''}
            className="w-full px-4 py-2 bg-zinc-800 rounded-lg border border-zinc-700 text-zinc-100 placeholder:text-zinc-600 outline-none"
          />
          <FieldError name="date" formState={state} />
        </div>

        <div>
          <Label htmlFor="roomId" label="Room ID" className="text-gray-400 text-sm" />
          <Input
            type="text"
            name="roomId"
            id="roomId"
            defaultValue={state.values?.roomId || 'room_1'}
            className="w-full px-4 py-2 bg-zinc-800 rounded-lg border border-zinc-700 text-zinc-100 placeholder:text-zinc-600 outline-none"
          />
          <FieldError name="roomId" formState={state} />
        </div>

        <div>
          <Label htmlFor="description" label="Description" className="text-gray-400 text-sm" />
          <textarea
            name="description"
            id="description"
            defaultValue={state.values?.description || ''}
            className="w-full px-4 py-2 bg-zinc-800 resize-none rounded-lg border border-zinc-700 text-zinc-100 placeholder:text-zinc-600 outline-none"
          />
          <FieldError name="description" formState={state} />
        </div>

        <div>
          <Label htmlFor="maxParticipants" label="Max Participants" className="text-gray-400 text-sm" />
          <Input
            type="number"
            name="maxParticipants"
            id="maxParticipants"
            defaultValue={state.values?.maxParticipants || 30}
            className="w-full px-4 py-2 bg-zinc-800 rounded-lg border border-zinc-700 text-zinc-100 placeholder:text-zinc-600 outline-none"
          />
          <FieldError name="maxParticipants" formState={state} />
        </div>

        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={() => setCreateModalOpen(false)}
            className="px-4 py-2 text-sm text-gray-700 bg-zinc-300 hover:bg-gray-100 rounded"
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
