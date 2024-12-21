'use client'

export default function ChristmasWishes() {
  return (
    <div className="relative min-h-[300px] xs:min-h-[220px] w-full overflow-hidden rounded-2xl">
      <div className="absolute inset-0 bg-gradient-to-r from-green-600/20 via-red-500/30 to-green-600/20 animate-gradientPosition blur-2xl rounded-2xl" />
      <div className="relative w-full h-full bg-white/40 backdrop-blur-sm p-3 xs:p-6 sm:p-8 rounded-2xl border border-zinc-200/60 shadow-md hover:shadow-lg transition-all duration-300">
        <div className="flex flex-col items-center justify-center h-full gap-3 xs:gap-6 text-center py-2 xs:py-4">
          <div className="flex items-center gap-4 xs:gap-6 animate-scaleIn">
            <span className="text-xl xs:text-3xl animate-pulse">❄️</span>
            <span className="text-2xl xs:text-4xl hover:scale-110 transition-transform duration-300">🎄</span>
            <span className="text-xl xs:text-3xl animate-pulse">❄️</span>
          </div>
          <div className="space-y-2 xs:space-y-4">
            <h2 className="text-xl xs:text-3xl font-bold bg-gradient-to-r from-green-800 via-red-700 to-green-800 bg-clip-text text-transparent animate-fadeInUp">
              Wesołych Świąt!
            </h2>
            <p className="text-base xs:text-lg text-green-800/90 leading-relaxed max-w-lg mx-auto animate-fadeInUp [--slidein-delay:200ms]">
              Życzymy Wam spokojnych i radosnych Świąt Bożego Narodzenia oraz pomyślności w nadchodzącym Nowym Roku!
            </p>
          </div>
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-green-600/10 via-red-500/20 to-green-600/10 animate-gradientRotate -z-10 rounded-2xl" />
        </div>
      </div>
    </div>
  )
}
