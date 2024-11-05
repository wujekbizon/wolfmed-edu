'use client'

import { motion } from 'framer-motion'
import { fadeInUp, staggerContainer } from '@/animations/motion'
import SparklingEffect from '@/components/SparklingEffect'
import AboutCards from '@/components/AboutCards'
import TeamSection from '@/components/TeamSection'

export default function About() {
  return (
    <section className="w-full flex flex-col items-center justify-center py-16 md:py-24 bg-zinc-900 text-white relative overflow-hidden">
      <SparklingEffect />

      <motion.div
        // @ts-ignore
        className="container max-w-7xl px-4 relative"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={staggerContainer}
      >
        <div className="flex flex-col gap-8 md:gap-12">
          {/* Header Section */}
          <div className="text-center mb-8">
            <motion.h2
              variants={fadeInUp}
              // @ts-ignore
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-red-400"
            >
              Odkryj <span className="text-red-400">Wolfmed</span>
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              // @ts-ignore
              className="mt-4 text-lg text-zinc-300 max-w-2xl mx-auto"
            >
              Tworzymy przyszłość edukacji medycznej, łącząc doświadczenie z innowacją
            </motion.p>
          </div>
          <div className="grid lg:grid-cols-12 gap-8">
            <AboutCards />
            <TeamSection />
          </div>
        </div>
      </motion.div>
    </section>
  )
}
