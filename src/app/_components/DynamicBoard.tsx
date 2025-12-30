import DashboardInfo from "@/components/DashboardInfo"
import ExamCountdown from "@/components/ExamCountdown"
import ExamCountdownSkeleton from "@/components/skeletons/ExamCountdownSkeleton"
import UserOnboard from "@/components/UserOnboard"

import Link from "next/link"
import { Suspense } from "react"

export default async function DynamicBoard() {
  return (
    <section className="container mx-auto backdrop-blur-sm  p-3 xs:-p-4 sm:p-8 rounded-2xl shadow-lg border border-zinc-200/60 transition-all duration-300 bg-linear-to-br from-zinc-50/80 via-rose-50/30 to-zinc-50/80">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
          <UserOnboard />
        </div>
        <aside className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-zinc-400/20">
            <h3 className="text-xl font-bold text-zinc-800 mb-4">
              Najnowsze Aktualizacje
            </h3>
            <div className="border-l-4 border-zinc-300 pl-4">
                <p className="text-sm text-zinc-500">30 Grudzień 2025</p>
                <h4 className="font-medium text-zinc-800">
                  Dodano nowe pytania egzaminacyjne
                </h4>
                <p className="text-sm text-zinc-600">
                  Nasza baza testów zawiera już 931 pytań.
                </p>
              </div>
            <div className="space-y-4">
              <div className="border-l-4 border-red-500 pl-4">
                <p className="text-sm text-zinc-500">5 Grudzień 2025</p>
                <h4 className="font-medium text-zinc-800">
                 Nowa wersja aplikacji
                </h4>
                <p className="text-sm text-red-400 hover:text-red-500 transition-colors">
                  Wprowadziliśmy nową wersję aplikacji, z nowymi funkcjami i ulepszeniami.
                </p>
              </div>
             
            </div>
          </div>
          <div className="bg-linear-to-br from-red-500 to-red-600 rounded-2xl shadow-xl p-6 text-white border border-zinc-400/20">
            <h3 className="text-xl font-bold mb-3">
              Zapraszamy na forum
            </h3>
            <p className="text-sm opacity-90 mb-4">
              Właśnie uruchomiliśmy forum, gdzie możesz dzielić się swoją wiedzą
              i doświadczeniem z innymi uczestnikami
            </p>
            <Link
              href="/forum"
              className="bg-white text-red-600 px-4 py-2 rounded-full text-sm font-medium hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
