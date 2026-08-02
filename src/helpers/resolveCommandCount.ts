import type { ToolCommand } from '@/types/commandTypes'

/**
 * Clamps a requested item count to the command's spec, falling back to its
 * default when the input is absent or not a number.
 *
 * Shared by the chip UI and the server action so the field a student sees and
 * the argument the tool receives cannot disagree. Returns null for commands that
 * produce nothing countable.
 */
export function resolveCommandCount(
  command: ToolCommand | undefined,
  requested: unknown
): number | null {
  if (!command?.count) return null

  const { defaultValue, min, max } = command.count
  const parsed = typeof requested === 'number' ? requested : Number(requested)

  if (!Number.isFinite(parsed)) return defaultValue

  return Math.min(max, Math.max(min, Math.round(parsed)))
}
