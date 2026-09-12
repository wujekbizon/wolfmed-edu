import { ArrowLeft } from 'lucide-react'
import LinkButton from '@/components/ui/LinkButton'
import DnaArtwork from './DnaArtwork'

export default function NotFoundScreen() {
  return (
    <section className="flex min-h-[calc(100dvh-80px)] items-center bg-[radial-gradient(ellipse_at_5%_40%,#eed5d6,transparent_55%)] px-4 py-6 sm:px-8 sm:py-10 lg:px-12" aria-labelledby="not-found-title">
      <div className="mx-auto w-full max-w-[1480px]">
        <div className="grid overflow-hidden rounded-[32px] border border-white/80 bg-white/55 p-2 shadow-[0_24px_80px_-24px_#79343f33] md:min-h-[620px] md:grid-cols-[1.08fr_0.92fr] md:p-3 xl:min-h-[680px]">
          <DnaArtwork />
          <div className="flex flex-col justify-center px-6 py-9 sm:px-10 md:px-14 md:py-16 lg:px-18 xl:px-22">
            <p className="text-[10px] font-semibold tracking-[0.2em] text-[#9b5260]">NIE ZNALEZIONO STRONY</p>
            <p className="mt-4 text-[100px] font-semibold leading-none tracking-[-0.08em] text-[#b83243] sm:text-[128px] xl:text-[156px]" aria-hidden>404</p>
            <h1 id="not-found-title" className="mt-5 max-w-md text-3xl font-semibold leading-tight tracking-[-0.045em] text-zinc-800 sm:text-4xl xl:text-5xl">
              Brakuje jednego ogniwa.
            </h1>
            <p className="mt-5 max-w-md text-sm leading-7 text-zinc-500 xl:text-base xl:leading-8">
              Ta strona nie istnieje lub zmieniła adres. Wróćmy do miejsca, w którym wszystko się łączy.
            </p>
            <div className="mt-9">
              <LinkButton
                href="/"
                variant="secondary"
                size="lg"
                shape="pill"
                className="min-w-56 !border-[#e8c3c6] !bg-[#f7e3e4] !text-[#b83243] text-sm shadow-[0_8px_18px_-12px_#b83243] hover:!bg-[#f1d7d9] hover:!text-[#9f2939] hover:-translate-y-0.5 hover:shadow-[0_10px_22px_-14px_#b83243]"
              >
                <ArrowLeft size={16} aria-hidden />
                Strona główna
              </LinkButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
