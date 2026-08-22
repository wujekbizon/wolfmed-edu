export function parseFlashcardCellContent(content: string): string | null {
  try {
    const parsed = JSON.parse(content)
    return typeof parsed.deckId === 'string' ? parsed.deckId : null
  } catch {
    return null
  }
}
