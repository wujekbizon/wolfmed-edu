export default function BlogHero() {
  return (
    <div className="relative w-full bg-gradient-to-b from-[#3a3a54] via-[#2A2A3F] to-[#1F1F2D] border-b border-[#3A3A5A]/50 rounded-2xl mb-8">
      <div className="absolute inset-0 bg-gradient-to-br from-[#BB86FC]/5 via-transparent to-[#8686D7]/5 animate-gradient" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 md:py-24 text-center">
        <div className="inline-flex items-center px-4 py-1.5 mb-6 rounded-full bg-[#3A3A5E]/30 border border-[#BB86FC]/20 backdrop-blur-sm">
          <span className="text-sm font-medium text-[#BB86FC]/80">Artykuły medyczne</span>
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 leading-tight">
          <span className="bg-gradient-to-r from-[#E6E6F5] via-[#BB86FC]/60 to-[#E6E6F5] bg-clip-text text-transparent">
            Blog Medyczny
          </span>
        </h1>

        <p className="text-base sm:text-lg text-[#A5A5C3]/80 max-w-2xl mx-auto leading-relaxed">
          Profesjonalne artykuły o opiece medycznej i przygotowaniu do egzaminu
        </p>
      </div>
    </div>
  )
}
