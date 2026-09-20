import { Suspense } from 'react'
import BlogPageContent from '@/components/blog/BlogPageContent'
import BlogPageShell from '@/components/blog/BlogPageShell'
import BlogPostListSkeleton from '@/components/skeletons/BlogPostListSkeleton'

export default function BlogPageView() {
  return (
    <BlogPageShell>
      <Suspense fallback={<BlogPostListSkeleton />}>
        <BlogPageContent />
      </Suspense>
    </BlogPageShell>
  )
}
