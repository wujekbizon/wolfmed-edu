"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image, { StaticImageData } from "next/image";
import { useCarousel } from "@/hooks/useCarousel";

type Path = {
  slug: string;
  title: string;
  teaser: string;
  image: string | StaticImageData;
  cta: string;
};

interface CarouselProps {
  paths: Path[];
}

export default function PathCarousel({ paths }: CarouselProps) {
  const { emblaRef, selected, isPlaying, scrollTo, setIsPlaying } = useCarousel({
    autoplayDelay: 4000
  });

  return (
    <div className="relative w-full">
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex">
            {paths.map((p, idx) => (
              <motion.div
                key={p.slug}
                className="relative shrink-0 w-full flex items-center justify-center"
                style={{ display: Math.abs(selected - idx) <= 1 || (selected === 0 && idx === paths.length - 1) || (selected === paths.length - 1 && idx === 0) ? 'block' : 'none' }}
              >
                <div className="relative w-full lg:max-w-[100%] flex flex-col md:flex-row mx-auto">
                  <motion.div
                    className="relative bg-white/95 backdrop-blur-sm p-4 sm:p-8 md:p-16 px-4 sm:px-8 md:px-16 lg:px-20 shadow-2xl w-full lg:w-[655px] lg:absolute lg:left-0 lg:top-1/2 lg:-translate-y-1/2 z-10"
                    key={`info-${p.slug}`}
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: selected === idx ? 1 : 0, y: selected === idx ? 0 : 50 }}
                    transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
                  >
                    <div className="flex flex-col justify-center h-full">
                      <h1 className="text-2xl sm:text-4xl md:text-5xl font-semibold mb-4 md:mb-6 text-slate-900 leading-16">{p.title}</h1>
                      <p className="text-slate-600 font-medium text-sm sm:text-base md:text-lg leading-relaxed mb-6 md:mb-8 line-clamp-3 md:line-clamp-none">{p.teaser}</p>
                      <Link 
                        href={`/kierunki/${p.slug}`}
                        className="w-fit px-4 md:px-8 py-2 md:py-4 text-sm md:text-base font-semibold rounded-full bg-linear-to-r from-red-400 to-red-500 text-white border border-zinc-900/70 shadow-lg shadow-red-400/30 transition-all duration-300 hover:shadow-xl hover:shadow-red-400/40 hover:scale-105 active:scale-95"
                      >
                        {p.cta}
                      </Link>
                    </div>

                  </motion.div>
                  <div className={`relative w-full transition-opacity duration-500 ${selected === idx ? 'opacity-100' : 'opacity-50'}`}>
                    <div className="relative w-full h-[500px] md:h-[600px] lg:h-[700px]">
                      <Image
                        src={p.image}
                        alt={p.title}
                        fill
                        className="object-cover object-top"
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 90vw, 80vw"
                        priority
                      />
                      <div className="absolute bottom-8 right-8 flex md:flex-col items-center gap-4 px-3 py-5 bg-black/20 backdrop-blur">
                        <button
                          onClick={() => setIsPlaying(!isPlaying)}
                          className="p-2 text-slate-900/80  backdrop-blur-sm border border-zinc-800/50 hover:bg-white transition-colors cursor-pointer"
                          aria-label={isPlaying ? 'Pause' : 'Play'}
                        >
                          {isPlaying ? (
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-4 h-4 md:w-5 md:h-5">
                              <rect x="6" y="5" width="4" height="14" fill="currentColor" />
                              <rect x="14" y="5" width="4" height="14" fill="currentColor" />
                            </svg>
                          ) : (
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-4 h-4 md:w-5 md:h-5">
                              <path d="M8 5v14l11-7z" fill="currentColor" />
                            </svg>
                          )}
                        </button>
                        <div className="flex md:flex-col gap-5">
                          {paths.map((_, i) => (
                            <button
                              key={i}
                              className={`transition-all duration-300 cursor-pointer
                                w-4 h-4 md:w-4 md:h-4
                                ${
                                  selected === i 
                                    ? "bg-white border border-slate-900/80 " 
                                    : "border border-slate-800/80 backdrop-blur-sm hover:border-slate-900/80 hover:bg-white"
                                }
                                rounded-full
                              `}
                              onClick={() => scrollTo(i)}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
    </div>
  );
}
