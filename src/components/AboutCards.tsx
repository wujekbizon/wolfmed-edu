'use client'

import { motion } from 'framer-motion'
import { fadeInUp } from '@/animations/motion'
import { cards } from '@/constants/aboutCards'
import Link from 'next/link'

export default function AboutCards() {
  return (
    <motion.div
    // @ts-ignore
      variants={fadeInUp}
      className="lg:col-span-7 grid sm:grid-cols-2 gap-6"
    >
      {cards.map((card) => (
        <motion.div
          key={card.title}
          // @ts-ignore
          variants={fadeInUp}
          className="flex flex-col gap-6 p-6 rounded-2xl bg-zinc-800/30 border border-zinc-700/50 backdrop-blur-sm hover:border-red-500/30 transition-colors duration-300"
        >
          <div className="flex w-16 h-16 justify-center items-center bg-zinc-900/30 border border-red-400/20 rounded-xl p-3">
            {card.icon}
          </div>
          <div>
            <h3 className="text-lg font-bold text-white mb-2">{card.title}</h3>
            <p className="text-sm text-zinc-300 leading-relaxed">{card.description}</p>
          </div>
        </motion.div>
      ))}

      {/* Support Card */}
      <motion.div
        // @ts-ignore
        variants={fadeInUp}
        className="flex flex-col gap-6 p-6 rounded-2xl bg-gradient-to-br from-red-500/20 to-red-600/20 border border-red-500/30 backdrop-blur-sm sm:col-span-2"
      >
        <div className="flex flex-col items-center text-center gap-4">
          <h3 className="text-lg font-bold text-white">Wesprzyj Nasz Rozwój</h3>
          <p className="text-sm text-zinc-300 leading-relaxed">
            Twoje wsparcie pomaga nam tworzyć lepsze materiały edukacyjne dla przyszłych opiekunów medycznych
          </p>
          <Link
            href="https://buymeacoffee.com/grzegorzwolfinger"
            target="_blank"
            className="inline-block bg-gradient-to-r from-red-400 to-red-500 text-white text-sm sm:text-base font-semibold px-8 py-3 rounded-full shadow-lg shadow-red-400/30 border border-red-300/20 transition-all duration-300 ease-out hover:shadow-xl hover:shadow-red-400/40 hover:scale-105 hover:border-red-300/30 active:scale-95"
          >
            Wesprzyj nas ❤️
          </Link>
        </div>
      </motion.div>
    </motion.div>
  )
}
