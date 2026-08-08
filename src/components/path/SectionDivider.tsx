export default function SectionDivider() {
  return (
    <div className="w-full px-4 py-8 sm:px-6 md:px-8 lg:px-12 lg:py-12">
      <div className="mx-auto flex max-w-[1600px] items-center gap-4">
        <span className="h-px flex-1 bg-zinc-900/10" />
        <span className="h-1.5 w-1.5 rounded-full bg-rose-400/70" />
        <span className="h-px flex-1 bg-zinc-900/10" />
      </div>
    </div>
  )
}
