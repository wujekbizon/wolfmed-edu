import { CardProps } from '@/constants/educationalPathCards'
import Image from 'next/image'

const SimplePathCard = ({
  title,
  description,
  imgSrc,
}: CardProps) => {
  return (
    <div className='group h-full flex flex-col bg-gradient-to-br from-white/25 via-white/35 to-white/25 backdrop-blur-xl border border-white/50 rounded-2xl shadow-lg hover:shadow-2xl hover:border-white/70 hover:from-white/30 hover:via-white/40 hover:to-white/30 transition-all duration-300 overflow-hidden'>
      {imgSrc && (
        <div className='relative w-full aspect-[16/9] overflow-hidden flex-shrink-0'>
          <Image
            src={imgSrc}
            alt={title}
            fill
            sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
            className='object-cover transition-transform duration-500 group-hover:scale-105'
          />
          <div className='absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent' />
        </div>
      )}

      <div className='flex flex-col flex-1 p-5 md:p-6'>
        <h3 className='text-lg md:text-xl font-bold text-slate-900 mb-3 leading-snug'>
          {title}
        </h3>
        <p className='text-sm md:text-base text-zinc-800 leading-relaxed mb-4 flex-1'>
          {description}
        </p>
      </div>
    </div>
  )
}

export default SimplePathCard
