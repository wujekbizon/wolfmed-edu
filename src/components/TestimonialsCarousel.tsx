"use client"

import { useCarousel } from "@/hooks/useCarousel"
import { getInitials } from "@/helpers/getInitials"
import { Testimonial } from "@/types/careerPathsTypes"
import Stars from "./Stars"
import { formatDaysAgo } from "@/helpers/formatDate"
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react"

export default function TestimonialsCarousel({
  testimonials,
}: {
  testimonials: Testimonial[]
}) {
  const { emblaRef, selected, isPlaying, scrollTo, scrollPrev, scrollNext, setIsPlaying } =
    useCarousel({
      options: {
        loop: true,
        align: "start",
        slidesToScroll: 1,
        duration: 20,
        containScroll: "trimSnaps",
      },
      autoplayDelay: 8000,
    })

  return (
    <div className="relative w-full">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex cursor-grab active:cursor-grabbing select-none -mx-3">
          {testimonials.map((t, idx) => (
            <div
              key={idx}
              className="shrink-0 flex-[0_0_100%] sm:flex-[0_0_50%] lg:flex-[0_0_33.33%] px-3"
              aria-roledescription="slide"
              aria-label={`Slide ${idx + 1} z ${testimonials.length}`}
            >
              <figure className="h-72 flex flex-col bg-white/20 backdrop-blur-xl rounded-2xl border border-white/50 shadow-lg shadow-black/10 p-6 transition-all duration-300 hover:bg-white/30 hover:border-white/60 hover:shadow-xl hover:shadow-black/15">
                {/* Stars */}
                <div className="mb-3 flex items-center justify-between">
                  <Stars rating={t.rating} />
                  <span className="text-4xl font-serif text-[#ff5b5b]/40 leading-none select-none">&ldquo;</span>
                </div>

                {/* Quote text — scrollable for very long content, fixed height via parent */}
                <blockquote className="flex-1 min-h-0 overflow-y-auto text-sm sm:text-base text-zinc-800 leading-relaxed pr-1 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-zinc-400/50 [&::-webkit-scrollbar-thumb]:rounded-full">
                  {t.content}
                </blockquote>

                {/* Author footer */}
                <div className="mt-4 pt-4 border-t border-white/30 flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-[#ff5b5b]/10 ring-1 ring-[#ff5b5b]/25 grid place-items-center shrink-0">
                    <span className="text-sm font-bold text-[#ff5b5b]">
                      {getInitials(t.username ?? "")}
                    </span>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-semibold text-zinc-900 truncate">
                      {t.username}
                    </span>
                    <span className="text-xs text-zinc-400">
                      {formatDaysAgo(t.createdAt)}
                    </span>
                  </div>
                </div>
              </figure>
            </div>
          ))}
        </div>
      </div>

      {/* Controls: arrows left, counter + play right */}
      <div className="mt-6 flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <button
            onClick={() => { scrollPrev(); setIsPlaying(false) }}
            className="h-9 w-9 rounded-full border border-zinc-200 bg-white shadow-sm flex items-center justify-center text-zinc-600 hover:bg-zinc-50 hover:border-zinc-300 transition-all"
            aria-label="Poprzednia opinia"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={() => { scrollNext(); setIsPlaying(false) }}
            className="h-9 w-9 rounded-full border border-zinc-200 bg-white shadow-sm flex items-center justify-center text-zinc-600 hover:bg-zinc-50 hover:border-zinc-300 transition-all"
            aria-label="Następna opinia"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-zinc-400 tabular-nums">
            {selected + 1} / {testimonials.length}
          </span>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="h-9 w-9 rounded-full border border-zinc-200 bg-white shadow-sm flex items-center justify-center text-zinc-600 hover:bg-zinc-50 transition-all"
            aria-label={isPlaying ? "Wstrzymaj odtwarzanie" : "Wznów odtwarzanie"}
          >
            {isPlaying ? <Pause size={14} /> : <Play size={14} />}
          </button>
        </div>
      </div>
    </div>
  )
}
