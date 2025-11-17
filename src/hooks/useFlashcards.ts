import { useState, useCallback } from 'react'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { $nodesOfType } from 'lexical'
import { FlashcardNode } from '@/components/editor/nodes/FlashcardNode'

export type FlashcardData = {
  cardId: string
  questionText: string
  answerText: string
}

export function useFlashcards() {
  const [editor] = useLexicalComposerContext()
  const [flashcards, setFlashcards] = useState<FlashcardData[]>([])

  const refreshFlashcards = useCallback(() => {
    const cards: FlashcardData[] = []
    editor.read(() => {
      const flashcardNodes = $nodesOfType(FlashcardNode)
      flashcardNodes.forEach((node) => {
        cards.push({
          cardId: node.getCardId(),
          questionText: node.getQuestionText(),
          answerText: node.getAnswerText(),
        })
      })
    })
    setFlashcards(cards)
  }, [editor])

  return { flashcards, refreshFlashcards }
}
