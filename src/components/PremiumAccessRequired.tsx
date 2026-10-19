import { ArrowRight, Sparkles } from 'lucide-react'
import Card from '@/components/ui/Card'
import LinkButton from '@/components/ui/LinkButton'
import type { PremiumAccessRequiredProps } from '@/types/premiumAccessTypes'

export default function PremiumAccessRequired({ feature }: PremiumAccessRequiredProps) {
  const isDiagnozy = feature === 'diagnozy'

  return (
    <div className="flex min-h-[calc(100dvh-14rem)] w-full items-center justify-center">
      <Card variant="dark" className="w-full max-w-2xl p-6 sm:p-10">
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-medium text-zinc-300">
          <Sparkles aria-hidden size={14} />
          {isDiagnozy ? 'Pielęgniarstwo Premium' : 'Plan Premium'}
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-100 sm:text-3xl">
          {isDiagnozy ? 'Poznaj diagnozy i interwencje' : 'Twórz własne testy'}
        </h1>
        <p className="mt-4 leading-relaxed text-zinc-400">
          {isDiagnozy
            ? 'Ucz się diagnoz pielęgniarskich, ćwicz proces pielęgnowania i sprawdzaj wiedzę na egzaminie próbnym. Ta sekcja wymaga pakietu Premium w kursie Pielęgniarstwo. Premium w innym kursie jej nie odblokowuje.'
            : 'Układaj własne testy, generuj pytania z AI i zarządzaj swoimi zestawami. Aby korzystać z tej sekcji, potrzebujesz pakietu Premium w co najmniej jednym kursie.'}
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <LinkButton href={isDiagnozy ? '/kierunki/pielegniarstwo' : '/kierunki'} variant="dark">
            {isDiagnozy ? 'Zobacz Pielęgniarstwo Premium' : 'Poznaj plany Premium'}
            <ArrowRight aria-hidden size={16} />
          </LinkButton>
          <LinkButton href="/panel" variant="dark">Wróć do panelu</LinkButton>
        </div>
      </Card>
    </div>
  )
}
