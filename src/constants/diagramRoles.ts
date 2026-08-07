export const DIAGRAM_ROLES = ['start', 'decyzja', 'czynnosc', 'struktura', 'uwaga', 'wynik'] as const

export type DiagramRole = (typeof DIAGRAM_ROLES)[number]

export const DIAGRAM_GROUP_ROLE = 'grupa'

interface RoleStyle {
  fill: string
  stroke: string
  text: string
  label: string
}

/**
 * Excalidraw's dark theme inverts the whole canvas rather than swapping colors,
 * so the palette is defined once in light space and the filter produces the dark
 * variant. A hand-authored dark palette would be inverted too and come out wrong.
 *
 * Hues follow CATEGORY_COLORS in lib/mindmap/design.ts so a diagram and a mind
 * map of the same material read as one system.
 */
const ROLE_STYLES: Record<DiagramRole | typeof DIAGRAM_GROUP_ROLE, RoleStyle> = {
  start: { fill: '#e0e7ff', stroke: '#4338ca', text: '#1e1b4b', label: 'Punkt wyjścia' },
  decyzja: { fill: '#fef3c7', stroke: '#b45309', text: '#451a03', label: 'Decyzja' },
  czynnosc: { fill: '#ccfbf1', stroke: '#0f766e', text: '#042f2e', label: 'Czynność' },
  struktura: { fill: '#dbeafe', stroke: '#1d4ed8', text: '#172554', label: 'Struktura' },
  uwaga: { fill: '#fee2e2', stroke: '#b91c1c', text: '#450a0a', label: 'Stan pilny' },
  wynik: { fill: '#dcfce7', stroke: '#15803d', text: '#052e16', label: 'Wynik' },
  grupa: { fill: '#f8fafc', stroke: '#64748b', text: '#334155', label: 'Grupa' },
}

export const DIAGRAM_ROLE_LABELS = Object.fromEntries(
  Object.entries(ROLE_STYLES).map(([role, style]) => [role, style.label])
) as Record<DiagramRole | typeof DIAGRAM_GROUP_ROLE, string>

export const DIAGRAM_ROLE_COLORS = ROLE_STYLES

export const DIAGRAM_CLASSDEFS = Object.entries(ROLE_STYLES)
  .map(([role, s]) => `    classDef ${role} fill:${s.fill},stroke:${s.stroke},color:${s.text},stroke-width:2px`)
  .join('\n')

export const DIAGRAM_DETAIL_LEVELS = {
  prosty: { nodeBudget: 8, description: 'przegląd — tylko główne kroki' },
  szczegolowy: { nodeBudget: 16, description: 'pełna ścieżka z rozgałęzieniami' },
} as const

export type DiagramDetail = keyof typeof DIAGRAM_DETAIL_LEVELS

export const DEFAULT_DIAGRAM_DETAIL: DiagramDetail = 'szczegolowy'

// A graph this far past its budget is unreadable at any zoom, and is the point
// where one repair call is cheaper than shipping a diagram nobody can use.
export const DIAGRAM_BUDGET_OVERRUN_FACTOR = 1.5
