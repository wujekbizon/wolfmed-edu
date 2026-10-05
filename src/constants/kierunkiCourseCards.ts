import type { KierunkiWolfekCourseSlug } from '@/types/kierunkiWolfekTypes'
import type { KierunkiCourseCardCopy } from '@/types/careerPathsTypes'

export const KIERUNKI_COURSE_CARDS: Record<KierunkiWolfekCourseSlug, KierunkiCourseCardCopy> = {
  'opiekun-medyczny': {
    description: 'Ćwicz przed egzaminem państwowym i wracaj do procedur, gdy chcesz utrwalić wiedzę.',
    tags: ['Testy egzaminacyjne', 'Procedury'],
    noteTitle: 'Twój cel, Twoje tempo',
    note: 'Przygotuj się do egzaminu. Zostań, kiedy zechcesz rozwijać się dalej.',
    metricValue: '3000+',
    metricLabel: 'pytań w bazie kursu',
    students: '5 700+',
  },
  pielegniarstwo: {
    description: 'Materiały, testy i narzędzia, które pomagają uczyć się systematycznie przez cały tok studiów.',
    tags: ['Przedmioty i semestry', 'Narzędzia nauki'],
    noteTitle: 'Krok po kroku przez studia',
    note: 'Wracaj do materiału, sprawdzaj wiedzę i buduj własny rytm nauki.',
    metricValue: '22 700+',
    metricLabel: 'pytań z 22 kategorii',
    students: '1 100+',
  },
  'angielski-medyczny': {
    description: 'Poznaj medyczne słownictwo i ćwicz komunikację z pacjentem na poziomie A2.',
    tags: ['Poziom A2', 'Komunikacja z pacjentem'],
    noteTitle: 'Od słowa do rozmowy',
    note: 'Ćwicz zwroty, które przydadzą się przy pacjencie i na zajęciach.',
    metricValue: '5',
    metricLabel: 'kategorii angielskiego medycznego',
    students: '120+',
  },
}
