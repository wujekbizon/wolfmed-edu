import { Target, ClipboardList, Stethoscope, HeartHandshake, type LucideIcon } from 'lucide-react'

export const INSTAGRAM_URL =
  'https://www.instagram.com/wolfmededukacja.pl?utm_source=qr&igsh=aXdhajRjdzhxdDQy'

export const FOOTER_INSTAGRAM_ID = 'footer-instagram'

export const instagramHighlights: { Icon: LucideIcon; label: string }[] = [
  { Icon: Target, label: 'Quiz dnia — sprawdźcie swoją wiedzę' },
  { Icon: ClipboardList, label: 'Procedury tłumaczone krok po kroku' },
  { Icon: Stethoscope, label: 'Ciekawostki medyczne' },
  { Icon: HeartHandshake, label: 'Wsparcie od innych, którzy też się uczą' }
]
