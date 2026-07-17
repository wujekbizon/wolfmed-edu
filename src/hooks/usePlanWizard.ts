'use client'

import { useMemo, useState, useActionState } from 'react'
import { createPlanAction } from '@/actions/planner'
import { EMPTY_FORM_STATE } from '@/constants/formState'
import { useToastMessage } from '@/hooks/useToastMessage'
import { autoPlanName } from '@/helpers/autoPlanName'
import { computePlanCapacity, distributeMinutes } from '@/helpers/planCapacity'
import { scaledConceptMinutes } from '@/helpers/scaledConceptMinutes'
import {
  MAX_CONCEPTS,
  TOPIC_DEFAULT_MINUTES,
  CONCEPT_DEFAULT_MINUTES,
  PROCEDURE_DEFAULT_MINUTES,
} from '@/constants/planner'
import type {
  ConceptCatalogEntry,
  PlanWizardProps,
  ProcedureOption,
  SelectedConcept,
} from '@/types/plannerTypes'

function findFocusCourse(
  catalogByCourse: Record<string, ConceptCatalogEntry[]>,
  focusKey: string | null | undefined
): string | null {
  if (!focusKey) return null
  for (const [slug, entries] of Object.entries(catalogByCourse)) {
    if (entries.some((entry) => entry.categoryKey === focusKey)) return slug
  }
  return null
}

export function usePlanWizard({
  courses,
  catalogByCourse,
  proceduresByCourse,
  initialFocus = null,
}: Omit<PlanWizardProps, 'examPresetsByCourse'>) {
  const initialFocusCourse = findFocusCourse(catalogByCourse, initialFocus)
  const initialFocusKey = initialFocusCourse ? initialFocus ?? null : null
  const initialFocusLabel = initialFocusKey
    ? catalogByCourse[initialFocusCourse!]?.find(
        (entry) => entry.categoryKey === initialFocusKey
      )?.label ?? null
    : null

  const [step, setStep] = useState(0)
  const [courseSlug, setCourseSlug] = useState(
    initialFocusCourse ?? courses[0]?.slug ?? ''
  )
  const [goalType, setGoalType] = useState<'exam' | 'custom'>(
    (initialFocusCourse ?? courses[0]?.slug) === 'opiekun-medyczny'
      ? 'exam'
      : 'custom'
  )
  const [focusKey, setFocusKey] = useState<string | null>(initialFocusKey)
  const [name, setName] = useState(
    initialFocusLabel ? autoPlanName(initialFocusLabel) : ''
  )
  const [nameEdited, setNameEdited] = useState(false)
  const [presetLabel, setPresetLabel] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [minutesPerDay, setMinutesPerDay] = useState(60)
  const [studyDays, setStudyDays] = useState<number[]>([1, 2, 3, 4, 5])
  const [concepts, setConcepts] = useState<SelectedConcept[]>([])
  const [customLabel, setCustomLabel] = useState('')
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null)
  const [showOtherSubjects, setShowOtherSubjects] = useState(false)

  const [formState, action, isPending] = useActionState(
    createPlanAction,
    EMPTY_FORM_STATE
  )
  const noScriptFallback = useToastMessage(formState)

  const catalog = catalogByCourse[courseSlug] ?? []
  const procedureOptions = proceduresByCourse[courseSlug] ?? []
  const focusEntry = focusKey
    ? catalog.find((entry) => entry.categoryKey === focusKey) ?? null
    : null
  const otherEntries = focusEntry
    ? catalog.filter((entry) => entry.categoryKey !== focusKey)
    : catalog

  const capacityMinutes = useMemo(
    () => computePlanCapacity(dueDate, studyDays, minutesPerDay),
    [dueDate, studyDays, minutesPerDay]
  )
  const plannedMinutes = concepts.reduce((t, c) => t + c.targetMinutes, 0)
  const overCapacity = capacityMinutes > 0 && plannedMinutes > capacityMinutes
  const hoursTotal = Math.round((capacityMinutes / 60) * 10) / 10

  const hasConcept = (label: string) =>
    concepts.some((concept) => concept.label === label)

  const addConcept = (concept: SelectedConcept) =>
    setConcepts((current) =>
      current.some((c) => c.label === concept.label) ||
      current.length >= MAX_CONCEPTS
        ? current
        : [...current, concept]
    )

  const addTopics = (categoryKey: string, topics: string[]) =>
    setConcepts((current) => {
      const next = [...current]
      for (const topic of topics) {
        if (next.length >= MAX_CONCEPTS) break
        const label = topic.slice(0, 255)
        if (next.some((c) => c.label === label)) continue
        next.push({ categoryKey, label, source: 'category', targetMinutes: TOPIC_DEFAULT_MINUTES })
      }
      return next
    })

  const removeConcept = (label: string) =>
    setConcepts((current) => current.filter((c) => c.label !== label))

  const updateConceptMinutes = (label: string, minutes: number) =>
    setConcepts((current) =>
      current.map((c) => (c.label === label ? { ...c, targetMinutes: minutes } : c))
    )

  const distributeCapacity = () => {
    const share = distributeMinutes(capacityMinutes, concepts.length)
    if (concepts.length === 0) return
    setConcepts((current) => current.map((c) => ({ ...c, targetMinutes: share })))
  }

  const toggleStudyDay = (day: number) =>
    setStudyDays((days) =>
      days.includes(day)
        ? days.filter((d) => d !== day)
        : [...days, day].sort((a, b) => a - b)
    )

  const selectCourse = (slug: string) => {
    setCourseSlug(slug)
    setConcepts([])
    setFocusKey(null)
    setPresetLabel('')
    if (!nameEdited) setName('')
    setGoalType(slug === 'opiekun-medyczny' ? 'exam' : 'custom')
  }

  const selectFocus = (key: string | null) => {
    setFocusKey(key)
    setShowOtherSubjects(false)
    if (nameEdited) return
    if (key) {
      const entry = catalog.find((e) => e.categoryKey === key)
      if (entry) setName(autoPlanName(entry.label))
    } else {
      // Back to "Cały kurs": fall back to the selected exam session's name
      // instead of wiping the field.
      setName(presetLabel)
    }
  }

  const editName = (value: string) => {
    setName(value)
    setNameEdited(true)
  }

  const editNameFromPreset = (label: string) => {
    setPresetLabel(label)
    if (nameEdited || focusKey) return
    setName(label)
  }

  const addCustomConcept = () => {
    const label = customLabel.trim()
    if (label.length < 2) return
    addConcept({ categoryKey: null, label, source: 'custom', targetMinutes: CONCEPT_DEFAULT_MINUTES })
    setCustomLabel('')
  }

  const addProcedureConcept = (procedure: ProcedureOption) =>
    addConcept({
      categoryKey: null,
      procedureId: procedure.id,
      label: procedure.name.slice(0, 255),
      source: 'procedure',
      targetMinutes: PROCEDURE_DEFAULT_MINUTES,
    })

  const fillExamTemplate = () =>
    setConcepts((current) => {
      const next = [...current]
      for (const entry of catalog) {
        if (next.length >= MAX_CONCEPTS) break
        if (next.some((c) => c.label === entry.label)) continue
        next.push({
          categoryKey: entry.categoryKey,
          label: entry.label,
          source: 'category',
          targetMinutes: scaledConceptMinutes(entry),
        })
      }
      return next
    })

  return {
    // step
    step, setStep,
    stepOneValid: name.trim().length >= 3 && dueDate.length > 0,
    stepTwoValid: studyDays.length > 0 && minutesPerDay >= 15,
    stepThreeValid: concepts.length > 0,
    // core state
    courseSlug, goalType, setGoalType, focusKey, name, dueDate, minutesPerDay, studyDays,
    concepts, customLabel, setCustomLabel, expandedCategory, setExpandedCategory,
    showOtherSubjects, setShowOtherSubjects,
    setDueDate, setMinutesPerDay,
    // derived
    catalog, procedureOptions, focusEntry, otherEntries,
    capacityMinutes, plannedMinutes, overCapacity, hoursTotal,
    // form
    formState, action, isPending, noScriptFallback,
    // handlers
    hasConcept, addConcept, addTopics, removeConcept, updateConceptMinutes,
    distributeCapacity, toggleStudyDay, selectCourse, selectFocus, editName,
    editNameFromPreset, addCustomConcept, addProcedureConcept, fillExamTemplate,
  }
}

export type PlanWizardController = ReturnType<typeof usePlanWizard>
