"use client"

import { useCarousel } from "@/hooks/useCarousel"
import { getInitials } from "@/helpers/getInitials"
import { Testimonial } from "@/types/careerPathsTypes"
import Stars  from "./Stars"
import { formatDaysAgo } from "@/helpers/formatDate"

export default function TestimonialsCarousel({
  testimonials,
}: {
  testimonials: Testimonial[]
}) {
  const { emblaRef, selected, isPlaying, scrollTo, setIsPlaying } = useCarousel(
    { autoplayDelay: 8000 }
  )

  return (
    <div className="relative w-full">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex cursor-grab active:cursor-grabbing select-none">
          {testimonials.map((t, idx) => (
            <div
              key={idx}
              className="shrink-0 flex-[0_0_100%] w-full px-2 sm:px-4"
              aria-roledescription="slide"
              aria-label={`Slide ${idx + 1} z ${testimonials.length}`}
            >
              <figure className="relative rounded-2xl border border-zinc-200/70 bg-white/90 p-8 sm:p-10 shadow-lg backdrop-blur-sm">
              <div className="flex flex-col gap-4">
                  <blockquote className="text-base sm:text-lg text-zinc-700 leading-relaxed">
                    {t.content}
                  </blockquote>

                  <figcaption className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-red-50 ring-1 ring-red-200 grid place-items-center">
                        <span className="text-lg font-semibold text-red-600">
                          {getInitials(t.username ?? "")}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm sm:text-base text-zinc-700 font-medium">
                          {t.username}
                        </span>
                        <span className="text-xs text-zinc-500">
                          {formatDaysAgo(t.createdAt)}
                        </span>
                      </div>
                    </div>

                    <div>
                      <Stars rating={t.rating} />
                    </div>
                  </figcaption>
                </div>
              </figure>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-center gap-4">
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-zinc-300 bg-white shadow-sm hover:bg-zinc-50 text-zinc-600"
          aria-label={isPlaying ? "Wstrzymaj odtwarzanie" : "Wznów odtwarzanie"}
        >
          {isPlaying ? (
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden
            >
              <rect x="6" y="5" width="4" height="14" />
              <rect x="14" y="5" width="4" height="14" />
            </svg>
          ) : (
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>

        <div className="flex items-center gap-2">
          {testimonials.map((_, i) => (
            <button
              key={i}
              className={`h-2.5 w-2.5 rounded-full border transition-colors ${
                selected === i
                  ? "bg-red-500 border-red-500"
                  : "border-zinc-300 bg-transparent hover:bg-zinc-200"
              }`}
              aria-label={`Przejdź do opinii ${i + 1}`}
              aria-current={selected === i}
              onClick={() => scrollTo(i)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
