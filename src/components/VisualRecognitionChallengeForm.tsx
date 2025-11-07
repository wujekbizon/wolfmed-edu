'use client'

import { useEffect, useState } from 'react'
import { useActionState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import SubmitButton from '@/components/SubmitButton'
import VisualRecognitionChallengeSkeleton from '@/components/skeletons/VisualRecognitionChallengeSkeleton'
import { submitVisualRecognitionAction } from '@/actions/challenges'
import { useToastMessage } from '@/hooks/useToastMessage'
import { EMPTY_FORM_STATE } from '@/constants/formState'
import type { Procedure } from '@/types/dataTypes'
import type { VisualRecognitionChallenge } from '@/types/challengeTypes'
import { getProcedureSlugFromId } from '@/constants/procedureSlugs'

interface Props {
  procedure: Procedure
  allProcedures: Procedure[]
  challenge: VisualRecognitionChallenge
}

export default function VisualRecognitionChallengeForm({ procedure, allProcedures, challenge }: Props) {
  const router = useRouter()
  const procedureSlug = getProcedureSlugFromId(procedure.id) || procedure.id
  const [state, action] = useActionState(submitVisualRecognitionAction, EMPTY_FORM_STATE)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [startTime] = useState(Date.now())
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
    <section className="flex flex-col items-center px-4 sm:px-6 py-8 w-full h-full bg-gradient-to-br from-zinc-50 via-white to-zinc-50">
      <div className="w-full md:w-[85%] lg:w-3/4 xl:w-2/3 2xl:w-[60%] max-h-full overflow-y-auto scrollbar-webkit bg-white rounded-xl shadow-lg border border-zinc-200">
        {/* Header with gradient background */}
        <div className="bg-gradient-to-r from-zinc-800 to-zinc-900 p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-2">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <h2 className="text-2xl font-bold text-white">Rozpoznawanie wizualne</h2>
          </div>
          <p className="text-zinc-200 text-sm">
            Przeanalizuj obraz i wybierz prawidłową odpowiedź
          </p>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8">
          <form action={action}>
            <input type="hidden" name="procedureId" value={procedure.id} />
            <input type="hidden" name="procedureName" value={procedure.data.name} />
            <input type="hidden" name="selectedOption" value={selectedOption ?? ''} />
            <input type="hidden" name="correctAnswer" value={challenge.correctAnswer} />
            <input type="hidden" name="timeSpent" value={timeSpent} />

            {/* Image Container */}
            <div className="mb-8">
              <div className="relative w-full h-64 sm:h-80 md:h-96 bg-zinc-100 rounded-xl overflow-hidden shadow-lg border-2 border-zinc-200 group">
                <Image
                  src={challenge.image}
                  alt="Procedura medyczna"
                  fill
                  className="object-contain transition-transform duration-300 group-hover:scale-105"
                  priority
                />
                {/* Subtle overlay on hover */}
                <div className="absolute inset-0 bg-zinc-900/0 group-hover:bg-zinc-900/5 transition-colors duration-300" />
              </div>
            </div>

            {/* Question */}
            <div className="mb-6 p-4 bg-zinc-50 border-l-4 border-zinc-800 rounded-r-lg">
              <p className="text-lg font-semibold text-zinc-900">{challenge.question}</p>
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
                        ? 'border-zinc-800 bg-zinc-50 shadow-lg ring-2 ring-zinc-800 ring-offset-2'
                        : 'border-zinc-300 hover:border-zinc-400 hover:bg-zinc-50 hover:shadow-md'
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
                    <div className={`shrink-0 w-9 h-9 rounded-lg flex items-center justify-center text-base font-bold transition-all duration-200 ${
                      isSelected
                        ? 'bg-zinc-800 text-white shadow-md'
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
      </div>
    </section>
  )
}
