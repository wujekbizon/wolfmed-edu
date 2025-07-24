import Link from "next/link";

const paths = [
  {
    slug: "opiekun-medyczny",
    title: "Opiekun Medyczny",
    teaser:
      "Zdobądź kompleksową wiedzę i praktyczne umiejętności potrzebne do pracy jako opiekun medyczny...",
    cta: "Dołącz do naszej społeczności",
  },
  {
    slug: "pielegniarstwo",
    title: "Pielęgniarka / Pielęgniarz",
    teaser:
      "Nowa ścieżka edukacyjna dla przyszłych pielęgniarek i pielęgniarzy...",
    cta: "Zarejestruj się już dzis.",
  },
];

export default function KierunkiPage() {
  return (
    <section className="py-16 px-4 md:px-12">
      <h1 className="text-4xl font-bold mb-6">Kariera Medyczna</h1>
      <p className="text-lg mb-10">
        Twoja ścieżka w świecie medycyny — znajdź program edukacyjny idealnie
        dopasowany do Twoich potrzeb, tempa nauki i planów zawodowych.
      </p>

      <div className="grid md:grid-cols-2 gap-8">
        {paths.map(({ slug, title, teaser, cta }) => (
          <div key={slug} className="bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-2xl font-semibold mb-3">{title}</h2>
            <p className="text-gray-700 mb-4">{teaser}</p>
            <Link
              href={`/kierunki/${slug}`}
              className="text-blue-600 font-medium hover:underline"
            >
              {cta} →
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
