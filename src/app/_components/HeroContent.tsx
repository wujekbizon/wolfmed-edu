import { MedicalIllustration } from './MedicalIllustration'
import HeroTitle from '@/components/HeroTitle'
import HeroCallToActionButtons from '@/components/HeroCallToActionButtons'
import HeroSpotlightCard from '@/components/HeroSpotlightCard'

export default function HeroContent() {
  return (
    <div className="relative flex w-full items-center justify-center px-4 sm:px-6">
      {/* Living depth layer: the cell drifts and glows behind the content card. */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <MedicalIllustration backdrop />
      </div>

      <div className="relative z-10 w-full max-w-3xl">
        <HeroSpotlightCard>
          <div className="animate-fadeInUp">
            <HeroTitle />
          </div>
          <div className="animate-fadeInUp [--slidein-delay:200ms]">
            <HeroCallToActionButtons />
          </div>
          <div className="animate-fadeInUp [--slidein-delay:400ms] mt-6 flex items-center justify-center gap-3">
            <div className="flex -space-x-2">
              {['bg-red-300', 'bg-blue-300', 'bg-emerald-300'].map((c, i) => (
                <div key={i} className={`h-7 w-7 rounded-full border-2 border-white ${c}`} />
              ))}
            </div>
            <p className="text-sm text-zinc-500">
              Dołącz do <span className="font-semibold text-zinc-700">6 500+</span> studentów
            </p>
          </div>
        </HeroSpotlightCard>
      </div>
    </div>
  )
}
