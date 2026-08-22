'use client'

import { useEffect, useRef, useState } from 'react'
import type { ExcalidrawImperativeAPI } from '@excalidraw/excalidraw/types'
import { parseDiagramCellContent } from '@/helpers/parseDiagramCellContent'
import { serializeDiagramCell } from '@/helpers/serializeDiagramCell'
import { convertMermaidScene } from '@/lib/diagram/convertMermaidScene'
import { useDiagramPersistence } from '@/hooks/useDiagramPersistence'
import type { ExcalidrawScene } from '@/types/diagramTypes'
import { useCellsStore } from '@/store/useCellsStore'

/**
 * Owns the Mermaid-to-Excalidraw conversion for a draw cell.
 *
 * A scene produced after mount is pushed with updateScene. Excalidraw reads
 * initialData once, so the previous version only worked because flipping the
 * converting flag unmounted and remounted the canvas — an accidental remount
 * that would have broken the moment the loading state changed.
 *
 * Framing the new scene goes through the camera owner rather than calling
 * scrollToContent here: two independent camera writers means a resize landing
 * mid-move yanks the view somewhere neither of them intended.
 */
export function useMermaidScene(
  cellId: string,
  content: string | undefined,
  excalidrawAPI: ExcalidrawImperativeAPI | null,
  fitAuto: (animate?: boolean) => void
) {
  const cell = parseDiagramCellContent(content)
  const [converted, setConverted] = useState<ExcalidrawScene | null>(null)
  const [isConverting, setIsConverting] = useState(false)
  const [hasFailed, setHasFailed] = useState(false)
  const [retryToken, setRetryToken] = useState(0)
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
      setHasFailed(false)
      try {
        const scene = await convertMermaidScene(mermaid)
        if (cancelled) return

        markSaved(scene)
        setConverted(scene)
        updateCell(cellId, serializeDiagramCell(mermaid, scene))
      } catch (error) {
        console.error('[Excalidraw] Failed to convert Mermaid to Excalidraw:', error)
        // The cell keeps its source, so this is recoverable — leave the scene
        // alone rather than writing an empty one over a diagram that exists.
        if (!cancelled) setHasFailed(true)
      } finally {
        if (!cancelled) setIsConverting(false)
      }
    }

    void convert(pendingSource)
    return () => {
      cancelled = true
    }
  }, [pendingSource, cellId, updateCell, markSaved, retryToken])

  const scene = converted ?? (cell.kind === 'diagram' || cell.kind === 'scene' ? cell.scene : null)

  useEffect(() => {
    if (!excalidrawAPI || !scene || appliedRef.current === scene) return
    appliedRef.current = scene

    excalidrawAPI.updateScene({ elements: scene.elements as never })
    fitAuto(true)
  }, [excalidrawAPI, scene, fitAuto])

  return {
    scene,
    isConverting,
    hasFailed,
    retry: () => setRetryToken((token) => token + 1),
    onChange: handleChange,
    onPointerUp: handlePointerUp,
  }
}
