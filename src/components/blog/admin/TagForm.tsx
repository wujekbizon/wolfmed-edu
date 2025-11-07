'use client'

import { useActionState, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { generateSlug } from '@/lib/blogUtils'
import { createBlogTagAction, updateBlogTagAction } from '@/actions/blogCategories'
import type { BlogTag } from '@/types/dataTypes'
import { EMPTY_FORM_STATE } from '@/constants/formState'
import { useToastMessage } from '@/hooks/useToastMessage'
import Input from '@/components/ui/Input'
import Label from '@/components/ui/Label'
import FieldError from '@/components/FieldError'
import SubmitButton from '@/components/SubmitButton'

interface TagFormProps {
  tag?: BlogTag
  mode: 'create' | 'edit'
}

export default function TagForm({ tag, mode }: TagFormProps) {
  const router = useRouter()
  const [state, action] = useActionState(
    mode === 'create' ? createBlogTagAction : updateBlogTagAction,
    EMPTY_FORM_STATE
  )
  const noScriptFallback = useToastMessage(state)

  // Client-side slug generation
  const [name, setName] = useState('')
  const [autoSlug, setAutoSlug] = useState('')

  useEffect(() => {
    if (mode === 'create' && name) {
      setAutoSlug(generateSlug(name))
    }
  }, [name, mode])

  // Redirect on success
  useEffect(() => {
    if (state.status === 'SUCCESS') {
      router.push('/blog/admin/categories')
      router.refresh()
    }
  }, [state.status, router])

  return (
    <form action={action} className="space-y-6">
      {/* Hidden ID for edit mode */}
      {mode === 'edit' && tag && <input type="hidden" name="id" value={tag.id} />}

      <div className="bg-white p-6 rounded-lg shadow-sm border border-zinc-200">
        <h2 className="text-lg font-semibold text-zinc-900 mb-4">
          Informacje o Tagu
        </h2>
        <div className="space-y-4">
          {/* Name */}
          <div>
            <Label
              htmlFor="name"
              label="Nazwa *"
              className="block text-sm font-medium text-zinc-700 mb-1"
            />
            <Input
              type="text"
              id="name"
              name="name"
              className="w-full px-3 py-2 border border-zinc-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              placeholder="Wprowadź nazwę tagu..."
              defaultValue={state.values?.name?.toString() || tag?.name || ''}
              onChangeHandler={(e) => setName(e.target.value)}
            />
            <FieldError name="name" formState={state} />
          </div>

          {/* Slug */}
          <div>
            <Label
              htmlFor="slug"
              label="Slug (URL) *"
              className="block text-sm font-medium text-zinc-700 mb-1"
            />
            <Input
              type="text"
              id="slug"
              name="slug"
              className="w-full px-3 py-2 border border-zinc-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none font-mono text-sm"
              placeholder="nazwa-tagu"
              defaultValue={
                state.values?.slug?.toString() || tag?.slug || autoSlug || ''
              }
            />
            <FieldError name="slug" formState={state} />
            <p className="text-sm text-zinc-500 mt-1">
              URL przyjazny dla wyszukiwarek (np. botoks)
            </p>
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex items-center justify-end gap-4">
        <button
          type="button"
          onClick={() => router.push('/blog/admin/categories')}
          className="px-6 py-2 border border-zinc-300 text-zinc-700 rounded-md hover:bg-zinc-50 font-medium"
        >
          Anuluj
        </button>
        <SubmitButton
          label={mode === 'create' ? 'Utwórz Tag' : 'Zaktualizuj Tag'}
          loading={mode === 'create' ? 'Tworzenie...' : 'Aktualizacja...'}
        />
      </div>

      {noScriptFallback}
    </form>
  )
}
