export default function NoteFlashcardsSkeleton() {
  return (
    <div className='bg-white rounded-xl shadow-sm border border-zinc-200 p-4 animate-pulse'>
      <div className='flex items-center gap-2 mb-3'>
        <div className='w-4 h-4 rounded bg-zinc-200' />
        <div className='h-4 w-16 rounded bg-zinc-200' />
        <div className='ml-auto h-4 w-6 rounded bg-zinc-200' />
      </div>
      <div className='h-8 w-full rounded bg-zinc-100' />
    </div>
  )
}
