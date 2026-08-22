'use client'

import { useCallback, useEffect, useRef } from 'react'
import { hashElementsVersion } from '@excalidraw/excalidraw'
import type { ExcalidrawElement } from '@excalidraw/excalidraw/element/types'
import { buildSceneSignature } from '@/helpers/buildSceneSignature'
import { serializeDiagramCell } from '@/helpers/serializeDiagramCell'
import { SAVE_DEBOUNCE_MS, SAVE_SETTLE_MS } from '@/constants/diagramCanvas'
import type { ExcalidrawScene } from '@/types/diagramTypes'
import { useCellsStore } from '@/store/useCellsStore'

/**
 * Saves a draw cell without putting serialization on the pointer path.
 *
 * onChange fires for viewport updates too, not only scene mutations: one pan
 * produced 42 calls with a single distinct element hash. Serializing to decide
 * whether to save meant building a 29KB string 42 times to conclude nothing had
 * happened, so the decision is made on a hash and the write is debounced.
 */
export function useDiagramPersistence(cellId: string, sourceRef: { current: string | null }) {
  const updateCell = useCellsStore((s) => s.updateCell)
  const savedSignatureRef = useRef<string | null>(null)
  const pendingRef = useRef<ExcalidrawScene | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const flush = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = null

    const scene = pendingRef.current
    if (!scene) return
    pendingRef.current = null

    updateCell(cellId, serializeDiagramCell(sourceRef.current, scene))
  }, [cellId, sourceRef, updateCell])

  const schedule = useCallback(
    (delay: number) => {
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(flush, delay)
    },
    [flush]
  )

  const markSaved = useCallback((scene: ExcalidrawScene) => {
    savedSignatureRef.current = buildSceneSignature(
      hashElementsVersion(scene.elements as readonly ExcalidrawElement[]),
      scene.appState,
      scene.files
    )
  }, [])

  const handleChange = useCallback(
    (elements: readonly unknown[], appState: Record<string, unknown>, files?: unknown) => {
      const signature = buildSceneSignature(
        hashElementsVersion(elements as readonly ExcalidrawElement[]),
        appState,
        files as Record<string, unknown> | null
      )
      if (signature === savedSignatureRef.current) return

      savedSignatureRef.current = signature
      pendingRef.current = { elements: [...elements], appState, files } as ExcalidrawScene
      schedule(SAVE_DEBOUNCE_MS)
    },
    [schedule]
  )

  // A gesture that just ended is worth saving sooner than the idle debounce,
  // but not before Excalidraw's trailing onChange has landed.
  const handlePointerUp = useCallback(() => {
    if (pendingRef.current || timerRef.current) schedule(SAVE_SETTLE_MS)
  }, [schedule])

  useEffect(() => {
    const onHide = () => flush()
    document.addEventListener('visibilitychange', onHide)
    window.addEventListener('pagehide', onHide)

    return () => {
      document.removeEventListener('visibilitychange', onHide)
      window.removeEventListener('pagehide', onHide)
      flush()
    }
  }, [flush])

  return { handleChange, handlePointerUp, markSaved, flush }
}
