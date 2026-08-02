import { useEffect, useRef } from 'react'
import { useCellsStore } from '@/store/useCellsStore'
import { parseMindMapCellContent } from '@/helpers/parseMindMapCellContent'
import { setNodeExplanation } from '@/lib/mindmap/treeOps'
import type { FormState } from '@/types/actionTypes'
import type { RagExplainOrigin } from '@/types/ragCellTypes'

interface UseAttachExplanationArgs {
  origin: RagExplainOrigin | undefined
  state: FormState
  isPending: boolean
}

/**
 * Writes the answer back onto the mind-map node that asked for it, so the
 * explanation lives in the map instead of only in the cell that generated it.
 */
export function useAttachExplanationToMindMap({
  origin,
  state,
  isPending,
}: UseAttachExplanationArgs) {
  const updateCell = useCellsStore((s) => s.updateCell)
  const attachedTimestamp = useRef(0)

  useEffect(() => {
    if (!origin || isPending || state.status !== 'SUCCESS' || !state.message) return
    if (attachedTimestamp.current === state.timestamp) return
    attachedTimestamp.current = state.timestamp

    const mapCell = useCellsStore.getState().data[origin.mapCellId]
    if (!mapCell || mapCell.type !== 'mindmap') return

    const content = parseMindMapCellContent(mapCell.content)
    if (!content) return

    updateCell(
      origin.mapCellId,
      JSON.stringify({
        ...content,
        root: setNodeExplanation(content.root, origin.nodeId, state.message),
      })
    )
  }, [origin, isPending, state, updateCell])
}
