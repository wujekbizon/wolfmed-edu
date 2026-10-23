import type { PracticalExamCardSkeletonProps } from '@/types/practicalExamCardTypes'

export default function PracticalExamCardSkeleton({ variant = 'exam' }: PracticalExamCardSkeletonProps) {
  return (
    <div className='flex w-full min-w-0 flex-col overflow-hidden rounded-2xl border border-white/[0.06] bg-slate-900 lg:flex-row'>
      <div className='h-64 w-full shrink-0 bg-slate-500 motion-safe:animate-pulse sm:h-72 lg:h-auto lg:w-2/5 xl:w-1/3' />
      <div className='flex min-w-0 w-full flex-col gap-4 p-4 motion-safe:animate-pulse sm:gap-5 sm:p-5 lg:gap-6 lg:p-6 xl:p-8'>
        <div className='flex flex-col gap-3'>
          <div className='flex flex-wrap gap-2'>
            <div className='h-7 w-40 max-w-full rounded-full bg-slate-500 sm:h-8' />
            {variant === 'exam' && <div className='h-7 w-28 rounded-full bg-slate-600 sm:h-8' />}
          </div>
          <div className='h-8 w-3/4 rounded bg-slate-500 sm:h-9 lg:h-10' />
          {variant === 'exam' ? (
            <>
              <div className='h-4 w-36 rounded bg-slate-600' />
              <div className='h-5 w-2/3 rounded bg-slate-500' />
            </>
          ) : (
            <div className='space-y-2 py-1'>
              <div className='h-4 w-full rounded bg-slate-500' />
              <div className='h-4 w-full rounded bg-slate-500' />
              <div className='h-4 w-2/3 rounded bg-slate-500' />
            </div>
          )}
        </div>
        {variant === 'exam' && <div className='flex flex-wrap gap-5'><div className='h-5 w-20 rounded bg-slate-500' /><div className='h-5 w-40 rounded bg-slate-500' /></div>}
        <div className='mt-auto rounded-lg border border-zinc-600 bg-slate-950 p-3 sm:p-4'>
          <div className='h-11 w-full rounded-lg bg-slate-500' />
        </div>
      </div>
    </div>
  )
}
