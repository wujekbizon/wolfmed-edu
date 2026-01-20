import { Presentation, Users, BookOpen } from 'lucide-react'
import ProgramTopicItem from './ProgramTopicItem'

interface ProgramContentSectionProps {
  lectures: string[]
  seminars: string[]
  selfStudy: string[]
  categoryId: string
}

export default function ProgramContentSection({
  lectures,
  seminars,
  selfStudy,
  categoryId,
}: ProgramContentSectionProps) {
  return (
    <div className='bg-white rounded-lg shadow-md p-6 md:p-8 mb-6'>
      <h2 className='text-2xl font-bold mb-6'>Program kursu</h2>

      {lectures.length > 0 && (
        <div className='mb-6'>
          <div className='flex items-center gap-2 mb-3'>
            <Presentation className='w-5 h-5 text-zinc-600' />
            <h3 className='text-lg font-semibold text-gray-800'>Podstawy teoretyczne</h3>
          </div>
          <ul className='space-y-2'>
            {lectures.map((item, idx) => (
              <ProgramTopicItem key={idx} item={item} categoryId={categoryId} />
            ))}
          </ul>
        </div>
      )}

      {seminars.length > 0 && (
        <div className='mb-6'>
          <div className='flex items-center gap-2 mb-3'>
            <Users className='w-5 h-5 text-slate-600' />
            <h3 className='text-lg font-semibold text-gray-800'>Praktyczne zastosowanie</h3>
          </div>
          <ul className='space-y-2'>
            {seminars.map((item, idx) => (
              <ProgramTopicItem key={idx} item={item} categoryId={categoryId} />
            ))}
          </ul>
        </div>
      )}

      {selfStudy.length > 0 && (
        <div>
          <div className='flex items-center gap-2 mb-3'>
            <BookOpen className='w-5 h-5 text-zinc-600' />
            <h3 className='text-lg font-semibold text-gray-800'>Wiedza rozszerzona</h3>
          </div>
          <ul className='space-y-2'>
            {selfStudy.map((item, idx) => (
              <ProgramTopicItem key={idx} item={item} categoryId={categoryId} />
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
