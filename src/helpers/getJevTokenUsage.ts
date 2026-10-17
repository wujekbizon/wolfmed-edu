export function getJevTokenUsage(payload: unknown): { input: number | null; output: number | null } {
  if (!payload || typeof payload !== 'object' || !('usage' in payload) ||
    !payload.usage || typeof payload.usage !== 'object') return { input: null, output: null }
  const usage = payload.usage as Record<string, unknown>
  const input = usage.input_tokens
  const output = usage.output_tokens
  return {
    input: typeof input === 'number' && Number.isSafeInteger(input) && input >= 0 ? input : null,
    output: typeof output === 'number' && Number.isSafeInteger(output) && output >= 0 ? output : null,
  }
}
