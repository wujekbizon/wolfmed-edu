import { useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useCellsStore } from '@/store/useCellsStore'
import { createGeneratedDeckAction } from '@/actions/flashcardDecks'
import { flashcardDecksKey } from '@/constants/flashcards'
import { parseFlashcardContent } from '@/helpers/flashcardCellHelpers'
import { showToast } from '@/hooks/useToastMessage'
import type { CellTypes } from '@/types/cellTypes'

/**
 * Inserts a cell produced by an AI tool call.
 *
 * Flashcard cells are persisted before insertion: the generated cards are written to
 * the database and the cell stores only the resulting deck id, so the cards survive
 * on every device instead of living in the cell blob.
 */
export function useInsertGeneratedCell() {
  const insertCellAfterWithContent = useCellsStore((s) => s.insertCellAfterWithContent)
  const queryClient = useQueryClient()

  return useCallback(
    async (afterCellId: string, cellType: CellTypes, content: string) => {
      if (cellType !== 'flashcard') {
        insertCellAfterWithContent(afterCellId, cellType, content)
        return
      }

      const { flashcards, topic } = parseFlashcardContent(content)
      if (flashcards.length === 0) {
        showToast('ERROR', 'Nie udało się wygenerować fiszek')
        return
      }

      const result = await createGeneratedDeckAction(topic, flashcards)
      if (!result.success || !result.deckId) {
        showToast('ERROR', result.error ?? 'Nie udało się zapisać fiszek')
        return
      }

      await queryClient.invalidateQueries({ queryKey: flashcardDecksKey() })
      insertCellAfterWithContent(afterCellId, 'flashcard', JSON.stringify({ deckId: result.deckId }))
    },
    [insertCellAfterWithContent, queryClient]
  )
}
