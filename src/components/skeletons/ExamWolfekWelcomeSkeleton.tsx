export default function ExamWolfekWelcomeSkeleton() {
  return (
    <div className='flex flex-col gap-3 rounded-2xl border border-zinc-200/70 bg-linear-to-br from-white to-rose-50/70 p-5 pr-12 sm:flex-row sm:items-center sm:gap-6 sm:p-6 sm:pr-14'>
      <div className='h-32 w-32 shrink-0 rounded-full bg-zinc-300 motion-safe:animate-pulse' />
      <div className='w-full max-w-3xl space-y-3'>
        <div className='h-6 w-64 max-w-full rounded bg-zinc-300' />
        <div className='h-4 w-full rounded bg-zinc-200' />
        <div className='h-4 w-4/5 rounded bg-zinc-200' />
      </div>
    </div>
  )
}
