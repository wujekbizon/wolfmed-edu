import type { Command } from '@/types/commandTypes'

export const COMMANDS: Command[] = [
  {
    name: 'notatka',
    description: 'Tworzy gotową notatkę',
    example: '/notatka Stwórz notatkę o działach w fizjologii',
  },
  {
    name: 'diagram',
    description: 'Generuje diagram wizualny',
    example: '/diagram Utwórz schemat budowy serca',
  },
  {
    name: 'utworz',
    description: 'Generuje pytania testowe',
    example: '/utworz 10 pytań o anatomii serca',
  },
  {
    name: 'fiszka',
    description: 'Generuje fiszki edukacyjne',
    example: '/fiszka 20 fiszek z układu kostnego',
  },
  {
    name: 'planuj',
    description: 'Tworzy szczegółowy plan nauki',
    example: '/planuj Anatomia kończyny górnej',
  },
]
