export const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: 'easeOut',
    },
  },
}

export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

export const floatingAnimation = {
  y: [-10, 10],
  transition: {
    y: {
      duration: 2,
      repeat: Infinity,
      repeatType: 'reverse',
      ease: 'easeInOut',
    },
  },
}

export const gradientAnimation = {
  opacity: [0, 1],
  background: [
    'linear-gradient(45deg, rgba(255,91,91,0.2) 0%, rgba(147,51,234,0.1) 50%, rgba(255,91,91,0.2) 100%)',
    'linear-gradient(60deg, rgba(59,130,246,0.1) 0%, rgba(255,91,91,0.2) 50%, rgba(147,51,234,0.1) 100%)',
    'linear-gradient(45deg, rgba(255,91,91,0.2) 0%, rgba(59,130,246,0.1) 50%, rgba(255,91,91,0.2) 100%)',
  ],
  scale: [1, 1.1, 1],
  transition: {
    opacity: { duration: 0.2 },
    background: {
      duration: 5,
      repeat: Infinity,
      repeatType: 'reverse' as const,
    },
    scale: {
      duration: 8,
      repeat: Infinity,
      repeatType: 'reverse' as const,
      ease: 'easeInOut',
    },
  },
}

export const textReveal = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      damping: 20,
      stiffness: 100,
      duration: 0.2,
    },
  },
}
