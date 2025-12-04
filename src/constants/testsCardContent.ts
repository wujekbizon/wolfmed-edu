const NUMBER_OF_TESTS = 664
const NUMBER_OF_PROCEDURES = 31

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
    date: '31 Paż 2024',
    testsNumber: NUMBER_OF_TESTS,
    testsLabel: 'Testów',
    image: 'https://utfs.io/a/zw3dk8dyy9/UVAwLrIxs2k5Jp1VzHmQWsLSvF0ZVh7qXdCNxbjatwczey8g',
    link: '/panel/nauka',
  },
  {
    category: 'Procedury',
    title: 'Procedury Opiekuna Medycznego',
    content: 'Lista procedur i algorytmów dla opiekunów medycznych.',
    date: '27 Sie 2024',
    testsNumber: NUMBER_OF_PROCEDURES,
    testsLabel: 'Procedur',
    image: 'https://utfs.io/a/zw3dk8dyy9/UVAwLrIxs2k5HvfwYbqRXZAfUgQh6yMWki0EFjo5rbcJDS2m',
    link: '/panel/procedury',
  },
]
