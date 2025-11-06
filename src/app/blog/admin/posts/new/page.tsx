import { getBlogCategories, getBlogTags } from '@/server/queries'
import BlogPostForm from '@/components/blog/admin/BlogPostForm'
import Link from 'next/link'

export default async function NewPostPage() {
  const [categories, tags] = await Promise.all([
    getBlogCategories(),
    getBlogTags(),
  ])

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-zinc-600 mb-2">
          <Link href="/blog/admin" className="hover:text-red-600">
            Dashboard
          </Link>
          <span>/</span>
          <Link href="/blog/admin/posts" className="hover:text-red-600">
            Posty
          </Link>
          <span>/</span>
          <span className="text-zinc-900">Nowy Post</span>
        </div>
        <h1 className="text-3xl font-bold text-zinc-900">Utwórz Nowy Post</h1>
        <p className="text-zinc-600 mt-2">
          Wypełnij formularz poniżej, aby utworzyć nowy wpis na blogu
        </p>
      </div>

      <BlogPostForm mode="create" categories={categories} tags={tags} />
    </div>
  )
}
