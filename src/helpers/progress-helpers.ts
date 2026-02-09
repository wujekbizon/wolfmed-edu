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
