'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'

const STATUS_LINES = [
  'AI analizuje kroki procedury…',
  'Układam pytania egzaminacyjne…',
  'Dobieram podchwytliwe odpowiedzi…',
  'Sprawdzam zgodność z algorytmem…',
  'Jeszcze chwila — ostatnie szlify…',
]

export default function QuizGeneratingState() {
  const [lineIndex, setLineIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(
      () => setLineIndex((index) => (index + 1) % STATUS_LINES.length),
      2600
    )
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="flex flex-col items-center justify-center py-14 px-6 text-center">
      <div className="relative w-20 h-20 mb-6">
        <motion.div
          className="absolute inset-0 rounded-full bg-gradient-to-br from-[#ff9898] to-fuchsia-400 opacity-30"
          animate={{ scale: [1, 1.35, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute inset-2 rounded-full bg-gradient-to-br from-[#ff9898] to-fuchsia-400 opacity-60"
          animate={{ scale: [1.15, 0.95, 1.15] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
        <div className="absolute inset-4 rounded-full bg-gradient-to-br from-[#ff9898] to-fuchsia-400 flex items-center justify-center text-white shadow-lg">
          <motion.div
            animate={{ rotate: [0, 12, -12, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Sparkles className="w-6 h-6" />
          </motion.div>
        </div>
      </div>

      <motion.p
        key={lineIndex}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-sm font-semibold text-zinc-700"
      >
        {STATUS_LINES[lineIndex]}
      </motion.p>
      <p className="text-xs text-zinc-400 mt-2">
        Quiz powstaje specjalnie dla tej procedury — zwykle trwa to kilkanaście sekund.
      </p>
    </div>
  )
}
