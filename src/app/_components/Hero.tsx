'use client'

import { motion } from 'framer-motion'
import HeroButton from '@/components/HeroButton'
import { SignedIn, SignedOut } from '@clerk/nextjs'
import { fadeInUp, staggerContainer } from '@/animations/motion'
import { MedicalIllustration } from './MedicalIllustration'
import { MobileMedicalIllustration } from './MobileMedicalIllustration'
import { useIsMobile } from '@/hooks/useIsMobile'
import GradientOverlay from '@/components/GradientOverlay'
import HeroTitle from '@/components/HeroTitle'
import { FloatingShapes } from '@/components/FloatingShapes'

export default function Hero() {
  const isMobile = useIsMobile()

  return (
    <section className="relative w-full h-[calc(100vh_-_70px)] flex items-center justify-center overflow-hidden bg-white">
      <GradientOverlay />
      <FloatingShapes />
      <div className="container mx-auto px-4 flex flex-col lg:flex-row items-center justify-between gap-12">
        {/* Text content */}
        <motion.div
          // @ts-ignore
          className="flex-1 text-center lg:text-left z-[1]"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          <HeroTitle />
          <motion.div
            variants={fadeInUp}
            // @ts-ignore
            className="space-x-4"
          >
            <SignedIn>
              <HeroButton link="/testy-opiekun/nauka">Rozpocznij naukę</HeroButton>
            </SignedIn>
            <SignedOut>
              <HeroButton link="/sign-up">Zarejestruj się</HeroButton>
            </SignedOut>
          </motion.div>
        </motion.div>

        {/* Illustration section */}
        {isMobile ? <MobileMedicalIllustration /> : <MedicalIllustration />}
      </div>
    </section>
  )
}
