'use client'

import { motion } from 'framer-motion'
import { useRandomPositions } from '@/hooks/useRandomPositions'
import { HumanCellSVG } from '@/domain/bio/components/HumanCellSVG'
import { VirusSVG } from '@/domain/bio/components/VirusSVG'
import { BacteriaSVG } from '@/domain/bio/components/BacteriaSVG'

export const MedicalIllustration = () => {
  const { positions, svgSize } = useRandomPositions()

  return (
    <motion.div
      className="relative w-full max-w-[350px] sm:max-w-[450px] md:max-w-[500px] lg:max-w-[600px] xl:max-w-[700px] aspect-square mx-auto px-4"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: 'easeInOut' }}
    >
      <motion.div
        className="relative w-full h-full flex items-center justify-center overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{
          opacity: 1,
          scale: [1, 1.1, 1],
          rotate: [0, 2, -2, 0],
        }}
        transition={{
          opacity: { duration: 0.3 },
          duration: 8,
          repeat: Infinity,
          repeatType: 'reverse',
          ease: 'easeInOut',
        }}
      >
        <HumanCellSVG
          id="cell"
          type="cell"
          position={{ x: 0, y: 0 }}
          size={{ width: 100, height: 100 }}
          velocity={{ x: 0, y: 0 }}
          radius={50}
          color="rgb(198, 223, 247)"
        />
      </motion.div>

      {positions.map((pos, i) => (
        <motion.div
          key={i}
          className="absolute -translate-x-1/2 -translate-y-1/2"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: 0.3,
            delay: i * 0.05,
            ease: 'easeOut',
          }}
          style={{ 
            top: pos.top, 
            left: pos.left 
          }}
        >
          <motion.div
            animate={{
              y: [-15, 50],
              rotate: [0, 360],
            }}
            transition={{
              y: {
                duration: 20 + i * 0.3,
                repeat: Infinity,
                repeatType: 'reverse',
                ease: 'easeInOut',
              },
              rotate: {
                duration: 25,
                repeat: Infinity,
                ease: 'linear',
              },
            }}
          >
            {i % 2 === 0 ? (
              <VirusSVG
                id={`virus-${i}`}
                type="virus"
                position={{ x: 0, y: 0 }}
                size={{ width: svgSize.width, height: svgSize.height }}
                velocity={{ x: -100, y: 100 }}
                radius={svgSize.width / 2}
                color="#a66ca6"
              />
            ) : (
              <BacteriaSVG
                id={`bacteria-${i}`}
                type="bacteria"
                position={{ x: 0, y: 0 }}
                size={{ width: svgSize.width * 1.4, height: svgSize.height * 1.4 }}
                velocity={{ x: 0, y: 0 }}
                radius={svgSize.width * 0.7}
                color="#82a61e"
              />
            )}
          </motion.div>
        </motion.div>
      ))}
    </motion.div>
  )
}
