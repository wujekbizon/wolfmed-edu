import type { PathStory } from '@/types/pathStoryTypes'

export const CAREER_STORY: Record<string, PathStory> = {
  'opiekun-medyczny': {
    intro:
      'Zawód, w którym najwięcej znaczy obecność. Zobacz, jak wygląda dzień pracy — a potem sprawdź, czego uczymy.',
    facts: [
      { label: 'Nauka', value: 'Szkoła policealna, 1,5 roku' },
      { label: 'Egzamin', value: 'Zawodowy MED.14 — pisemny i praktyczny' },
      { label: 'Praca', value: 'Szpital, DPS, opieka domowa' },
    ],
    scenes: [
      {
        time: '06:40',
        title: 'Zaczyna dzień od poznania pacjenta',
        description:
          'Przejmuje dyżur, sprawdza, co zmieniło się w nocy, i układa plan opieki na najbliższe godziny.',
        photoHint: 'poranna zmiana, przekazanie dyżuru',
      },
      {
        time: '09:15',
        title: 'Pomaga tam, gdzie samodzielność się kończy',
        description:
          'Higiena, ubieranie, karmienie, zmiana pozycji, pionizacja. Codzienne czynności, które dla pacjenta znaczą najwięcej.',
        photoHint: 'pomoc przy wstawaniu z łóżka',
      },
      {
        time: '12:30',
        title: 'Obserwuje i przekazuje dalej',
        description:
          'Mierzy parametry, zauważa zmiany w stanie pacjenta i informuje pielęgniarkę lub lekarza. Prowadzi dokumentację.',
        photoHint: 'pomiar ciśnienia i wpis w karcie',
      },
      {
        time: '17:00',
        title: 'Jest obok, gdy nikogo innego nie ma',
        description:
          'Rozmawia, uspokaja, towarzyszy. To ta część zawodu, której nie widać w podstawie programowej, a decyduje o wszystkim.',
        photoHint: 'rozmowa z pacjentką przy oknie',
      },
    ],
  },
}
