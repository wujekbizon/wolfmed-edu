'use client'

import { useActionState, useEffect, useRef, useState } from 'react'
import { uploadMaterialAction } from '@/actions/materials'
import { EMPTY_FORM_STATE } from '@/constants/formState'
import { useToastMessage } from '@/hooks/useToastMessage'
import type { MaterialUploadFile, MaterialUploadFormProps } from '@/types/materialsTypes'
import SubmitButton from './SubmitButton'
import MaterialUploadButton from './MaterialUploadButton'
import Input from './ui/Input'
import Label from './ui/Label'
import FieldError from './FieldError'

export default function UploadMaterialForm({ onSuccess, essay = false }: MaterialUploadFormProps) {
  const [state, action] = useActionState(uploadMaterialAction, EMPTY_FORM_STATE)
  const [file, setFile] = useState<MaterialUploadFile | null>(null)
  const handled = useRef(0)
  const noScriptFallback = useToastMessage(state)
  useEffect(() => {
    if (state.status !== 'SUCCESS' || handled.current === state.timestamp) return
    handled.current = state.timestamp
    onSuccess(typeof state.values?.materialId === 'string' ? state.values.materialId : undefined)
  }, [state, onSuccess])

  return (
    <form action={action} className="flex flex-col gap-4 p-4">
      <div>
        <Label htmlFor="material-category" label="Kategoria" />
        <Input id="material-category" name="category" defaultValue={essay ? 'Prace pisemne' : ''} className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700" />
        <FieldError formState={state} name="category" />
      </div>
      <MaterialUploadButton onUploaded={setFile} essay={essay} />
      <FieldError formState={state} name="type" />
      {file && <p className="break-words text-sm text-zinc-600">{file.name}</p>}
      <input type="hidden" name="title" value={file?.name ?? ''} />
      <input type="hidden" name="key" value={file?.key ?? ''} />
      <input type="hidden" name="fileUrl" value={file?.url ?? ''} />
      <input type="hidden" name="type" value={file?.type ?? ''} />
      <input type="hidden" name="size" value={file?.size ?? ''} />
      <SubmitButton label="Zapisz materiał" loading="Zapisywanie..." />
      {noScriptFallback}
    </form>
  )
}
