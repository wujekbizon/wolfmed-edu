'use client'

import { useEffect, useState } from 'react'
import { PopulatedCategories } from '@/types/categoryType'
import { getCategorySelectOptions } from '@/helpers/getCategorySelectOptions'
import Label from './ui/Label'
import DropdownSelect from './ui/DropdownSelect'
import FieldError from './FieldError'
import type { FormState } from '@/types/actionTypes'

/**
 * Required select that ties a freshly named custom category to a real
 * curriculum subject the user has access to. The chosen subject drives the
 * planner's learning-curve attribution (see server/planner/progress.ts).
 */
export default function LinkedSubjectSelect(props: {
  categories: PopulatedCategories[]
  formState: FormState
}) {
  const [linkedCategory, setLinkedCategory] = useState('')

  useEffect(() => {
    if (props.formState.status !== 'ERROR') return

    const submittedCategory = props.formState.values?.linkedCategory?.toString()
    if (submittedCategory) setLinkedCategory(submittedCategory)
  }, [props.formState.timestamp, props.formState.status, props.formState.values])

  return (
    <div className="flex w-full flex-col">
      <Label
        label="Przypisz do przedmiotu:"
        htmlFor="linkedCategory"
        className="text-xs sm:text-sm text-zinc-700 font-medium"
      />
      <DropdownSelect
        options={getCategorySelectOptions(props.categories)}
        value={linkedCategory}
        onSelect={setLinkedCategory}
        name="linkedCategory"
        ariaLabel="Przypisz do przedmiotu"
        placeholder="Wybierz przedmiot…"
      />
      <FieldError name="linkedCategory" formState={props.formState} />
      <p className="mt-1 text-xs text-zinc-500">
        Twoje testy z tej kategorii wliczą się do postępu nauki wybranego przedmiotu.
      </p>
    </div>
  )
}
