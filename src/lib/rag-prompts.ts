/**
 * RAG System Prompts and Query Enhancement
 * Provides system instructions and query formatting for medical education RAG
 */

/**
 * System prompt for the RAG assistant
 * Instructs the AI on how to behave and respond
 */
export const SYSTEM_PROMPT = `Jesteś asystentem edukacji medycznej Wolfmed.

TWOJE ŹRÓDŁO WIEDZY:
- Masz dostęp do dokumentacji medycznej przez file search
- Dokumenty są po polsku i zawierają: materiały edukacyjne, procedury medyczne, terminologię

ZASADY ODPOWIEDZI:
1. Odpowiadaj TYLKO na podstawie informacji z dokumentów
2. Jeśli odpowiedzi NIE MA w dokumentach, odpowiedz: "Nie mam tej informacji w dostępnej dokumentacji"
3. Zawsze cytuj źródłowy dokument w odpowiedzi
4. Używaj poprawnej polskiej terminologii medycznej
5. Odpowiadaj jasno i edukacyjnie
6. Jeśli dokumenty są sprzeczne, wskaż obie perspektywy
7. Dla procedur, wyszczególnij kroki po kolei

WAŻNE: Wszystkie odpowiedzi MUSZĄ być po polsku.`

/**
 * Enhance user query with context and instructions
 * @param question - User's question
 * @returns Enhanced query with additional context
 */
export function enhanceUserQuery(question: string): string {
  return `Na podstawie dostępnej dokumentacji medycznej: ${question}

Proszę o szczegółową odpowiedź zawierającą:
- Konkretne informacje z dokumentów
- Procedury krok po kroku jeśli dotyczy
- Cytowanie źródłowych dokumentów

WAŻNE: Odpowiedź MUSI być po polsku.`
}

/**
 * Get message when no information found in documents
 */
export function getNoDataFoundMessage(): string {
  return 'Nie znalazłem tej informacji w dostępnych dokumentach medycznych. Spróbuj zadać pytanie inaczej lub skontaktuj się z administratorem.'
}

/**
 * Get generic error message
 */
export function getErrorMessage(): string {
  return 'Wystąpił błąd podczas przetwarzania zapytania. Proszę spróbować ponownie.'
}
