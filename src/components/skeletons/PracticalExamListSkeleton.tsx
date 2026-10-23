import PracticalExamCardSkeleton from '@/components/skeletons/PracticalExamCardSkeleton'
import ExamWolfekWelcomeSkeleton from '@/components/skeletons/ExamWolfekWelcomeSkeleton'

export default function PracticalExamListSkeleton() {
  return (
    <section aria-label='Ładowanie arkuszy egzaminacyjnych' aria-busy='true' className='flex h-full w-full flex-col items-center overflow-y-auto scrollbar-webkit px-4 py-4 lg:p-16'>
      <div aria-hidden='true' className='mx-auto flex w-full flex-col gap-6 md:gap-8 2xl:w-3/4'>
        <ExamWolfekWelcomeSkeleton />
        <div className='flex flex-col gap-4 md:gap-8'>
          <div className='flex flex-col gap-2 rounded-2xl border border-zinc-200/60 bg-white p-3 sm:p-4 xl:flex-row'>
            <div className='h-10 min-w-0 flex-1 rounded-xl bg-zinc-300' />
            <div className='h-10 w-full rounded-xl bg-zinc-300 xl:w-52' />
            <div className='h-10 w-full rounded-xl bg-zinc-300 xl:w-52' />
          </div>
          <div className='h-4 w-28 rounded bg-zinc-300' />
          {[0, 1].map((item) => <PracticalExamCardSkeleton key={item} />)}
        </div>
        <div className='flex flex-col gap-4 md:gap-8'>
          <div className='h-4 w-28 rounded bg-zinc-300' />
          <PracticalExamCardSkeleton variant='ai' />
        </div>
      </div>
    </section>
  )
}
