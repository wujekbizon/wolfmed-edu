'use client'

import { useState } from 'react'
import { NotebookPen, ListChecks } from 'lucide-react'
import { planCompletionPercent } from '@/helpers/planCompletionPercent'
import type { PlanProgress } from '@/types/plannerTypes'
import PlanDashboardHeader from './dashboard/PlanDashboardHeader'
import PlanStatTiles from './dashboard/PlanStatTiles'
import PlanProgressBar from './dashboard/PlanProgressBar'
import TodayFocusCard from './dashboard/TodayFocusCard'
import ConceptList from './ConceptList'
import QuickStudyLogForm from './QuickStudyLogForm'
import PlanSettings from './PlanSettings'

export default function PlanDashboard({ progress }: { progress: PlanProgress }) {
  const [showSettings, setShowSettings] = useState(false)
  const { plan, concepts } = progress

  const completionPercent = planCompletionPercent(
    progress.attributedMinutes,
    progress.plannedTotalMinutes
  )
  const completedConcepts = concepts.filter((c) => c.completedAt).length

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white border border-zinc-200 rounded-2xl p-4 sm:p-8 shadow-sm">
        <PlanDashboardHeader
          plan={plan}
          paceStatus={progress.paceStatus}
          showSettings={showSettings}
          onToggleSettings={() => setShowSettings((value) => !value)}
        />
        <PlanStatTiles progress={progress} completionPercent={completionPercent} />
        <PlanProgressBar
          completionPercent={completionPercent}
          completedConcepts={completedConcepts}
          totalConcepts={concepts.length}
          unattributedMinutes={progress.unattributedMinutes}
        />
        {showSettings && <PlanSettings plan={plan} />}
      </div>

      <TodayFocusCard todayIsStudyDay={progress.todayIsStudyDay} suggestion={progress.suggestion} />

      <div className="bg-white border border-zinc-200 rounded-2xl p-4 sm:p-8 shadow-sm">
        <h2 className="flex items-center gap-2 text-lg font-bold text-zinc-900 mb-4">
          <ListChecks className="w-5 h-5 text-[#ff9898]" />
          Zagadnienia
          <span className="ml-1 text-sm font-semibold text-zinc-400">
            {completedConcepts}/{concepts.length}
          </span>
        </h2>
        <ConceptList planId={plan.id} concepts={concepts} />
      </div>

      <div className="bg-white border border-zinc-200 rounded-2xl p-4 sm:p-8 shadow-sm">
        <h2 className="flex items-center gap-2 text-lg font-bold text-zinc-900 mb-1">
          <NotebookPen className="w-5 h-5 text-[#ff9898]" />
          Zapisz naukę
        </h2>
        <p className="text-sm text-zinc-500 mb-4">
          Uczysz się z książek albo notatek poza aplikacją? Zapisz to — liczy się do Twojego postępu i serii dni nauki.
        </p>
        <QuickStudyLogForm concepts={concepts} />
      </div>
    </div>
  )
}
