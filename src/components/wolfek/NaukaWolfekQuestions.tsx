'use client'

import { NAUKA_WOLFEK_QUESTIONS } from '@/constants/naukaWolfekQuestions'
import type { NaukaWolfekQuestionsProps } from '@/types/naukaLayoutTypes'
import WolfekPreparedQuestionButton from './WolfekPreparedQuestionButton'

export default function NaukaWolfekQuestions({ activeId, onSelect }: NaukaWolfekQuestionsProps) {

  return (
    <div className='nauka-wolfek-questions w-full max-w-md justify-self-center space-y-4 lg:justify-self-end'>
      <div className='panel-wolfek-topic-picker'>
      <p className='panel-wolfek-topics-label'>Wybierz pytanie</p>
      <div role='group' aria-label='Pytania do Wolfka' className='panel-wolfek-topics'>
        {NAUKA_WOLFEK_QUESTIONS.map((question) => (
          <WolfekPreparedQuestionButton key={question.id} question={question} pending={false}
            active={activeId === question.id} onSelect={onSelect} />
        ))}
      </div>
      </div>
    </div>
  )
}
