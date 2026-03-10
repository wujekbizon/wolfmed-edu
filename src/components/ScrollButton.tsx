'use client'

import { motion } from 'framer-motion'

export default function ScrollButton({ tag, className = '' }: { tag: string; className?: string }) {
  return (
    <div className={`${className} absolute left-1/2 -translate-x-1/2`}>
      <a href={`#${tag}`} className="block" aria-label="Scroll to explore section">
        <div className="relative w-8 h-14 border-2 border-red-400/50 hover:border-red-500/70 rounded-full backdrop-blur-sm bg-white/20 transition-colors duration-300">
          <motion.div
            animate={{ y: [0, 24, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-red-400 rounded-full"
          />
        </div>
      </a>
    </div>
  )
}
