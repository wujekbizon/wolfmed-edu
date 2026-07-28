import { GraduationCap, Sparkles } from 'lucide-react'
import LinkButton from './ui/LinkButton'

interface CategoryActionBarProps {
  categoryName: string
}

export default function CategoryActionBar({ categoryName }: CategoryActionBarProps) {
  return (
    <div className='sticky bottom-0 z-20 max-w-6xl mx-auto mt-6 rounded-lg border border-zinc-200 bg-white/80 backdrop-blur-md shadow-lg px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]'>
      <div className='flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between'>
        <p className='hidden sm:block text-sm text-zinc-500 truncate'>
          Gotowy, żeby ruszyć z kategorią{' '}
          <span className='font-semibold text-zinc-700'>{categoryName}</span>?
        </p>
        <div className='flex flex-col sm:flex-row gap-2 sm:shrink-0'>
          <LinkButton
            href='/panel/testy'
            variant='primary'
            className='w-full sm:w-auto min-h-11 text-sm'
          >
            <GraduationCap className='w-4 h-4 shrink-0' />
            Rozpocznij Egzamin
          </LinkButton>
          <LinkButton
            href='/panel/nauka'
            variant='secondary'
            className='w-full sm:w-auto min-h-11 text-sm'
          >
            <Sparkles className='w-4 h-4 shrink-0' />
            Rozpocznij naukę
          </LinkButton>
        </div>
      </div>
    </div>
  )
}
