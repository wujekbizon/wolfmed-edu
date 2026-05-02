'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, RotateCcw, ArrowLeft, Clock, Award } from 'lucide-react'
import Link from 'next/link'
import type { PielegniastwoProcedure } from '@/types/pielegniastwoTypes'

type Direction = 1 | -1

export default function PielegniastwoProcedureReader({
  procedure,
}: {
  procedure: PielegniastwoProcedure
}) {
  const [currentSection, setCurrentSection] = useState(0)
  const [direction, setDirection] = useState<Direction>(1)

  const { sections, notes } = procedure
  const allSections = notes
    ? [...sections, { title: 'Uwagi', steps: [], _notes: notes } as any]
    : sections

  const totalSections = allSections.length
  const isLastSection = currentSection === totalSections - 1
  const isFirstSection = currentSection === 0

  const handleNext = () => {
    if (currentSection < totalSections - 1) {
      setDirection(1)
      setCurrentSection((prev) => prev + 1)
    }
  }

  const handlePrevious = () => {
    if (currentSection > 0) {
      setDirection(-1)
      setCurrentSection((prev) => prev - 1)
    }
  }

  const handleReset = () => {
    setDirection(1)
    setCurrentSection(0)
  }

  const sectionVariants = {
    enter: (dir: Direction) => ({ opacity: 0, x: dir === 1 ? -40 : 40 }),
    center: { opacity: 1, x: 0 },
    exit: (dir: Direction) => ({ opacity: 0, x: dir === 1 ? 40 : -40 }),
  }

  const active = allSections[currentSection]
  const isNotesSection = !active.steps?.length && (active as any)._notes

  return (
    <div className="flex flex-col w-full h-full gap-4 px-1 sm:px-4 py-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 px-2">
        <div className="flex-1 min-w-0">
          <Link
            href="/panel/procedury/pielegniarstwo"
            className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-700 mb-2 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Wróć do listy
          </Link>
          <h1 className="text-lg md:text-xl font-bold text-zinc-800 leading-tight">
            {procedure.name}
          </h1>
        </div>
        <div className="flex items-center gap-3 shrink-0 flex-wrap justify-end">
          <span className="inline-flex items-center gap-1 text-xs text-zinc-500 bg-zinc-100 px-2 py-1 rounded-full">
            <Clock className="w-3.5 h-3.5" />
            {procedure.executionTime}
          </span>
          <span className="inline-flex items-center gap-1 text-xs text-zinc-500 bg-zinc-100 px-2 py-1 rounded-full">
            <Award className="w-3.5 h-3.5" />
            {procedure.passingPoints}/{procedure.totalPoints} pkt
          </span>
        </div>
      </div>

      {/* Reader card */}
      <div className="w-full max-w-2xl mx-auto bg-white border border-zinc-200 rounded-2xl shadow-sm flex flex-col overflow-hidden">
        <div className="p-6 flex flex-col h-full">
          {/* Section header */}
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-zinc-900 font-semibold text-base md:text-lg leading-tight flex-1 mr-4">
              {active.title}
            </h2>
            <span className="text-xs font-medium px-2 py-1 rounded-full bg-zinc-100 text-zinc-700 border border-zinc-200 shrink-0">
              {currentSection + 1}/{totalSections}
            </span>
          </div>

          {/* Section content */}
          <div className="relative mb-6 min-h-[240px]">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={currentSection}
                custom={direction}
                variants={sectionVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.35, ease: 'easeInOut' }}
                className="absolute inset-0 overflow-y-auto scrollbar-webkit pr-1"
              >
                {isNotesSection ? (
                  <p className="text-zinc-600 text-sm leading-relaxed">{(active as any)._notes}</p>
                ) : (
                  <ol className="space-y-2">
                    {active.steps.map((step: any) => (
                      <li key={step.number} className="flex gap-3 text-sm">
                        <span className="shrink-0 w-6 h-6 rounded-full bg-zinc-100 border border-zinc-200 text-zinc-600 text-xs font-semibold flex items-center justify-center mt-0.5">
                          {step.number}
                        </span>
                        <span className="flex-1 text-zinc-700 leading-relaxed">{step.step}</span>
                        <span className="shrink-0 text-xs font-medium text-zinc-400 mt-0.5">
                          {step.points} pkt
                        </span>
                      </li>
                    ))}
                  </ol>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Progress bar */}
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-xs text-zinc-500">
              <span>Postęp</span>
              <span className="font-semibold">
                {Math.round(((currentSection + 1) / totalSections) * 100)}%
              </span>
            </div>
            <div className="h-2 bg-zinc-100 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-slate-700"
                initial={false}
                animate={{ width: `${((currentSection + 1) / totalSections) * 100}%` }}
                transition={{ duration: 0.45, ease: 'easeInOut' }}
              />
            </div>
          </div>

          {/* Navigation */}
          {!isLastSection ? (
            <div className="mt-auto flex flex-col sm:flex-row gap-3">
              {!isFirstSection && (
                <button
                  onClick={handlePrevious}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium bg-zinc-100 text-zinc-700 hover:bg-zinc-200 border border-zinc-200 transition-all duration-200"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Cofnij
                </button>
              )}
              <button
                onClick={handleNext}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium bg-slate-700 text-white hover:bg-slate-800 transition-all duration-200 shadow-sm"
              >
                Następna sekcja
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="mt-auto flex flex-col gap-3">
              {!isFirstSection && (
                <button
                  onClick={handlePrevious}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium bg-zinc-100 text-zinc-700 hover:bg-zinc-200 border border-zinc-200 transition-all duration-200"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Cofnij
                </button>
              )}
              <div className="flex flex-col items-center text-center py-4">
                <div className="text-4xl mb-3 animate-bounce">🎉</div>
                <p className="text-zinc-700 mb-4 font-medium text-sm">
                  Ukończyłeś wszystkie sekcje tej procedury.
                </p>
                <button
                  onClick={handleReset}
                  className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium bg-green-600 text-white hover:bg-green-700 transition-all"
                >
                  <RotateCcw className="w-4 h-4" />
                  Zacznij od nowa
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
