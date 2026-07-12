// Client-safe definitions of the student preferences the settings UI exposes.
// Shared by the preferences form, the server action validation, and the Path A
// prompt assembler so the three never drift. Values are stored as JSONB strings
// in wolfmed_mem_preferences.

export interface PreferenceOption {
  value: string
  label: string
}

export interface PreferenceDef {
  key: string
  label: string
  help: string
  options: PreferenceOption[]
}

export const PREFERENCE_DEFS: PreferenceDef[] = [
  {
    key: 'exam_target',
    label: 'Cel egzaminacyjny',
    help: 'Do jakiego egzaminu się przygotowujesz.',
    options: [
      { value: 'brak', label: 'Nie określono' },
      { value: 'opiekun_medyczny', label: 'Opiekun medyczny' },
      { value: 'pielegniarstwo', label: 'Pielęgniarstwo' },
    ],
  },
  {
    key: 'explanation_depth',
    label: 'Poziom szczegółowości',
    help: 'Jak szczegółowe mają być wyjaśnienia tutora.',
    options: [
      { value: 'podstawowy', label: 'Podstawowy' },
      { value: 'kliniczny', label: 'Szczegóły kliniczne' },
    ],
  },
  {
    key: 'question_style',
    label: 'Styl pytań',
    help: 'Preferowany format pytań testowych.',
    options: [
      { value: 'klasyczny', label: 'Klasyczny' },
      { value: 'przypadek', label: 'Oparte na przypadku' },
    ],
  },
]

export const PREFERENCE_KEYS = PREFERENCE_DEFS.map((p) => p.key)

// Fast lookup of the human label for a stored value (used by the assembler).
export function preferenceValueLabel(key: string, value: string): string {
  const def = PREFERENCE_DEFS.find((p) => p.key === key)
  return def?.options.find((o) => o.value === value)?.label ?? value
}

export function preferenceLabel(key: string): string {
  return PREFERENCE_DEFS.find((p) => p.key === key)?.label ?? key
}
