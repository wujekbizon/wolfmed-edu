import { preferenceLabel, preferenceValueLabel } from '@/constants/memoryPreferences'

export function renderMemoryPreferences(prefs: Record<string, unknown>): string[] {
  const lines: string[] = []
  for (const [key, raw] of Object.entries(prefs)) {
    const value = typeof raw === 'string' ? raw : String(raw ?? '')
    if (!value || value === 'brak') continue
    lines.push(`- ${preferenceLabel(key)}: ${preferenceValueLabel(key, value)}`)
  }
  return lines
}
