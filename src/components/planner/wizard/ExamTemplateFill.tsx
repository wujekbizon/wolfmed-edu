'use client'

import { GraduationCap } from 'lucide-react'
import { buildExamTemplateConcepts } from '@/helpers/examTemplateConcepts'
import type { PlanWizardController } from '@/hooks/usePlanWizard'

export default function ExamTemplateFill({ wizard }: { wizard: PlanWizardController }) {
  const remaining = buildExamTemplateConcepts(wizard.catalog).filter(
    (concept) => !wizard.hasConcept(concept.label)
  ).length

  if (remaining === 0) return null

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-lg bg-zinc-50 border border-zinc-200">
      <div className="flex-1 min-w-52">
        <p className="flex items-center gap-1.5 text-sm font-semibold text-zinc-700">
          <GraduationCap className="w-4 h-4 text-[#ff9898]" />
          Przygotowujesz się do całego egzaminu?
        </p>
        <p className="text-xs text-zinc-400 mt-0.5">
          Dodaj wszystkie przedmioty kursu z czasem dopasowanym do ich wielkości.
          Potem możesz usunąć zbędne albo rozłożyć czas równomiernie.
        </p>
      </div>
      <button
        type="button"
        onClick={wizard.fillExamTemplate}
        className="px-4 py-2 rounded-lg bg-zinc-900 text-white text-xs font-semibold hover:bg-zinc-700 transition-colors"
      >
        Wypełnij planem egzaminacyjnym ({remaining})
      </button>
    </div>
  )
}
