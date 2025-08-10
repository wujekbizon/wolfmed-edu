"use client";

import Image from "next/image";
import { useCarousel } from "@/hooks/useCarousel";
import { getInitials } from "@/helpers/getInitials";
import { Testimonial } from "@/types/careerPathsTypes";



const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "Świetna platforma edukacyjna! Materiały są konkretne, a mapa programu pomaga zrozumieć cały tok nauczania.",
    author: "Anna, studentka pielęgniarstwa",
    role: "II rok",
  },
  {
    quote:
      "Przejrzyste moduły, testy i procedury – wszystko w jednym miejscu. Idealne wsparcie przed kolokwiami i praktykami.",
    author: "Michał, student pielęgniarstwa",
    role: "III rok",
  },
  {
    quote:
      "Najbardziej cenię możliwość szybkiego powtórzenia materiału i sprawdzenia się na quizach. Polecam!",
    author: "Katarzyna, absolwentka",
  },
];

interface CarouselProps {
  testimonials: Testimonial[];
}


export default function TestimonialsCarousel({ testimonials }: CarouselProps) {
  const { emblaRef, selected, isPlaying, scrollTo, setIsPlaying } = useCarousel({ autoplayDelay: 5000 });

  return (
    <div className="relative w-full">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex cursor-grab active:cursor-grabbing select-none">
          {testimonials.map((t, idx) => (
            <div
              key={idx}
              className="flex-shrink-0 flex-[0_0_100%] w-full px-2 sm:px-4"
              aria-roledescription="slide"
              aria-label={`Slide ${idx + 1} z ${TESTIMONIALS.length}`}
            >
              <figure className="relative mx-auto max-w-3xl rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8 shadow-[0_10px_30px_rgba(0,0,0,0.25)] backdrop-blur-md">
                <div className="pointer-events-none absolute -inset-px rounded-3xl [mask-image:linear-gradient(transparent,black,transparent)]">
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-fuchsia-500/10 via-rose-500/10 to-indigo-500/10 blur-2xl" />
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-1 inline-flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-rose-500 to-indigo-500 text-white shadow-md">
                    <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                      <path d="M7.17 6A5.17 5.17 0 0 0 2 11.17V22h8.27V11.17A5.17 5.17 0 0 0 5.1 6H7.17Zm11 0A5.17 5.17 0 0 0 13 11.17V22h8.27V11.17A5.17 5.17 0 0 0 16.1 6h2.07Z" />
                    </svg>
                  </div>
                  <blockquote className="text-base sm:text-lg text-zinc-100/95 leading-relaxed">
                    {t.quote}
                  </blockquote>
                </div>
                <figcaption className="mt-5 flex items-center gap-3 text-sm sm:text-base text-zinc-300">
                  {t.avatarUrl ? (
                    <div className="relative h-10 w-10 overflow-hidden rounded-full ring-1 ring-white/30">
                      <Image
                        src={t.avatarUrl}
                        alt={`Zdjęcie użytkownika ${t.author}`}
                        width={40}
                        height={40}
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-white/10 ring-1 ring-white/20 grid place-items-center">
                      <span className="text-[11px] font-semibold text-white/90">
                        {getInitials(t.author)}
                      </span>
                    </div>
                  )}
                  <div>
                    <span className="font-medium text-white">{t.author}</span>
                    {t.role ? <span className="ml-2 text-zinc-400">• {t.role}</span> : null}
                  </div>
                </figcaption>
              </figure>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-center gap-4">
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white hover:bg-white/20"
          aria-label={isPlaying ? "Wstrzymaj odtwarzanie" : "Wznów odtwarzanie"}
        >
          {isPlaying ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <rect x="6" y="5" width="4" height="14" />
              <rect x="14" y="5" width="4" height="14" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>

        <div className="flex items-center gap-2">
          {TESTIMONIALS.map((_, i) => (
            <button
              key={i}
              className={`h-2.5 w-2.5 rounded-full border transition-colors ${
                selected === i ? "bg-white border-white" : "border-white/40 hover:border-white"
              }`}
              aria-label={`Przejdź do opinii ${i + 1}`}
              aria-current={selected === i}
              onClick={() => scrollTo(i)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}


