'use client'

import Input from '@/components/ui/Input'
import Label from '@/components/ui/Label'
import DropdownSelect from '@/components/ui/DropdownSelect'
import { Textarea } from '@/components/ui/Textarea'
import FieldError from '@/components/FieldError'
import { ESSAY_COURSES, ESSAY_KINDS } from '@/constants/essay'
import { useEssayResources } from '@/context/EssayResourcesContext'
import type { EssayFieldProps } from '@/types/essayTypes'

export default function EssayBriefFields({ brief, onChange, state, disabled, id }: EssayFieldProps) {
  const { courses } = useEssayResources()
  const courseOptions = ESSAY_COURSES.filter((option) => courses.includes(option.value))
  return (
    <fieldset disabled={disabled} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor={`${id}-course`} label="Kierunek" />
          <DropdownSelect id={`${id}-course`} options={courseOptions} value={brief.course} onSelect={(course) => onChange({ ...brief, course })} ariaLabel="Kierunek" disabled={disabled} placeholder="Wybierz kierunek" />
          <FieldError name="course" formState={state} />
        </div>
        <div>
          <Label htmlFor={`${id}-kind`} label="Rodzaj pracy" />
          <DropdownSelect id={`${id}-kind`} options={ESSAY_KINDS} value={brief.kind} onSelect={(kind) => onChange({ ...brief, kind })} ariaLabel="Rodzaj pracy" disabled={disabled} />
          <FieldError name="kind" formState={state} />
        </div>
      </div>
      <div>
        <Label htmlFor={`${id}-topic`} label="Temat pracy" />
        <Input id={`${id}-topic`} value={brief.topic} onChangeHandler={(event) => onChange({ ...brief, topic: event.target.value })} placeholder="Wpisz temat lub tytuł pracy" className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-700" />
        <FieldError name="topic" formState={state} />
      </div>
      <details>
        <summary className="cursor-pointer text-sm font-medium text-zinc-700">Wymagane zagadnienia lub własny plan <span className="font-normal text-zinc-500">(opcjonalnie)</span></summary>
        <div className="mt-3">
          <Label htmlFor={`${id}-requirements`} label="Wklej wymagania prowadzącego lub swój plan" />
          <Textarea id={`${id}-requirements`} value={brief.requirements} onChange={(event) => onChange({ ...brief, requirements: event.target.value })} placeholder="Każde zagadnienie w osobnym wierszu" />
        </div>
      </details>
      <FieldError name="requirements" formState={state} />
      <div>
        <Label htmlFor={`${id}-additional`} label="Dodatkowe informacje (opcjonalnie)" />
        <Textarea id={`${id}-additional`} value={brief.additional} onChange={(event) => onChange({ ...brief, additional: event.target.value })} placeholder="Np. skup się na roli pielęgniarki, około 1000 słów." />
        <FieldError name="additional" formState={state} />
      </div>
    </fieldset>
  )
}
