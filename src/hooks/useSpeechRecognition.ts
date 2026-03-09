import { useState, useEffect, useCallback, useRef } from 'react'
import type { SpeechRecognition, SpeechRecognitionEvent, SpeechRecognitionErrorEvent } from '@/types/speechTypes'

export function useSpeechRecognition(onResult: (text: string, isFinal: boolean) => void) {
  const [isListening, setIsListening] = useState(false)
  const [speechRecognition, setSpeechRecognition] = useState<SpeechRecognition | null>(null)

  const onResultRef = useRef(onResult)
  onResultRef.current = onResult

  useEffect(() => {
    if (typeof window === 'undefined') return
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) return

    const recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'pl-PL'
    setSpeechRecognition(recognition)
  }, [])

  useEffect(() => {
    if (!speechRecognition || !isListening) return

    const handleResult = (event: SpeechRecognitionEvent) => {
      const lastResult = event.results[event.results.length - 1]
      if (!lastResult?.[0]) return
      const transcript = lastResult[0].transcript.trim()
      onResultRef.current(transcript, lastResult.isFinal)
    }

    const handleError = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error)
      speechRecognition.stop()
      setIsListening(false)
    }

    speechRecognition.onresult = handleResult
    speechRecognition.onerror = handleError

    return () => {
      speechRecognition.onresult = () => {}
      speechRecognition.onerror = () => {}
    }
  }, [isListening, speechRecognition])

  const startListening = useCallback(() => {
    if (speechRecognition) {
      speechRecognition.start()
      setIsListening(true)
    }
  }, [speechRecognition])

  const stopListening = useCallback(() => {
    if (speechRecognition) {
      speechRecognition.stop()
      setIsListening(false)
    }
  }, [speechRecognition])

  return { isListening, startListening, stopListening, isSupported: !!speechRecognition }
}
