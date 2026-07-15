'use client'

import { useEffect, useRef, useState } from 'react'
import { animate, useInView, useReducedMotion } from 'framer-motion'
import { heroStats, type HeroStat } from '@/constants/heroStats'

function StatTile({ value, suffix, label }: HeroStat) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-15%' })
  const reduceMotion = useReducedMotion()
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    if (!inView) return
    if (reduceMotion) {
      setDisplay(value)
      return
    }
    const controls = animate(0, value, {
      duration: 1.4,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v: number) => setDisplay(Math.floor(v)),
    })
    return () => controls.stop()
  }, [inView, value, reduceMotion])

  return (
    <div ref={ref} className="flex flex-col items-center text-center">
      <span className="bg-gradient-to-r from-fuchsia-500 via-red-500 to-amber-400 bg-clip-text text-4xl font-bold tabular-nums text-transparent sm:text-5xl">
        {display.toLocaleString('pl-PL')}
        {suffix}
      </span>
      <span className="mt-2 text-sm text-zinc-600 sm:text-base">{label}</span>
    </div>
  )
}

export default function HeroStats() {
  return (
    <section className="w-full px-4 py-8 sm:px-6 md:px-8 md:py-12">
      <div className="mx-auto max-w-6xl rounded-3xl border border-white/60 bg-white/50 px-6 py-10 shadow-sm backdrop-blur-md sm:px-10">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {heroStats.map((stat) => (
            <StatTile
              key={stat.label}
              value={stat.value}
              suffix={stat.suffix}
              label={stat.label}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
