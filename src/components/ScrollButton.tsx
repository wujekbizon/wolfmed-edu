'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

export default function ScrollButton({ tag, className = '' }: { tag: string; className?: string }) {
  return (
    <div className={`${className} absolute left-1/2 -translate-x-1/2`}>
      <Link
        href={`#${tag}`}
        scroll={false}
        aria-label="Scroll to explore section"
        className="block"
        onClick={() => {
          const el = document.getElementById(tag)
          if (!el) return
          const top = el.getBoundingClientRect().top + window.scrollY - 80
          window.scrollTo({ top, behavior: 'smooth' })
        }}
      >
        <div className="relative w-8 h-14 border-2 border-zinc-400 hover:border-zinc-500 rounded-full backdrop-blur-sm bg-zinc-200 hover:bg-white/80 transition-colors duration-300">
          <motion.div
            animate={{ y: [0, 24, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-2 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-red-400 rounded-full"
          />
        </div>
      </Link>
    </div>
  )
}
