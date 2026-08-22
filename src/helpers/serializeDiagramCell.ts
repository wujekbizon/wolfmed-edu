import { PERSISTED_APP_STATE_KEYS } from '@/constants/diagramCanvas'
import type { ExcalidrawScene } from '@/types/diagramTypes'

/**
 * Writes a draw cell back out, keeping the Mermaid source next to the scene.
 */
export function serializeDiagramCell(source: string | null, scene: ExcalidrawScene): string {
  const appState = Object.fromEntries(
    PERSISTED_APP_STATE_KEYS.filter((key) => scene.appState?.[key] !== undefined).map((key) => [
      key,
      scene.appState?.[key],
    ])
  )

  const persisted: ExcalidrawScene = {
    elements: scene.elements,
    appState,
    ...(scene.files ? { files: scene.files } : {}),
  }

  return source
    ? JSON.stringify({ format: 'mermaid', source, scene: persisted })
    : JSON.stringify(persisted)
}
