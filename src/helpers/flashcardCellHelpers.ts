export function parseFlashcardContent(content: string): {
  flashcards: Array<{ questionText: string; answerText: string }>
  topic: string
} {
  try {
    const parsed = JSON.parse(content)
    const flashcards = Array.isArray(parsed.flashcards) ? parsed.flashcards : []
    return { flashcards, topic: parsed.topic ?? 'Fiszki' }
  } catch {
    return { flashcards: [], topic: 'Fiszki' }
  }
}
