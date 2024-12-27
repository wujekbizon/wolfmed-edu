import { getPostById } from '@/server/fileArchive'
import { formatDate } from '@/helpers/formatDate'
import { notFound } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'
import Link from 'next/link'
import AddCommentButton from '@/components/AddCommentButton'
import DeletePostButton from '@/components/DeletePostButton'
import DeleteCommentButton from '@/components/DeleteCommentButton'

export default async function PostPage({ params }: { params: { postId: string } }) {
  const { postId } = await params
  const post = await getPostById(postId)
  const { userId } = await auth()

  if (!post) {
    notFound()
  }

  const isAuthor = userId === post.authorId

  return (
    <main className="min-h-screen w-full max-w-4xl mx-auto px-0 xs:px-4 py-8">
      <div className="mb-6">
        <Link
          href="/forum"
          className="text-zinc-800 hover:text-zinc-300 transition-colors inline-flex items-center gap-2"
        >
          ← Wróć do forum
        </Link>
      </div>

      <article className="bg-zinc-900 rounded-lg overflow-hidden">
        {/* Header Section */}
        <div className="p-6 border-b border-zinc-800">
          <div className="flex justify-between items-start">
            <h1 className="text-2xl sm:text-3xl font-bold text-zinc-100 mb-4">{post.title}</h1>
          </div>
          <div className="flex items-center justify-between gap-4 text-sm text-zinc-500">
            <div className="flex items-center gap-2">
              <span>{post.authorName}</span>
              <span>•</span>
              <time>{formatDate(post.createdAt)}</time>
            </div>
            {isAuthor && <DeletePostButton postId={post.id} authorId={post.authorId} />}
          </div>
        </div>

        {/* Content Section */}
        <div className="p-6 border-b border-zinc-800">
          <div className="prose prose-invert max-w-none">
            <p className="text-zinc-300 leading-relaxed whitespace-pre-wrap">{post.content}</p>
          </div>
        </div>

        {/* Comments Section */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm xs:text-lg font-semibold text-zinc-100">Komentarze ({post.comments.length})</h2>
            <AddCommentButton postId={post.id} />
          </div>

          <div className="space-y-6">
            {post.comments.map((comment) => (
              <div key={comment.id} className="bg-zinc-800/50 rounded-lg p-4 hover:bg-zinc-800 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-sm text-zinc-500">
                    <span className="font-medium text-zinc-300">{comment.authorName}</span>
                    <span>•</span>
                    <time>{formatDate(comment.createdAt)}</time>
                  </div>
                  {(isAuthor || userId === comment.authorId) && (
                    <DeleteCommentButton postId={post.id} commentId={comment.id} authorId={comment.authorId} />
                  )}
                </div>
                <p className="text-zinc-300 text-sm leading-relaxed">{comment.content}</p>
              </div>
            ))}

            {post.comments.length === 0 && (
              <p className="text-center text-zinc-500 py-4">Bądź pierwszym który skomentuje ten post</p>
            )}
          </div>
        </div>
      </article>
    </main>
  )
}
