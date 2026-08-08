import type { PathStory } from '@/types/pathStoryTypes'

export const PIELEGNIARSTWO_STORY: PathStory = {
  intro:
    'Prowadzimy Cię przez cały tok studiów pielęgniarskich — przedmioty podstawowe i kierunkowe, proces pielęgnowania i testy sprawdzające, na jednej platformie. Zobacz, do jakiej pracy Cię przygotowujemy.',
  facts: [
    { label: 'Nauka', value: 'Studia licencjackie, dalej magisterskie' },
    { label: 'Egzamin', value: 'Dyplomowy — teoria i praktyka' },
    { label: 'Praca', value: 'Szpital, przychodnia, opieka długoterminowa' }
  ],
  scenes: [
    {
      time: '07:00',
      title: 'Zaczyna od oceny stanu pacjenta',
      description:
        'Przejmuje dyżur, sprawdza parametry i to, co zmieniło się w nocy. Na tej ocenie opiera plan opieki na całą zmianę.',
      photoHint: 'pielęgniarka przy łóżku pacjenta',
      imgSrc:
        'https://zw3dk8dyy9.ufs.sh/f/UVAwLrIxs2k5LfaSoQyT6ikNIWjyZsOdaGtHcBb3PAS8E7u5'
    },
    {
      time: '10:20',
      title: 'Podaje leki według reguły pięciu W',
      description:
        'Właściwy pacjent, lek, dawka, droga i czas. Każde podanie potwierdza w dokumentacji i obserwuje, jak pacjent na nie reaguje.',
      photoHint: 'przygotowanie i kontrola leków',
      imgSrc:
        'https://zw3dk8dyy9.ufs.sh/f/UVAwLrIxs2k54CeCBW9lLqODmv7er0SPRQB8C9VnfbTHisc1'
    },
    {
      time: '13:40',
      title: 'Planuje opiekę i ocenia jej skutki',
      description:
        'Formułuje diagnozy pielęgniarskie, dobiera interwencje i sprawdza, czy zadziałały. To ta część zawodu, którą widać w dokumentacji.',
      photoHint: 'planowanie opieki i dokumentacja',
      imgSrc:
        'https://zw3dk8dyy9.ufs.sh/f/UVAwLrIxs2k5XsKjQQxVpDmWAcOabR2YPhrGzwTdQFLHCilt'
    },
    {
      time: '18:30',
      title: 'Przekazuje dyżur zespołowi',
      description:
        'Referuje stan pacjentów, sygnalizuje to, co wymaga uwagi na nocnej zmianie, i konsultuje wątpliwości z lekarzem.',
      photoHint: 'zespół na dyżurce',
      imgSrc:
        'https://zw3dk8dyy9.ufs.sh/f/UVAwLrIxs2k5N8G4NnH2M1UuCEmiKr7chszHj6GeZpqAJ4w2'
    }
  ]
}
