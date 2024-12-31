import { Suspense } from 'react'
import { getForumPostById } from '@/server/queries'
import { notFound } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'
import Link from 'next/link'
import ForumDetailHeader from '@/components/ForumDetailHeader'
import ForumDetailContent from '@/components/ForumDetailContent'
import ForumDetailComments from '@/components/ForumDetailComments'
import Loading from './loading'

type Props = {
  params: Promise<{
    postId: string
  }>
}
async function ForumPost({ postId }: { postId: string }) {
  const post = await getForumPostById(postId)
  const { userId } = await auth()

  if (!post) {
    notFound()
  }

  const isAuthor = userId === post.authorId

  return (
    <section className="min-h-screen w-full max-w-5xl mx-auto px-0 xs:px-4 py-8">
      <div className="mb-6">
        <Link
          href="/forum"
          className="text-zinc-800 hover:text-zinc-300 transition-colors inline-flex items-center gap-2"
        >
          ← Wróć do forum
        </Link>
      </div>
      <article className="bg-zinc-900 rounded-lg overflow-hidden">
        <ForumDetailHeader
          title={post.title}
          authorName={post.authorName}
          createdAt={post.createdAt}
          isAuthor={isAuthor}
          postId={post.id}
          authorId={post.authorId}
        />
        <ForumDetailContent content={post.content} />
        <ForumDetailComments
          postId={post.id}
          comments={post.comments}
          userId={userId}
          isAuthor={isAuthor}
          readonly={post.readonly}
        />
      </article>
    </section>
  )
}

export default async function PostPage({ params }: Props) {
  const { postId } = await params

  return (
    <Suspense fallback={<Loading />}>
      <ForumPost postId={postId} />
    </Suspense>
  )
}
