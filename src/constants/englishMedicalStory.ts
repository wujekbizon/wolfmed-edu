import type { PathStory } from '@/types/pathStoryTypes'

const ENGLISH_MEDICAL_IMAGE =
  'https://utfs.io/a/zw3dk8dyy9/UVAwLrIxs2k5ooTSgYvSLyQhzP6mdErKItkOUcXlTqiNMavY'
const ENGLISH_MEDICAL_IMAGE_ALT =
  'https://utfs.io/a/zw3dk8dyy9/UVAwLrIxs2k5BjjFJjEFD1UJjByX9nEY7CcT26HaQ4iwRItP'
const ENGLISH_MEDICAL_IMAGE_THREE =
  'https://utfs.io/a/zw3dk8dyy9/UVAwLrIxs2k58DVn394HBZxypP1UFjuAhJ4WoOXgcGSRqzCi'
const ENGLISH_MEDICAL_IMAGE_FOUR =
  'https://utfs.io/a/zw3dk8dyy9/UVAwLrIxs2k5nNaK3XL9GQYxNri4Uw0MejlVEP63mgKp18FO'

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
      title: 'Poznajesz pacjentkę i pytasz o samopoczucie',
      description:
        'Zaczynasz rozmowę i pytasz o objawy: “How are you feeling?”, “Where does it hurt?” oraz “I have a headache.”',
      photoHint: 'opiekun medyczny rozmawia z pacjentką o bólu głowy',
      imgSrc: ENGLISH_MEDICAL_IMAGE_ALT,
    },
    {
      time: '02',
      title: 'Pomagasz w porannej opiece',
      description:
        'Ćwiczysz uprzejme prośby, zgodę i bezpieczne poruszanie się: “Are you ready to get up?”, “Take your time.”, “I will help you.”',
      photoHint: 'opiekun medyczny pomaga pacjentce wstać z łóżka',
      imgSrc: ENGLISH_MEDICAL_IMAGE,
    },
    {
      time: '03',
      title: 'Sprawdzasz podstawowe parametry',
      description:
        'Pytasz o zawroty głowy i samopoczucie, a następnie opisujesz czynności: “I will check your temperature and blood pressure.”',
      photoHint: 'opiekun medyczny sprawdza temperaturę i ciśnienie pacjentki',
      imgSrc: ENGLISH_MEDICAL_IMAGE_THREE,
    },
    {
      time: '04',
      title: 'Zapewniasz komfort i planujesz dalszą opiekę',
      description:
        'Kończysz wizytę spokojną rozmową: “Here is some water.”, “You can rest now.” i “Should I call the nurse if the pain gets worse?”',
      photoHint: 'opiekun medyczny podaje wodę i uspokaja pacjentkę',
      imgSrc: ENGLISH_MEDICAL_IMAGE_FOUR,
    },
  ],
}
