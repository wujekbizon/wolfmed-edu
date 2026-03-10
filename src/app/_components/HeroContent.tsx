import { MedicalIllustration } from './MedicalIllustration'
import HeroTitle from '@/components/HeroTitle'
import HeroCallToActionButtons from '@/components/HeroCallToActionButtons'

export default function HeroContent() {
  return (
    <div className="container mx-auto px-4 flex flex-col lg:flex-row items-center justify-between gap-8 sm:gap-12">
      <div className="flex-1 text-center lg:text-left z-1 mt-4 sm:mt-0">
        <div className="animate-fadeInUp">
          <HeroTitle />
        </div>
        <div className="animate-fadeInUp [--slidein-delay:200ms]">
          <HeroCallToActionButtons />
        </div>
        <div className="animate-fadeInUp [--slidein-delay:400ms] mt-6 flex items-center gap-3 justify-center lg:justify-start">
          <div className="flex -space-x-2">
            {['bg-red-300', 'bg-blue-300', 'bg-emerald-300'].map((c, i) => (
              <div key={i} className={`h-7 w-7 rounded-full border-2 border-white ${c}`} />
            ))}
          </div>
          <p className="text-sm text-zinc-500">
            Dołącz do <span className="font-semibold text-zinc-700">6 500+</span> studentów
          </p>
        </div>
      </div>
      <MedicalIllustration />
    </div>
  )
}
