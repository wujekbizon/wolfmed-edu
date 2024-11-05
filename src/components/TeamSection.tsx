'use client'

import { motion } from 'framer-motion'
import { fadeInUp } from '@/animations/motion'
import Image from 'next/image'
import Link from 'next/link'
import { teamMembers } from '@/constants/teamMembers'

export default function TeamSection() {
  return (
    <motion.div
      variants={fadeInUp}
      // @ts-ignore
      className="lg:col-span-5 bg-zinc-800/30 border border-zinc-700/50 rounded-2xl p-6"
    >
      <h3 className="text-2xl font-bold mb-6 text-center">Nasz Zespół</h3>
      <div className="space-y-6">
        {teamMembers.map((member) => (
          <motion.div
            key={member.name}
            variants={fadeInUp}
            // @ts-ignore
            className="flex items-center flex-col xs:flex-row gap-4 p-4 rounded-xl bg-zinc-900/30 border border-zinc-700/50"
          >
            <Image
              src={member.image}
              alt={member.name}
              width={400}
              height={600}
              className="rounded-xl object-cover w-full xs:w-32 h-full"
            />
            <div>
              <h4 className="font-bold text-white">{member.name}</h4>
              <p className="text-red-400 text-sm">{member.role}</p>
              <p className="text-sm text-zinc-300 mt-1">{member.bio}</p>
              <Link
                href={member.linkedin}
                target="_blank"
                className="text-sm text-red-400 hover:text-red-300 mt-2 inline-block"
              >
                LinkedIn →
              </Link>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
