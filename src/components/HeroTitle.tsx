'use client'

import { motion } from 'framer-motion'
import { textReveal, fadeInUp } from '@/animations/motion'

export default function HeroTitle() {
  return (
    <>
      <motion.h1
        variants={textReveal}
        // @ts-ignore
        className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-zinc-800"
      >
        Edukacja{' '}
        <motion.span
          // @ts-ignore
          className="text-[#ff5b5b]"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: 0.5,
            delay: 0.2,
            ease: 'easeOut',
          }}
        >
          medyczna
        </motion.span>
        <br />
        <motion.span
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.5,
            delay: 0.4,
            ease: 'easeOut',
          }}
        >
          może być jeszcze łatwiejsza.
        </motion.span>
      </motion.h1>

      <motion.p
        variants={fadeInUp}
        // @ts-ignore
        className="text-lg text-zinc-600 mb-8 max-w-xl place-self-center lg:place-self-start"
      >
        Rozpocznij swoją podróż w świecie medycyny z naszą innowacyjną platformą edukacyjną.
      </motion.p>
    </>
  )
}
