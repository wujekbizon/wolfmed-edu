'use client'

import { useInView } from 'react-intersection-observer'

export default function SectionScrollCue() {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.5 })

  return (
    <div
      aria-hidden='true'
      className='w-full px-4 py-8 sm:px-6 md:px-8 lg:px-12 lg:py-12'
    >
      <div className='mx-auto flex max-w-[1600px] justify-center'>
        <span ref={ref} className='relative block h-16 w-px bg-zinc-900/10'>
          <span
            className={`absolute inset-0 origin-top bg-rose-400/70 transition-transform duration-700 ease-out motion-reduce:scale-y-100 motion-reduce:transition-none ${
              inView ? 'scale-y-100' : 'scale-y-0'
            }`}
          />
        </span>
      </div>
    </div>
  )
}
