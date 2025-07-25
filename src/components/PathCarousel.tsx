"use client";

import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image, { StaticImageData } from "next/image";

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
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    loop: true, 
    align: "center",
    skipSnaps: false,
    duration: 20,
    startIndex: 0,
    containScroll: "trimSnaps"
  });
  const [selected, setSelected] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  const scrollTo = (index: number) => {
    emblaApi?.scrollTo(index);
    setSelected(index);
  };

  const scrollNext = useCallback(() => {
    if (!emblaApi) return;
    emblaApi.scrollNext();
  }, [emblaApi]);

  const onSelect = () => setSelected(emblaApi?.selectedScrollSnap() || 0);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", onSelect);
  }, [emblaApi]);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (isPlaying) {
      intervalId = setInterval(() => {
        scrollNext();
      }, 5000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isPlaying, scrollNext]);

  return (
    <div className="relative w-full">
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex">
            {paths.map((p, idx) => (
              <motion.div
                key={p.slug}
                className="relative flex-shrink-0 w-full flex items-center justify-center"
                style={{ display: Math.abs(selected - idx) <= 1 || (selected === 0 && idx === paths.length - 1) || (selected === paths.length - 1 && idx === 0) ? 'block' : 'none' }}
              >
                <div className="relative w-full lg:max-w-[80%] flex flex-col md:flex-row px-4 lg:px-8 mx-auto">
                  <motion.div
                    className="relative bg-white/95 backdrop-blur-sm p-6 md:p-12 shadow-2xl w-full lg:w-[655px] lg:absolute lg:left-0 lg:top-1/2 lg:-translate-y-1/2 z-10"
                    key={`info-${p.slug}`}
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: selected === idx ? 1 : 0, y: selected === idx ? 0 : 50 }}
                    transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
                  >
                    <div className="flex flex-col justify-center h-full">
                      <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6 text-slate-900">{p.title}</h2>
                      <p className="text-slate-600 font-medium text-base md:text-lg leading-relaxed mb-6 md:mb-8 line-clamp-3 md:line-clamp-none">{p.teaser}</p>
                      <Link 
                        href={`/kierunki/${p.slug}`}
                        className="inline-block px-4 md:px-6 py-2 md:py-3 text-sm md:text-base bg-slate-900 text-white font-medium rounded-[15px] hover:bg-slate-800 transition-colors border border-slate-800"
                      >
                        {p.cta}
                      </Link>
                    </div>

                  </motion.div>
                  
                  <motion.div
                    className="relative w-full"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: selected === idx ? 1 : 0 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  >
                    <div className="relative w-full h-[500px] md:h-[600px] lg:h-[700px]">
                      <Image
                        src={p.image}
                        alt={p.title}
                        width={1200}
                        height={800}
                        className="object-cover object-center w-full h-full"
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
                                    ? "bg-white border border-slate-900/80" 
                                    : "border border-slate-800/80 hover:border-slate-900/80 hover:bg-white"
                                }
                                rounded-full
                              `}
                              onClick={() => scrollTo(i)}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
    </div>
  );
}
