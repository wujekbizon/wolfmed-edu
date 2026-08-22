'use client'

import { useRef } from 'react'
import { useGeneratedQuiz } from '@/hooks/useGeneratedQuiz'
import type { AiChallengeType, GeneratedQuizPlayView } from '@/types/generatedQuizTypes'
import QuizIntroCard from './QuizIntroCard'
import KnowledgeQuizPlayer from './KnowledgeQuizPlayer'
import SpotErrorPlayer from './SpotErrorPlayer'
import ScenarioPlayer from './ScenarioPlayer'
import QuizResultView from './QuizResultView'

export default function GeneratedQuizExperience({
  course,
  challengeType,
  procedureId,
  procedureName,
  procedureSlug,
  isPremium,
  initialQuiz,
}: {
  course: string
  challengeType: AiChallengeType
  procedureId: string
  procedureName: string
  procedureSlug: string
  isPremium: boolean
  initialQuiz: GeneratedQuizPlayView | null
}) {
  const q = useGeneratedQuiz(initialQuiz)
  const generateFormRef = useRef<HTMLFormElement>(null)
  const submitFormRef = useRef<HTMLFormElement>(null)
  const backHref = `/panel/procedury/${course}/${procedureSlug}/wyzwania`

  return (
    <section className="w-full h-full overflow-y-auto scrollbar-webkit bg-zinc-50 p-4 lg:p-10">
      <div className="max-w-3xl mx-auto animate-fadeInUp">
        <form ref={generateFormRef} action={q.generateAction} className="hidden">
          <input type="hidden" name="procedureId" value={procedureId} />
          <input type="hidden" name="challengeType" value={challengeType} />
        </form>
        <form ref={submitFormRef} action={q.submitAction} className="hidden">
          <input type="hidden" name="quizId" value={q.quiz?.quizId ?? ''} />
          <input type="hidden" name="answers" value={q.buildAnswersJson(challengeType)} />
          <input type="hidden" name="timeSpent" value={q.elapsedSeconds()} />
        </form>

        {q.phase === 'intro' && (
          <QuizIntroCard
            challengeType={challengeType}
            procedureName={procedureName}
            isPremium={isPremium}
            hasExistingQuiz={!!q.quiz}
            isGenerating={q.isGenerating}
            errorMessage={q.generateState.status === 'ERROR' ? q.generateState.message : null}
            onGenerate={() => generateFormRef.current?.requestSubmit()}
            onPlayExisting={q.playExisting}
          />
        )}

        {q.phase === 'playing' && q.quiz && challengeType === 'knowledge-quiz' && (
          <KnowledgeQuizPlayer
            quiz={q.quiz}
            answers={q.answers}
            isSubmitting={q.isSubmitting}
            onSelect={q.selectAnswer}
            onSubmit={() => submitFormRef.current?.requestSubmit()}
          />
        )}
        {q.phase === 'playing' && q.quiz && challengeType === 'spot-error' && (
          <SpotErrorPlayer
            quiz={q.quiz}
            selectedErrors={q.selectedErrors}
            isSubmitting={q.isSubmitting}
            onToggleStep={q.toggleError}
            onSubmit={() => submitFormRef.current?.requestSubmit()}
          />
        )}
        {q.phase === 'playing' && q.quiz && challengeType === 'scenario-based' && (
          <ScenarioPlayer
            quiz={q.quiz}
            selectedOption={q.selectedOption}
            isSubmitting={q.isSubmitting}
            onSelect={q.setSelectedOption}
            onSubmit={() => submitFormRef.current?.requestSubmit()}
          />
        )}

        {q.phase === 'result' && (
          <QuizResultView
            challengeType={challengeType}
            procedureName={procedureName}
            score={q.score}
            passed={q.score >= 70}
            review={q.review}
            isGenerating={q.isGenerating}
            onRetryNewQuiz={() => generateFormRef.current?.requestSubmit()}
            backHref={backHref}
          />
        )}
      </div>
    </section>
  )
}
