export default function AllTestsSkeleton() {
  return (
    <div className="flex w-full flex-col items-center gap-6 animate-pulse">
      <div className="h-12 w-full rounded-xl bg-zinc-200 md:w-[85%] lg:w-3/4 xl:w-2/3 2xl:w-[60%]" />
      <div className="flex w-full flex-col gap-6 md:w-[85%] lg:w-3/4 xl:w-2/3 2xl:w-[60%]">
        {[0, 1, 2].map((item) => (
          <div key={item} className="h-40 rounded-2xl border border-zinc-200 bg-zinc-100" />
        ))}
      </div>
    </div>
  )
}
