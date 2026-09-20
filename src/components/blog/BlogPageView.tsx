import { Suspense } from 'react'
import BlogHero from '@/components/BlogHero'
import BlogBackground from '@/components/blog/BlogBackground'
import BlogPageContent from '@/components/blog/BlogPageContent'
import BlogPromoBanner from '@/components/blog/BlogPromoBanner'
import BlogToolbar from '@/components/blog/BlogToolbar'
import BlogPostListSkeleton from '@/components/skeletons/BlogPostListSkeleton'

export default function BlogPageView() {
  return (
    <section className="relative w-full overflow-hidden bg-[#09060c]/95">
      <BlogBackground />
      <div className="relative z-10 mx-auto max-w-6xl px-3 py-4 xs:px-6 sm:py-8 md:py-12 lg:px-8">
        <BlogHero />
        <div className="relative mb-8 flex h-32 w-full items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="h-px w-full bg-linear-to-r from-transparent via-[#3A3A5A]/50 to-transparent" />
          </div>
          <div className="relative rounded-full border border-[#3A3A5A]/50 bg-linear-to-r from-[#2A2A3F] via-[#3A3A5E] to-[#2A2A3F] p-3 shadow-lg shadow-[#BB86FC]/5">
            <svg className="h-5 w-5 text-[#BB86FC]/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
          </div>
        </div>
        <BlogToolbar />
        <div className="flex w-full flex-col gap-6 rounded-xl border border-[#3A3A5A]/50 bg-[#1F1F2D] p-4 sm:p-8 lg:p-10">
          <Suspense fallback={<BlogPostListSkeleton />}>
            <BlogPageContent />
          </Suspense>
        </div>
      </div>
      <BlogPromoBanner />
    </section>
  )
}
