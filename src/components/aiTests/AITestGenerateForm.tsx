'use client'

import { useEffect, useState } from 'react'
import type { PopulatedCategories } from '@/types/categoryType'
import type { FormState } from '@/types/actionTypes'
import { Textarea } from '@/components/ui/Textarea'
import Label from '@/components/ui/Label'
import Input from '@/components/ui/Input'
import FieldError from '@/components/FieldError'
import SubmitButton from '@/components/SubmitButton'
import DropdownSelect from '@/components/ui/DropdownSelect'
import { getCategorySelectOptions } from '@/helpers/getCategorySelectOptions'
import { QUESTION_COUNT_OPTIONS } from '@/constants/aiTests'

const inputClass =
  'w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg bg-white/90 text-sm border border-zinc-200 outline-none focus:ring-2 focus:ring-[#ff9898]/50 transition-all duration-300 text-zinc-700'

export default function AITestGenerateForm(props: {
  categories: PopulatedCategories[]
  action: (formData: FormData) => void
  state: FormState
}) {
  const [questionCount, setQuestionCount] = useState('5')
  const [linkedCategory, setLinkedCategory] = useState('')

  useEffect(() => {
    if (props.state.status !== 'ERROR') return

    const submittedCount = props.state.values?.questionCount?.toString()
    const submittedCategory = props.state.values?.linkedCategory?.toString()
    if (submittedCount) setQuestionCount(submittedCount)
    if (submittedCategory) setLinkedCategory(submittedCategory)
  }, [props.state.timestamp, props.state.status, props.state.values])

  return (
    <form action={props.action} className="flex flex-col gap-4">
      <div className="flex flex-col">
        <Label htmlFor="topic" label="Temat lub problem medyczny:" className="text-xs sm:text-sm text-zinc-700 font-medium" />
        <Textarea
          id="topic"
          name="topic"
          defaultValue={props.state.values?.topic?.toString() || ''}
          placeholder="np. Powikłania cukrzycy typu 2, opieka nad pacjentem po udarze..."
          className={inputClass}
        />
        <FieldError name="topic" formState={props.state} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col">
          <Label htmlFor="categoryName" label="Nazwa Twojej kategorii:" className="text-xs sm:text-sm text-zinc-700 font-medium" />
          <Input
            type="text"
            id="categoryName"
            name="categoryName"
            defaultValue={props.state.values?.categoryName?.toString() || ''}
            placeholder="np. Moje pytania z cukrzycy"
            className={inputClass}
          />
          <FieldError name="categoryName" formState={props.state} />
        </div>
        <div className="flex flex-col">
          <Label htmlFor="questionCount" label="Liczba pytań:" className="text-xs sm:text-sm text-zinc-700 font-medium" />
          <DropdownSelect
            options={QUESTION_COUNT_OPTIONS}
            value={questionCount}
            onSelect={setQuestionCount}
            name="questionCount"
            ariaLabel="Liczba pytań"
          />
        </div>
      </div>

      <div className="flex flex-col">
        <Label htmlFor="linkedCategory" label="Przypisz do przedmiotu:" className="text-xs sm:text-sm text-zinc-700 font-medium" />
        <DropdownSelect
          options={getCategorySelectOptions(props.categories)}
          value={linkedCategory}
          onSelect={setLinkedCategory}
          name="linkedCategory"
          ariaLabel="Przypisz do przedmiotu"
          placeholder="Wybierz przedmiot…"
        />
        <FieldError name="linkedCategory" formState={props.state} />
        <p className="mt-1 text-xs text-zinc-500">Pytania wliczą się do postępu nauki wybranego przedmiotu.</p>
      </div>

      <div className="flex w-full sm:w-auto self-start">
        <SubmitButton label="Generuj pytania" loading="Generuję..." />
      </div>
    </form>
  )
}
