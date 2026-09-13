import type { PathStory } from '@/types/pathStoryTypes'

const ENGLISH_MEDICAL_IMAGE =
  'https://utfs.io/a/zw3dk8dyy9/UVAwLrIxs2k5A7rR6OTmtJLFcNxMQbgSqKBWs3zA7RoEVreO'
const ENGLISH_MEDICAL_IMAGE_ALT =
  'https://utfs.io/a/zw3dk8dyy9/UVAwLrIxs2k52osKX2SEBiUD8sVXHObYqkj3TNfo4PKMGg6J'

export const ENGLISH_MEDICAL_STORY: PathStory = {
  intro:
    'Ucz się angielskiego, którego naprawdę potrzebujesz w pracy medycznej — od pierwszego kontaktu z pacjentem po przygotowanie do egzaminu na pielęgniarstwie i kierunku opiekuna medycznego.',
  facts: [
    { label: 'Poziom', value: 'A2 — podstawowa komunikacja medyczna' },
    { label: 'Praca', value: 'Pacjent, oddział i zespół medyczny' },
    { label: 'Egzamin', value: 'Pielęgniarstwo i opiekun medyczny' },
  ],
  scenes: [
    {
      time: '01',
      title: 'Poznajesz słowa używane w medycynie',
      description:
        'Utrwalasz terminy dotyczące ciała, objawów, parametrów życiowych, badań, sprzętu i podstawowego leczenia.',
      photoHint: 'nauka terminologii medycznej',
      imgSrc: ENGLISH_MEDICAL_IMAGE_ALT,
    },
    {
      time: '02',
      title: 'Ćwiczysz język potrzebny w praktyce',
      description:
        'Budujesz proste zdania, prowadzisz podstawową rozmowę z pacjentem i rozwiązujesz zadania podobne do egzaminacyjnych.',
      photoHint: 'rozmowa z pacjentem po angielsku',
      imgSrc: ENGLISH_MEDICAL_IMAGE,
    },
  ],
}
