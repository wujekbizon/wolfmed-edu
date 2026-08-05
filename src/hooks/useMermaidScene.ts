'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { ExcalidrawImperativeAPI } from '@excalidraw/excalidraw/types'
import { parseDiagramCellContent } from '@/helpers/parseDiagramCellContent'
import { serializeDiagramCell } from '@/helpers/serializeDiagramCell'
import { convertMermaidScene } from '@/lib/diagram/convertMermaidScene'
import { SCENE_FOCUS } from '@/constants/diagramCanvas'
import type { ExcalidrawScene } from '@/types/diagramTypes'
import { useCellsStore } from '@/store/useCellsStore'

/**
 * Owns the Mermaid-to-Excalidraw conversion for a draw cell.
 *
 * A scene produced after mount is pushed with updateScene. Excalidraw reads
 * initialData once, so the previous version only worked because flipping the
 * converting flag unmounted and remounted the canvas — an accidental remount
 * that would have broken the moment the loading state changed.
 */
export function useMermaidScene(
  cellId: string,
  content: string | undefined,
  excalidrawAPI: ExcalidrawImperativeAPI | null
) {
  const cell = parseDiagramCellContent(content)
  const [converted, setConverted] = useState<ExcalidrawScene | null>(null)
  const [isConverting, setIsConverting] = useState(false)
  const updateCell = useCellsStore((s) => s.updateCell)

  const sourceRef = useRef<string | null>(null)
  sourceRef.current = cell.kind === 'source' || cell.kind === 'diagram' ? cell.source : null
  const lastWrittenRef = useRef<string | null>(null)
  const appliedRef = useRef<ExcalidrawScene | null>(null)

  const pendingSource = cell.kind === 'source' ? cell.source : null

  useEffect(() => {
    if (!pendingSource) return
    let cancelled = false

    async function convert(mermaid: string) {
      setIsConverting(true)
      try {
        const scene = await convertMermaidScene(mermaid)
        if (cancelled) return

        const serialized = serializeDiagramCell(mermaid, scene)
        lastWrittenRef.current = serialized
        setConverted(scene)
        updateCell(cellId, serialized)
      } catch (error) {
        console.error('[Excalidraw] Failed to convert Mermaid to Excalidraw:', error)
        if (!cancelled) setConverted({ elements: [], appState: { collaborators: [] } })
      } finally {
        if (!cancelled) setIsConverting(false)
      }
    }

    void convert(pendingSource)
    return () => {
      cancelled = true
    }
  }, [pendingSource, cellId, updateCell])

  const scene = converted ?? (cell.kind === 'diagram' || cell.kind === 'scene' ? cell.scene : null)

  useEffect(() => {
    if (!excalidrawAPI || !scene || appliedRef.current === scene) return
    appliedRef.current = scene

    excalidrawAPI.updateScene({ elements: scene.elements as never })
    excalidrawAPI.scrollToContent(scene.elements as never, {
      fitToContent: true,
      animate: true,
      duration: SCENE_FOCUS.duration,
    })
  }, [excalidrawAPI, scene])

  // Excalidraw fires onChange on its first paint, so persisting unconditionally
  // rewrote every cell that was merely opened — and, once the source lives in
  // the same blob, that first write replaced the payload with a bare scene and
  // the diagram lost its graph.
  const persist = useCallback(
    (elements: readonly unknown[], appState: Record<string, unknown>, files?: unknown) => {
      const scene = { elements: [...elements], appState, files } as ExcalidrawScene
      const next = serializeDiagramCell(sourceRef.current, scene)
      if (next === lastWrittenRef.current) return

      lastWrittenRef.current = next
      updateCell(cellId, next)
    },
    [cellId, updateCell]
  )

  return { scene, isConverting, persist }
}
