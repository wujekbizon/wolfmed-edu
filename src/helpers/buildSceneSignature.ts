import { PERSISTED_APP_STATE_KEYS } from '@/constants/diagramCanvas'

/**
 * A cheap "has anything worth saving changed" key.
 *
 * The element hash covers the scene; the persisted appState keys and the file
 * ids cover what the hash cannot see — a background colour change or a pasted
 * image leaves every element version untouched.
 */
export function buildSceneSignature(
  elementsHash: number,
  appState: Record<string, unknown> | undefined,
  files: Record<string, unknown> | null | undefined
): string {
  const state = PERSISTED_APP_STATE_KEYS.map((key) => `${key}=${String(appState?.[key])}`).join('|')
  const fileIds = files ? Object.keys(files).sort().join(',') : ''

  return `${elementsHash}:${state}:${fileIds}`
}
