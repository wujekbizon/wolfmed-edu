import TestimonialsCarouselSkeleton from '@/components/skeletons/TestimonialsCarouselSkeleton'
import TestimonialsCarousel from '@/components/TestimonialsCarousel'
import { getTestimonialsWithUsernames } from '@/server/queries'
import { Suspense } from 'react'

export default async function Testimonials() {
  const testimonials = await getTestimonialsWithUsernames()

  return (
    <section
      aria-labelledby='testimonials-title'
      className='relative w-full px-4 sm:px-6 md:px-8 py-32'
    >
      <div className='bg-transparent rounded-3xl px-4 lg:px-8 xl:px-16 py-12 sm:py-16 lg:py-20'>
        <header className='relative mb-8 sm:mb-12 text-center'>
          <span className='mb-3 sm:mb-4 inline-flex items-center gap-1.5 rounded-full border border-red-300/50 bg-white/60 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-red-500 backdrop-blur-sm'>
            <span className='h-1.5 w-1.5 rounded-full bg-red-400' />
            Opinie studentów
          </span>
          <h2
            id='testimonials-title'
            className='mt-3 text-3xl sm:text-4xl font-bold text-zinc-800'
          >
            Co mówią o programie
          </h2>
          <p className='mt-2 text-sm md:text-base text-zinc-600'>
            Prawdziwe głosy naszych użytkowników.
          </p>
        </header>

        <div className='max-w-6xl mx-auto'>
          <Suspense fallback={<TestimonialsCarouselSkeleton />}>
            <TestimonialsCarousel testimonials={testimonials} />
          </Suspense>
        </div>
      </div>
    </section>
  )
}