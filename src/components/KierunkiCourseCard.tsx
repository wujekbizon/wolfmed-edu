'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowUpRight, ArrowRight, BookOpenCheck, Sparkles, UsersRound } from 'lucide-react'
import { KIERUNKI_COURSE_CARDS } from '@/constants/kierunkiCourseCards'
import { PRICING_ANCHOR } from '@/constants/pricingAnchor'
import type { KierunkiCourseCardProps } from '@/types/careerPathsTypes'
import KierunkiCourseVideoButton from './wolfek/KierunkiCourseVideoButton'
import KierunkiRollingNumber from './KierunkiRollingNumber'

export default function KierunkiCourseCard({ path }: KierunkiCourseCardProps) {
  const copy = KIERUNKI_COURSE_CARDS[path.slug]
  const reduced = useReducedMotion()

  return <motion.article className="kierunki-course-card" data-course={path.slug}
    initial={false} animate="rest" whileHover={reduced ? 'rest' : 'hover'}>
    <header className="kierunki-course-header">
      <h3><Link className="kierunki-course-main-link" href={'/kierunki/' + path.slug}>{path.title}</Link></h3>
      <p className="kierunki-course-description">{copy.description}</p>
    </header>
    <div className="kierunki-course-stage">
      <div className="kierunki-course-note">
        <span className="kierunki-course-orbit" aria-hidden="true"><Sparkles size={24} strokeWidth={1.3} /></span>
        <h4>{copy.noteTitle}</h4>
        <p>{copy.note}</p>
      </div>
      <motion.div className="kierunki-course-glass"
        variants={{ rest: { y: 0 }, hover: { y: -2 } }}
        transition={{ duration: .35, ease: 'easeOut' }}>
        <div className="kierunki-course-image">
          <Image src={path.image} alt="" fill sizes="(max-width: 767px) 90vw, (max-width: 1279px) 80vw, 700px" className="object-cover" />
        </div>
        <span className="kierunki-course-image-label"><BookOpenCheck size={15} aria-hidden="true" /> Nauka w Twoim rytmie</span>
      </motion.div>
      <div className="kierunki-course-metric">
        <span className="kierunki-course-orbit" aria-hidden="true"><BookOpenCheck size={25} strokeWidth={1.3} /></span>
        <strong><KierunkiRollingNumber value={copy.metricValue} reduced={Boolean(reduced)} /></strong>
        <p>{copy.metricLabel}</p>
      </div>
    </div>
    {copy.students && <div className="kierunki-course-social-proof">
      <UsersRound size={19} strokeWidth={1.5} aria-hidden="true" />
      <p><strong><KierunkiRollingNumber value={copy.students} reduced={Boolean(reduced)} /></strong> studentów</p>
    </div>}
    <footer className="kierunki-course-footer">
      <ul className="kierunki-course-tags">{copy.tags.map((tag) => <li key={tag}>{tag}</li>)}</ul>
      <span className="kierunki-course-explore" aria-hidden="true">Poznaj kierunek <ArrowRight size={17} /></span>
      <div className="kierunki-course-actions">
        <KierunkiCourseVideoButton courseSlug={path.slug} />
        <Link href={'/kierunki/' + path.slug + '#' + PRICING_ANCHOR}
          aria-label={'Zobacz ceny: ' + path.title}>Zobacz ceny <ArrowUpRight size={15} aria-hidden="true" /></Link>
      </div>
    </footer>
  </motion.article>
}
