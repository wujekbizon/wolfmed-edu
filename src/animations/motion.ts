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

export const floatingAnimation = (
  floatDistance: number = 10,    // how far it moves up/down
  rotateAmount: number = 2,      // how much it rotates
  scaleAmount: number = 0.05     // how much it "breathes"
) => ({
  y: [-floatDistance, floatDistance],
  rotate: [0, rotateAmount, -rotateAmount, rotateAmount / 2, -rotateAmount / 2, 0],
  scale: [1, 1 + scaleAmount, 1 - scaleAmount, 1 + scaleAmount / 2, 1],
  transition: {
    y: {
      duration: 2 + Math.random(), // small random variation
      repeat: Infinity,
      repeatType: 'reverse',
      ease: 'easeInOut',
    },
    rotate: {
      duration: 3 + Math.random() * 2,
      repeat: Infinity,
      repeatType: 'mirror',
      ease: 'easeInOut',
    },
    scale: {
      duration: 2.5 + Math.random(),
      repeat: Infinity,
      repeatType: 'mirror',
      ease: 'easeInOut',
    },
  },
})

export const driftingAnimation = (
  driftX: number = 15,   // max horizontal drift
  driftY: number = 15,   // max vertical drift
  rotateAmount: number = 4, // how much it rotates
  scaleAmount: number = 0.05 // pulsing
) => {
  // create a more organic "wandering" pattern
  const xKeyframes = [
    0,
    Math.random() * driftX,
    -Math.random() * driftX,
    Math.random() * (driftX / 2),
    0,
  ]
  const yKeyframes = [
    0,
    -Math.random() * driftY,
    Math.random() * driftY,
    -Math.random() * (driftY / 2),
    0,
  ]

  return {
    x: xKeyframes,
    y: yKeyframes,
    rotate: [0, rotateAmount, -rotateAmount, rotateAmount / 2, -rotateAmount / 2, 0],
    scale: [1, 1 + scaleAmount, 1 - scaleAmount, 1 + scaleAmount / 2, 1],
    transition: {
      x: {
        duration: 8 + Math.random() * 4, // slow, long drift
        repeat: Infinity,
        repeatType: 'mirror',
        ease: 'easeInOut',
      },
      y: {
        duration: 9 + Math.random() * 4,
        repeat: Infinity,
        repeatType: 'mirror',
        ease: 'easeInOut',
      },
      rotate: {
        duration: 6 + Math.random() * 3,
        repeat: Infinity,
        repeatType: 'mirror',
        ease: 'easeInOut',
      },
      scale: {
        duration: 5 + Math.random() * 2,
        repeat: Infinity,
        repeatType: 'mirror',
        ease: 'easeInOut',
      },
    },
  }
}

export const longDriftAnimation = (
  driftX: number = 40,   // max horizontal drift
  driftY: number = 40,   // max vertical drift
  rotateAmount: number = 5,
  scaleAmount: number = 0.05,
  forwardDuration: number = 10 // seconds for forward drift
) => {
  // pick a random direction offset for THIS shape
  const targetX = (Math.random() * 2 - 1) * driftX; // random -driftX..driftX
  const targetY = (Math.random() * 2 - 1) * driftY;

  return {
    // drift forward, then back
    x: [0, targetX, 0],
    y: [0, targetY, 0],

    // slow rotation (just adds a bit of life)
    rotate: [0, rotateAmount, -rotateAmount, 0],

    // very subtle breathing
    scale: [1, 1 + scaleAmount, 1 - scaleAmount, 1],

    transition: {
      x: {
        duration: forwardDuration * 2, // forward 10s + back 10s
        repeat: Infinity,
        ease: "easeInOut",
      },
      y: {
        duration: forwardDuration * 2,
        repeat: Infinity,
        ease: "easeInOut",
      },
      rotate: {
        duration: forwardDuration * 1.5,
        repeat: Infinity,
        repeatType: "mirror",
        ease: "easeInOut",
      },
      scale: {
        duration: forwardDuration,
        repeat: Infinity,
        repeatType: "mirror",
        ease: "easeInOut",
      },
    },
  };
};

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
