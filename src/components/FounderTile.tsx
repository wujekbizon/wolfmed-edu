'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { fadeInUp } from '@/animations/motion'
import { teamMembers } from '@/constants/teamMembers'

type Member = (typeof teamMembers)[number]

interface FounderTileProps {
  member: Member
  domain: string
  className: string
}

export default function FounderTile({ member, domain, className }: FounderTileProps) {
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
