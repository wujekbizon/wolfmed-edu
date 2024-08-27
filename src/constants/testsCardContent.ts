import { NUMBER_OF_PROCEDURES, NUMBER_OF_TESTS } from './testsNumbers'

export interface TestCardContent {
  category: string
  title: string
  content: string
  date: string
  testsNumber: number
  testsLabel: string
  image: string
  link: string
}

export const testCardContent: TestCardContent[] = [
  {
    category: 'Testy',
    title: 'Testy Opiekuna Medycznego.',
    content: 'Darmowa baza testów, oparata na 2 ostatnich latach z egzaminów i kursu na Opiekuna Medycznego.',
    date: '27 Sie 2024',
    testsNumber: NUMBER_OF_TESTS,
    testsLabel: 'Testów',
    image: '/heart.png',
    link: '/testy-opiekun/nauka',
  },
  {
    category: 'Procedury',
    title: 'Procedury Opiekuna Medycznego',
    content: 'Lista procedur i algorytmów dla opiekunów medycznych.',
    date: '27 Sie 2024',
    testsNumber: NUMBER_OF_PROCEDURES,
    testsLabel: 'Procedur',
    image: '/syringie.png',
    link: '/testy-opiekun/procedury',
  },
]
