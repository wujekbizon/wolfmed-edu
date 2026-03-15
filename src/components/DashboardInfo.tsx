import { dashboardLinks } from "@/constants/dashboardLinks"
import Link from "next/link"

export default function DashboardInfo() {
  return (
    <div className="rounded-2xl p-5 border border-white/60 bg-white/60 backdrop-blur-lg">
      <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-3">
        Szybki dostęp
      </h3>
      <div className="flex flex-col gap-2">
        {dashboardLinks.map(({ icon, link, text }) => (
          <Link
            key={text}
            href={link}
            className="flex items-center justify-between gap-3 px-4 py-2.5
              bg-white/50 border border-white/60 rounded-xl
              transition-all hover:bg-white/80 hover:shadow-sm"
          >
            <span className="text-sm font-semibold text-zinc-800">{text}</span>
            <span className="text-zinc-500">{icon}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
