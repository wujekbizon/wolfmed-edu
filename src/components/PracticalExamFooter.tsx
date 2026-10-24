import { ChevronLeft, ChevronRight } from 'lucide-react'
import Button from '@/components/ui/Button'
import type { PracticalExamFooterProps } from '@/types/practicalExamWorkspaceTypes'

export default function PracticalExamFooter({ active, total, pending, onSelect }: PracticalExamFooterProps) {
  return (
    <footer className='shrink-0 border-t border-zinc-200 bg-white px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] lg:px-6'>
      <div className='mx-auto flex max-w-7xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
        <div className='flex gap-2'>
          <Button variant='secondary' disabled={active === 0} onClick={() => onSelect(active - 1)} className='min-h-11 flex-1 text-sm sm:flex-none'><ChevronLeft size={16} />Poprzednia</Button>
          <Button variant='secondary' disabled={active >= total - 1} onClick={() => onSelect(active + 1)} className='min-h-11 flex-1 text-sm sm:flex-none'>Następna<ChevronRight size={16} /></Button>
        </div>
        <Button type='submit' form='exam-form' variant='coral' disabled={pending} className='min-h-11 whitespace-normal px-5 text-sm'>{pending ? 'Sprawdzanie...' : 'Zakończ i sprawdź arkusz'}</Button>
      </div>
    </footer>
  )
}
