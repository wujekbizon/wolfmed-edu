import Image from 'next/image'
import Link from 'next/link'
import type { NaukaCategoryBrowseItem } from '@/types/categoryType'

export default function LearningCategoryCard({ item, loading = 'lazy' }: { item: NaukaCategoryBrowseItem; loading?: 'eager' | 'lazy' }) {
  return (
    <Link href={`/panel/nauka/${item.value}`} className='group flex items-center justify-center rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-400'>
      <div className='relative flex flex-col w-full overflow-hidden rounded-2xl md:min-h-[450px] xl:h-[450px] bg-linear-to-br from-zinc-800 to-zinc-900 border border-zinc-700 shadow-lg transform transition-all duration-300 cursor-pointer backdrop-blur-sm backdrop-filter'>
        <div className='relative w-full h-28 md:h-72 p-3 md:p-4 flex flex-col justify-end items-start'>
          {item.image ? (
            <Image
              src={item.image}
              loading={loading}
              alt={`${item.category} image`}
              fill
              sizes='(max-width: 1279px) 100vw, (max-width: 1535px) 50vw, 33vw'
              className='h-full w-full object-cover rounded-t-xl opacity-75 group-hover:opacity-100 transition-opacity duration-300'
            />
          ) : (
            <div className='absolute inset-0 flex items-center justify-center bg-linear-to-br from-blue-600 to-purple-600'>
              <span className='text-6xl md:text-9xl font-bold text-white uppercase opacity-75'>
                {item.category.charAt(0)}
              </span>
            </div>
          )}
          <div className='absolute inset-0 bg-linear-to-t from-zinc-900 via-zinc-900/20 md:via-transparent to-transparent z-10' />
          <h3 className='relative z-20 text-lg md:text-2xl font-bold text-white drop-shadow-md leading-tight'>
            {item.category}
          </h3>
          <p className={`relative z-20 text-xs md:text-sm text-zinc-300 mt-1 ${item.isCustom ? '' : 'hidden md:block'}`}>
            {item.isCustom ? 'Twoja kategoria' : 'Kompleksowe testy i pytania'}
          </p>
        </div>
        <div className='relative z-10 flex flex-col justify-between p-3 md:p-4 flex-1'>
          <p className='line-clamp-2 md:line-clamp-none text-zinc-300 text-sm md:text-base xl:text-lg leading-relaxed mb-3 md:mb-4'>
            {item.description}
          </p>
          <div className='flex items-center justify-between mt-auto'>
            <p className='text-zinc-200 text-sm md:text-base xl:text-lg'>
              <span className='font-bold text-red-400 mx-1'>{item.count}</span>
              pytań
            </p>
            <p className='text-red-400 text-sm md:text-base xl:text-lg font-semibold hover:text-red-500'>
              Rozpocznij naukę &rarr;
            </p>
          </div>
        </div>
      </div>
    </Link>
  )
}
