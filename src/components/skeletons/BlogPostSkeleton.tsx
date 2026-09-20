import BlogBackground from '@/components/blog/BlogBackground'

export default function BlogPostSkeleton() {
  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-[#09060c]/95 p-2 sm:p-4 md:p-6 lg:p-8">
      <BlogBackground />
      <div className="relative z-10 mx-auto w-full max-w-6xl animate-pulse">
        <div className="mb-6 h-10 w-44 rounded-full bg-[#2A2A3F]" />
        <article className="overflow-hidden rounded-2xl border border-[#3A3A5A] bg-[#2A2A3F]">
          <div className="h-64 w-full bg-[#3A3A5A]/60 sm:h-80 md:h-96" />
          <div className="p-5 sm:p-8 md:p-10 lg:p-14">
            <div className="mx-auto max-w-4xl">
              <div className="mb-6 h-10 w-4/5 rounded bg-[#3A3A5A]/60" />
              <div className="mb-12 h-12 w-48 rounded bg-[#3A3A5A]/40" />
              <div className="space-y-4">
                <div className="h-5 w-full rounded bg-[#3A3A5A]/40" />
                <div className="h-5 w-full rounded bg-[#3A3A5A]/40" />
                <div className="h-5 w-3/4 rounded bg-[#3A3A5A]/40" />
              </div>
            </div>
          </div>
        </article>
      </div>
    </section>
  )
}
