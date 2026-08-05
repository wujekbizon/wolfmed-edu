'use client'

import { useEffect, useRef, useState } from 'react'
import type { ExcalidrawImperativeAPI } from '@excalidraw/excalidraw/types'
import { parseDiagramCellContent } from '@/helpers/parseDiagramCellContent'
import { serializeDiagramCell } from '@/helpers/serializeDiagramCell'
import { convertMermaidScene } from '@/lib/diagram/convertMermaidScene'
import { useDiagramPersistence } from '@/hooks/useDiagramPersistence'
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
  const appliedRef = useRef<ExcalidrawScene | null>(null)

  const { handleChange, handlePointerUp, markSaved } = useDiagramPersistence(cellId, sourceRef)

  const pendingSource = cell.kind === 'source' ? cell.source : null

  useEffect(() => {
    if (!pendingSource) return
    let cancelled = false

    async function convert(mermaid: string) {
      setIsConverting(true)
      try {
        const scene = await convertMermaidScene(mermaid)
        if (cancelled) return

        markSaved(scene)
        setConverted(scene)
        updateCell(cellId, serializeDiagramCell(mermaid, scene))
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
  }, [pendingSource, cellId, updateCell, markSaved])

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

  return { scene, isConverting, onChange: handleChange, onPointerUp: handlePointerUp }
}
