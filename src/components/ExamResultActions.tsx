import { ArrowLeft, RotateCcw } from 'lucide-react'
import Button from '@/components/ui/Button'
import LinkButton from '@/components/ui/LinkButton'
import type { ExamResultActionsProps } from '@/types/practicalExamResultTypes'

export default function ExamResultActions({ onRestart }: ExamResultActionsProps) {
  return (
    <div className='flex flex-col gap-3 sm:flex-row'>
      <Button variant='coral' onClick={onRestart} className='min-h-11 whitespace-normal px-5 text-sm'><RotateCcw size={16} />Wypełnij ponownie</Button>
      <LinkButton href='/panel/egzaminy' variant='secondary' className='min-h-11 whitespace-normal px-5 text-sm'><ArrowLeft size={16} />Lista arkuszy</LinkButton>
    </div>
  )
}
