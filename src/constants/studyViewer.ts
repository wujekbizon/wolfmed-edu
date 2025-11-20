import type { HighlightColor } from '@/components/editor/nodes/HighlightNode'

// Highlight color options for text highlighting
export const HIGHLIGHT_COLORS: { color: HighlightColor; label: string; className: string }[] = [
  { color: 'yellow', label: 'Żółty', className: 'bg-yellow-200 hover:bg-yellow-300 border-yellow-400' },
  { color: 'green', label: 'Zielony', className: 'bg-green-200 hover:bg-green-300 border-green-400' },
  { color: 'blue', label: 'Niebieski', className: 'bg-blue-200 hover:bg-blue-300 border-blue-400' },
  { color: 'pink', label: 'Różowy', className: 'bg-pink-200 hover:bg-pink-300 border-pink-400' },
  { color: 'purple', label: 'Fioletowy', className: 'bg-purple-200 hover:bg-purple-300 border-purple-400' },
]

// StudyToolbar UI text
export const STUDY_TOOLBAR_TEXT = {
  studyMode: 'Tryb nauki',
  readOnlyMode: 'Tryb odczytu',
  enableStudyMode: 'Włącz tryb nauki',
  disableStudyMode: 'Wyłącz tryb nauki',
  highlightButton: 'Zaznacz',
  highlightTitle: 'Zaznacz tekst',
  chooseColor: 'Wybierz kolor',
  commentButton: 'Komentarz',
  commentTitle: 'Dodaj komentarz',
  flashcardButton: 'Fiszka',
  flashcardTitle: 'Utwórz fiszkę',
  reviewButton: 'Przeglądaj fiszki',
  reviewButtonShort: 'Fiszki',
}

// Comment modal text
export const COMMENT_MODAL_TEXT = {
  title: 'Dodaj komentarz',
  description: 'Zaznacz tekst, a następnie dodaj swoją notatkę lub adnotację.',
  placeholder: 'Wpisz swój komentarz tutaj...',
  cancel: 'Anuluj',
  submit: 'Dodaj komentarz',
}

// Flashcard modal text
export const FLASHCARD_MODAL_TEXT = {
  createTitle: 'Utwórz fiszkę',
  createDescription: 'Utwórz fiszkę, aby pomóc sobie w nauce i zapamiętaniu tej treści.',
  questionLabel: 'Pytanie',
  questionPlaceholder: 'Jakie jest pytanie?',
  answerLabel: 'Odpowiedź',
  answerPlaceholder: 'Jaka jest odpowiedź?',
  cancel: 'Anuluj',
  submit: 'Utwórz fiszkę',
}

// Flashcard review modal text
export const FLASHCARD_REVIEW_TEXT = {
  title: 'Przeglądaj fiszki',
  cardProgress: (current: number, total: number) => `Fiszka ${current} z ${total}`,
  shuffleTitle: 'Tasuj fiszki',
  noCardsTitle: 'Brak fiszek',
  noCardsDescription: 'Utwórz fiszki z notatek, aby rozpocząć naukę!',
  close: 'Zamknij',
  questionLabel: 'PYTANIE',
  answerLabel: 'ODPOWIEDŹ',
  clickToReveal: 'Kliknij, aby zobaczyć odpowiedź',
  clickToSeeQuestion: 'Kliknij, aby zobaczyć pytanie',
  previous: 'Poprzednia',
  next: 'Następna',
}
