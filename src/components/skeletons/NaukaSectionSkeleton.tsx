export default function NaukaSectionSkeleton({ rows = 2 }: { rows?: number }) {
  return (
    <div className='bg-white p-4 sm:p-6 rounded-2xl shadow-xl border border-zinc-200/60 animate-pulse'>
      <div className='h-6 w-40 rounded bg-zinc-200 mb-6' />
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
        {Array.from({ length: rows * 3 }).map((_, index) => (
          <div key={index} className='h-28 rounded-2xl bg-zinc-100' />
        ))}
      </div>
    </div>
  )
}
