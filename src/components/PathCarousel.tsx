'use client'

import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react'
import { useCarousel } from '@/hooks/useCarousel'
import type { CareerPathCarouselItem } from '@/types/careerPathsTypes'
import KierunkiCourseCard from './KierunkiCourseCard'

export default function PathCarousel({ paths }: { paths: CareerPathCarouselItem[] }) {
  const { emblaRef, selected, isPlaying, scrollTo, scrollPrev, scrollNext, setIsPlaying } =
    useCarousel({ autoplayDelay: 7000 })

  return <div className="kierunki-course-carousel" role="region" aria-label="Kursy" aria-roledescription="karuzela">
    <div className="kierunki-course-carousel-viewport" ref={emblaRef}>
      <div className="kierunki-course-carousel-track">
        {paths.map((path, index) => <div className="kierunki-course-carousel-slide" key={path.slug}
          role="group" aria-roledescription="slajd" aria-label={`${index + 1} z ${paths.length}: ${path.title}`}>
          <KierunkiCourseCard path={path} />
        </div>)}
      </div>
    </div>
    <div className="kierunki-course-carousel-controls">
      <button type="button" onClick={scrollPrev} aria-label="Poprzedni kurs">
        <ChevronLeft size={19} />
      </button>
      <div className="kierunki-course-carousel-dots" aria-label="Wybierz kurs">
        {paths.map((path, index) => <button key={path.slug} type="button" onClick={() => scrollTo(index)}
          aria-label={`Pokaż kurs: ${path.title}`} aria-current={selected === index ? 'true' : undefined} />)}
      </div>
      <button type="button" onClick={() => setIsPlaying(!isPlaying)}
        aria-label={isPlaying ? 'Wstrzymaj karuzelę' : 'Uruchom karuzelę'} aria-pressed={isPlaying}>
        {isPlaying ? <Pause size={16} /> : <Play size={16} />}
      </button>
      <button type="button" onClick={scrollNext} aria-label="Następny kurs">
        <ChevronRight size={19} />
      </button>
    </div>
  </div>
}
