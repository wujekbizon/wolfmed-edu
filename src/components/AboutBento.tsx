'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { fadeInUp, staggerContainer } from '@/animations/motion'
import { teamMembers } from '@/constants/teamMembers'
import { cards } from '@/constants/aboutCards'

type Member = (typeof teamMembers)[number]

// The two founders embody the brand: medicine (Kinga) + technology (Grzegorz).
const founderDomains = ['Medyczne doświadczenie', 'Technologia i rozwój']

function FounderTile({ member, domain, className }: { member: Member; domain: string; className: string }) {
  return (
    <motion.div
      variants={fadeInUp as any}
      className={`group relative flex flex-col overflow-hidden rounded-3xl border border-zinc-700/50 bg-zinc-800/40 shadow-lg shadow-black/40 backdrop-blur-sm sm:flex-row ${className}`}
    >
      <div className="relative aspect-[16/11] w-full overflow-hidden sm:aspect-auto sm:w-2/5 sm:min-h-[300px]">
        <Image
          src={member.image}
          alt={member.name}
          fill
          sizes="(min-width: 640px) 40vw, 100vw"
          className="object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/70 via-transparent to-transparent" />
      </div>
      <div className="flex flex-1 flex-col justify-center gap-3 p-6">
        <span className="self-start rounded-full border border-red-400/30 bg-red-500/10 px-3 py-1 text-xs font-medium text-red-300">
          {domain}
        </span>
        <div>
          <h3 className="text-xl font-bold text-white">{member.name}</h3>
          <p className="text-sm text-zinc-400">{member.role}</p>
        </div>
        <p className="text-sm leading-relaxed text-zinc-300">{member.bio}</p>
        <Link
          href={member.linkedin}
          target="_blank"
          className="mt-1 inline-flex items-center gap-1 text-sm font-medium text-red-400 transition-colors hover:text-red-300"
        >
          LinkedIn →
        </Link>
      </div>
    </motion.div>
  )
}

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
          className={`sm:col-span-2 ${i === 0 ? 'lg:col-span-7' : 'lg:col-span-5'}`}
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
