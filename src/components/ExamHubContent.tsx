import Image from 'next/image'
import { ArrowRight, LockKeyhole } from 'lucide-react'
import LinkButton from '@/components/ui/LinkButton'
import Button from '@/components/ui/Button'
import ExamHubStats from '@/components/ExamHubStats'
import type { ExamHubContentProps } from '@/types/examHubTypes'

export default function ExamHubContent({ card }: ExamHubContentProps) {
  return (
    <div className='grid min-w-0 overflow-hidden rounded-3xl border border-white bg-[#fcf8f7] p-2 shadow-sm sm:p-3 xl:h-[42rem] xl:grid-cols-[0.9fr_1fr]'>
      <div className='relative min-h-52 overflow-hidden rounded-2xl bg-zinc-900 sm:min-h-72 xl:min-h-[34rem]'>
        <Image src={card.image} alt='' fill loading='eager' sizes='(min-width: 1280px) 45vw, 100vw' className='object-cover' />
        <div className='absolute inset-0 bg-linear-to-t from-zinc-950 via-zinc-950/25 to-transparent' />
        <div className='absolute inset-x-0 bottom-0 p-5 sm:p-8'>
          <p className='mb-2 text-xs font-semibold tracking-widest text-rose-200 uppercase'>{card.subtitle}</p>
          <h2 className='max-w-sm text-3xl font-bold tracking-tight text-white sm:text-4xl'>{card.title}</h2>
        </div>
      </div>
      <div className='flex min-h-0 min-w-0 flex-col gap-5 px-3 py-6 sm:p-7 xl:px-9 xl:pt-7 xl:pb-0'>
        {card.disabled && <p className='flex items-center gap-2 text-sm font-semibold text-[#765086]'><LockKeyhole size={17} />Dostęp w kursie Opiekun Medyczny</p>}
        <p className='shrink-0 text-sm leading-relaxed text-zinc-600 sm:text-base'>{card.description}</p>
        {card.stats.length > 0 && <div className='shrink-0'><ExamHubStats stats={card.stats} /></div>}
        {card.preview && card.preview.items.length > 0 && (
          <div className='flex min-h-0 flex-col xl:flex-1'>
            <h3 className='mb-2 flex items-center gap-2 text-sm font-semibold text-zinc-800'><span className='text-[#9373b1]'>{card.preview.icon}</span>{card.preview.label}</h3>
            <ul tabIndex={0} aria-label={card.preview.label} className='scrollbar-thin max-h-64 min-h-0 overflow-y-auto overscroll-contain divide-y divide-rose-100 pr-3 focus-visible:outline-2 focus-visible:outline-rose-400 xl:max-h-none xl:flex-1'>
              {card.preview.items.map((item) => <li key={item} className='py-2 text-sm text-zinc-600'>{item}</li>)}
            </ul>
          </div>
        )}
        <div className='flex shrink-0 flex-wrap gap-x-4 gap-y-3'>
          {card.meta.map((item) => <span key={item.label} className='inline-flex items-center gap-1.5 text-xs text-zinc-500'><span className='text-[#9373b1]'>{item.icon}</span>{item.label}</span>)}
        </div>
        <div className='mt-auto shrink-0 pt-2'>
          {card.disabled ? (
            <Button disabled variant='secondary' size='lg' className='w-full whitespace-normal'>Egzaminy niedostępne<LockKeyhole size={16} /></Button>
          ) : (
            <LinkButton href={card.href} variant='coral' size='md' shape='soft' className='min-h-11 w-full whitespace-normal text-sm'>{card.cta}<ArrowRight size={17} className='shrink-0' /></LinkButton>
          )}
        </div>
      </div>
    </div>
  )
}
