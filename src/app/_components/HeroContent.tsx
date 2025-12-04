import { MedicalIllustration } from './MedicalIllustration'
import HeroTitle from '@/components/HeroTitle'
import HeroCallToActionButtons from '@/components/HeroCallToActionButtons'
import { Suspense } from 'react'

export default async function HeroContent() {
  return (
    <div className="container mx-auto px-4 flex flex-col lg:flex-row items-center justify-between gap-8 sm:gap-12">
      <div className="flex-1 text-center lg:text-left z-1 mt-4 sm:mt-0">
        <div className="animate-fadeInUp">
          <HeroTitle />
        </div>
        <div className="animate-fadeInUp [--slidein-delay:200ms]">
          <Suspense fallback={<div className="animate-pulse bg-zinc-200 h-10 w-28 rounded-md"></div>}>
           <HeroCallToActionButtons />
          </Suspense>
        </div>
      </div>
      <MedicalIllustration />
    </div>
  )
}
