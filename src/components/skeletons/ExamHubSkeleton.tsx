import ExamWolfekWelcomeSkeleton from '@/components/skeletons/ExamWolfekWelcomeSkeleton'

export default function ExamHubSkeleton() {
  return (
    <section aria-label='Wczytywanie testów i egzaminów' aria-busy='true' className='min-w-0 w-full bg-linear-to-br from-zinc-50/80 via-rose-50/30 to-zinc-50/80 px-4 pb-10 lg:px-10'>
      <div aria-hidden='true' className='mx-auto w-full max-w-7xl'>
        <div className='mb-4 h-9 w-56 max-w-full rounded bg-zinc-300' />
        <ExamWolfekWelcomeSkeleton />
        <div className='my-5 flex h-12 w-full gap-1 rounded-2xl border border-zinc-200 p-1 sm:my-6 sm:max-w-lg'>
          <div className='flex-1 rounded-xl bg-rose-200' />
          <div className='flex-1 rounded-xl bg-zinc-200' />
        </div>
        <div className='grid min-w-0 overflow-hidden rounded-3xl border border-white bg-[#fcf8f7] p-2 shadow-sm sm:p-3 xl:h-[42rem] xl:grid-cols-[0.9fr_1fr]'>
          <div className='relative min-h-52 rounded-2xl bg-zinc-700 sm:min-h-72 xl:min-h-[34rem]'>
            <div className='absolute inset-x-5 bottom-6 space-y-3 sm:inset-x-8'>
              <div className='h-4 w-28 rounded bg-zinc-500' />
              <div className='h-10 w-3/4 rounded bg-zinc-400' />
            </div>
          </div>
          <div className='flex min-w-0 flex-col gap-5 px-3 py-6 sm:p-7 xl:px-9 xl:pt-7 xl:pb-0'>
            <div className='space-y-2 motion-safe:animate-pulse'>
              <div className='h-4 w-full rounded bg-zinc-300' />
              <div className='h-4 w-full rounded bg-zinc-300' />
              <div className='h-4 w-3/4 rounded bg-zinc-300' />
            </div>
            <div className='grid grid-cols-2 gap-4 rounded-2xl bg-zinc-900 p-5'>
              {[0, 1].map((item) => <div key={item} className='space-y-3'><div className='h-3 w-16 rounded bg-zinc-600' /><div className='h-8 w-20 rounded bg-rose-300/60' /></div>)}
            </div>
            <div className='space-y-3 xl:flex-1'>
              <div className='h-4 w-40 rounded bg-zinc-300' />
              {[0, 1, 2, 3, 4].map((item) => <div key={item} className='border-b border-rose-100 py-2'><div className='h-4 w-2/3 rounded bg-zinc-200' /></div>)}
            </div>
            <div className='h-4 w-3/4 rounded bg-zinc-300' />
            <div className='mt-auto h-11 shrink-0 rounded-md bg-[#ff9898]' />
          </div>
        </div>
      </div>
    </section>
  )
}
