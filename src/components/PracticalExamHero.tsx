import Image from 'next/image'
import type { PracticalExamHeroProps } from '@/types/practicalExamCardTypes'

export default function PracticalExamHero({ image, title, eager = false }: PracticalExamHeroProps) {
  return (
    <div className='relative h-64 w-full shrink-0 sm:h-72 lg:h-auto lg:w-2/5 xl:w-1/3'>
      <Image src={image} alt={title} fill loading={eager ? 'eager' : 'lazy'} sizes='(max-width: 1024px) 100vw, 40vw' className='object-cover' />
    </div>
  )
}
