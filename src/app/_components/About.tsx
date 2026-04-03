'use client'

import { motion } from 'framer-motion'
import { fadeInUp, staggerContainer } from '@/animations/motion'
import AboutCards from '@/components/AboutCards'
import TeamSection from '@/components/TeamSection'

export default function About() {
  return (
    <section className="w-full px-4 sm:px-6 md:px-8 py-8 md:py-12">
      <div className="bg-zinc-900/90 rounded-3xl border border-white/5 flex flex-col items-center justify-center py-16 md:py-24 text-white relative overflow-hidden">
      <motion.div
        // @ts-ignore
        className="container max-w-7xl px-4 relative "
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={staggerContainer}
      >
        <div className="flex flex-col gap-8 md:gap-12">
          <div className="text-center mb-8">
            <motion.span
              // @ts-ignore
              variants={fadeInUp}
              className="mb-3 sm:mb-4 inline-block rounded-full bg-red-500/20 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-red-300"
            >
              O Nas
            </motion.span>
            <motion.h2
              // @ts-ignore
              variants={fadeInUp}
              className="text-3xl sm:text-4xl md:text-5xl py-2 font-bold text-white"
            >
              Odkryj <span className="text-[#ff5b5b]">Wolfmed</span>
            </motion.h2>
            <motion.p
              // @ts-ignore
              variants={fadeInUp}
              className="mt-4 text-lg text-zinc-400 max-w-2xl mx-auto"
            >
              Tworzymy przyszłość edukacji medycznej, łącząc doświadczenie z innowacją
            </motion.p>
          </div>
          <div className="h-full grid xl:grid-cols-12 gap-10">
            <AboutCards />
            <TeamSection />
          </div>
        </div>
      </motion.div>
      </div>
    </section>
  )
}