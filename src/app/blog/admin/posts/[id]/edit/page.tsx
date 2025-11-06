import { getBlogPostById, getBlogCategories, getBlogTags } from '@/server/queries'
import BlogPostForm from '@/components/blog/admin/BlogPostForm'
import Link from 'next/link'
import { notFound } from 'next/navigation'

interface EditPostPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function EditPostPage({ params }: EditPostPageProps) {
  const { id } = await params
  const [post, categories, tags] = await Promise.all([
    getBlogPostById(id),
    getBlogCategories(),
    getBlogTags(),
  ])

  if (!post) {
    notFound()
  }

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
          <span className="text-zinc-900">Edytuj Post</span>
        </div>
        <h1 className="text-3xl font-bold text-zinc-900">Edytuj Post</h1>
        <p className="text-zinc-600 mt-2">
          Zaktualizuj szczegóły posta poniżej
        </p>
      </div>

      <BlogPostForm mode="edit" post={post} categories={categories} tags={tags} />
    </div>
  )
}
