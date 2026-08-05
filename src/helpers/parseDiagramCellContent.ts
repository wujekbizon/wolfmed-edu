import { isMermaidSyntax } from '@/helpers/isMermaidSyntax'
import type { DiagramCellContent, ExcalidrawScene } from '@/types/diagramTypes'

export type DiagramCellState =
  | { kind: 'empty' }
  | { kind: 'source'; source: string }
  | { kind: 'diagram'; source: string; scene: ExcalidrawScene }
  | { kind: 'scene'; scene: ExcalidrawScene }

function withCollaborators(scene: ExcalidrawScene): ExcalidrawScene {
  return { ...scene, appState: { ...(scene.appState ?? {}), collaborators: [] } }
}

/**
 * Reads a draw cell in any of the three shapes it can hold: raw Mermaid a
 * generator just produced, the source-plus-scene written since, and the bare
 * Excalidraw scene every cell saved before that — those keep working, they
 * simply cannot be rebuilt from their graph.
 */
export function parseDiagramCellContent(raw: string | undefined): DiagramCellState {
  if (!raw?.trim()) return { kind: 'empty' }

  if (isMermaidSyntax(raw)) return { kind: 'source', source: raw }

  try {
    const parsed = JSON.parse(raw) as Partial<DiagramCellContent> & Partial<ExcalidrawScene>

    if (parsed?.format === 'mermaid' && typeof parsed.source === 'string' && parsed.scene) {
      return { kind: 'diagram', source: parsed.source, scene: withCollaborators(parsed.scene) }
    }

    if (Array.isArray(parsed?.elements)) {
      return { kind: 'scene', scene: withCollaborators(parsed as ExcalidrawScene) }
    }

    return { kind: 'empty' }
  } catch {
    return { kind: 'empty' }
  }
}
