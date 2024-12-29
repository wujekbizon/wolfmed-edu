import { useState, useEffect, useCallback } from 'react'
import type { SpeechRecognition, SpeechRecognitionEvent, SpeechRecognitionErrorEvent } from '../types/speech'

/**
 * Custom hook for handling speech recognition functionality
 * Provides speech-to-text capabilities with browser's Web Speech API
 *
 * @param onResult - Callback function that receives the final transcribed text
 * @returns Object containing speech recognition controls and state
 */
export function useSpeechRecognition(onResult: (text: string) => void) {
  const [isListening, setIsListening] = useState(false)
  const [speechRecognition, setSpeechRecognition] = useState<SpeechRecognition | null>(null)

  /**
   * Initialize speech recognition on mount
   * Handles browser compatibility and sets up initial configuration
   */
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Support both standard and webkit (Safari) implementations
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition()
        recognition.continuous = true // Don't stop listening after first result
        recognition.interimResults = true // Get results while user is speaking
        recognition.lang = 'pl-PL' // Set language to Polish
        setSpeechRecognition(recognition)
      }
    }
  }, [])

  /**
   * Manages speech recognition event handlers
   * Sets up result and error handlers when listening state changes
   * Cleans up handlers when component unmounts or listening stops
   */
  useEffect(() => {
    if (!speechRecognition) return

    const handleResult = (event: SpeechRecognitionEvent) => {
      const results = event.results
      const lastResult = results[results.length - 1]
      if (!lastResult?.[0]) return

      const transcript = lastResult[0].transcript.trim()

      // Only emit final results to prevent flickering/duplicate text
      if (lastResult.isFinal) {
        onResult(transcript)
      }
    }

    const handleError = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error)
      stopListening()
    }

    // Attach handlers only when actively listening
    if (isListening) {
      speechRecognition.onresult = handleResult
      speechRecognition.onerror = handleError
    }

    // Cleanup function to remove handlers and prevent memory leaks
    return () => {
      if (speechRecognition) {
        speechRecognition.onresult = () => {}
        speechRecognition.onerror = () => {}
      }
    }
  }, [isListening, speechRecognition, onResult])

  /**
   * Starts the speech recognition service
   * Memoized to prevent unnecessary re-renders
   */
  const startListening = useCallback(() => {
    if (speechRecognition) {
      speechRecognition.start()
      setIsListening(true)
    }
  }, [speechRecognition])

  /**
   * Stops the speech recognition service
   * Memoized to prevent unnecessary re-renders
   */
  const stopListening = useCallback(() => {
    if (speechRecognition) {
      speechRecognition.stop()
      setIsListening(false)
    }
  }, [speechRecognition])

  return {
    isListening,
    startListening,
    stopListening,
    isSupported: !!speechRecognition,
  }
}
