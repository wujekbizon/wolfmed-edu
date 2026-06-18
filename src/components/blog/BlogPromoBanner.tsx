import Link from 'next/link'
import { ArrowRight, HeartPulse, Cross, Sparkles } from 'lucide-react'

const COURSES = [
  {
    title: 'Opiekun Medyczny',
    description: 'Zdobądź uprawnienia i wejdź na rynek pracy w opiece zdrowotnej.',
    href: '/kierunki/opiekun-medyczny',
    icon: HeartPulse,
  },
  {
    title: 'Pielęgniarstwo',
    description: 'Przygotuj się do jednego z najbardziej szanowanych zawodów medycznych.',
    href: '/kierunki/pielegniarstwo',
    icon: Cross,
  },
]

export default function BlogPromoBanner() {
  return (
    <section
      aria-label="Poznaj platformę WolfMed"
      className="relative w-full overflow-hidden rounded-2xl border border-[#3A3A5A]/60
        bg-linear-to-br from-[#2A2A3F] via-[#1F1F2D] to-[#15151f] shadow-xl shadow-black/30"
    >
      <div className="absolute -left-16 -top-20 h-64 w-64 rounded-full bg-[#BB86FC]/15 blur-3xl" aria-hidden="true" />
      <div className="absolute -right-16 -bottom-24 h-72 w-72 rounded-full bg-[#8686D7]/15 blur-3xl" aria-hidden="true" />

      <div className="relative flex flex-col gap-8 p-6 sm:p-8 lg:flex-row lg:items-center lg:gap-10 lg:p-10">
        <div className="flex-1">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#BB86FC]/20 bg-[#3A3A5E]/30 px-3.5 py-1.5 backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5 text-[#BB86FC]/80" />
            <span className="text-xs font-medium tracking-wide text-[#BB86FC]/80">Platforma edukacyjna</span>
          </div>

          <h2 className="mt-5 text-2xl font-bold leading-tight sm:text-3xl md:text-4xl">
            <span className="bg-linear-to-r from-[#E6E6F5] via-[#BB86FC]/70 to-[#E6E6F5] bg-clip-text text-transparent">
              Twoja droga do zawodu medycznego zaczyna się tutaj
            </span>
          </h2>

          <p className="mt-4 max-w-xl text-sm leading-relaxed text-[#A5A5C3]/80 sm:text-base">
            Profesjonalne kursy online dla przyszłych pracowników służby zdrowia. Dołącz do tysięcy studentów,
            którzy już rozwijają swoją karierę z WolfMed.
          </p>

          <Link
            href="/sign-up"
            className="group mt-7 inline-flex items-center gap-2 rounded-xl bg-linear-to-r from-[#BB86FC] to-[#8686D7]
              px-6 py-3 text-sm font-semibold text-[#15151f] shadow-lg shadow-[#BB86FC]/20
              transition-all hover:shadow-[#BB86FC]/30 hover:brightness-110"
          >
            Zapisz się już dziś
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        <div className="grid w-full gap-3 sm:grid-cols-2 lg:w-[26rem] lg:shrink-0">
          {COURSES.map(({ title, description, href, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="group flex flex-col gap-3 rounded-xl border border-[#3A3A5A]/60 bg-[#16161f]/60 p-5
                transition-all hover:border-[#BB86FC]/40 hover:bg-[#1F1F2D]"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#BB86FC]/20 bg-[#3A3A5E]/30 text-[#BB86FC]">
                <Icon className="h-5 w-5" strokeWidth={1.75} />
              </span>
              <span className="text-sm font-semibold text-[#E6E6F5]">{title}</span>
              <span className="text-xs leading-relaxed text-[#A5A5C3]/70">{description}</span>
              <span className="mt-auto inline-flex items-center gap-1 text-xs font-medium text-[#BB86FC]/80">
                Sprawdź kurs
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
