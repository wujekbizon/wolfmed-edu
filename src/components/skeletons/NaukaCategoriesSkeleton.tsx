export default function NaukaCategoriesSkeleton() {
  return (
    <div className='bg-transparent xs:bg-white p-0 xs:p-4 sm:p-6 rounded-2xl shadow-none xs:shadow-xl border border-transparent xs:border-zinc-200/60'>
      <div className='h-7 w-52 rounded-lg bg-zinc-200 animate-pulse mb-5' />

      <div className='flex flex-col sm:flex-row gap-2 mb-4'>
        <div className='h-10 flex-1 rounded-xl bg-zinc-200 animate-pulse' />
        <div className='h-10 w-full sm:w-52 rounded-xl bg-zinc-200 animate-pulse' />
        <div className='h-10 w-full sm:w-52 rounded-xl bg-zinc-200 animate-pulse' />
      </div>

      <div className='h-3 w-20 rounded bg-zinc-200 animate-pulse mb-4' />

      <div className='h-fit grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-6'>
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className='relative flex flex-col w-full overflow-hidden rounded-2xl min-h-[450px] xl:h-[450px] bg-linear-to-br from-zinc-800 to-zinc-900 border border-zinc-700 shadow-lg'
          >
            <div className='relative w-full h-72 p-4 flex flex-col justify-end items-start bg-zinc-700/50 animate-pulse'>
              <div className='h-7 w-2/3 rounded-lg bg-zinc-600' />
              <div className='h-4 w-40 rounded bg-zinc-600 mt-2' />
            </div>

            <div className='flex flex-col justify-between p-4 flex-1'>
              <div className='flex flex-col gap-2 mb-4'>
                <div className='h-4 w-full rounded bg-zinc-700 animate-pulse' />
                <div className='h-4 w-5/6 rounded bg-zinc-700 animate-pulse' />
                <div className='h-4 w-3/5 rounded bg-zinc-700 animate-pulse' />
              </div>
              <div className='flex items-center justify-between mt-auto'>
                <div className='h-5 w-24 rounded bg-zinc-700 animate-pulse' />
                <div className='h-5 w-36 rounded bg-zinc-700 animate-pulse' />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
