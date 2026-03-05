import { ChevronDown, ChevronUp } from 'lucide-react'
import type { LearningStep } from '@/types/cellTypes'

interface PlanStepItemProps {
  step: LearningStep
  isExpanded: boolean
  onToggle: () => void
}

export default function PlanStepItem({ step, isExpanded, onToggle }: PlanStepItemProps) {
  return (
    <div className="bg-white">
      <button
        type="button"
        onClick={onToggle}
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
        <div className="px-5 pb-4">
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
}
