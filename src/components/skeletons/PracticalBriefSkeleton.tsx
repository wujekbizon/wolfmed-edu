import ExamWolfekWelcomeSkeleton from '@/components/skeletons/ExamWolfekWelcomeSkeleton'

export default function PracticalBriefSkeleton() {
  return (
    <section aria-label='Wczytywanie wprowadzenia do egzaminu' aria-busy='true' className='min-w-0 w-full px-4 pb-6 lg:px-10'>
      <div aria-hidden='true' className='mx-auto flex w-full max-w-7xl flex-col gap-6'>
        <div className='my-3 h-5 w-40 rounded bg-zinc-300' />
        <div className='w-full border-b border-zinc-200/70 pb-4'><div className='h-9 w-3/4 rounded bg-zinc-300' /></div>
        <div className='grid grid-cols-2 gap-3 rounded-2xl bg-zinc-900 p-5 sm:grid-cols-4'>
          {[0, 1, 2, 3].map((item) => <div key={item} className='space-y-3'><div className='h-3 w-20 max-w-full rounded bg-zinc-600' /><div className='h-8 w-16 rounded bg-rose-300/60' /></div>)}
        </div>
        <div className='rounded-2xl border border-zinc-200 bg-white'>
          <ExamWolfekWelcomeSkeleton />
          <div className='grid gap-2 p-5 sm:grid-cols-2'>
            {[0, 1, 2, 3].map((item) => <div key={item} className='h-12 rounded-lg bg-zinc-200 motion-safe:animate-pulse' />)}
          </div>
        </div>
        <div className='flex w-full gap-1 rounded-2xl border border-zinc-200 p-1 sm:max-w-xl'>
          {[0, 1, 2].map((item) => <div key={item} className={`h-11 flex-1 rounded-xl ${item === 0 ? 'bg-rose-200' : 'bg-zinc-200'}`} />)}
        </div>
        <div className='space-y-4 rounded-2xl border border-zinc-200 bg-white p-5 sm:p-7'>
          <div className='h-6 w-52 max-w-full rounded bg-zinc-300' />
          {[0, 1, 2].map((item) => <div key={item} className='h-4 w-full rounded bg-zinc-200' />)}
        </div>
        <div className='h-13 w-full rounded-lg bg-[#ff9898] lg:ml-auto lg:w-80' />
      </div>
    </section>
  )
}
