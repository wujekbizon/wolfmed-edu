"use client"

import { useState } from 'react'
import { Clock, BookOpen, ChevronDown, ChevronUp, Target, CheckCircle2, Mic } from 'lucide-react'
import type { Cell } from '@/types/cellTypes'

interface LearningStep {
  number: number
  title: string
  what: string
  why: string
  keyConcepts: string[]
  estimatedMinutes: number
}

interface LearningPlan {
  topic: string
  goal: string
  prerequisites: string[]
  estimatedTotalMinutes: number
  steps: LearningStep[]
  summary: string
  examRelevance?: string
}

export default function PlanCell({ cell }: { cell: Cell }) {
  const [expandedSteps, setExpandedSteps] = useState<Set<number>>(new Set([0]))

  let plan: LearningPlan | null = null
  try {
    plan = JSON.parse(cell.content) as LearningPlan
  } catch {
    return (
      <div className="p-4 text-sm text-zinc-500">Nie udało się wczytać planu nauki.</div>
    )
  }

  const toggleStep = (index: number) => {
    setExpandedSteps(prev => {
      const next = new Set(prev)
      if (next.has(index)) {
        next.delete(index)
      } else {
        next.add(index)
      }
      return next
    })
  }

  const hours = Math.floor(plan.estimatedTotalMinutes / 60)
  const minutes = plan.estimatedTotalMinutes % 60
  const timeLabel = hours > 0
    ? `${hours}h ${minutes > 0 ? `${minutes}min` : ''}`
    : `${minutes}min`

  return (
    <div className="rounded-xl overflow-hidden border border-zinc-200 bg-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-rose-50 to-fuchsia-50 border-b border-zinc-200 px-5 py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-gradient-to-br from-[#ff9898] to-fuchsia-400 rounded-lg shrink-0">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-xs font-medium text-zinc-400 uppercase tracking-wide">Plan nauki</p>
              <h3 className="font-semibold text-zinc-900 text-base leading-snug">{plan.topic}</h3>
            </div>
          </div>
          <div className="flex items-center gap-1.5 bg-white/70 border border-zinc-200 rounded-full px-3 py-1 shrink-0">
            <Clock className="w-3.5 h-3.5 text-zinc-400" />
            <span className="text-xs font-medium text-zinc-600">{timeLabel}</span>
          </div>
        </div>

        <div className="mt-3 flex items-start gap-2">
          <Target className="w-4 h-4 text-[#ff9898] shrink-0 mt-0.5" />
          <p className="text-sm text-zinc-700">{plan.goal}</p>
        </div>
      </div>

      {/* Prerequisites */}
      {plan.prerequisites?.length > 0 && (
        <div className="px-5 py-3 border-b border-zinc-100 bg-zinc-50/50">
          <p className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-2">Wymagania wstępne</p>
          <div className="flex flex-wrap gap-2">
            {plan.prerequisites.map((prereq, i) => (
              <span key={i} className="inline-flex items-center gap-1 bg-white border border-zinc-200 text-zinc-600 text-xs px-2.5 py-1 rounded-full">
                <CheckCircle2 className="w-3 h-3 text-zinc-400" />
                {prereq}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Steps */}
      <div className="divide-y divide-zinc-100">
        {plan.steps?.map((step, index) => {
          const isExpanded = expandedSteps.has(index)
          return (
            <div key={step.number} className="bg-white">
              <button
                type="button"
                onClick={() => toggleStep(index)}
                className="w-full px-5 py-3.5 flex items-center gap-3 text-left hover:bg-zinc-50/80 transition-colors"
              >
                <span className="shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-[#ff9898]/20 to-fuchsia-100 border border-[#ff9898]/30 flex items-center justify-center text-xs font-semibold text-[#e07070]">
                  {step.number}
                </span>
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium text-zinc-800">{step.title}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-zinc-400">{step.estimatedMinutes}min</span>
                  {isExpanded
                    ? <ChevronUp className="w-4 h-4 text-zinc-400" />
                    : <ChevronDown className="w-4 h-4 text-zinc-400" />
                  }
                </div>
              </button>

              {isExpanded && (
                <div className="px-5 pb-4 space-y-3">
                  <div className="ml-9 space-y-3">
                    <div>
                      <p className="text-xs font-medium text-zinc-400 mb-1">Co się nauczyć</p>
                      <p className="text-sm text-zinc-700">{step.what}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-zinc-400 mb-1">Dlaczego ważne klinicznie</p>
                      <p className="text-sm text-zinc-700">{step.why}</p>
                    </div>
                    {step.keyConcepts?.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-zinc-400 mb-1.5">Kluczowe pojęcia</p>
                        <div className="flex flex-wrap gap-1.5">
                          {step.keyConcepts.map((concept, i) => (
                            <span key={i} className="bg-fuchsia-50 border border-fuchsia-200 text-fuchsia-700 text-xs px-2 py-0.5 rounded-md font-mono">
                              {concept}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Footer */}
      <div className="border-t border-zinc-200 bg-zinc-50/50 px-5 py-4 space-y-3">
        {plan.summary && (
          <div>
            <p className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-1">Weryfikacja wiedzy</p>
            <p className="text-sm text-zinc-600">{plan.summary}</p>
          </div>
        )}

        {plan.examRelevance && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
            <p className="text-xs font-medium text-amber-600 mb-0.5">LEK</p>
            <p className="text-xs text-amber-700">{plan.examRelevance}</p>
          </div>
        )}

        <div className="pt-1">
          <div className="relative inline-block group">
            <button
              type="button"
              disabled
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-zinc-200 to-zinc-300 text-zinc-400 text-sm rounded-lg cursor-not-allowed"
            >
              <Mic className="w-4 h-4" />
              Generuj wykład
            </button>
            <div className="absolute bottom-full left-0 mb-2 px-2.5 py-1.5 bg-zinc-800 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              Wkrótce dostępne
              <div className="absolute top-full left-4 border-4 border-transparent border-t-zinc-800" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
