import { Suspense } from "react"
import { getTestimonialsWithUsernames } from "@/server/queries"
import TestimonialsCarousel from "@/components/TestimonialsCarousel"
import TestimonialsCarouselSkeleton from "@/components/skeletons/TestimonialsCarouselSkeleton"

export default async function Testimonials() {

  return (
    <section
      aria-labelledby="testimonials-title"
      className="relative w-full  px-4 sm:px-8 md:px-16 py-12 sm:py-16 lg:py-20 bg-violet-200"
    >
      <header className="relative mb-8 sm:mb-12 text-center">
        <span className="inline-block rounded-full bg-white/10  px-3 py-1 text-xs font-medium tracking-wide">
          Opinie studentów
        </span>
        <h2
          id="testimonials-title"
          className="mt-3 text-2xl md:text-3xl lg:text-4xl font-bold"
        >
          Co mówią o programie
        </h2>
        <p className="mt-2 text-sm md:text-base text-zinc-500">
          Prawdziwe głosy naszych użytkowników.
        </p>
      </header>

      <div className="relative mx-auto w-full max-w-4xl">
        <Suspense fallback={<TestimonialsCarouselSkeleton/>}>
        <TestimonialsCarouselWithData />
        </Suspense>
      </div>
    </section>
  )
}

async function TestimonialsCarouselWithData() {
  const testimonials = await getTestimonialsWithUsernames()
  return <TestimonialsCarousel testimonials={testimonials} />
}
