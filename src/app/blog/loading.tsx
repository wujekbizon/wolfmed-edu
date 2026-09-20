import BlogPageShell from '@/components/blog/BlogPageShell'
import BlogPostListSkeleton from '@/components/skeletons/BlogPostListSkeleton'

export default function Loading() {
  return (
    <BlogPageShell>
      <BlogPostListSkeleton />
    </BlogPageShell>
  )
}
