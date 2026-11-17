'use client'

import { useEffect, useRef } from 'react'
import { parseEssayCellContent } from '@/helpers/parseEssayCellContent'
import { showToast } from '@/hooks/useToastMessage'
import type { FormState } from '@/types/actionTypes'
import type { EssayDraft } from '@/types/essayTypes'

export function useEssayActionResult(state: FormState, onResult: (input: string, result: EssayDraft) => void) {
  const handled = useRef(0)
  useEffect(() => {
    if (state.status !== 'SUCCESS' || handled.current === state.timestamp) return
    handled.current = state.timestamp
    const content = state.values?.result
    const input = state.values?.input
    const result = typeof content === 'string' ? parseEssayCellContent(content) : null
    if (result && typeof input === 'string') onResult(input, result)
    else showToast('ERROR', 'Nie udało się odczytać wyniku. Szkic został zachowany.')
  }, [state, onResult])
}
