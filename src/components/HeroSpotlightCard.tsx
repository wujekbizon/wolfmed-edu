'use client'

import { useRef, useState, type ReactNode, type MouseEvent } from 'react'

export default function HeroSpotlightCard({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const [hovered, setHovered] = useState(false)

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top })
  }

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group relative overflow-hidden rounded-[2rem] border border-white/70 bg-white/55 px-6 py-10 shadow-2xl shadow-rose-400/20 backdrop-blur-xl sm:px-16 sm:py-14"
    >
      {/* cursor-follow spotlight (adapted from Aceternity Card Spotlight for a light surface) */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 transition-opacity duration-300"
        style={{
          opacity: hovered ? 1 : 0,
          background: `radial-gradient(600px circle at ${pos.x}px ${pos.y}px, rgba(255,91,91,0.16), transparent 60%)`,
        }}
      />
      <div className="relative z-10 flex flex-col items-center text-center">{children}</div>
    </div>
  )
}
