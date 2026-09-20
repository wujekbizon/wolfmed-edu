import type { Metadata } from 'next'
import ForumPageView from '@/components/forum/ForumPageView'

export const experimental_ppr = true

export const metadata: Metadata = {
  title: 'Wolfmed Forum Dyskusyjne ',
  description:
    'Witam na forum dyskusyjne na naszej platformie. To przestrzeń, która łączy zarówno tych, którzy dopiero przygotowują się do egzaminu na opiekuna medycznego, jak i doświadczonych opiekunów, chcących podzielić się swoimi rozwiązaniami i poradami z innymi.',
  keywords:
    'opiekun, forum, porady, dieta, opieka, bezpieczeństwo, etyka, stres, komunikacja, higiena, egzamin, pomoc, rehabilitacja, dyskusja, problemy',
}

export default function ForumPage() {
  return <ForumPageView />
}
