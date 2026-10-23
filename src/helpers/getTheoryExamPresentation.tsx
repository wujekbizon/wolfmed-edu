import { LayoutGrid, HelpCircle, CheckCircle2, BookOpenCheck, Timer, BarChart3,  } from 'lucide-react'
import { pluralizePl } from '@/helpers/pluralizePl'
import type { ExamHubProps, ExamHubCard } from '@/types/examHubTypes'

export function getTheoryExamPresentation({ categoryCount, questionCount, categoryNames }: ExamHubProps): ExamHubCard {
  return {
    href: '/panel/testy',
    title: 'Egzamin teoretyczny',
    subtitle: 'Część pisemna',
    description:
      'Testy jednokrotnego wyboru z kluczem odpowiedzi. Ćwicz pytania z dostępnych kategorii tematycznych, utrwalaj materiał i sprawdzaj swoją wiedzę w dowolnym momencie.',
    image: 'https://zw3dk8dyy9.ufs.sh/f/UVAwLrIxs2k5T8A3NV6spcKHld4CGX8o0kyJTPUwfnQEMegN',
    stats: [
      {
        icon: <HelpCircle className="w-3.5 h-3.5" />,
        value: questionCount.toLocaleString('pl-PL'),
        label: pluralizePl(questionCount, ['pytanie', 'pytania', 'pytań']),
      },
      {
        icon: <LayoutGrid className="w-3.5 h-3.5" />,
        value: categoryCount.toLocaleString('pl-PL'),
        label: pluralizePl(categoryCount, ['kategoria', 'kategorie', 'kategorii']),
      },
    ],
    preview: {
      icon: <BookOpenCheck className="w-3.5 h-3.5" />,
      label: 'Kategorie w zestawie',
      items: categoryNames,
      limit: 5,
    },
    meta: [
      { icon: <CheckCircle2 className="w-3.5 h-3.5" />, label: 'Klucz odpowiedzi' },
      { icon: <Timer className="w-3.5 h-3.5" />, label: 'Pomiar czasu' },
      { icon: <BarChart3 className="w-3.5 h-3.5" />, label: 'Wynik końcowy' },
    ],
    cta: 'Przejdź do testów',
  }

}
