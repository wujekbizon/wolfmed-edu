'use client'

import { BookOpen } from 'lucide-react'
import FocusProgram from './FocusProgram'
import CatalogEntry from './CatalogEntry'
import CustomConceptInput from './CustomConceptInput'
import ProcedurePicker from './ProcedurePicker'
import SelectedConceptsList from './SelectedConceptsList'
import ExamTemplateFill from './ExamTemplateFill'
import type { PlanWizardController } from '@/hooks/usePlanWizard'

export default function StepScope({ wizard }: { wizard: PlanWizardController }) {
  return (
    <div className="space-y-6">
      {wizard.goalType === 'exam' && !wizard.focusEntry && (
        <ExamTemplateFill wizard={wizard} />
      )}
      {wizard.focusEntry ? (
        <FocusProgram focusEntry={wizard.focusEntry} wizard={wizard} />
      ) : (
        <div>
          <h3 className="flex items-center gap-1.5 text-sm font-semibold text-zinc-700 mb-2">
            <BookOpen className="w-4 h-4 text-[#ff9898]" />
            Wybierz zagadnienia z programu kursu
          </h3>
          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {wizard.catalog.map((entry) => (
              <CatalogEntry key={entry.categoryKey} entry={entry} wizard={wizard} />
            ))}
          </div>
        </div>
      )}

      <ProcedurePicker wizard={wizard} />
      <CustomConceptInput wizard={wizard} />
      <SelectedConceptsList wizard={wizard} />
    </div>
  )
}
