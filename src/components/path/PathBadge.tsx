export default function PathBadge({ label }: { label: string }) {
  return (
    <span className='inline-flex items-center gap-2 self-start rounded-full bg-white/80 backdrop-blur-sm border border-zinc-200/60 shadow-sm px-3 py-1.5 text-[11px] font-semibold uppercase tracking-widest text-zinc-600'>
      <span className='w-1.5 h-1.5 rounded-full bg-rose-400' />
      {label}
    </span>
  )
}
