export default function ProcedureHubCardSkeleton() {
  return (
    <div role='status' aria-label='Wczytywanie procedur' aria-busy='true' className='grid min-w-0 rounded-3xl border border-white bg-[#fcf8f7] p-2 shadow-sm sm:p-3 xl:grid-cols-[0.9fr_1fr]'>
      <div aria-hidden='true' className='min-h-52 rounded-2xl bg-zinc-200 sm:min-h-72 xl:min-h-[34rem]' />
      <div aria-hidden='true' className='flex flex-col gap-5 px-3 py-6 motion-safe:animate-pulse sm:p-7 xl:px-9'>
        <div className='h-16 rounded bg-zinc-200' />
        <div className='h-28 rounded-2xl bg-zinc-900' />
        <div className='h-4 w-48 rounded bg-zinc-300' />
        {[0, 1, 2, 3].map(item => <div key={item} className='h-6 rounded bg-zinc-200' />)}
        <div className='mt-auto h-11 rounded-md bg-[#ff9898]' />
      </div>
    </div>
  )
}
