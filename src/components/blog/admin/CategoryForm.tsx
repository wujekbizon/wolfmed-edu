'use client'

import { useActionState, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { generateSlug } from '@/lib/blogUtils'
import {
  createBlogCategoryAction,
  updateBlogCategoryAction,
} from '@/actions/blogCategories'
import type { BlogCategory } from '@/types/dataTypes'
import { EMPTY_FORM_STATE } from '@/constants/formState'
import { useToastMessage } from '@/hooks/useToastMessage'
import Input from '@/components/ui/Input'
import Label from '@/components/ui/Label'
import FieldError from '@/components/FieldError'
import SubmitButton from '@/components/SubmitButton'

interface CategoryFormProps {
  category?: BlogCategory
  mode: 'create' | 'edit'
}

export default function CategoryForm({ category, mode }: CategoryFormProps) {
  const router = useRouter()
  const [state, action] = useActionState(
    mode === 'create' ? createBlogCategoryAction : updateBlogCategoryAction,
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
      {mode === 'edit' && category && (
        <input type="hidden" name="id" value={category.id} />
      )}

      <div className="bg-white p-6 rounded-lg shadow-sm border border-zinc-200">
        <h2 className="text-lg font-semibold text-zinc-900 mb-4">
          Informacje o Kategorii
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
              required
              className="w-full px-3 py-2 border border-zinc-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
              placeholder="Wprowadź nazwę kategorii..."
              defaultValue={state.values?.name?.toString() || category?.name || ''}
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
              required
              className="w-full px-3 py-2 border border-zinc-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none font-mono text-sm"
              placeholder="nazwa-kategorii"
              defaultValue={
                state.values?.slug?.toString() ||
                category?.slug ||
                autoSlug ||
                ''
              }
            />
            <FieldError name="slug" formState={state} />
            <p className="text-sm text-zinc-500 mt-1">
              URL przyjazny dla wyszukiwarek (np. medycyna-estetyczna)
            </p>
          </div>

          {/* Description */}
          <div>
            <Label
              htmlFor="description"
              label="Opis"
              className="block text-sm font-medium text-zinc-700 mb-1"
            />
            <textarea
              id="description"
              name="description"
              rows={3}
              className="w-full px-3 py-2 border border-zinc-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
              placeholder="Krótki opis kategorii..."
              defaultValue={
                state.values?.description?.toString() || category?.description || ''
              }
            />
            <FieldError name="description" formState={state} />
          </div>

          {/* Color */}
          <div>
            <Label
              htmlFor="color"
              label="Kolor *"
              className="block text-sm font-medium text-zinc-700 mb-1"
            />
            <div className="flex items-center gap-3">
              <Input
                type="color"
                id="color"
                name="color"
                required
                className="h-10 w-20 border border-zinc-300 rounded-md cursor-pointer"
                defaultValue={
                  state.values?.color?.toString() || category?.color || '#ef4444'
                }
              />
              <span className="text-sm text-zinc-600">
                Wybierz kolor reprezentujący tę kategorię
              </span>
            </div>
            <FieldError name="color" formState={state} />
          </div>

          {/* Icon */}
          <div>
            <Label
              htmlFor="icon"
              label="Ikona (Emoji)"
              className="block text-sm font-medium text-zinc-700 mb-1"
            />
            <Input
              type="text"
              id="icon"
              name="icon"
              className="w-full px-3 py-2 border border-zinc-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
              placeholder="🏥"
              defaultValue={state.values?.icon?.toString() || category?.icon || ''}
            />
            <FieldError name="icon" formState={state} />
            <p className="text-sm text-zinc-500 mt-1">
              Opcjonalne emoji reprezentujące kategorię
            </p>
          </div>

          {/* Order */}
          <div>
            <Label
              htmlFor="order"
              label="Kolejność"
              className="block text-sm font-medium text-zinc-700 mb-1"
            />
            <Input
              type="number"
              id="order"
              name="order"
              className="w-full px-3 py-2 border border-zinc-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
              placeholder="0"
              defaultValue={
                state.values?.order?.toString() || category?.order?.toString() || '0'
              }
              min={0}
            />
            <FieldError name="order" formState={state} />
            <p className="text-sm text-zinc-500 mt-1">
              Określa kolejność wyświetlania kategorii (mniejsze liczby = wyżej)
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
          label={mode === 'create' ? 'Utwórz Kategorię' : 'Zaktualizuj Kategorię'}
          loading={mode === 'create' ? 'Tworzenie...' : 'Aktualizacja...'}
        />
      </div>

      {noScriptFallback}
    </form>
  )
}
