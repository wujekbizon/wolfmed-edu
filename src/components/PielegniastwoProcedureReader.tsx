'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, RotateCcw, ArrowLeft, Clock, Award, Check } from 'lucide-react'
import Link from 'next/link'
import type { PielegniastwoProcedure, PielegniastwoSection } from '@/types/pielegniastwoTypes'

type Direction = 1 | -1

type ExtendedSection = PielegniastwoSection & { _notes?: string }

export default function PielegniastwoProcedureReader({
  procedure,
}: {
  procedure: PielegniastwoProcedure
}) {
  const [currentSection, setCurrentSection] = useState(0)
  const [direction, setDirection] = useState<Direction>(1)

  const allSections: ExtendedSection[] = procedure.notes
    ? [...procedure.sections, { title: 'Uwagi', steps: [], _notes: procedure.notes }]
    : procedure.sections

  const totalSections = allSections.length
  const isLastSection = currentSection === totalSections - 1
  const isFirstSection = currentSection === 0
  const progressPct = Math.round(((currentSection + 1) / totalSections) * 100)

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

  const variants = {
    enter: (dir: Direction) => ({ opacity: 0, x: dir === 1 ? -32 : 32 }),
    center: { opacity: 1, x: 0 },
    exit: (dir: Direction) => ({ opacity: 0, x: dir === 1 ? 32 : -32 }),
  }

  const active = allSections[currentSection]
  const isNotesSection = !!active._notes

  return (
    <div className="flex w-full h-full overflow-hidden">

      {/* ── SIDEBAR ─────────────────────────────────────────── */}
      <aside className="hidden lg:flex flex-col w-72 xl:w-80 shrink-0 h-full border-r border-zinc-200 bg-white overflow-y-auto scrollbar-webkit">
        <div className="p-6 flex flex-col gap-6">

          <Link
            href="/panel/procedury/pielegniarstwo"
            className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-700 transition-colors w-fit"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Wróć do listy
          </Link>

          <div>
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
              Procedura
            </p>
            <h1 className="text-sm font-bold text-zinc-800 leading-snug">{procedure.name}</h1>
          </div>

          <div className="flex flex-col gap-2">
            <div className="inline-flex items-center gap-2 text-sm text-zinc-500">
              <Clock className="w-4 h-4 shrink-0" />
              {procedure.executionTime}
            </div>
            <div className="inline-flex items-center gap-2 text-sm text-zinc-500">
              <Award className="w-4 h-4 shrink-0" />
              Próg zdania: {procedure.passingPoints} / {procedure.totalPoints} pkt
            </div>
          </div>

          <div className="border-t border-zinc-100" />

          <div>
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">
              Sekcje
            </p>
            <ol className="space-y-1">
              {allSections.map((section, index) => {
                const isCompleted = index < currentSection
                const isActive = index === currentSection
                return (
                  <li
                    key={index}
                    className={`flex items-start gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-slate-700 text-white'
                        : isCompleted
                        ? 'text-zinc-400'
                        : 'text-zinc-400'
                    }`}
                  >
                    <span
                      className={`shrink-0 w-5 h-5 rounded-full border flex items-center justify-center text-xs font-semibold mt-0.5 ${
                        isActive
                          ? 'border-white/30 bg-white/10 text-white'
                          : isCompleted
                          ? 'border-zinc-200 bg-zinc-100 text-zinc-400'
                          : 'border-zinc-200 text-zinc-400'
                      }`}
                    >
                      {isCompleted ? <Check className="w-3 h-3" /> : index + 1}
                    </span>
                    <span className="text-xs leading-snug">{section.title}</span>
                  </li>
                )
              })}
            </ol>
          </div>
        </div>
      </aside>

      {/* ── MAIN ────────────────────────────────────────────── */}
      <main className="flex flex-col flex-1 h-full overflow-hidden">

        {/* Mobile header */}
        <div className="lg:hidden flex flex-col gap-2 border-b border-zinc-200 bg-white px-4 py-3">
          <Link
            href="/panel/procedury/pielegniarstwo"
            className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-700 transition-colors w-fit"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Wróć do listy
          </Link>
          <h1 className="text-sm font-bold text-zinc-800 leading-snug line-clamp-2">
            {procedure.name}
          </h1>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="inline-flex items-center gap-1 text-xs text-zinc-500">
              <Clock className="w-3.5 h-3.5" />
              {procedure.executionTime}
            </span>
            <span className="inline-flex items-center gap-1 text-xs text-zinc-500">
              <Award className="w-3.5 h-3.5" />
              {procedure.passingPoints}/{procedure.totalPoints} pkt
            </span>
            <span className="text-xs text-zinc-400">
              Sekcja {currentSection + 1} z {totalSections}
            </span>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto scrollbar-webkit">
          <div className="px-4 md:px-10 py-6 md:py-10 max-w-4xl w-full mx-auto">

            {/* Section header */}
            <div className="flex items-center gap-3 mb-8">
              <span className="shrink-0 text-xs font-semibold text-zinc-400 bg-zinc-100 border border-zinc-200 px-2.5 py-1 rounded-full">
                {currentSection + 1} / {totalSections}
              </span>
              <h2 className="text-lg md:text-2xl font-bold text-zinc-800 leading-snug">
                {active.title}
              </h2>
            </div>

            {/* Section body */}
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={currentSection}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3, ease: 'easeInOut' }}
              >
                {isLastSection && isNotesSection ? (
                  <p className="text-zinc-600 text-sm md:text-base leading-relaxed">
                    {active._notes}
                  </p>
                ) : isLastSection && !isNotesSection && active.steps.length === 0 ? (
                  /* Completion screen */
                  <div className="flex flex-col items-center justify-center text-center py-16 gap-4">
                    <div className="text-6xl animate-bounce">🎉</div>
                    <h3 className="text-xl font-bold text-zinc-800">Ukończyłeś procedurę!</h3>
                    <p className="text-zinc-500 text-sm max-w-sm">
                      Przeszedłeś przez wszystkie {totalSections} sekcje tej procedury.
                    </p>
                    <button
                      onClick={handleReset}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-xl transition-colors mt-2"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Zacznij od nowa
                    </button>
                  </div>
                ) : (
                  <div className="divide-y divide-zinc-100 border border-zinc-200 rounded-xl overflow-hidden bg-white">
                    {active.steps.map((step) => (
                      <div key={step.number} className="flex items-start gap-4 px-4 md:px-6 py-4">
                        <span className="shrink-0 w-7 h-7 rounded-full bg-zinc-100 border border-zinc-200 text-zinc-500 text-xs font-bold flex items-center justify-center mt-0.5">
                          {step.number}
                        </span>
                        <p className="flex-1 text-zinc-700 text-sm md:text-base leading-relaxed">
                          {step.step}
                        </p>
                        <span className="shrink-0 text-xs font-semibold text-zinc-400 bg-zinc-50 border border-zinc-200 px-2 py-1 rounded-full mt-0.5 whitespace-nowrap">
                          {step.points} pkt
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* ── BOTTOM NAV BAR ─────────────────────────────────── */}
        <div className="shrink-0 border-t border-zinc-200 bg-white px-4 md:px-10 py-4 flex flex-col gap-3">
          {/* Progress */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-1.5 bg-zinc-100 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-slate-700 rounded-full"
                initial={false}
                animate={{ width: `${progressPct}%` }}
                transition={{ duration: 0.4, ease: 'easeInOut' }}
              />
            </div>
            <span className="text-xs font-semibold text-zinc-400 shrink-0 w-9 text-right">
              {progressPct}%
            </span>
          </div>

          {/* Buttons */}
          {!isLastSection && (
            <div className="flex gap-3">
              {!isFirstSection && (
                <button
                  onClick={handlePrevious}
                  className="flex items-center justify-center gap-2 px-5 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-sm font-medium rounded-xl border border-zinc-200 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Cofnij
                </button>
              )}
              <button
                onClick={handleNext}
                className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-700 hover:bg-slate-800 text-white text-sm font-medium rounded-xl transition-colors"
              >
                Następna sekcja
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {isLastSection && (
            <div className="flex gap-3">
              {!isFirstSection && (
                <button
                  onClick={handlePrevious}
                  className="flex items-center justify-center gap-2 px-5 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-sm font-medium rounded-xl border border-zinc-200 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Cofnij
                </button>
              )}
              <button
                onClick={handleReset}
                className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-xl transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                Zacznij od nowa
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
