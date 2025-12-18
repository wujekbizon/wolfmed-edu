import PathCarousel from "@/components/PathCarousel";

const paths = [
  {
    slug: "opiekun-medyczny",
    title: "Opiekun Medyczny",
    teaser: "Zdobądź kompleksową wiedzę i przygotuj się do egzaminu na Opiekuna Medycznego – bezpłatnie!",
    image: 'https://utfs.io/a/zw3dk8dyy9/UVAwLrIxs2k5RgLCs7moJ4bO3G5lMSTzfQXhE0VIeNdPaZLn',
    cta: "Sprawdź szczegóły",
  },
  {
    slug: "pielegniarstwo",
    title: "Pielęgniarstwo",
    teaser: "Nowa kompletna ścieżka edukacyjna dla kierunku pielęgniarstwo - rozpocznij naukę już dziś !",
    image: 'https://utfs.io/a/zw3dk8dyy9/UVAwLrIxs2k5ZbFLvNrONPcnEXeA3kx1jV6t9rCB2UlzoaSM',
    cta: "Zarejestruj się już dziś",
  }
];

export const dynamic = 'force-static'

export default function KierunkiPage() {
  return (
      <section className="relative pt-20 pb-16 lg:pt-32 lg:pb-24 bg-gradient-to-b from-slate-900 to-zinc-900">
        <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-[1px]" />
        <div className="relative w-full flex flex-col items-center justify-center px-4">
          <div className="max-w-3xl text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
             Kierunki Edukacyjne
            </h1>
            <p className="text-lg md:text-xl text-zinc-400 mb-16 leading-relaxed">
              Twoja ścieżka w świecie medycyny — znajdź program edukacyjny
              <span className="block mt-2">idealnie dopasowany do Twoich potrzeb.</span>
            </p>
          </div>
        </div>
        <PathCarousel paths={paths} />
      </section>
  );
}
