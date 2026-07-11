'use client'

import { useMemo, useState, useActionState } from 'react'
import { createPlanAction } from '@/actions/planner'
import { EMPTY_FORM_STATE } from '@/constants/formState'
import { useToastMessage } from '@/hooks/useToastMessage'
import { countPlannedDays } from '@/server/planner/engine'
import type { ConceptCatalogEntry, ExamDatePreset } from '@/types/plannerTypes'

interface SelectedConcept {
  categoryKey: string | null
  label: string
  source: 'category' | 'custom'
  targetMinutes: number
}

interface PlanWizardProps {
  courses: { slug: string; name: string }[]
  catalogByCourse: Record<string, ConceptCatalogEntry[]>
  examPresets: ExamDatePreset[]
  initialFocus?: string | null
}

const WEEKDAYS = [
  { value: 1, label: 'Pn' },
  { value: 2, label: 'Wt' },
  { value: 3, label: 'Śr' },
  { value: 4, label: 'Cz' },
  { value: 5, label: 'Pt' },
  { value: 6, label: 'So' },
  { value: 7, label: 'Nd' },
]

const STEP_TITLES = ['Cel', 'Czas', 'Zakres']
const MAX_CONCEPTS = 60
const TOPIC_DEFAULT_MINUTES = 30

function toDateInputValue(dateISO: string): string {
  return dateISO.split('T')[0] || ''
}

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

function autoPlanName(subjectLabel: string): string {
  return `${subjectLabel} — przygotowanie`
}

export default function PlanWizard({
  courses,
  catalogByCourse,
  examPresets,
  initialFocus = null,
}: PlanWizardProps) {
  const initialFocusCourse = findFocusCourse(catalogByCourse, initialFocus)

  const [step, setStep] = useState(0)
  const [courseSlug, setCourseSlug] = useState(
    initialFocusCourse ?? courses[0]?.slug ?? ''
  )
  const [goalType, setGoalType] = useState<'exam' | 'custom'>(
    (initialFocusCourse ?? courses[0]?.slug) === 'opiekun-medyczny'
      ? 'exam'
      : 'custom'
  )
  const initialFocusKey = initialFocusCourse ? initialFocus ?? null : null
  const initialFocusLabel = initialFocusKey
    ? catalogByCourse[initialFocusCourse!]?.find(
        (entry) => entry.categoryKey === initialFocusKey
      )?.label ?? null
    : null

  const [focusKey, setFocusKey] = useState<string | null>(initialFocusKey)
  const [name, setName] = useState(
    initialFocusLabel ? autoPlanName(initialFocusLabel) : ''
  )
  const [nameEdited, setNameEdited] = useState(false)
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
  const focusEntry = focusKey
    ? catalog.find((entry) => entry.categoryKey === focusKey) ?? null
    : null
  const otherEntries = focusEntry
    ? catalog.filter((entry) => entry.categoryKey !== focusKey)
    : catalog

  const capacityMinutes = useMemo(() => {
    if (!dueDate || studyDays.length === 0) return 0
    const due = new Date(`${dueDate}T23:59:59Z`)
    if (Number.isNaN(due.getTime())) return 0
    return countPlannedDays(new Date(), due, studyDays) * minutesPerDay
  }, [dueDate, studyDays, minutesPerDay])

  const plannedMinutes = concepts.reduce(
    (total, concept) => total + concept.targetMinutes,
    0
  )
  const overCapacity = capacityMinutes > 0 && plannedMinutes > capacityMinutes

  const toggleStudyDay = (day: number) => {
    setStudyDays((days) =>
      days.includes(day)
        ? days.filter((d) => d !== day)
        : [...days, day].sort((a, b) => a - b)
    )
  }

  const hasConcept = (label: string) =>
    concepts.some((concept) => concept.label === label)

  const addConcept = (concept: SelectedConcept) => {
    setConcepts((current) => {
      if (
        current.some((c) => c.label === concept.label) ||
        current.length >= MAX_CONCEPTS
      ) {
        return current
      }
      return [...current, concept]
    })
  }

  const addTopics = (categoryKey: string, topics: string[]) => {
    setConcepts((current) => {
      const next = [...current]
      for (const topic of topics) {
        if (next.length >= MAX_CONCEPTS) break
        const label = topic.slice(0, 255)
        if (next.some((c) => c.label === label)) continue
        next.push({
          categoryKey,
          label,
          source: 'category',
          targetMinutes: TOPIC_DEFAULT_MINUTES,
        })
      }
      return next
    })
  }

  const removeConcept = (label: string) => {
    setConcepts((current) =>
      current.filter((concept) => concept.label !== label)
    )
  }

  const updateConceptMinutes = (label: string, minutes: number) => {
    setConcepts((current) =>
      current.map((concept) =>
        concept.label === label
          ? { ...concept, targetMinutes: minutes }
          : concept
      )
    )
  }

  const distributeCapacity = () => {
    if (capacityMinutes <= 0 || concepts.length === 0) return
    const share = Math.max(
      15,
      Math.floor(capacityMinutes / concepts.length / 5) * 5
    )
    setConcepts((current) =>
      current.map((concept) => ({ ...concept, targetMinutes: share }))
    )
  }

  const selectFocus = (key: string | null) => {
    setFocusKey(key)
    setShowOtherSubjects(false)
    if (nameEdited) return
    if (key) {
      const entry = catalog.find((e) => e.categoryKey === key)
      if (entry) setName(autoPlanName(entry.label))
    } else {
      setName('')
    }
  }

  const stepOneValid = name.trim().length >= 3 && dueDate.length > 0
  const stepTwoValid = studyDays.length > 0 && minutesPerDay >= 15
  const stepThreeValid = concepts.length > 0

  const hoursTotal = Math.round((capacityMinutes / 60) * 10) / 10

  const renderTopicRow = (categoryKey: string, topic: string) => (
    <li key={topic} className="flex items-center justify-between gap-2 py-0.5">
      <span className="text-xs text-zinc-600">{topic}</span>
      {hasConcept(topic.slice(0, 255)) ? (
        <button
          type="button"
          onClick={() => removeConcept(topic.slice(0, 255))}
          className="text-xs text-red-500 font-semibold shrink-0"
        >
          Usuń
        </button>
      ) : (
        <button
          type="button"
          onClick={() =>
            addConcept({
              categoryKey,
              label: topic.slice(0, 255),
              source: 'category',
              targetMinutes: TOPIC_DEFAULT_MINUTES,
            })
          }
          className="text-xs text-zinc-700 font-semibold shrink-0 hover:text-red-500"
        >
          + Dodaj
        </button>
      )}
    </li>
  )

  const renderCategoryEntry = (entry: ConceptCatalogEntry) => (
    <div key={entry.categoryKey} className="border border-zinc-100 rounded-lg">
      <div className="flex items-center justify-between px-3 py-2.5">
        <button
          type="button"
          onClick={() =>
            setExpandedCategory(
              expandedCategory === entry.categoryKey ? null : entry.categoryKey
            )
          }
          className="text-left flex-1"
        >
          <span className="text-sm font-medium text-zinc-800">
            {entry.label}
          </span>
          {entry.questionCount > 0 && (
            <span className="block text-xs text-zinc-400">
              {entry.questionCount} pytań w bazie testów
            </span>
          )}
        </button>
        {hasConcept(entry.label) ? (
          <button
            type="button"
            onClick={() => removeConcept(entry.label)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-50 text-red-600 hover:bg-red-100"
          >
            Usuń
          </button>
        ) : (
          <button
            type="button"
            onClick={() =>
              addConcept({
                categoryKey: entry.categoryKey,
                label: entry.label,
                source: 'category',
                targetMinutes: 60,
              })
            }
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-zinc-900 text-white hover:bg-zinc-700"
          >
            Dodaj
          </button>
        )}
      </div>
      {expandedCategory === entry.categoryKey &&
        entry.topicGroups.length > 0 && (
          <div className="border-t border-zinc-100 px-3 py-2 space-y-3">
            {entry.topicGroups.map((group) => (
              <div key={group.key}>
                <span className="block text-xs font-semibold text-zinc-500 mb-1">
                  {group.label}
                </span>
                <ul className="space-y-1">
                  {group.topics.map((topic) =>
                    renderTopicRow(entry.categoryKey, topic)
                  )}
                </ul>
              </div>
            ))}
          </div>
        )}
    </div>
  )

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white border border-zinc-100 rounded-2xl p-4 sm:p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-zinc-900 mb-1">
          Stwórz swój plan nauki
        </h1>
        <p className="text-sm text-zinc-500 mb-6">
          Ustal cel, realny czas i zakres — resztą zajmie się Wolfmed.
        </p>

        <div className="flex gap-2 mb-8">
          {STEP_TITLES.map((title, index) => (
            <div key={title} className="flex-1">
              <div
                className={`h-1.5 rounded-full mb-2 transition-colors ${
                  index <= step ? 'bg-red-500' : 'bg-zinc-100'
                }`}
              />
              <span
                className={`text-xs font-semibold ${
                  index <= step ? 'text-zinc-900' : 'text-zinc-400'
                }`}
              >
                {index + 1}. {title}
              </span>
            </div>
          ))}
        </div>

        {step === 0 && (
          <div className="space-y-5">
            {courses.length > 1 && (
              <div>
                <label className="block text-sm font-semibold text-zinc-700 mb-2">
                  Kurs
                </label>
                <div className="flex flex-wrap gap-2">
                  {courses.map((course) => (
                    <button
                      key={course.slug}
                      type="button"
                      onClick={() => {
                        setCourseSlug(course.slug)
                        setConcepts([])
                        setFocusKey(null)
                        if (!nameEdited) setName('')
                        setGoalType(
                          course.slug === 'opiekun-medyczny' ? 'exam' : 'custom'
                        )
                      }}
                      className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                        courseSlug === course.slug
                          ? 'bg-zinc-900 text-white border-zinc-900'
                          : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-400'
                      }`}
                    >
                      {course.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-zinc-700 mb-2">
                Cel planu
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setGoalType('exam')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                    goalType === 'exam'
                      ? 'bg-zinc-900 text-white border-zinc-900'
                      : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-400'
                  }`}
                >
                  Egzamin
                </button>
                <button
                  type="button"
                  onClick={() => setGoalType('custom')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                    goalType === 'custom'
                      ? 'bg-zinc-900 text-white border-zinc-900'
                      : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-400'
                  }`}
                >
                  Własny cel
                </button>
              </div>
            </div>

            {catalog.length > 0 && (
              <div>
                <label className="block text-sm font-semibold text-zinc-700 mb-1">
                  Czego dotyczy plan?
                </label>
                <p className="text-xs text-zinc-400 mb-2">
                  Wybierz przedmiot, a w kroku 3 podpowiemy Ci jego program —
                  albo zostań przy całym kursie.
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => selectFocus(null)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                      focusKey === null
                        ? 'bg-red-500 text-white border-red-500'
                        : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-400'
                    }`}
                  >
                    Cały kurs
                  </button>
                  {catalog.map((entry) => (
                    <button
                      key={entry.categoryKey}
                      type="button"
                      onClick={() => selectFocus(entry.categoryKey)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                        focusKey === entry.categoryKey
                          ? 'bg-red-500 text-white border-red-500'
                          : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-400'
                      }`}
                    >
                      {entry.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {goalType === 'exam' && examPresets.length > 0 && (
              <div>
                <label className="block text-sm font-semibold text-zinc-700 mb-2">
                  Najbliższe sesje egzaminacyjne
                </label>
                <div className="space-y-2">
                  {examPresets.map((preset) => (
                    <button
                      key={preset.dateISO}
                      type="button"
                      onClick={() => {
                        setDueDate(toDateInputValue(preset.dateISO))
                        if (!nameEdited && !focusKey) setName(preset.label)
                      }}
                      className={`w-full text-left px-4 py-3 rounded-lg border text-sm transition-colors ${
                        dueDate === toDateInputValue(preset.dateISO)
                          ? 'border-red-400 bg-red-50 text-zinc-900'
                          : 'border-zinc-200 text-zinc-600 hover:border-zinc-400'
                      }`}
                    >
                      <span className="font-medium">{preset.label}</span>
                      <span className="block text-xs text-zinc-400 mt-0.5">
                        {new Date(preset.dateISO).toLocaleDateString('pl-PL')}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label
                htmlFor="plan-name"
                className="block text-sm font-semibold text-zinc-700 mb-2"
              >
                Nazwa planu
              </label>
              <input
                id="plan-name"
                type="text"
                value={name}
                onChange={(event) => {
                  setName(event.target.value)
                  setNameEdited(true)
                }}
                placeholder="np. Przygotowanie do egzaminu — zima 2027"
                maxLength={255}
                className="w-full px-4 py-2.5 rounded-lg border border-zinc-200 text-sm focus:outline-none focus:border-zinc-400"
              />
            </div>

            <div>
              <label
                htmlFor="plan-due-date"
                className="block text-sm font-semibold text-zinc-700 mb-2"
              >
                Termin (do kiedy?)
              </label>
              <input
                id="plan-due-date"
                type="date"
                value={dueDate}
                min={new Date(Date.now() + 24 * 60 * 60 * 1000)
                  .toISOString()
                  .split('T')[0]}
                onChange={(event) => setDueDate(event.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-zinc-200 text-sm focus:outline-none focus:border-zinc-400"
              />
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-6">
            <div>
              <label
                htmlFor="minutes-per-day"
                className="block text-sm font-semibold text-zinc-700 mb-2"
              >
                Ile minut dziennie możesz się uczyć?{' '}
                <span className="text-red-500 font-bold">{minutesPerDay} min</span>
              </label>
              <input
                id="minutes-per-day"
                type="range"
                min={15}
                max={240}
                step={15}
                value={minutesPerDay}
                onChange={(event) => setMinutesPerDay(Number(event.target.value))}
                className="w-full accent-red-500"
              />
              <div className="flex justify-between text-xs text-zinc-400 mt-1">
                <span>15 min</span>
                <span>4 h</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-zinc-700 mb-2">
                W które dni się uczysz?
              </label>
              <div className="flex gap-2">
                {WEEKDAYS.map((day) => (
                  <button
                    key={day.value}
                    type="button"
                    onClick={() => toggleStudyDay(day.value)}
                    className={`w-11 h-11 rounded-lg text-sm font-semibold border transition-colors ${
                      studyDays.includes(day.value)
                        ? 'bg-red-500 text-white border-red-500'
                        : 'bg-white text-zinc-500 border-zinc-200 hover:border-zinc-400'
                    }`}
                  >
                    {day.label}
                  </button>
                ))}
              </div>
            </div>

            {capacityMinutes > 0 && (
              <div className="p-4 rounded-lg bg-zinc-50 border border-zinc-100 text-sm text-zinc-600">
                Do{' '}
                <span className="font-semibold text-zinc-900">
                  {new Date(`${dueDate}T12:00:00`).toLocaleDateString('pl-PL')}
                </span>{' '}
                zaplanujesz około{' '}
                <span className="font-semibold text-red-500">{hoursTotal} h</span>{' '}
                nauki.
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            {focusEntry ? (
              <>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold text-zinc-700">
                      Program: {focusEntry.label}
                    </h3>
                    {focusEntry.questionCount > 0 && (
                      <span className="text-xs text-zinc-400">
                        {focusEntry.questionCount} pytań w bazie testów
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-400 mb-3">
                    Zagadnienia pochodzą prosto z programu przedmiotu — dodaj
                    całe sekcje albo wybierz pojedyncze tematy.
                  </p>
                  <div className="space-y-4 max-h-96 overflow-y-auto pr-1 border border-zinc-100 rounded-lg p-3">
                    {focusEntry.topicGroups.length === 0 && (
                      <p className="text-sm text-zinc-400">
                        Ten przedmiot nie ma jeszcze szczegółowego programu.
                        Dodaj go jako jedno zagadnienie lub dopisz własne tematy
                        poniżej.
                      </p>
                    )}
                    {focusEntry.topicGroups.map((group) => {
                      const remaining = group.topics.filter(
                        (topic) => !hasConcept(topic.slice(0, 255))
                      )
                      return (
                        <div key={group.key}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-semibold text-zinc-500">
                              {group.label}
                            </span>
                            {remaining.length > 0 ? (
                              <button
                                type="button"
                                onClick={() =>
                                  addTopics(focusEntry.categoryKey, group.topics)
                                }
                                className="text-xs font-semibold text-red-500 hover:text-red-600"
                              >
                                Dodaj wszystkie ({remaining.length})
                              </button>
                            ) : (
                              <span className="text-xs text-zinc-300">
                                dodano ✓
                              </span>
                            )}
                          </div>
                          <ul className="space-y-1">
                            {group.topics.map((topic) =>
                              renderTopicRow(focusEntry.categoryKey, topic)
                            )}
                          </ul>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {otherEntries.length > 0 && (
                  <div>
                    <button
                      type="button"
                      onClick={() => setShowOtherSubjects((show) => !show)}
                      className="text-sm font-semibold text-zinc-500 hover:text-zinc-800"
                    >
                      {showOtherSubjects ? '▾' : '▸'} Inne przedmioty (
                      {otherEntries.length})
                    </button>
                    {showOtherSubjects && (
                      <div className="space-y-2 max-h-72 overflow-y-auto pr-1 mt-2">
                        {otherEntries.map(renderCategoryEntry)}
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div>
                <h3 className="text-sm font-semibold text-zinc-700 mb-2">
                  Wybierz zagadnienia z programu kursu
                </h3>
                <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                  {catalog.map(renderCategoryEntry)}
                </div>
              </div>
            )}

            <div>
              <h3 className="text-sm font-semibold text-zinc-700 mb-2">
                Własne zagadnienie
              </h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customLabel}
                  onChange={(event) => setCustomLabel(event.target.value)}
                  placeholder="np. Farmakologia z wykładów"
                  maxLength={255}
                  className="flex-1 px-4 py-2.5 rounded-lg border border-zinc-200 text-sm focus:outline-none focus:border-zinc-400"
                />
                <button
                  type="button"
                  onClick={() => {
                    const label = customLabel.trim()
                    if (label.length < 2) return
                    addConcept({
                      categoryKey: null,
                      label,
                      source: 'custom',
                      targetMinutes: 60,
                    })
                    setCustomLabel('')
                  }}
                  className="px-4 py-2.5 rounded-lg bg-zinc-900 text-white text-sm font-semibold hover:bg-zinc-700"
                >
                  Dodaj
                </button>
              </div>
            </div>

            {concepts.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-zinc-700">
                    Twój plan ({concepts.length})
                  </h3>
                  {capacityMinutes > 0 && (
                    <button
                      type="button"
                      onClick={distributeCapacity}
                      className="text-xs font-semibold text-zinc-500 hover:text-red-500"
                    >
                      Rozłóż czas równomiernie
                    </button>
                  )}
                </div>
                <ul className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {concepts.map((concept) => (
                    <li
                      key={concept.label}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg bg-zinc-50 border border-zinc-100"
                    >
                      <span className="flex-1 text-sm text-zinc-800">
                        {concept.label}
                      </span>
                      <input
                        type="number"
                        min={5}
                        max={6000}
                        step={5}
                        value={concept.targetMinutes}
                        onChange={(event) =>
                          updateConceptMinutes(
                            concept.label,
                            Number(event.target.value)
                          )
                        }
                        className="w-20 px-2 py-1 rounded border border-zinc-200 text-sm text-right"
                        aria-label={`Minuty na: ${concept.label}`}
                      />
                      <span className="text-xs text-zinc-400">min</span>
                      <button
                        type="button"
                        onClick={() => removeConcept(concept.label)}
                        className="text-zinc-400 hover:text-red-500 text-sm font-bold"
                        aria-label={`Usuń: ${concept.label}`}
                      >
                        ✕
                      </button>
                    </li>
                  ))}
                </ul>

                <div
                  className={`mt-3 p-3 rounded-lg text-sm border ${
                    overCapacity
                      ? 'bg-amber-50 border-amber-200 text-amber-800'
                      : 'bg-zinc-50 border-zinc-100 text-zinc-600'
                  }`}
                >
                  Zaplanowane:{' '}
                  <span className="font-semibold">
                    {Math.round((plannedMinutes / 60) * 10) / 10} h
                  </span>{' '}
                  / dostępne do terminu:{' '}
                  <span className="font-semibold">{hoursTotal} h</span>
                  {overCapacity && (
                    <span className="block mt-1">
                      To więcej, niż realnie zmieścisz. Zmniejsz zakres, skróć
                      czas na zagadnienia albo przesuń termin — lepszy skromny
                      plan, który wykonasz, niż ambitny, który porzucisz.
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-between mt-8 pt-6 border-t border-zinc-100">
          <button
            type="button"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
            className="px-5 py-2.5 rounded-lg text-sm font-semibold text-zinc-600 hover:bg-zinc-50 disabled:opacity-0"
          >
            Wstecz
          </button>

          {step < 2 ? (
            <button
              type="button"
              onClick={() => setStep((s) => s + 1)}
              disabled={step === 0 ? !stepOneValid : !stepTwoValid}
              className="px-6 py-2.5 rounded-lg bg-zinc-900 text-white text-sm font-semibold hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Dalej
            </button>
          ) : (
            <form action={action}>
              {noScriptFallback}
              <input type="hidden" name="courseSlug" value={courseSlug} />
              <input type="hidden" name="name" value={name} />
              <input type="hidden" name="goalType" value={goalType} />
              <input
                type="hidden"
                name="focusCategoryKey"
                value={focusKey ?? ''}
              />
              <input type="hidden" name="dueDate" value={dueDate} />
              <input type="hidden" name="minutesPerDay" value={minutesPerDay} />
              <input
                type="hidden"
                name="studyDays"
                value={JSON.stringify(studyDays)}
              />
              <input
                type="hidden"
                name="concepts"
                value={JSON.stringify(concepts)}
              />
              <button
                type="submit"
                disabled={!stepThreeValid || isPending}
                className="px-6 py-2.5 rounded-lg bg-red-500 text-white text-sm font-semibold hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isPending ? 'Tworzenie…' : 'Utwórz plan nauki'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
