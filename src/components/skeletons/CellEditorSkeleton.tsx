export default function CellEditorSkeleton() {
  return (
    <div role='status' aria-label='Wczytywanie komórki' className='h-[300px] w-full rounded bg-white/60 p-4'>
      <span className='sr-only'>Wczytywanie komórki…</span>
      <div aria-hidden='true' className='flex h-full animate-pulse flex-col gap-4 opacity-30 motion-reduce:animate-none'>
        <div className='h-7 w-1/3 rounded bg-zinc-300' />
        <div className='min-h-0 flex-1 rounded-lg bg-zinc-200/70' />
        <div className='h-3 w-2/3 rounded bg-zinc-300' />
      </div>
    </div>
  )
}
