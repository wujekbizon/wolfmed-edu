'use client'

import { useWypelnijForm } from '@/hooks/useWypelnijForm'
import WypelnijCasePanel from '@/components/diagnozy/wypelnij/WypelnijCasePanel'
import WypelnijGuide from '@/components/diagnozy/wypelnij/WypelnijGuide'
import WypelnijComplete from '@/components/diagnozy/wypelnij/WypelnijComplete'
import type { Diagnoza, DiagnozaFormulation } from '@/types/diagnozyTypes'

export default function WypelnijRunner({
  diagnoza,
  formulations,
  alreadyCompleted,
}: {
  diagnoza: Diagnoza
  formulations: DiagnozaFormulation[]
  alreadyCompleted: boolean
}) {
  const form = useWypelnijForm(diagnoza, alreadyCompleted)

  const incomplete =
    !form.chosenSlug ||
    form.cele.length === 0 ||
    form.interwencje.length === 0 ||
    !form.ocena

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <WypelnijCasePanel opisPrzypadku={diagnoza.opisPrzypadku} />
      </div>

      <p className="text-sm text-zinc-600 mb-4">
        Wypełnij przewodnik procesu pielęgnowania: postaw diagnozę, a następnie uzupełnij
        kolejne pola, dodając pozycje z list.
      </p>

      <WypelnijGuide form={form} formulations={formulations} />

      <WypelnijComplete
        completed={form.completed}
        submitting={form.submitting}
        disabled={incomplete}
        onComplete={form.complete}
        onPracticeAgain={form.practiceAgain}
      />
    </div>
  )
}
