export default function PracticalExamRunnerSkeleton() {
  return (
    <section aria-busy='true' aria-label='Wczytywanie egzaminu' className='-my-10 flex h-[calc(100dvh-5rem)] w-full flex-col overflow-hidden bg-zinc-50'>
      <div aria-hidden='true' className='flex min-h-0 flex-1 flex-col'>
        <div className='flex shrink-0 items-center justify-between gap-3 border-b border-zinc-200 bg-white px-4 py-4'>
          <div className='h-5 w-20 rounded bg-zinc-300' />
          <div className='hidden h-5 w-64 rounded bg-zinc-300 sm:block' />
          <div className='h-10 w-20 rounded-lg bg-zinc-300' />
        </div>
        <div className='space-y-3 border-b border-zinc-200 bg-white p-4'>
          <div className='flex gap-2'>
            {[0, 1, 2, 3, 4].map((item) => <div key={item} className={`h-11 flex-1 rounded-xl ${item === 0 ? 'bg-rose-200' : 'hidden bg-zinc-200 md:block'}`} />)}
          </div>
          <div className='h-3 w-28 rounded bg-zinc-300' />
        </div>
        <div className='flex min-h-0 flex-1 overflow-hidden'>
          <div className='min-w-0 flex-1 overflow-y-auto px-3 py-4 sm:p-6'>
            <div className='mx-auto max-w-5xl overflow-hidden rounded-2xl border border-zinc-200 bg-white'>
              <div className='space-y-3 border-b border-zinc-100 bg-zinc-50 p-5 sm:p-6'>
                <div className='h-3 w-40 rounded bg-zinc-300' />
                <div className='h-7 w-3/4 rounded bg-zinc-300' />
              </div>
              <div className='space-y-3 p-4 motion-safe:animate-pulse sm:p-6'>
                {[0, 1, 2, 3, 4, 5].map((item) => <div key={item} className='flex min-h-16 items-center gap-4 rounded-xl border border-zinc-200 p-3'><div className='size-6 shrink-0 rounded-full bg-zinc-300' /><div className='h-4 flex-1 rounded bg-zinc-200' /><div className='size-6 rounded bg-zinc-200' /></div>)}
              </div>
            </div>
          </div>
          <aside className='hidden w-80 shrink-0 space-y-5 border-l border-zinc-200 bg-white p-5 xl:block 2xl:w-96'>
            <div className='h-11 rounded-xl bg-rose-100' />
            <div className='h-5 w-40 rounded bg-zinc-300' />
            {[0, 1, 2, 3, 4].map((item) => <div key={item} className='h-4 w-full rounded bg-zinc-200' />)}
          </aside>
        </div>
        <div className='flex shrink-0 flex-col gap-3 border-t border-zinc-200 bg-white p-4 sm:flex-row sm:justify-between'>
          <div className='flex gap-2'><div className='h-11 w-28 rounded-lg bg-zinc-200' /><div className='h-11 w-28 rounded-lg bg-zinc-200' /></div>
          <div className='h-11 rounded-lg bg-[#ff9898] sm:w-64' />
        </div>
      </div>
    </section>
  )
}
