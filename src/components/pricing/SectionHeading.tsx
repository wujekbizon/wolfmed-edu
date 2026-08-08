export default function SectionHeading({
  eyebrow,
  title,
  subtitle,
  titleId,
  tone = 'light'
}: {
  eyebrow: string
  title: string
  subtitle?: string
  titleId?: string
  tone?: 'light' | 'dark'
}) {
  const onDark = tone === 'dark'

  return (
    <header className='mb-8 sm:mb-12 text-center'>
      <span
        className={`inline-block rounded-full px-3 py-1 text-xs font-medium tracking-wide ${
          onDark ? 'bg-white/10 text-zinc-200' : 'bg-slate-100 text-slate-700'
        }`}
      >
        {eyebrow}
      </span>
      <h2
        {...(titleId ? { id: titleId } : {})}
        className={`mt-3 text-2xl md:text-3xl lg:text-4xl font-bold ${
          onDark ? 'text-zinc-100' : 'text-slate-900'
        }`}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className={`mt-3 text-base md:text-lg ${
            onDark ? 'text-white/55' : 'text-zinc-600'
          }`}
        >
          {subtitle}
        </p>
      )}
    </header>
  )
}
