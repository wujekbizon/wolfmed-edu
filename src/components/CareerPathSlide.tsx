'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { Video } from 'lucide-react'
import Button from '@/components/ui/Button'
import { KIERUNKI_WOLFEK_VIDEOS } from '@/constants/kierunkiWolfekVideos'
import type { CareerPathCarouselItem } from '@/types/careerPathsTypes'

export default function CareerPathSlide({ path, index, selected, pathCount, onVideo }: {
  path: CareerPathCarouselItem
  index: number
  selected: number
  pathCount: number
  onVideo: () => void
}) {
  const active = selected === index
  const nearby = Math.abs(selected - index) <= 1 ||
    (selected === 0 && index === pathCount - 1) || (selected === pathCount - 1 && index === 0)

  return <motion.div className="relative flex w-full shrink-0 items-center justify-center" style={{ display: nearby ? 'block' : 'none' }}>
    <div className="relative mx-auto flex w-full flex-col lg:max-w-full lg:flex-row">
      <motion.div className="relative z-10 w-full bg-white/95 p-4 shadow-2xl backdrop-blur-sm sm:p-8 md:px-16 md:py-16 lg:absolute lg:left-0 lg:top-1/2 lg:w-[655px] lg:-translate-y-1/2 lg:px-20"
        initial={{ opacity: 0, y: 50 }} animate={{ opacity: active ? 1 : 0, y: active ? 0 : 50 }}
        transition={{ duration: .6, delay: .2, ease: 'easeOut' }}>
        <h2 className="mb-4 text-2xl font-semibold leading-tight text-slate-900 sm:mb-6 sm:text-4xl md:text-5xl">{path.title}</h2>
        <p className="mb-6 line-clamp-3 text-sm font-medium leading-relaxed text-slate-600 sm:mb-8 sm:text-base md:line-clamp-none md:text-lg">{path.teaser}</p>
        <div className="flex flex-wrap items-center gap-3">
          <Link href={`/kierunki/${path.slug}`} className="w-fit rounded-full border border-zinc-900/70 bg-linear-to-r from-red-400 to-red-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-red-400/30 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-red-400/40 active:scale-95 md:px-8 md:py-4 md:text-base">
            {path.cta}
          </Link>
          {KIERUNKI_WOLFEK_VIDEOS[path.slug] && <Button type="button" variant="secondary" size="sm"
            className="kierunki-course-video-button" data-active-slide={active} onClick={onVideo}>
            <Video size={16} aria-hidden="true" /> Prezentacja kursu
          </Button>}
        </div>
      </motion.div>
      <div className={`relative w-full transition-opacity duration-500 ${active ? 'opacity-100' : 'opacity-50'}`}>
        <div className="relative h-[500px] w-full md:h-[600px] lg:h-[700px]">
          <Image src={path.image} alt={path.title} fill className="object-cover object-top"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 90vw, 80vw" priority />
        </div>
      </div>
    </div>
  </motion.div>
}
