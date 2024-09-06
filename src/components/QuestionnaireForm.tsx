'use client'

import React, { useCallback, useState } from 'react'
import { questionnaireOptions } from '@/constants/questionnaireOptions'
import CustomRadioInput from './CustomRadioInput'
import { InputValues } from '@/types'
import SubmitButton from './SubmitButton'

const QuestionnaireForm = () => {
  const [inputValues, setInputValues] = useState<InputValues>({
    selectedOption1: '',
    selectedOption2: '',
    selectedOption3: '',
    selectedOption4: '',
    selectedOption5: '',
  })

  const handleOptionChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setInputValues((prevState) => ({ ...prevState, [name]: value }))
  }, [])

  return (
    <form action="" className="w-[80%] flex flex-col items-center gap-7 p-12 border border-zinc-900">
      {questionnaireOptions?.map(({ title, options }) => (
        <div className="w-full flex items-center justify-between" key={title}>
          <div className="flex-1 flex justify-start items-center">
            <h4>{title}</h4>
          </div>
          <div className="flex-1 flex justify-end">
            {options.map((option) => (
              <CustomRadioInput
                option={option}
                onChange={handleOptionChange}
                inputValues={inputValues}
                key={option.label}
              />
            ))}
          </div>
        </div>
      ))}
      <SubmitButton label="Wyślij Ankietę" loading="Wysyłam..." />
    </form>
  )
}
export default QuestionnaireForm
