import { Target, Clock, ListChecks } from 'lucide-react'

const STEPS = [
  { title: 'Cel', icon: Target },
  { title: 'Czas', icon: Clock },
  { title: 'Zakres', icon: ListChecks },
] as const

export default function WizardStepIndicator({ step }: { step: number }) {
  return (
    <div className="flex gap-2 mb-8">
      {STEPS.map(({ title, icon: StepIcon }, index) => (
        <div key={title} className="flex-1">
          <div
            className={`h-1.5 rounded-full mb-2 transition-colors ${
              index <= step ? 'bg-red-500' : 'bg-zinc-100'
            }`}
          />
          <span
            className={`inline-flex items-center gap-1.5 text-xs font-semibold ${
              index <= step ? 'text-zinc-900' : 'text-zinc-400'
            }`}
          >
            <StepIcon className="w-3.5 h-3.5" />
            {index + 1}. {title}
          </span>
        </div>
      ))}
    </div>
  )
}
