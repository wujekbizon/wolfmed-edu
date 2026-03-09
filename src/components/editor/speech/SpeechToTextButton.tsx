'use client'

import { useRef, useCallback } from 'react'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { $getSelection, $isRangeSelection, $getRoot, $createRangeSelection, $setSelection } from 'lexical'
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition'
import MicrophoneIcon from '@/components/icons/MicrophoneIcon'

export default function SpeechToTextButton() {
  const [editor] = useLexicalComposerContext()

  // Tracks how many interim chars are currently in the editor so they can
  // be replaced when the next interim/final result arrives
  const interimLengthRef = useRef(0)

  const handleResult = useCallback(
    (transcript: string, isFinal: boolean) => {
      editor.update(() => {
        let selection = $getSelection()

        if (!$isRangeSelection(selection)) {
          const lastNode = $getRoot().getLastDescendant()
          if (lastNode) {
            const newSelection = $createRangeSelection()
            newSelection.anchor.set(lastNode.getKey(), lastNode.getTextContent().length, 'text')
            newSelection.focus.set(lastNode.getKey(), lastNode.getTextContent().length, 'text')
            $setSelection(newSelection)
          }
          selection = $getSelection()
        }

        if (!$isRangeSelection(selection)) return

        // Extend anchor backward to cover the previous interim text, then
        // insertText will replace that range with the new transcript
        if (interimLengthRef.current > 0) {
          const anchor = selection.anchor
          const node = anchor.getNode()
          const newOffset = Math.max(0, anchor.offset - interimLengthRef.current)
          selection.anchor.set(node.getKey(), newOffset, 'text')
        }

        selection.insertText(isFinal ? transcript + ' ' : transcript)
        interimLengthRef.current = isFinal ? 0 : transcript.length
      })
    },
    [editor]
  )

  const { isListening, startListening, stopListening, isSupported } = useSpeechRecognition(handleResult)

  if (!isSupported) return null

  const handleToggle = () => {
    if (isListening) {
      stopListening()
      interimLengthRef.current = 0
    } else {
      startListening()
    }
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      className={`p-1.5 sm:p-2 rounded text-zinc-300 hover:text-zinc-100 relative
        ${isListening ? 'bg-red-500/20 text-red-400' : 'hover:bg-zinc-700'}`}
      title={isListening ? 'Zatrzymaj dyktowanie' : 'Rozpocznij dyktowanie'}
    >
      <MicrophoneIcon />
      {isListening && <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-500 animate-pulse" />}
    </button>
  )
}
