import type { ProgressStage } from '@/types/progressTypes'
import { STAGE_MESSAGES, TOOL_LABELS } from '@/constants/progress'

export function getStageMessage(stage: ProgressStage, tool?: string): string {
  if (stage === 'calling_tool' && tool) {
    return `Wywołuję narzędzie ${tool}...`
  }
  return STAGE_MESSAGES[stage]
}

export function getToolLabel(tool: string | null): string {
  if (!tool) return 'wyszukiwanie'
  return TOOL_LABELS[tool] || tool.replace('_tool', '').replace('_', ' ')
}

export function formatSSEMessage(
  id: number,
  event: string,
  data: Record<string, unknown>,
  retry?: number
): string {
  let message = ''

  if (retry !== undefined) {
    message += `retry: ${retry}\n`
  }

  message += `id: ${id}\n`
  message += `event: ${event}\n`
  message += `data: ${JSON.stringify(data)}\n\n`

  return message
}

export function formatKeepAlive(): string {
  return `: keep-alive\n\n`
}
