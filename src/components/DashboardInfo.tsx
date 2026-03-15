import { dashboardLinks } from "@/constants/dashboardLinks"
import Link from "next/link"

export default function DashboardInfo() {
  return (
    <div className="rounded-2xl p-5 border border-white/[0.06] bg-zinc-800/90">
      <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-widest mb-3">
        Szybki dostęp
      </h3>
      <div className="flex flex-col gap-2">
        {dashboardLinks.map(({ icon, link, text }) => (
          <Link
            key={text}
            href={link}
            className="flex items-center justify-between gap-3 px-4 py-2.5
              bg-zinc-700/80 border border-white/[0.06] rounded-xl
              transition-all hover:bg-zinc-600/80 hover:border-white/[0.10]"
          >
            <span className="text-sm font-semibold text-zinc-100">{text}</span>
            <span className="text-zinc-400">{icon}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
