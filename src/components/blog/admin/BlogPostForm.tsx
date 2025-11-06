'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { generateSlug, calculateReadingTime } from '@/lib/blogUtils'
import { createBlogPost, updateBlogPost } from '@/actions/blog'
import type { BlogPost, BlogCategory, BlogTag } from '@/types/dataTypes'
import toast from 'react-hot-toast'

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
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form state
  const [title, setTitle] = useState(post?.title || '')
  const [slug, setSlug] = useState(post?.slug || '')
  const [excerpt, setExcerpt] = useState(post?.excerpt || '')
  const [content, setContent] = useState(post?.content || '')
  const [coverImage, setCoverImage] = useState(post?.coverImage || '')
  const [categoryId, setCategoryId] = useState(post?.categoryId || '')
  const [selectedTags, setSelectedTags] = useState<string[]>(
    post?.tags?.map((t) => t.id) || []
  )
  const [status, setStatus] = useState<'draft' | 'published'>(
    (post?.status as 'draft' | 'published') || 'draft'
  )
  const [metaTitle, setMetaTitle] = useState(post?.metaTitle || '')
  const [metaDescription, setMetaDescription] = useState(post?.metaDescription || '')
  const [metaKeywords, setMetaKeywords] = useState(post?.metaKeywords || '')

  // Auto-generate slug from title
  const handleTitleChange = (value: string) => {
    setTitle(value)
    if (mode === 'create' || !post?.slug) {
      setSlug(generateSlug(value))
    }
  }

  // Calculate reading time
  const readingTime = calculateReadingTime(content)

  // Handle tag selection
  const toggleTag = (tagId: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    )
  }

  // Handle submit
  const handleSubmit = async (e: React.FormEvent, isDraft: boolean = false) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const formData = {
        title,
        slug,
        excerpt,
        content,
        coverImage: coverImage || null,
        categoryId: categoryId || null,
        tags: selectedTags,
        status: isDraft ? ('draft' as const) : status,
        metaTitle: metaTitle || undefined,
        metaDescription: metaDescription || undefined,
        metaKeywords: metaKeywords || undefined,
      }

      let result
      if (mode === 'create') {
        result = await createBlogPost(formData)
      } else {
        result = await updateBlogPost({ id: post!.id, ...formData })
      }

      if (result.success) {
        toast.success(
          mode === 'create'
            ? 'Post został utworzony!'
            : 'Post został zaktualizowany!'
        )
        router.push('/blog/admin/posts')
        router.refresh()
      } else {
        toast.error(result.error || 'Wystąpił błąd')
      }
    } catch (error) {
      console.error('Error submitting form:', error)
      toast.error('Wystąpił błąd podczas zapisywania posta')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-8">
      {/* Basic Information */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-zinc-200">
        <h2 className="text-lg font-semibold text-zinc-900 mb-4">
          Podstawowe Informacje
        </h2>
        <div className="space-y-4">
          {/* Title */}
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-zinc-700 mb-1"
            >
              Tytuł <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              required
              className="w-full px-3 py-2 border border-zinc-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
              placeholder="Wprowadź tytuł posta..."
            />
          </div>

          {/* Slug */}
          <div>
            <label
              htmlFor="slug"
              className="block text-sm font-medium text-zinc-700 mb-1"
            >
              Slug (URL) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              required
              className="w-full px-3 py-2 border border-zinc-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none font-mono text-sm"
              placeholder="tytul-posta"
            />
            <p className="mt-1 text-xs text-zinc-500">
              URL: /blog/{slug || 'tytul-posta'}
            </p>
          </div>

          {/* Excerpt */}
          <div>
            <label
              htmlFor="excerpt"
              className="block text-sm font-medium text-zinc-700 mb-1"
            >
              Wstęp <span className="text-red-500">*</span>
            </label>
            <textarea
              id="excerpt"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              required
              rows={3}
              className="w-full px-3 py-2 border border-zinc-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none resize-none"
              placeholder="Krótki opis posta (50-500 znaków)..."
              maxLength={500}
            />
            <p className="mt-1 text-xs text-zinc-500">
              {excerpt.length}/500 znaków
            </p>
          </div>

          {/* Content */}
          <div>
            <label
              htmlFor="content"
              className="block text-sm font-medium text-zinc-700 mb-1"
            >
              Treść <span className="text-red-500">*</span>
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              rows={20}
              className="w-full px-3 py-2 border border-zinc-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none resize-y font-mono text-sm"
              placeholder="Treść posta (obsługuje Markdown)..."
            />
            <p className="mt-1 text-xs text-zinc-500">
              Czas czytania: ~{readingTime} min | {content.length} znaków
            </p>
          </div>

          {/* Cover Image */}
          <div>
            <label
              htmlFor="coverImage"
              className="block text-sm font-medium text-zinc-700 mb-1"
            >
              URL Obrazu Głównego
            </label>
            <input
              type="url"
              id="coverImage"
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              className="w-full px-3 py-2 border border-zinc-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
              placeholder="https://example.com/image.jpg"
            />
          </div>
        </div>
      </div>

      {/* Organization */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-zinc-200">
        <h2 className="text-lg font-semibold text-zinc-900 mb-4">Organizacja</h2>
        <div className="space-y-4">
          {/* Category */}
          <div>
            <label
              htmlFor="category"
              className="block text-sm font-medium text-zinc-700 mb-1"
            >
              Kategoria
            </label>
            <select
              id="category"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-3 py-2 border border-zinc-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
            >
              <option value="">Brak kategorii</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-2">
              Tagi
            </label>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => toggleTag(tag.id)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    selectedTags.includes(tag.id)
                      ? 'bg-red-600 text-white'
                      : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                  }`}
                >
                  {tag.name}
                </button>
              ))}
            </div>
            {tags.length === 0 && (
              <p className="text-sm text-zinc-500">
                Brak dostępnych tagów. Dodaj tagi w sekcji zarządzania.
              </p>
            )}
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
            <label
              htmlFor="metaTitle"
              className="block text-sm font-medium text-zinc-700 mb-1"
            >
              Meta Tytuł
            </label>
            <input
              type="text"
              id="metaTitle"
              value={metaTitle}
              onChange={(e) => setMetaTitle(e.target.value)}
              className="w-full px-3 py-2 border border-zinc-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
              placeholder="Zostaw puste aby użyć tytułu posta"
              maxLength={60}
            />
            <p className="mt-1 text-xs text-zinc-500">{metaTitle.length}/60 znaków</p>
          </div>

          <div>
            <label
              htmlFor="metaDescription"
              className="block text-sm font-medium text-zinc-700 mb-1"
            >
              Meta Opis
            </label>
            <textarea
              id="metaDescription"
              value={metaDescription}
              onChange={(e) => setMetaDescription(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-zinc-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none resize-none"
              placeholder="Zostaw puste aby użyć wstępu posta"
              maxLength={160}
            />
            <p className="mt-1 text-xs text-zinc-500">
              {metaDescription.length}/160 znaków
            </p>
          </div>

          <div>
            <label
              htmlFor="metaKeywords"
              className="block text-sm font-medium text-zinc-700 mb-1"
            >
              Słowa Kluczowe
            </label>
            <input
              type="text"
              id="metaKeywords"
              value={metaKeywords}
              onChange={(e) => setMetaKeywords(e.target.value)}
              className="w-full px-3 py-2 border border-zinc-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
              placeholder="opiekun, medyczny, porady (oddzielone przecinkami)"
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => router.back()}
          disabled={isSubmitting}
          className="px-6 py-2 text-zinc-700 bg-white border border-zinc-300 rounded-md hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          Anuluj
        </button>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={(e) => handleSubmit(e, true)}
            disabled={isSubmitting}
            className="px-6 py-2 text-zinc-700 bg-white border border-zinc-300 rounded-md hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {isSubmitting ? 'Zapisywanie...' : 'Zapisz jako szkic'}
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {isSubmitting
              ? 'Publikowanie...'
              : mode === 'create'
              ? 'Opublikuj Post'
              : 'Aktualizuj Post'}
          </button>
        </div>
      </div>
    </form>
  )
}
