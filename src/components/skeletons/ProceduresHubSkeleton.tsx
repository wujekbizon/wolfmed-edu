import ExamWolfekWelcomeSkeleton from '@/components/skeletons/ExamWolfekWelcomeSkeleton'
import ProcedureHubCardSkeleton from '@/components/skeletons/ProcedureHubCardSkeleton'

export default function ProceduresHubSkeleton() {
  return (
    <section aria-label='Wczytywanie procedur medycznych' aria-busy='true' className='w-full min-w-0 px-4 pb-10 lg:px-10'>
      <div className='mx-auto w-full max-w-7xl'>
        <div aria-hidden='true' className='mb-4 h-9 w-72 max-w-full rounded bg-zinc-300' />
        <ExamWolfekWelcomeSkeleton />
        <div aria-hidden='true' className='my-6 h-12 rounded-2xl bg-zinc-200 sm:max-w-lg' />
        <ProcedureHubCardSkeleton />
      </div>
    </section>
  )
}
