export default function SectionHeading({
  eyebrow,
  title,
  subtitle,
  titleId,
}: {
  eyebrow: string
  title: string
  subtitle?: string
  titleId?: string
}) {
  return (
    <header className="mb-8 sm:mb-12 text-center">
      <span className="inline-block rounded-full bg-slate-100 text-slate-700 px-3 py-1 text-xs font-medium tracking-wide">
        {eyebrow}
      </span>
      <h2
        {...(titleId ? { id: titleId } : {})}
        className="mt-3 text-2xl md:text-3xl lg:text-4xl font-bold text-slate-900"
      >
        {title}
      </h2>
      {subtitle && <p className="mt-3 text-zinc-600 text-base md:text-lg">{subtitle}</p>}
    </header>
  )
}
