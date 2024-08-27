import { NUMBER_OF_TESTS } from './testsNumbers'

export interface TestCardContent {
  category: string
  title: string
  content: string
  date: string
  testsNumber: number
}

export const testCardContent: TestCardContent[] = [
  {
    category: 'Opiekun Medyczny',
    title: 'Testy dla Opiekuna Medycznego.',
    content: 'Darmowa baza testów, oparata na 2 ostatnich latach z egzaminów i kursu na Opiekuna Medycznego.',
    date: '27 Sie 2024',
    testsNumber: NUMBER_OF_TESTS,
  },
]
