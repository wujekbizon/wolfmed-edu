import DashboardInfo from "@/components/DashboardInfo"
import ExamCountdown from "@/components/ExamCountdown"
import ExamCountdownSkeleton from "@/components/skeletons/ExamCountdownSkeleton"
import UserOnboard from "@/components/UserOnboard"

import Link from "next/link"
import { Suspense } from "react"

export default async function DynamicBoard() {
  return (
    <section className="container mx-auto p-3 xs:p-4 sm:p-8 rounded-2xl shadow-xl border border-white/[0.06] transition-all duration-300 bg-zinc-900">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
          <UserOnboard />
        </div>
        <aside className="lg:col-span-4 space-y-6">
          <div className="bg-zinc-800 rounded-2xl shadow-xl p-6 border border-white/[0.06]">
            <h3 className="text-xl font-bold text-zinc-100 mb-4">
              Najnowsze Aktualizacje
            </h3>
            <div className="border-l-4 border-zinc-600 pl-4">
              <p className="text-sm text-zinc-500">30 Grudzień 2025</p>
              <h4 className="font-medium text-zinc-200">
                Dodano nowe pytania egzaminacyjne
              </h4>
              <p className="text-sm text-zinc-400">
                Nasza baza testów zawiera już 931 pytań.
              </p>
            </div>
            <div className="space-y-4 mt-4">
              <div className="border-l-4 border-rose-500 pl-4">
                <p className="text-sm text-zinc-500">5 Grudzień 2025</p>
                <h4 className="font-medium text-zinc-200">
                  Nowa wersja aplikacji
                </h4>
                <p className="text-sm text-rose-400 hover:text-rose-300 transition-colors">
                  Wprowadziliśmy nową wersję aplikacji, z nowymi funkcjami i ulepszeniami.
                </p>
              </div>
            </div>
          </div>
          <div className="bg-zinc-800 rounded-2xl shadow-xl p-6 border border-rose-500/20">
            <h3 className="text-xl font-bold text-zinc-100 mb-3">
              Zapraszamy na forum
            </h3>
            <p className="text-sm text-zinc-300 mb-4">
              Właśnie uruchomiliśmy forum, gdzie możesz dzielić się swoją wiedzą
              i doświadczeniem z innymi uczestnikami
            </p>
            <Link
              href="/forum"
              className="inline-block bg-rose-500 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-rose-600 transition-colors"
            >
              Forum dyskusyjne
            </Link>
          </div>
          <DashboardInfo />
          <Suspense fallback={<ExamCountdownSkeleton />}>
            <ExamCountdown />
          </Suspense>
        </aside>
      </div>
    </section>
  )
}
