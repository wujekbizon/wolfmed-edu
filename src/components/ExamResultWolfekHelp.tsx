'use client'

import { useState } from 'react'
import Button from '@/components/ui/Button'
import ExamWolfekWelcome from '@/components/wolfek/ExamWolfekWelcome'
import WolfekPreparedQuestionButton from '@/components/wolfek/WolfekPreparedQuestionButton'
import WolfekAnswerText from '@/components/wolfek/WolfekAnswerText'
import { WolfekAnimationContext } from '@/components/wolfek/WolfekAnimationContext'
import { getWolfekSpeechTiming } from '@/helpers/getWolfekSpeechTiming'
import { getExamResultHelp } from '@/helpers/getExamResultHelp'
import { EXAM_RESULT_QUESTIONS } from '@/constants/practicalExamResults'
import type { WolfekActivity } from '@/types/wolfekTypes'
import type { ExamResultHelpProps } from '@/types/practicalExamResultTypes'

export default function ExamResultWolfekHelp({ result, activeTab, onReview }: ExamResultHelpProps) {
  const [selected, setSelected] = useState('')
  const [activity, setActivity] = useState<WolfekActivity>({ pending: false, answerKey: 0 })
  const help = getExamResultHelp(result, selected)
  const selectQuestion = (id: string) => {
    setSelected(id)
    setActivity((previous) => ({ pending: false, answerKey: previous.answerKey + 1, speechDuration: getWolfekSpeechTiming(getExamResultHelp(result, id).text).duration }))
  }
  return (
    <WolfekAnimationContext.Provider value={{ activity, setActivity }}>
      <ExamWolfekWelcome active='practice' variant='results' professorExcited={result.passed} reviewTargetId={`exam-results-tab-${activeTab}`} answer={help.text && (
        <div key={activity.answerKey} className='wolfek-speaker-answer w-fit max-w-xl'>
          <div className='panel-wolfek-answer' role='status'><WolfekAnswerText text={help.text} /></div>
          {help.target && <Button variant='ghost' onClick={() => { if (help.target) onReview(help.target) }} className='min-h-11 w-fit whitespace-normal text-sm'>Otwórz szczegóły →</Button>}
        </div>
      )}>
        <div className='panel-wolfek-topic-picker w-full max-w-md lg:ml-auto'>
          <p className='panel-wolfek-topics-label'>Wybierz pytanie</p>
          <div className='panel-wolfek-topics' role='group' aria-label='Pytania do Wolfka o wynik'>
            {EXAM_RESULT_QUESTIONS.map((question) => <WolfekPreparedQuestionButton key={question.id} question={question} pending={false} active={selected === question.id} appearance='straight' onSelect={selectQuestion} />)}
          </div>
        </div>
      </ExamWolfekWelcome>
    </WolfekAnimationContext.Provider>
  )
}
