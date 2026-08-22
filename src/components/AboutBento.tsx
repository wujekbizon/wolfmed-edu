'use client'

import { motion } from 'framer-motion'
import { fadeInUp, staggerContainer } from '@/animations/motion'
import { teamMembers } from '@/constants/teamMembers'
import { cards } from '@/constants/aboutCards'
import FounderTile from './FounderTile'

// The two founders embody the brand: medicine (Kinga) + technology (Grzegorz).
const founderDomains = ['Medyczne doświadczenie', 'Technologia i rozwój']

export default function AboutBento() {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={staggerContainer as any}
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-12"
    >
      {teamMembers.map((member, i) => (
        <FounderTile
          key={member.name}
          member={member}
          domain={founderDomains[i] ?? ''}
          className="sm:col-span-2 lg:col-span-6"
        />
      ))}

      {cards.map((card) => (
        <motion.div
          key={card.title}
          variants={fadeInUp as any}
          className="flex flex-col gap-3 rounded-2xl border border-zinc-700/50 bg-zinc-800/30 p-5 shadow-md shadow-black/30 backdrop-blur-sm transition-colors duration-300 hover:border-red-500/30 lg:col-span-3"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-red-400/20 bg-zinc-900/40">
            {card.icon}
          </div>
          <h4 className="text-base font-bold text-white">{card.title}</h4>
          <p className="text-sm leading-relaxed text-zinc-400">{card.description}</p>
        </motion.div>
      ))}
    </motion.div>
  )
}
