import type { ProgressStage } from '@/types/progressTypes'

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

export const TOOL_LABELS: Record<string, string> = {
  notatka_tool: 'notatka',
  utworz_test: 'test',
  diagram_tool: 'diagram',
  podsumuj: 'podsumowanie',
}

export const TOOL_LABELS_ACCUSATIVE: Record<string, string> = {
  notatka: 'notatkę',
  diagram: 'diagram',
  utworz: 'test',
  podsumuj: 'podsumowanie',
}

export const TOOL_LABELS_GENITIVE: Record<string, string> = {
  notatka_tool: 'notatki',
  diagram_tool: 'diagramu',
  utworz_test: 'testu',
  podsumuj: 'podsumowania',
}

export const PROGRESS_DELAY = 200

export const JOB_TTL = 5 * 60 * 1000 // 5 minutes

export const KEEP_ALIVE_INTERVAL = 15000 // 15 seconds

export const DEFAULT_SSE_RETRY = 3000 // 3 seconds

export const JOB_WAIT_TIMEOUT = 10000 // 10 seconds

export const SSE_POLL_INTERVAL = 150 // 150ms
