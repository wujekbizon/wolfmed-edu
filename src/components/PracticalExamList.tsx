'use client'

import { useActionState, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import PracticalExamCard from '@/components/PracticalExamCard'
import PracticalExamRunnerSkeleton from '@/components/skeletons/PracticalExamRunnerSkeleton'
import { EMPTY_FORM_STATE } from '@/constants/formState'
import { generatePracticalExamAction } from '@/actions/praktyczny'
import { useToastMessage } from '@/hooks/useToastMessage'
import type { PublicExam } from '@/types/praktycznyTypes'

interface Props {
  exams: PublicExam[]
  isPremium?: boolean
}

export default function PracticalExamList({ exams, isPremium = false }: Props) {
  const [state, action, isPending] = useActionState(generatePracticalExamAction, EMPTY_FORM_STATE)
  const noScriptFallback = useToastMessage(state)
  const router = useRouter()
  const [navigating, setNavigating] = useState(false)

  useEffect(() => {
    if (state.status === 'SUCCESS' && 'examId' in state && state.examId) {
      setNavigating(true)
      router.push(`/panel/egzaminy/${state.examId}`)
    }
  }, [state, router])

  // Keep the skeleton up through generation and the subsequent navigation,
  // so the user lands on the freshly generated arkusz without a flash back.
  if (isPending || navigating) {
    return <PracticalExamRunnerSkeleton />
  }

  return (
    <section className="flex flex-col items-center w-full h-full overflow-y-auto scrollbar-webkit px-2 sm:px-4 py-8">
      <div className="w-full 2xl:w-3/4 flex flex-col mx-auto gap-6 md:gap-8">
        <div className="px-1">
          <h1 className="text-2xl font-bold text-zinc-800">Egzamin praktyczny</h1>
          <p className="text-zinc-500 text-sm mt-1">
            Wybierz arkusz z prawdziwej sesji egzaminacyjnej i wypełnij dokumentację jak na egzaminie
          </p>
        </div>

        {exams.length > 0 && (
          <div className="flex flex-col gap-4 md:gap-8">
            <p className="px-1 text-xs font-semibold text-zinc-400 uppercase tracking-widest">
              Arkusze z prawdziwych sesji
            </p>
            {exams.map((exam) => (
              <PracticalExamCard key={exam.id} variant="exam" exam={exam} />
            ))}
          </div>
        )}

        <div className="flex flex-col gap-4 md:gap-8">
          <p className="px-1 text-xs font-semibold text-zinc-400 uppercase tracking-widest">
            Nowe arkusze
          </p>
          <PracticalExamCard variant="ai" isPremium={isPremium} action={action} />
        </div>
      </div>
      {noScriptFallback}
    </section>
  )
}
