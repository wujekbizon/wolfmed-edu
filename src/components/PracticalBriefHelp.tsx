'use client'

import { useState } from 'react'
import WolfekPreparedQuestionButton from '@/components/wolfek/WolfekPreparedQuestionButton'
import ExamWolfekWelcome from '@/components/wolfek/ExamWolfekWelcome'
import WolfekAnswerText from '@/components/wolfek/WolfekAnswerText'
import { WolfekAnimationContext } from '@/components/wolfek/WolfekAnimationContext'
import { getWolfekSpeechTiming } from '@/helpers/getWolfekSpeechTiming'
import type { WolfekActivity } from '@/types/wolfekTypes'
import { PRACTICAL_BRIEF_QUESTIONS } from '@/constants/practicalBrief'
import { getPracticalBriefHelp } from '@/helpers/getPracticalBriefHelp'
import type { PracticalBriefHelpProps } from '@/types/practicalBriefTypes'

export default function PracticalBriefHelp({ exam, activeTab, onNavigate }: PracticalBriefHelpProps) {
  const [selected, setSelected] = useState('')
  const [activity, setActivity] = useState<WolfekActivity>({ pending: false, answerKey: 0 })
  const answer = selected ? getPracticalBriefHelp(exam, selected) : ''

  const selectQuestion = (id: string) => {
    const question = PRACTICAL_BRIEF_QUESTIONS.find((item) => item.id === id)
    if (!question) return
    setSelected(id)
    setActivity((previous) => ({
      pending: false,
      answerKey: previous.answerKey + 1,
      speechDuration: getWolfekSpeechTiming(getPracticalBriefHelp(exam, id)).duration,
    }))
    onNavigate(question.tab)
  }

  return (
    <WolfekAnimationContext.Provider value={{ activity, setActivity }}>
      <ExamWolfekWelcome active='practice' variant='brief' reviewTargetId={`practical-brief-tab-${activeTab}`} answer={answer && (
        <div key={activity.answerKey} className='wolfek-speaker-answer w-fit max-w-xl'>
          <div className='panel-wolfek-answer' role='status'>
            <WolfekAnswerText text={answer} />
          </div>
        </div>
      )}>
      <div className='panel-wolfek-topic-picker w-full max-w-md lg:ml-auto'>
      <p className='panel-wolfek-topics-label'>Wybierz pytanie</p>
      <div className='panel-wolfek-topics' role='group' aria-label='Pytania do Wolfka o egzamin'>
        {PRACTICAL_BRIEF_QUESTIONS.map((question) => (
          <WolfekPreparedQuestionButton key={question.id} appearance='straight' question={{ id: question.id, prompt: question.label }} pending={false} active={selected === question.id} onSelect={selectQuestion} />
        ))}
      </div>
      </div>
      </ExamWolfekWelcome>
    </WolfekAnimationContext.Provider>
  )
}
