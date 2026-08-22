import PlanSettingsForm from './settings/PlanSettingsForm'
import PlanLifecycleActions from './settings/PlanLifecycleActions'
import type { PlanProgress } from '@/types/plannerTypes'

export default function PlanSettings({ plan }: { plan: PlanProgress['plan'] }) {
  return (
    <div className="mt-6 pt-6 border-t border-zinc-200 space-y-6">
      <PlanSettingsForm plan={plan} />
      <PlanLifecycleActions plan={plan} />
    </div>
  )
}
