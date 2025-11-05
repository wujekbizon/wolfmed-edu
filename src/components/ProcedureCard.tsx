'use client'

import { Procedure } from '@/types/dataTypes'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react'
import Link from 'next/link'

type Direction = 1 | -1

export default function ProcedureCard({ procedure }: { procedure: Procedure }) {
  const [currentStep, setCurrentStep] = useState(0)
  const [direction, setDirection] = useState<Direction>(1)

  const { data: { algorithm }, id } = procedure

  const totalSteps = algorithm.length
  const isComplete = currentStep === totalSteps - 1

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setDirection(1)
      setCurrentStep(prev => prev + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setDirection(-1)
      setCurrentStep(prev => prev - 1)
    }
  }

  const handleReset = () => {
    setDirection(1)
    setCurrentStep(0)
  }

  const textVariants = {
    enter: (dir: Direction) => ({
      opacity: 0,
      x: dir === 1 ? -40 : 40,
    }),
    center: { opacity: 1, x: 0 },
    exit: (dir: Direction) => ({
      opacity: 0,
      x: dir === 1 ? 40 : -40,
    }),
  }

  return (
    <div className="relative w-full h-full flex flex-col md:flex-row items-end justify-end gap-6">
      <div className="w-full md:w-3/4 lg:w-1/2 mx-auto bg-white border border-zinc-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden flex flex-col">
        <div className="p-6 flex flex-col h-full">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-zinc-900 font-semibold text-lg md:text-xl leading-tight">
              Krok {currentStep + 1}
            </h3>
            <span className="text-xs font-medium px-2 py-1 rounded-full bg-zinc-100 text-zinc-700 border border-zinc-200">
              {currentStep + 1}/{totalSteps}
            </span>
          </div>
          <div className="relative mb-6 h-[200px] overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                custom={direction}
                variants={textVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.35, ease: 'easeInOut' }}
                className="absolute inset-0"
              >
                <div className="flex-1 overflow-y-auto scrollbar-webkit mb-4 pr-1">
                  <p className="text-zinc-600 text-sm md:text-base leading-relaxed">
                    {algorithm[currentStep]?.step}
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-xs text-zinc-600">
              <span>Postęp</span>
              <span className="font-semibold">
                {Math.round(((currentStep + 1) / totalSteps) * 100)}%
              </span>
            </div>
            <div className="h-2 bg-zinc-200 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-slate-700"
                initial={false}
                animate={{
                  width: `${((currentStep + 1) / totalSteps) * 100}%`,
                }}
                transition={{ duration: 0.45, ease: 'easeInOut' }}
              />
            </div>
          </div>
          {!isComplete ? (
            <div className="mt-auto flex flex-col sm:flex-row gap-3">
              {currentStep > 0 && (
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
                Następny krok
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center py-8">
              <div className="text-5xl mb-4 animate-bounce">🎉</div>
              <p className="text-zinc-700 mb-4 font-medium">
                Gratulacje! Ukończyłeś wszystkie kroki.
              </p>
              <button
                onClick={handleReset}
                className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium bg-green-600 text-white hover:bg-green-700 transition-all"
              >
                <RotateCcw className="w-4 h-4" />
                Zacznij od nowa
              </button>
           
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
