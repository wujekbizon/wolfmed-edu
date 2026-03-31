'use client'

import { motion } from 'framer-motion'
import { fadeInUp } from '@/animations/motion'
import { cards } from '@/constants/aboutCards'

export default function AboutCards() {
  return (
    <motion.div
    // @ts-ignore
      variants={fadeInUp}
      className="xl:col-span-7 h-full grid sm:grid-cols-2 sm:grid-rows-2 gap-6"
    >
      {cards.map((card) => (
        <motion.div
          key={card.title}
          // @ts-ignore
          variants={fadeInUp}
          className="flex flex-col gap-6 p-6 rounded-2xl bg-zinc-800/30 border border-zinc-700/50 backdrop-blur-sm shadow-lg shadow-black/40 transition-all duration-300 hover:border-red-500/30 hover:shadow-xl hover:shadow-black/60"
        >
          <div className="flex w-16 h-16 justify-center items-center bg-zinc-900/30 border border-red-400/20 rounded-xl p-3 shadow-md shadow-black/30">
            {card.icon}
          </div>
          <div className='flex flex-col items-center justify-center'>
            <h3 className="text-lg font-bold text-white mb-2">{card.title}</h3>
            <p className="text-sm text-zinc-300 leading-relaxed text-center">{card.description}</p>
          </div>
        </motion.div>
      ))}
    </motion.div>
  )
}