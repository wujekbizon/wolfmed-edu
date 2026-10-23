import { FileText, CheckCircle2, ClipboardList, Target, CalendarDays } from 'lucide-react'
import { pluralizePl } from '@/helpers/pluralizePl'
import type { ExamHubProps, ExamHubCard } from '@/types/examHubTypes'

export function getPracticalExamPresentation({ practicalExamCount, sessionNames, hasPracticalAccess }: ExamHubProps): ExamHubCard {
  return hasPracticalAccess
    ? {
        href: '/panel/egzaminy',
        title: 'Egzamin praktyczny',
        subtitle: 'Część praktyczna',
        description:
          'Wierne arkusze egzaminacyjne MED.14 z prawdziwych sesji. Wypełnij dokumentację jak na egzaminie i otrzymaj ocenę zgodną z zasadami oceniania.',
        image: 'https://zw3dk8dyy9.ufs.sh/f/UVAwLrIxs2k55tagqNnBKUAhkYmyprxV4JznuWGliEwXqgb2',
        stats: [
          {
            icon: <FileText className="w-3.5 h-3.5" />,
            value: practicalExamCount.toLocaleString('pl-PL'),
            label: pluralizePl(practicalExamCount, ['arkusz', 'arkusze', 'arkuszy']),
          },
          {
            icon: <Target className="w-3.5 h-3.5" />,
            value: '75%',
            label: 'Próg zaliczenia',
          },
        ],
        preview: {
          icon: <CalendarDays className="w-3.5 h-3.5" />,
          label: 'Dostępne sesje',
          items: sessionNames,
          limit: 4,
        },
        meta: [
          { icon: <ClipboardList className="w-3.5 h-3.5" />, label: 'Wypełnianie kart' },
          { icon: <CheckCircle2 className="w-3.5 h-3.5" />, label: 'Ocena wg klucza' },
          { icon: <FileText className="w-3.5 h-3.5" />, label: 'Prawdziwe sesje' },
        ],
        cta: 'Przejdź do egzaminów',
      }
    : {
        href: '/panel/egzaminy',
        title: 'Egzamin praktyczny',
        subtitle: 'Część praktyczna',
        description:
          'Praktyczne arkusze egzaminacyjne są obecnie dostępne wyłącznie dla kursu Opiekun Medyczny.',
        image: 'https://zw3dk8dyy9.ufs.sh/f/UVAwLrIxs2k55tagqNnBKUAhkYmyprxV4JznuWGliEwXqgb2',
        disabled: true,
        stats: [],
        meta: [
          { icon: <ClipboardList className="w-3.5 h-3.5" />, label: 'Wypełnianie kart' },
          { icon: <CheckCircle2 className="w-3.5 h-3.5" />, label: 'Ocena wg klucza' },
          { icon: <FileText className="w-3.5 h-3.5" />, label: 'Prawdziwe sesje' },
        ],
        cta: 'Przejdź do egzaminów',
      }

}
