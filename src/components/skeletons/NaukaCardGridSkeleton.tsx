export default function NaukaCardGridSkeleton({
  titleWidth = 'w-40',
  cards = 6,
}: {
  titleWidth?: string
  cards?: number
}) {
  return (
    <section className='bg-white p-4 sm:p-6 rounded-2xl shadow-xl border border-zinc-200/60'>
      <div className='flex flex-wrap justify-between items-center gap-y-3 mb-6'>
        <div className={`h-6 ${titleWidth} rounded bg-zinc-200 animate-pulse`} />
        <div className='flex gap-1.5 sm:gap-2'>
          <div className='h-8 w-32 rounded-full bg-zinc-100 animate-pulse' />
          <div className='h-8 w-32 rounded-full bg-zinc-100 animate-pulse' />
        </div>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
        {Array.from({ length: cards }).map((_, index) => (
          <div
            key={index}
            className='p-4 bg-zinc-50 border border-zinc-200 rounded-2xl shadow-sm h-40 flex flex-col gap-3'
          >
            <div className='h-5 w-3/4 rounded bg-zinc-200 animate-pulse' />
            <div className='flex flex-col gap-2 flex-1'>
              <div className='h-3.5 w-full rounded bg-zinc-100 animate-pulse' />
              <div className='h-3.5 w-5/6 rounded bg-zinc-100 animate-pulse' />
              <div className='h-3.5 w-2/3 rounded bg-zinc-100 animate-pulse' />
            </div>
            <div className='h-3.5 w-24 rounded bg-zinc-100 animate-pulse' />
          </div>
        ))}
      </div>
    </section>
  )
}
