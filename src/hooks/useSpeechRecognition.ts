import { useState, useEffect, useCallback, useRef } from 'react'
import type { SpeechRecognition, SpeechRecognitionEvent, SpeechRecognitionErrorEvent } from '@/types/speechTypes'

/**
 * Hook that provides speech recognition functionality using the Web Speech API.
 *
 * Initializes a continuous, interim-result-enabled recognizer set to Polish (`pl-PL`).
 * The `onResult` callback is kept in a ref so callers can pass a new function reference
 * on every render without restarting the recognizer.
 *
 * @param onResult - Called whenever the recognizer produces a result.
 *   Receives the trimmed transcript and a flag indicating whether the result is final.
 *
 * @returns An object with:
 * - `isListening` – whether the recognizer is currently active
 * - `startListening` – starts the recognizer
 * - `stopListening` – stops the recognizer
 * - `isSupported` – whether the Web Speech API is available in the current browser
 */
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
