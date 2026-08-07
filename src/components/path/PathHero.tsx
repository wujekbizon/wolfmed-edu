export default function PathHero({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <div className="relative w-full">
      <div className="flex flex-col items-center text-center">
        <span className="mb-3 sm:mb-4 inline-block rounded-full bg-white/80 backdrop-blur-sm border border-zinc-200/60 shadow-sm px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-zinc-600">
          Kierunek Edukacyjny
        </span>
        <h1 className="mb-2 lg:mb-4 max-w-2xl text-3xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-slate-700 p-2 leading-14">
          {title}
        </h1>
        <p className="max-w-3xl text-zinc-500 text-base sm:text-xl font-normal leading-6 tracking-[-0.14px] text-center">
          {description}
        </p>
      </div>
    </div>
  )
}
