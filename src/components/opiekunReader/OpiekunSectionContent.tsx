'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Check } from 'lucide-react'
import type { OpiekunReaderSection, ReaderDirection } from '@/types/procedureReaderTypes'
import OpiekunStepRow from './OpiekunStepRow'

const variants = {
  enter: (dir: ReaderDirection) => ({ opacity: 0, x: dir === 1 ? -32 : 32 }),
  center: { opacity: 1, x: 0 },
  exit: (dir: ReaderDirection) => ({ opacity: 0, x: dir === 1 ? 32 : -32 }),
}

export default function OpiekunSectionContent({
  section,
  sectionIndex,
  totalSections,
  direction,
  markedSteps,
  onToggleStep,
}: {
  section: OpiekunReaderSection
  sectionIndex: number
  totalSections: number
  direction: ReaderDirection
  markedSteps: number[]
  onToggleStep: (stepNumber: number) => void
}) {
  const steps = section.steps ?? []
  const markedInSection = steps.filter((_, index) =>
    markedSteps.includes(index + 1)
  ).length

  return (
    <>
      <div className="flex items-center gap-3 mb-8 flex-wrap">
        <span className="shrink-0 text-xs font-semibold text-zinc-400 bg-zinc-100 border border-zinc-200 px-2.5 py-1 rounded-full">
          {sectionIndex + 1} / {totalSections}
        </span>
        <h2 className="text-lg md:text-2xl font-bold text-zinc-800 leading-snug">
          {section.title}
        </h2>
        {steps.length > 0 && (
          <span
            className={`ml-auto shrink-0 inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border transition-colors ${
              markedInSection === steps.length
                ? 'text-slate-700 bg-slate-100 border-slate-200'
                : 'text-zinc-400 bg-zinc-50 border-zinc-200'
            }`}
          >
            <Check className="w-3.5 h-3.5" />
            {markedInSection} / {steps.length} zaznaczonych
          </span>
        )}
      </div>

      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={sectionIndex}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.3, ease: 'easeInOut' }}
        >
          {section.description ? (
            <p className="text-zinc-600 text-sm md:text-base leading-relaxed">
              {section.description}
            </p>
          ) : (
            <div className="divide-y divide-zinc-100 border border-zinc-200 rounded-xl overflow-hidden bg-white">
              {steps.map((step, index) => (
                <OpiekunStepRow
                  key={index}
                  stepNumber={index + 1}
                  text={step}
                  isMarked={markedSteps.includes(index + 1)}
                  onToggle={() => onToggleStep(index + 1)}
                />
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </>
  )
}
