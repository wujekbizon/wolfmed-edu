'use client'

import { motion } from 'framer-motion'
import { fadeInUp, staggerContainer } from '@/animations/motion'
import AboutBento from '@/components/AboutBento'
import MicrobeSwarm from '@/components/MicrobeSwarm'

export default function About() {
  return (
    <section className="w-full px-4 sm:px-6 md:px-8 py-16 md:py-24">
      <div className="group/about bg-gradient-to-b from-zinc-800/90 to-zinc-950/90 rounded-3xl border border-white/5 shadow-2xl shadow-zinc-950/50 ring-1 ring-inset ring-white/10 flex flex-col items-center justify-center py-16 md:py-24 text-white relative overflow-hidden">
      <MicrobeSwarm />
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
              Za Wolfmed stoją Kinga i Grzegorz Wolfinger — połączenie medycznego
              doświadczenia z pasją do technologii.
            </motion.p>
          </div>
          <AboutBento />
        </div>
      </motion.div>
      </div>
    </section>
  )
}