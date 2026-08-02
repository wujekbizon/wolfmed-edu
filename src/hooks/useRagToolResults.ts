import { useEffect, useRef } from 'react'
import { useInsertGeneratedCell } from '@/hooks/useInsertGeneratedCell'
import type { FormState } from '@/types/actionTypes'
import type { CellTypes } from '@/types/cellTypes'

/** Inserts the cells produced by an answer's tool calls below the asking cell. */
export function useRagToolResults({ state, cellId }: { state: FormState; cellId: string }) {
  const insertGeneratedCell = useInsertGeneratedCell()
  const processedResults = useRef<Set<string>>(new Set())

  useEffect(() => {
    if (state.status !== 'SUCCESS' || !state.values?.toolResults) return

    const toolResults = state.values.toolResults
    if (typeof toolResults !== 'object' || toolResults === null || Array.isArray(toolResults)) return

    Object.entries(toolResults).forEach(([toolName, result]) => {
      if (
        typeof result !== 'object' ||
        result === null ||
        !('content' in result) ||
        typeof (result as { content: unknown }).content !== 'string'
      ) return

      const typedResult = result as { cellType?: CellTypes; content: string }
      const resultKey = `${toolName}-${typedResult.content.slice(0, 50)}`

      if (typedResult.cellType && !processedResults.current.has(resultKey)) {
        processedResults.current.add(resultKey)
        void insertGeneratedCell(cellId, typedResult.cellType, typedResult.content)
      }
    })
  }, [state.status, state.values?.toolResults, cellId, insertGeneratedCell])
}
