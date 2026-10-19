import { BookOpen, Sparkles, ClipboardList, Headphones } from 'lucide-react'
import type { DashboardCourse, DashboardTool } from '@/types/dashboardDiscoveryTypes'

export const DASHBOARD_TOOLS: DashboardTool[] = [
  { icon: BookOpen, label: 'Testy', description: 'Sprawdź wiedzę w pytaniach egzaminacyjnych.', href: '/panel/testy', premium: false, iconTone: 'lavender' },
  { icon: Sparkles, label: 'Pracownia AI', description: 'Zadawaj pytania i twórz materiały do nauki.', href: '/panel/nauka?tab=workspace', premium: true, iconTone: 'rose' },
  { icon: ClipboardList, label: 'Procedury', description: 'Ćwicz postępowanie krok po kroku.', href: '/panel/procedury', premium: false, iconTone: 'rose' },
  { icon: Headphones, label: 'Wykłady', description: 'Wróć do swoich wykładów audio.', href: '/panel/nauka?tab=library&library=lectures', premium: true, iconTone: 'lavender' },
]

export const DASHBOARD_COURSES: DashboardCourse[] = [
  { slug: 'opiekun-medyczny', title: 'Opiekun Medyczny', description: 'Przygotowanie do egzaminu i codziennej opieki nad pacjentem.', subjects: 'Testy · Procedury · Egzamin praktyczny' },
  { slug: 'pielegniarstwo', title: 'Pielęgniarstwo', description: 'Materiały do nauki przedmiotów pielęgniarskich.', subjects: 'Testy · Program studiów · Diagnozy' },
  { slug: 'angielski-medyczny', title: 'Angielski Medyczny', description: 'Angielski A2 przydatny w kontakcie z pacjentem.', subjects: 'Słownictwo · Komunikacja · Gramatyka' },
]
