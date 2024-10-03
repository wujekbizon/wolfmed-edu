import { Metadata } from 'next'
import About from '@/app/_components/About'

export const dynamic = 'force-static'

export const metadata: Metadata = {
  title: 'O nas',
  description:
    'Wolfmed Edukacja to innowacyjny startup edukacyjny dedykowany przyszłym opiekunom medycznym, którzy przygotowują się do egzaminów zawodowych',
  keywords:
    'innowacyjny, startup, opiekunom, medycznym, bezpłatny, edukacyjny, egzamin, zawód, społeczność, motywacja, pozytywny, opieka, zdrowie',
}

export default function AboutPage() {
  return <About />
}
