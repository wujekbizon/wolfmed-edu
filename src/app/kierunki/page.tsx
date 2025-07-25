import PathCarousel from "@/components/PathCarousel";
import img1 from "@/images/medical-guardian-wide.jpg";
import img2 from "@/images/nurse-wide.jpg";
import Footer from "../_components/Footer";

const paths = [
  {
    slug: "opiekun-medyczny",
    title: "Opiekun Medyczny",
    teaser: "Zdobądź kompleksową wiedzę i przygotuj się do egzaminu na Opiekuna Medycznego – bezpłatnie!",
    image: img1,
    cta: "Sprawdź szczegóły",
  },
  {
    slug: "pielegniarstwo",
    title: "Pielęgniarstwo",
    teaser: "Nowa kompletna ścieżka edukacyjna dla kierunku pielęgniarstwo - rozpocznij naukę już dziś !",
    image: img2,
    cta: "Zarejestruj się już dziś",
  }
];

export default function KierunkiPage() {
  return (
    <>
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
      <Footer />
    </>
  );
}
