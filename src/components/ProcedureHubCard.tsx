import 'server-only'

import { ArrowRight, BookOpen, CheckCircle2, Clock } from 'lucide-react'
import { getProceduresCount } from '@/server/queries'
import HubPanel from '@/components/ui/HubPanel'
import HubStats from '@/components/ui/HubStats'
import LinkButton from '@/components/ui/LinkButton'
import type { ProcedureHubCardProps } from '@/types/procedureHubTypes'

export default async function ProcedureHubCard({ card }: ProcedureHubCardProps) {
  const count = await getProceduresCount(card.slug)

  return (
    <HubPanel image={card.image} subtitle={card.subtitle} title={card.title}>
      <div className='flex min-w-0 flex-col gap-5 px-3 py-6 sm:p-7 xl:px-9'>
        <p className='text-sm leading-relaxed text-zinc-600 sm:text-base'>{card.description}</p>
        <HubStats stats={[
          { icon: <BookOpen size={16} />, label: 'procedur', value: count.toLocaleString('pl-PL') },
          { icon: <Clock size={16} />, label: 'szacowany czas nauki', value: card.learningTime },
        ]} />
        <div>
          <h3 className='mb-2 text-sm font-semibold text-zinc-800'>Co znajdziesz w kursie</h3>
          <ul className='divide-y divide-rose-100'>
            {card.features.map(feature => (
              <li key={feature} className='flex items-center gap-3 py-3 text-sm text-zinc-600'>
                <CheckCircle2 size={16} aria-hidden='true' className='shrink-0 text-[#9373b1]' />
                {feature}
              </li>
            ))}
          </ul>
        </div>
        <div className='mt-auto pt-2'>
          <LinkButton href={card.href} variant='coral' size='md' shape='soft' className='min-h-11 w-full whitespace-normal text-sm'>
            Przejdź do procedur<ArrowRight size={17} aria-hidden='true' className='shrink-0' />
          </LinkButton>
        </div>
      </div>
    </HubPanel>
  )
}
