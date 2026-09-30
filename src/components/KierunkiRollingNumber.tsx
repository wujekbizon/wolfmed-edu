'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import type { KierunkiRollingNumberProps } from '@/types/careerPathsTypes'

export default function KierunkiRollingNumber({ value, reduced }: KierunkiRollingNumberProps) {
  const numberRef = useRef<HTMLSpanElement>(null)
  const inView = useInView(numberRef, { once: true, amount: .5 })

  return <span className="kierunki-rolling-number" ref={numberRef}>
    <span className="sr-only">{value}</span>
    <span className="kierunki-rolling-visual" aria-hidden="true">{Array.from(value).map((character, index) =>
      /\d/.test(character) ? <span className="kierunki-rolling-digit" key={index}>
        {reduced ? <span className="kierunki-rolling-glyph" data-zero={character === '0' ? '' : undefined} data-three={character === '3' ? '' : undefined}>{character}</span> :
          <motion.span className="kierunki-rolling-reel" key={`${index}-${character}`}
            initial={{ y: '0em' }} animate={{ y: inView ? `-${10 + Number(character)}em` : '0em' }}
            transition={{ duration: 1.25, delay: index * .08, ease: [0.12, 0.72, 0.19, 1] }}>
            {Array.from({ length: 20 }, (_, digit) =>
              <span className="kierunki-rolling-glyph" data-zero={digit % 10 === 0 ? '' : undefined}
                data-three={digit % 10 === 3 ? '' : undefined} key={digit}>{digit % 10}</span>,
            )}
          </motion.span>}
      </span> : <span className="kierunki-rolling-symbol" key={index}>{character}</span>,
    )}</span>
  </span>
}
