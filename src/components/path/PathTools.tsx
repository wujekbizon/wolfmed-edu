'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import ToolListItem from './ToolListItem'
import { PATH_TOOLS_INTRO } from '@/constants/pathTools'
import type { CardProps } from '@/constants/educationalPathCards'

export default function PathTools({
  features,
  courseSlug,
}: {
  features: CardProps[]
  courseSlug: string
}) {
  const intro = PATH_TOOLS_INTRO[courseSlug]
  const [selected, setSelected] = useState(0)
  const tabs = useRef<(HTMLButtonElement | null)[]>([])

  if (!intro) return null

  // Roving focus: arrows move selection and focus together, which is what a
  // tablist is expected to do once one tab owns the tab stop.
  const move = (from: number, delta: number) => {
    const next = (from + delta + features.length) % features.length
    setSelected(next)
    tabs.current[next]?.focus()
  }

  const onKeyDown = (index: number) => (event: React.KeyboardEvent) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
      event.preventDefault()
      move(index, 1)
    }
    if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
      event.preventDefault()
      move(index, -1)
    }
  }

  const active = features[selected]

  return (
    // relative is load-bearing: GradientOverlay in the parent section is
    // absolutely positioned and paints above any static sibling.
    <section
      aria-labelledby="tools-title"
      className="relative w-full overflow-hidden rounded-3xl bg-gradient-to-b from-[#2A262B] to-[#1C1A1E] px-6 py-14 sm:px-10 lg:px-[60px] lg:py-[68px]"
    >
      <div className="mx-auto max-w-[1180px]">
        <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between lg:gap-10">
          <div>
            <p className="font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-rose-500">
              {intro.eyebrow}
            </p>
            <h2
              id="tools-title"
              className="mt-4 text-3xl lg:text-[42px] font-bold leading-[1.08] tracking-[-0.03em] text-zinc-100"
            >
              {intro.headline[0]}
              <br />
              {intro.headline[1]}
            </h2>
          </div>
          <p className="max-w-[340px] text-[15px] leading-[1.7] text-white/55 text-pretty">
            {intro.lead}
          </p>
        </header>

        <div className="mt-8 grid items-start gap-7 lg:mt-12 lg:grid-cols-[400px_1fr] lg:gap-11">
          <div role="tablist" aria-label="Narzędzia kierunku" className="order-2 grid lg:order-1">
            {features.map((feature, index) => (
              <ToolListItem
                key={feature.title}
                feature={feature}
                index={index}
                selected={index === selected}
                onSelect={() => setSelected(index)}
                onKeyDown={onKeyDown(index)}
                registerRef={(node) => {
                  tabs.current[index] = node
                }}
              />
            ))}
          </div>

          <div className="order-1 relative h-[260px] overflow-hidden rounded-2xl bg-zinc-900 lg:order-2 lg:h-[470px]">
            {active?.imgSrc && (
              <Image
                key={active.title}
                src={active.imgSrc}
                alt={active.title}
                fill
                sizes="(max-width: 1024px) 100vw, 720px"
                className="object-cover"
              />
            )}
            <div className="absolute inset-x-5 bottom-5 flex items-end justify-between gap-5">
              <span className="rounded-md bg-white/85 px-3 py-2 font-mono text-[11.5px] leading-[1.5] text-zinc-800">
                {active?.text}
              </span>
              <span className="rounded-md bg-white/85 px-3 py-2 font-mono text-[10.5px] font-medium text-zinc-800">
                {String(selected + 1).padStart(2, '0')} /{' '}
                {String(features.length).padStart(2, '0')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
