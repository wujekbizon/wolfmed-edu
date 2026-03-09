import ResizableComponent from '../Resizable'
import MediaCellPlayer from './MediaCellPlayer'
import type { Cell } from '@/types/cellTypes'

export default function MediaCell({ cell }: { cell: Cell }) {
  return (
    <ResizableComponent direction='vertical'>
      <div className='relative rounded-2xl overflow-hidden h-full shadow-[0_8px_32px_rgba(255,197,197,0.4)]'>
        <div className='absolute inset-0 bg-white/55 backdrop-blur-2xl' />
        <div className='absolute inset-0 bg-[#ffc5c5]/20' />
        <div className='absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent' />
        <div className='absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-transparent pointer-events-none' />
        <div className='absolute inset-0 rounded-2xl ring-1 ring-white/70 pointer-events-none' />
        <div className='relative h-full'>
          <MediaCellPlayer cell={cell} />
        </div>
      </div>
    </ResizableComponent>
  )
}
