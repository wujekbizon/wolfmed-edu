import CellEditorSkeleton from './CellEditorSkeleton'

export default function NaukaCellsSkeleton() {
  return (
    <div aria-busy='true' className='space-y-8 py-3'>
      {[0, 1].map((index) => (
        <div key={index} className='rounded border border-zinc-200/50 bg-red-300/15 p-1.5'>
          <div aria-hidden='true' className='flex h-10 items-center justify-between px-2 opacity-25'>
            <div className='h-5 w-14 rounded bg-slate-300' />
            <div className='h-5 w-24 rounded bg-slate-300' />
          </div>
          <CellEditorSkeleton />
        </div>
      ))}
    </div>
  )
}
