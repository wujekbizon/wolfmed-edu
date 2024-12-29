'use client'

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { $getSelection, $isRangeSelection, $getRoot, $createRangeSelection, $setSelection } from 'lexical'
import { useSpeechRecognition } from './useSpeechRecognition'
import MicrophoneIcon from '@/components/icons/MicrophoneIcon'

export default function SpeechToTextButton() {
  const [editor] = useLexicalComposerContext()

  const handleResult = (transcript: string) => {
    editor.update(() => {
      const selection = $getSelection()

      // If no selection, create one at the end of the document
      if (!$isRangeSelection(selection)) {
        const lastNode = $getRoot().getLastDescendant()
        if (lastNode) {
          const newSelection = $createRangeSelection()
          newSelection.anchor.set(lastNode.getKey(), lastNode.getTextContent().length, 'text')
          newSelection.focus.set(lastNode.getKey(), lastNode.getTextContent().length, 'text')
          $setSelection(newSelection)
        }
      }

      // Now we can safely insert text
      const updatedSelection = $getSelection()
      if ($isRangeSelection(updatedSelection)) {
        updatedSelection.insertText(transcript + ' ')
      }
    })
  }

  const { isListening, startListening, stopListening, isSupported } = useSpeechRecognition(handleResult)

  if (!isSupported) return null

  const handleToggle = () => {
    if (isListening) {
      stopListening()
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
