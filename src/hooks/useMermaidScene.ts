'use client'

import { useEffect, useState } from 'react'
import { convertToExcalidrawElements } from '@excalidraw/excalidraw'
import { parseMermaidToExcalidraw } from '@excalidraw/mermaid-to-excalidraw'
import { parseDiagramRoles } from '@/helpers/parseDiagramRoles'
import { buildDiagramLegend } from '@/lib/diagram/buildDiagramLegend'
import { styleDiagramSkeleton } from '@/lib/diagram/styleDiagramSkeleton'
import { isMermaidSyntax } from '@/helpers/isMermaidSyntax'
import { useCellsStore } from '@/store/useCellsStore'

/**
 * Converts a Mermaid cell into a styled Excalidraw scene.
 *
 * The styling pass runs on the skeleton, before conversion — see
 * styleDiagramSkeleton for why that ordering is not optional.
 */
export function useMermaidScene(cellId: string, content: string | undefined) {
  const [scene, setScene] = useState<Record<string, unknown> | null>(null)
  const [isConverting, setIsConverting] = useState(false)
  const updateCell = useCellsStore((s) => s.updateCell)

  useEffect(() => {
    if (!content || !isMermaidSyntax(content)) {
      setScene(null)
      return
    }

    let cancelled = false

    async function convert(source: string) {
      setIsConverting(true)
      try {
        const { elements: skeleton, files } = await parseMermaidToExcalidraw(source)
        const roles = parseDiagramRoles(source)
        const styled = styleDiagramSkeleton(skeleton, roles)
        const elements = convertToExcalidrawElements([
          ...styled,
          ...buildDiagramLegend(skeleton, roles),
        ])

        if (cancelled) return

        const converted = { elements, files, appState: { collaborators: [] } }
        setScene(converted)
        updateCell(cellId, JSON.stringify(converted))
      } catch (error) {
        console.error('[Excalidraw] Failed to convert Mermaid to Excalidraw:', error)
        if (!cancelled) setScene({ elements: [], appState: { collaborators: [] } })
      } finally {
        if (!cancelled) setIsConverting(false)
      }
    }

    void convert(content)

    return () => {
      cancelled = true
    }
  }, [content, cellId, updateCell])

  return { scene, isConverting }
}
