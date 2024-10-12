import { EXAMPLE_MOTTOS } from '@/constants/mottos'

export const generateRandomMotto = (): string => {
  return EXAMPLE_MOTTOS[Math.floor(Math.random() * EXAMPLE_MOTTOS.length)] ?? ''
}
