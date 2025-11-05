'use client'

import { useEffect, useState } from 'react'
import { useActionState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import SubmitButton from '@/components/SubmitButton'
import { submitScenarioAction } from '@/actions/challenges'
import { useToastMessage } from '@/hooks/useToastMessage'
import { EMPTY_FORM_STATE } from '@/constants/formState'
import { generateScenarioChallenge } from '@/helpers/challengeGenerator'
import type { Procedure } from '@/types/dataTypes'
import { getProcedureSlugFromId } from '@/constants/procedureSlugs'

interface Props {
  procedure: Procedure
}

export default function ScenarioChallengeForm({ procedure }: Props) {
  const router = useRouter()
  const procedureSlug = getProcedureSlugFromId(procedure.id) || procedure.id
  const [state, action] = useActionState(submitScenarioAction, EMPTY_FORM_STATE)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [startTime] = useState(Date.now())
  const [challenge] = useState(() => generateScenarioChallenge(procedure))
  const noScriptFallback = useToastMessage(state)

  const timeSpent = Math.floor((Date.now() - startTime) / 1000)

  useEffect(() => {
    if (state.status === 'SUCCESS') {
      const timer = setTimeout(() => {
        router.push(`/panel/procedury/${procedureSlug}/wyzwania`)
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [state.status, procedure.id])
  


  return (
    <section className="flex flex-col items-center gap-8 px-4 sm:px-6 py-8 w-full h-full overflow-y-auto scrollbar-webkit bg-gradient-to-br from-zinc-50 via-white to-zinc-50">
      <div className="w-full md:w-[85%] lg:w-3/4 xl:w-2/3 2xl:w-[60%] bg-white p-8 rounded-xl shadow-lg border border-zinc-200">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2 text-zinc-900">Scenariusz kliniczny</h2>
          <h3 className="text-lg font-medium text-zinc-700">{procedure.data.name}</h3>
        </div>

        <form action={action}>
          <input type="hidden" name="procedureId" value={procedure.id} />
          <input type="hidden" name="procedureName" value={procedure.data.name} />
          <input type="hidden" name="selectedOption" value={selectedOption ?? ''} />
          <input type="hidden" name="timeSpent" value={timeSpent} />
          <input type="hidden" name="correctAnswer" value={challenge.correctAnswer} />

          {/* Scenario Card */}
          <div className="mb-8">
            <div className="relative bg-gradient-to-br from-white to-zinc-50 p-6 sm:p-8 rounded-xl border-2 border-zinc-200 shadow-md overflow-hidden">
              {/* Gradient accent bar */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-zinc-700 via-zinc-800 to-zinc-900" />

              {/* Scenario icon */}
              <div className="flex items-start gap-4 mb-4">
                <div className="shrink-0 w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center shadow-sm">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-zinc-600 uppercase tracking-wide mb-1">
                    Opis przypadku
                  </h4>
                  <p className="text-base leading-relaxed text-zinc-800 font-normal">
                    {challenge.scenario}
                  </p>
                </div>
              </div>
            </div>

            {/* Question */}
            <div className="mt-6 p-4 bg-zinc-50 border-l-4 border-zinc-800 rounded-r-lg">
              <p className="text-lg font-semibold text-zinc-900 leading-relaxed">
                {challenge.question}
              </p>
            </div>
          </div>

          {/* Options */}
          <div className="space-y-3 mb-8">
            {challenge.options.map((option, index) => {
              const isSelected = selectedOption === index
              const letter = String.fromCharCode(65 + index) // A, B, C, D

              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => setSelectedOption(index)}
                  className={`w-full flex items-center gap-4 p-5 rounded-lg border-2 transition-all duration-200 text-left group animate-fadeInUp ${
                    isSelected
                      ? 'border-zinc-800 bg-zinc-50 shadow-md'
                      : 'border-zinc-300 hover:border-zinc-400 hover:bg-zinc-50'
                  }`}
                  style={{ '--slidein-delay': `${index * 0.05}s` } as React.CSSProperties}
                >
                  {/* Custom Radio Button */}
                  <div className="shrink-0 relative">
                    <div
                      className={`w-6 h-6 rounded-full border-2 transition-all duration-200 flex items-center justify-center ${
                        isSelected
                          ? 'border-zinc-800 bg-zinc-800'
                          : 'border-zinc-400 bg-white group-hover:border-zinc-500'
                      }`}
                    >
                      {isSelected && (
                        <svg
                          className="w-4 h-4 text-white"
                          fill="none"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="3"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </div>

                  {/* Letter Badge */}
                  <div className={`shrink-0 w-8 h-8 rounded-md flex items-center justify-center text-sm font-bold transition-colors duration-200 ${
                    isSelected
                      ? 'bg-zinc-800 text-white'
                      : 'bg-zinc-200 text-zinc-700 group-hover:bg-zinc-300'
                  }`}>
                    {letter}
                  </div>

                  {/* Option Text */}
                  <span className={`flex-1 text-base leading-relaxed transition-colors duration-200 ${
                    isSelected
                      ? 'text-zinc-900 font-semibold'
                      : 'text-zinc-700 font-medium'
                  }`}>
                    {option}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 w-full">
            <SubmitButton
              disabled={selectedOption === null}
              label={selectedOption === null ? 'Wybierz odpowiedź' : 'Zatwierdź odpowiedź'}
              loading="Sprawdzanie..."
              className={`flex-1 h-11 sm:h-12 px-6 font-medium text-base rounded-lg transition-all duration-200 ${
                selectedOption !== null
                  ? 'bg-zinc-900 text-white hover:bg-zinc-800 shadow-md hover:shadow-lg'
                  : 'bg-zinc-300 text-zinc-500 cursor-not-allowed'
              }`}
            />
            <Link
              href={`/panel/procedury/${procedureSlug}/wyzwania`}
              className="h-11 sm:h-12 px-6 bg-white text-zinc-700 border-2 border-zinc-300 font-medium text-base rounded-lg hover:bg-zinc-50 hover:border-zinc-400 transition-all duration-200 flex items-center justify-center"
            >
              Anuluj
            </Link>
          </div>
          {noScriptFallback}
        </form>
      </div>
    </section>
  )
}
