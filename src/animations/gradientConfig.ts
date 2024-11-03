export const gradientConfig = {
  backgroundStates: [
    'radial-gradient(circle at 20% 20%, rgba(255,91,91,0.15) 0%, rgba(147,51,234,0.05) 50%, transparent 70%)',
    'radial-gradient(circle at 80% 80%, rgba(59,130,246,0.1) 0%, rgba(255,91,91,0.1) 50%, transparent 70%)',
    'radial-gradient(circle at 20% 20%, rgba(255,91,91,0.15) 0%, rgba(147,51,234,0.05) 50%, transparent 70%)',
  ],
  transition: {
    opacity: { duration: 0.2 },
    background: {
      duration: 6,
      repeat: Infinity,
      repeatType: 'reverse',
    },
  },
}
