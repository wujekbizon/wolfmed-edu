import Image from 'next/image'
import type { HubPanelProps } from '@/types/hubPresentationTypes'

export default function HubPanel({ image, subtitle, title, children, fixedHeight = false }: HubPanelProps) {
  return (
    <div className={`grid min-w-0 overflow-hidden rounded-3xl border border-white bg-[#fcf8f7] p-2 shadow-sm sm:p-3 xl:grid-cols-[0.9fr_1fr] ${fixedHeight ? 'xl:h-[42rem]' : ''}`}>
      <div className='relative min-h-52 overflow-hidden rounded-2xl bg-zinc-900 sm:min-h-72 xl:min-h-[34rem]'>
        <Image src={image} alt='' fill loading='eager' sizes='(min-width: 1280px) 45vw, 100vw' className='object-cover' />
        <div className='absolute inset-0 bg-linear-to-t from-zinc-950 via-zinc-950/25 to-transparent' />
        <div className='absolute inset-x-0 bottom-0 p-5 sm:p-8'>
          <p className='mb-2 text-xs font-semibold tracking-widest text-rose-200 uppercase'>{subtitle}</p>
          <h2 className='max-w-sm text-3xl font-bold tracking-tight text-white sm:text-4xl'>{title}</h2>
        </div>
      </div>
      {children}
    </div>
  )
}
