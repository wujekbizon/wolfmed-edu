/**
 * Default plan name derived from the selected subject, e.g.
 * "Anatomia" → "Anatomia — przygotowanie".
 */
export function autoPlanName(subjectLabel: string): string {
  return `${subjectLabel} — przygotowanie`
}
