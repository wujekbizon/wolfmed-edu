import type {
  PracticalExam,
  ExamAnswers,
  ExamResult,
  FormResult,
  FieldResult,
  ProcedureResult,
  ValueField,
  ListField,
  ChoiceField,
} from '@/types/praktycznyTypes'
import { PRACTICAL_PASSING_PERCENT } from '@/types/praktycznyTypes'

const POLISH_MAP: Record<string, string> = {
  ą: 'a', ć: 'c', ę: 'e', ł: 'l', ń: 'n', ó: 'o', ś: 's', ź: 'z', ż: 'z',
}

function normalize(value: string): string {
  return value
    .toLowerCase()
    .replace(/[ąćęłńóśźż]/g, (char) => POLISH_MAP[char] ?? char)
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function parseNumber(value: string): number {
  return parseFloat(value.replace(',', '.').replace(/[^0-9.-]/g, ''))
}

function rangeToText(field: ValueField): string {
  const unit = field.unit ? ` ${field.unit}` : ''
  const { min, max } = field.range ?? {}
  if (min !== undefined && max !== undefined) return `${min}–${max}${unit}`
  if (min !== undefined) return `co najmniej ${min}${unit}`
  if (max !== undefined) return `maksymalnie ${max}${unit}`
  return ''
}

function valueModelAnswers(field: ValueField): string[] {
  if (field.accepted && field.accepted.length > 0) {
    return field.unit ? field.accepted.map((a) => `${a} ${field.unit}`) : field.accepted
  }
  if (field.match === 'date') return ['zgodne z datą i godziną egzaminu']
  if (field.range) return [rangeToText(field)]
  return []
}

function gradeValueField(field: ValueField, raw: string): FieldResult {
  const value = (raw ?? '').trim()
  let earned = 0

  if (value.length > 0) {
    if (field.match === 'date') {
      earned = /\d/.test(value) ? 1 : 0
    } else if (field.match === 'number') {
      const num = parseNumber(value)
      if (!Number.isNaN(num)) {
        if (field.range) {
          const okMin = field.range.min === undefined || num >= field.range.min
          const okMax = field.range.max === undefined || num <= field.range.max
          earned = okMin && okMax ? 1 : 0
        } else if (field.accepted) {
          earned = field.accepted.some((a) => parseNumber(a) === num) ? 1 : 0
        }
      }
    } else {
      const normValue = normalize(value)
      earned = (field.accepted ?? []).some((a) => {
        const normAccepted = normalize(a)
        return normAccepted.length > 0 && normValue.includes(normAccepted)
      })
        ? 1
        : 0
    }
  }

  return {
    fieldId: field.id,
    label: field.label,
    kind: 'value',
    earned,
    max: 1,
    modelAnswers: valueModelAnswers(field),
    matchedAnswerIds: [],
  }
}

function gradeListField(field: ListField, raw: string[]): FieldResult {
  const lines = (Array.isArray(raw) ? raw : [])
    .map((line) => normalize(line ?? ''))
    .filter((line) => line.length > 0)

  const matchedAnswerIds: string[] = []
  const usedLines = new Set<number>()

  for (const answer of field.acceptedAnswers) {
    const keywords = [answer.canonical, ...(answer.synonyms ?? [])].map(normalize)
    for (let i = 0; i < lines.length; i++) {
      if (usedLines.has(i)) continue
      const line = lines[i]
      if (line && keywords.some((kw) => kw.length > 0 && line.includes(kw))) {
        usedLines.add(i)
        matchedAnswerIds.push(answer.id)
        break
      }
    }
  }

  return {
    fieldId: field.id,
    label: field.label,
    kind: 'list',
    earned: Math.min(field.minRequired, matchedAnswerIds.length),
    max: field.minRequired,
    modelAnswers: field.acceptedAnswers.map((a) => a.canonical),
    matchedAnswerIds,
  }
}

function gradeChoiceField(field: ChoiceField, raw: string[]): FieldResult {
  const selected = new Set(Array.isArray(raw) ? raw : [])
  let groupsMet = 0
  const modelAnswers: string[] = []
  const userSelections: string[] = []

  for (const group of field.groups) {
    let correctSelected = 0
    let wrongSelected = 0
    for (const option of group.options) {
      if (option.correct) modelAnswers.push(option.label)
      if (selected.has(option.id)) {
        userSelections.push(option.label)
        if (option.correct) correctSelected++
        else wrongSelected++
      }
    }
    if (wrongSelected === 0 && correctSelected >= group.minRequired) groupsMet++
  }

  return {
    fieldId: field.id,
    label: field.label,
    kind: 'choice',
    earned: groupsMet,
    max: field.groups.length,
    modelAnswers,
    matchedAnswerIds: [],
    userSelections,
  }
}

export function gradePracticalExam(exam: PracticalExam, answers: ExamAnswers): ExamResult {
  const forms: FormResult[] = exam.forms.map((form) => {
    const fields = form.fields.map((field): FieldResult => {
      const answer = answers[`${form.id}:${field.id}`]
      if (field.kind === 'list') {
        return gradeListField(field, Array.isArray(answer) ? answer : [])
      }
      if (field.kind === 'choice') {
        return gradeChoiceField(field, Array.isArray(answer) ? answer : [])
      }
      return gradeValueField(field, typeof answer === 'string' ? answer : '')
    })

    return {
      formId: form.id,
      title: form.title,
      earned: fields.reduce((sum, f) => sum + f.earned, 0),
      max: fields.reduce((sum, f) => sum + f.max, 0),
      fields,
    }
  })

  const procedures: ProcedureResult[] = []
  exam.assessedTasks.forEach((task, taskIndex) => {
    if (task.type !== 'procedure') return
    const correctSteps = task.items
    const submitted = answers[`procedure:${taskIndex}`]
    const userSteps = Array.isArray(submitted) ? submitted : []
    let earnedSteps = 0
    for (let i = 0; i < correctSteps.length; i++) {
      if (userSteps[i] === correctSteps[i]) earnedSteps++
    }
    procedures.push({
      taskIndex,
      title: task.title,
      earned: earnedSteps,
      max: correctSteps.length,
      correctSteps,
      userSteps,
    })
  })

  const earned =
    forms.reduce((sum, f) => sum + f.earned, 0) + procedures.reduce((sum, p) => sum + p.earned, 0)
  const max =
    forms.reduce((sum, f) => sum + f.max, 0) + procedures.reduce((sum, p) => sum + p.max, 0)
  const percent = max > 0 ? Math.round((earned / max) * 100) : 0

  return {
    forms,
    procedures,
    earned,
    max,
    percent,
    passed: percent >= PRACTICAL_PASSING_PERCENT,
  }
}
