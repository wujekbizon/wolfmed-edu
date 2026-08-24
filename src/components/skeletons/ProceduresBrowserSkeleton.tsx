export default function ProceduresBrowserSkeleton() {
  return (
    <section className='px-1 sm:px-4 py-4 w-full h-full'>
      <div className='w-full px-4 pb-4 md:px-6 md:pb-6'>
        <div className='flex flex-col sm:flex-row gap-2 py-3'>
          <div className='h-10 flex-1 rounded-xl bg-zinc-200 animate-pulse' />
          <div className='h-10 w-full sm:w-52 rounded-xl bg-zinc-200 animate-pulse' />
        </div>
        <div className='h-3 w-20 rounded bg-zinc-200 animate-pulse mb-4' />
        <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6'>
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className='border border-zinc-200 bg-white p-4 rounded-2xl'>
              <div className='h-[300px] rounded-xl bg-zinc-100 animate-pulse' />
              <div className='h-5 w-3/4 rounded bg-zinc-100 animate-pulse mt-4' />
              <div className='h-4 w-full rounded bg-zinc-100 animate-pulse mt-3' />
              <div className='h-4 w-2/3 rounded bg-zinc-100 animate-pulse mt-2' />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
