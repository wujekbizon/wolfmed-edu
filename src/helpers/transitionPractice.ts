import type { PracticeActionInput, PracticeItem } from '@/types/learningPracticeTypes'
import type { TestData } from '@/types/dataTypes'

export function transitionPractice(item: PracticeItem, input: PracticeActionInput, data: TestData | null) {
  if (!data) {
    if (!['skip', 'next', 'finish'].includes(input.command)) throw new Error('Pytanie zmienione. Pomiń je.')
    item.outcome = 'invalid'
    return
  }
  if (input.command === 'finish') return
  if (input.command === 'next') {
    if (!item.outcome) throw new Error('Najpierw odpowiedz lub pomiń pytanie.')
    return
  }
  if (input.command === 'skip') {
    if (!item.outcome) item.outcome = 'skipped'
    return
  }
  if (input.command === 'reveal') {
    item.revealed = true
    item.learningEventId = input.eventId
    item.correctIndex = data.answers.findIndex((answer) => answer.isCorrect)
    if (!item.outcome) item.outcome = 'revealed'
    return
  }
  if (item.outcome) throw new Error('Pytanie jest już zakończone.')
  if (input.command === 'hint') {
    item.hintOpened = true
    if (item.learningEventId) item.support = {
      trigger: item.learningEventId, hintIndex: 0, action: null, mode: 'active',
    }
    return
  }
  const answer = input.selected === undefined ? undefined : data.answers[input.selected]
  if (!answer || item.attempts.length >= 2) throw new Error('Nieprawidłowa próba.')
  const assisted = item.priorExposure || item.hintOpened || item.revealed || item.attempts.length > 0
  item.attempts.push({ selected: input.selected!, correct: answer.isCorrect, assisted, eventId: input.eventId })
  item.learningEventId = input.eventId
  if (answer.isCorrect) {
    item.correctIndex = input.selected!
    item.outcome = assisted ? 'assisted' : 'unassisted'
  }
  else if (item.attempts.length === 2) {
    item.revealed = true
    item.correctIndex = data.answers.findIndex((entry) => entry.isCorrect)
    item.outcome = 'revealed'
  }
}
