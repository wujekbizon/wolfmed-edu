import { dashboardLinks } from "@/constants/dashboardLinks"
import Link from "next/link"

export default function DashboardInfo() {
  return (
    <section className="container mx-auto">
      <div
        className="bg-zinc-800/90 backdrop-blur-sm w-full gap-6 xs:gap-8 flex flex-col items-center xl:flex-row
      justify-between p-3 xs:p-6 sm:p-6 rounded-2xl shadow-md border border-white/[0.06]
      hover:shadow-lg transition-all duration-300"
      >
        <div className="w-full flex flex-col gap-3 xs:gap-4">
          <h3 className="text-base xs:text-lg sm:text-xl font-semibold text-zinc-100 mb-1 xs:mb-2 text-center xs:text-left">
            Szybki dostęp:
          </h3>
          {dashboardLinks.map(({ icon, link, text }) => (
            <Link
              key={text}
              href={link}
              className="flex items-center justify-between w-full gap-3 xs:gap-4 px-4 xs:px-6 py-2.5 xs:py-3
              bg-zinc-700/80 border border-white/[0.06] shadow-sm text-zinc-100 rounded-xl transition-all hover:shadow-md
              hover:scale-[1.01] hover:bg-zinc-600/80"
            >
              <span className="text-sm xs:text-base font-semibold text-zinc-100">
                {text}
              </span>
              <span className="text-zinc-400">{icon}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
