'use client'

import { useEffect, useState, useCallback } from 'react'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { COMMAND_PRIORITY_NORMAL, createCommand, $getSelection, $isRangeSelection, $getRoot, $createParagraphNode, $nodesOfType } from 'lexical'
import { $createFlashcardNode, FlashcardNode } from '../nodes/FlashcardNode'

export type FlashcardPayload = {
  questionText: string
  answerText: string
}

export type EditFlashcardPayload = {
  cardId: string
  questionText: string
  answerText: string
}

export const CREATE_FLASHCARD_COMMAND = createCommand<FlashcardPayload>('CREATE_FLASHCARD_COMMAND')
export const EDIT_FLASHCARD_COMMAND = createCommand<EditFlashcardPayload>('EDIT_FLASHCARD_COMMAND')
export const DELETE_FLASHCARD_COMMAND = createCommand<string>('DELETE_FLASHCARD_COMMAND')
export const GET_ALL_FLASHCARDS_COMMAND = createCommand<void>('GET_ALL_FLASHCARDS_COMMAND')

export type FlashcardData = {
  cardId: string
  questionText: string
  answerText: string
}

export default function FlashcardPlugin() {
  const [editor] = useLexicalComposerContext()
  const [flashcards, setFlashcards] = useState<FlashcardData[]>([])

  const extractFlashcards = useCallback(() => {
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

  useEffect(() => {
    const unregisterCreate = editor.registerCommand(
      CREATE_FLASHCARD_COMMAND,
      (payload: FlashcardPayload) => {
        editor.update(() => {
          const flashcardNode = $createFlashcardNode(payload.questionText, payload.answerText)
          const selection = $getSelection()

          if ($isRangeSelection(selection)) {
            selection.insertNodes([flashcardNode])
          } else {
            const root = $getRoot()
            const paragraph = $createParagraphNode()
            paragraph.append(flashcardNode)
            root.append(paragraph)
          }
        })
        extractFlashcards()
        return true
      },
      COMMAND_PRIORITY_NORMAL,
    )

    const unregisterEdit = editor.registerCommand(
      EDIT_FLASHCARD_COMMAND,
      (payload: EditFlashcardPayload) => {
        editor.update(() => {
          const flashcardNodes = $nodesOfType(FlashcardNode)
          flashcardNodes.forEach((node) => {
            if (node.getCardId() === payload.cardId) {
              node.setQuestionText(payload.questionText)
              node.setAnswerText(payload.answerText)
            }
          })
        })
        extractFlashcards()
        return true
      },
      COMMAND_PRIORITY_NORMAL,
    )

    const unregisterDelete = editor.registerCommand(
      DELETE_FLASHCARD_COMMAND,
      (cardId: string) => {
        editor.update(() => {
          const flashcardNodes = $nodesOfType(FlashcardNode)
          flashcardNodes.forEach((node) => {
            if (node.getCardId() === cardId) {
              node.remove()
            }
          })
        })
        extractFlashcards()
        return true
      },
      COMMAND_PRIORITY_NORMAL,
    )

    const unregisterGetAll = editor.registerCommand(
      GET_ALL_FLASHCARDS_COMMAND,
      () => {
        extractFlashcards()
        return true
      },
      COMMAND_PRIORITY_NORMAL,
    )

    return () => {
      unregisterCreate()
      unregisterEdit()
      unregisterDelete()
      unregisterGetAll()
    }
  }, [editor, extractFlashcards])

  useEffect(() => {
    extractFlashcards()
  }, [extractFlashcards])

  return null
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
