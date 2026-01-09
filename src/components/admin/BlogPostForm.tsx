'use client'

import { useActionState, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { generateSlug } from '@/lib/blogUtils'
import { createBlogPostAction, updateBlogPostAction } from '@/actions/blog'
import type { BlogPost, BlogCategory, BlogTag } from '@/types/dataTypes'
import { EMPTY_FORM_STATE } from '@/constants/formState'
import { useToastMessage } from '@/hooks/useToastMessage'
import Input from '@/components/ui/Input'
import Label from '@/components/ui/Label'
import FieldError from '@/components/FieldError'
import SubmitButton from '@/components/SubmitButton'

interface BlogPostFormProps {
  post?: BlogPost
  categories: BlogCategory[]
  tags: BlogTag[]
  mode: 'create' | 'edit'
}

export default function BlogPostForm({
  post,
  categories,
  tags,
  mode,
}: BlogPostFormProps) {
  const router = useRouter()
  const [state, action] = useActionState(
    mode === 'create' ? createBlogPostAction : updateBlogPostAction,
    EMPTY_FORM_STATE
  )
  const noScriptFallback = useToastMessage(state)

  // Client-side slug generation only
  const [title, setTitle] = useState('')
  const [autoSlug, setAutoSlug] = useState('')

  useEffect(() => {
    if (mode === 'create' && title) {
      setAutoSlug(generateSlug(title))
    }
  }, [title, mode])

  // Redirect on success
  useEffect(() => {
    if (state.status === 'SUCCESS') {
      router.push('/admin/posts')
      router.refresh()
    }
  }, [state.status, router])

  return (
    <form action={action} className="space-y-8">
      {/* Hidden ID for edit mode */}
      {mode === 'edit' && post && (
        <input type="hidden" name="id" value={post.id} />
      )}

      {/* Basic Information */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-zinc-200">
        <h2 className="text-lg font-semibold text-zinc-900 mb-4">
          Podstawowe Informacje
        </h2>
        <div className="space-y-4">
          {/* Title */}
          <div>
            <Label
              htmlFor="title"
              label="Tytuł *"
              className="block text-sm font-medium text-zinc-700 mb-1"
            />
            <Input
              type="text"
              id="title"
              name="title"
              className="w-full px-3 py-2 border border-zinc-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
              placeholder="Wprowadź tytuł posta..."
              defaultValue={state.values?.title?.toString() || post?.title || ''}
              onChangeHandler={(e) => setTitle(e.target.value)}
            />
            <FieldError name="title" formState={state} />
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
              className="w-full px-3 py-2 border border-zinc-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none font-mono text-sm"
              placeholder="tytul-posta"
              defaultValue={
                state.values?.slug?.toString() ||
                post?.slug ||
                autoSlug
              }
            />
            <p className="mt-1 text-xs text-zinc-500">
              URL: /blog/{autoSlug || post?.slug || 'tytul-posta'}
            </p>
            <FieldError name="slug" formState={state} />
          </div>

          {/* Excerpt */}
          <div>
            <Label
              htmlFor="excerpt"
              label="Wstęp *"
              className="block text-sm font-medium text-zinc-700 mb-1"
            />
            <textarea
              id="excerpt"
              name="excerpt"
              rows={3}
              className="w-full px-3 py-2 border border-zinc-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none resize-none"
              placeholder="Krótki opis posta (50-500 znaków)..."
              maxLength={500}
              defaultValue={state.values?.excerpt?.toString() || post?.excerpt || ''}
            />
            <FieldError name="excerpt" formState={state} />
          </div>

          {/* Content */}
          <div>
            <Label
              htmlFor="content"
              label="Treść *"
              className="block text-sm font-medium text-zinc-700 mb-1"
            />
            <textarea
              id="content"
              name="content"
              rows={20}
              className="w-full px-3 py-2 border border-zinc-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none resize-y font-mono text-sm"
              placeholder="Treść posta (obsługuje Markdown)..."
              defaultValue={state.values?.content?.toString() || post?.content || ''}
            />
            <FieldError name="content" formState={state} />
          </div>

          {/* Cover Image */}
          <div>
            <Label
              htmlFor="coverImage"
              label="URL Obrazu Głównego"
              className="block text-sm font-medium text-zinc-700 mb-1"
            />
            <Input
              type="url"
              id="coverImage"
              name="coverImage"
              className="w-full px-3 py-2 border border-zinc-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
              placeholder="https://example.com/image.jpg"
              defaultValue={state.values?.coverImage?.toString() || post?.coverImage || ''}
            />
            <FieldError name="coverImage" formState={state} />
          </div>
        </div>
      </div>

      {/* Organization */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-zinc-200">
        <h2 className="text-lg font-semibold text-zinc-900 mb-4">Organizacja</h2>
        <div className="space-y-4">
          {/* Category */}
          <div>
            <Label
              htmlFor="categoryId"
              label="Kategoria"
              className="block text-sm font-medium text-zinc-700 mb-1"
            />
            <select
              id="categoryId"
              name="categoryId"
              className="w-full px-3 py-2 border border-zinc-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
              defaultValue={state.values?.categoryId?.toString() || post?.categoryId || ''}
            >
              <option value="">Brak kategorii</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            <FieldError name="categoryId" formState={state} />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-2">
              Tagi (max 10)
            </label>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <label
                  key={tag.id}
                  className="inline-flex items-center cursor-pointer"
                >
                  <input
                    type="checkbox"
                    name="tags"
                    value={tag.id}
                    defaultChecked={post?.tags?.some((t) => t.id === tag.id)}
                    className="sr-only peer"
                  />
                  <span className="px-3 py-1 rounded-full text-sm font-medium transition-colors peer-checked:bg-red-600 peer-checked:text-white bg-zinc-100 text-zinc-700 hover:bg-zinc-200">
                    {tag.name}
                  </span>
                </label>
              ))}
            </div>
            {tags.length === 0 && (
              <p className="text-sm text-zinc-500">
                Brak dostępnych tagów. Dodaj tagi w sekcji zarządzania.
              </p>
            )}
            <FieldError name="tags" formState={state} />
          </div>
        </div>
      </div>

      {/* SEO */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-zinc-200">
        <h2 className="text-lg font-semibold text-zinc-900 mb-4">
          SEO (Opcjonalne)
        </h2>
        <div className="space-y-4">
          <div>
            <Label
              htmlFor="metaTitle"
              label="Meta Tytuł"
              className="block text-sm font-medium text-zinc-700 mb-1"
            />
            <input
              type="text"
              id="metaTitle"
              name="metaTitle"
              className="w-full px-3 py-2 border border-zinc-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
              placeholder="Zostaw puste aby użyć tytułu posta"
              maxLength={60}
              defaultValue={state.values?.metaTitle?.toString() || post?.metaTitle || ''}
            />
            <FieldError name="metaTitle" formState={state} />
          </div>

          <div>
            <Label
              htmlFor="metaDescription"
              label="Meta Opis"
              className="block text-sm font-medium text-zinc-700 mb-1"
            />
            <textarea
              id="metaDescription"
              name="metaDescription"
              rows={2}
              className="w-full px-3 py-2 border border-zinc-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none resize-none"
              placeholder="Zostaw puste aby użyć wstępu posta"
              maxLength={160}
              defaultValue={state.values?.metaDescription?.toString() || post?.metaDescription || ''}
            />
            <FieldError name="metaDescription" formState={state} />
          </div>

          <div>
            <Label
              htmlFor="metaKeywords"
              label="Słowa Kluczowe"
              className="block text-sm font-medium text-zinc-700 mb-1"
            />
            <Input
              type="text"
              id="metaKeywords"
              name="metaKeywords"
              className="w-full px-3 py-2 border border-zinc-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
              placeholder="opiekun, medyczny, porady (oddzielone przecinkami)"
              defaultValue={state.values?.metaKeywords?.toString() || post?.metaKeywords || ''}
            />
            <FieldError name="metaKeywords" formState={state} />
          </div>
        </div>
      </div>

      {/* Status */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-zinc-200">
        <h2 className="text-lg font-semibold text-zinc-900 mb-4">Status Publikacji</h2>
        <div>
          <Label
            htmlFor="status"
            label="Status"
            className="block text-sm font-medium text-zinc-700 mb-1"
          />
          <select
            id="status"
            name="status"
            className="w-full px-3 py-2 border border-zinc-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
            defaultValue={state.values?.status?.toString() || post?.status || 'draft'}
          >
            <option value="draft">Szkic</option>
            <option value="published">Opublikowany</option>
            <option value="archived">Archiwum</option>
          </select>
          <FieldError name="status" formState={state} />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2 text-zinc-700 bg-white border border-zinc-300 rounded-md hover:bg-zinc-50 font-medium"
        >
          Anuluj
        </button>

        <SubmitButton
          label={mode === 'create' ? 'Utwórz Post' : 'Aktualizuj Post'}
          loading="Zapisywanie..."
          className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 font-medium"
        />
      </div>

      {noScriptFallback}
    </form>
  )
}
