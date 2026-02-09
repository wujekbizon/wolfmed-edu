export type ProgressStage =
  | 'idle'
  | 'parsing'
  | 'resolving'
  | 'fetching'
  | 'searching'
  | 'calling_tool'
  | 'executing'
  | 'finalizing'
  | 'complete'
  | 'error'

export interface ProgressData {
  stage: ProgressStage
  message: string
  progress: number
  total: number
  tool?: string
}

export interface LogEntry {
  level: 'info' | 'warn' | 'error'
  message: string
  timestamp: string
}

export const STAGE_PROGRESS: Record<ProgressStage, number> = {
  idle: 0,
  parsing: 10,
  resolving: 20,
  fetching: 30,
  searching: 45,
  calling_tool: 60,
  executing: 75,
  finalizing: 90,
  complete: 100,
  error: 0,
}

export const STAGE_MESSAGES: Record<ProgressStage, string> = {
  idle: 'Oczekiwanie...',
  parsing: 'Analizuję zapytanie...',
  resolving: 'Rozwiązuję referencje...',
  fetching: 'Pobieram zawartość zasobów...',
  searching: 'Przeszukuję dokumenty...',
  calling_tool: 'Wywołuję narzędzie...',
  executing: 'Generuję zawartość...',
  finalizing: 'Finalizuję odpowiedź...',
  complete: 'Gotowe',
  error: 'Wystąpił błąd',
}

export function getStageMessage(stage: ProgressStage, tool?: string): string {
  if (stage === 'calling_tool' && tool) {
    return `Wywołuję narzędzie ${tool}...`
  }
  return STAGE_MESSAGES[stage]
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
