import type { Command } from '@/types/commandTypes'

export const COMMANDS: Command[] = [
  {
    name: 'notatka',
    description: 'Tworzy gotową notatkę na dany temat',
    example: '/notatka Stwórz notatkę o działach w fizjologii',
  },
  {
    name: 'diagram',
    description: 'Generuje diagram wizualny (flowchart lub sequence)',
    example: '/diagram Utwórz schemat budowy serca',
  },
  {
    name: 'utworz',
    description: 'Generuje pytania testowe w formacie JSON',
    example: '/utworz 10 pytań o anatomii serca',
  },
  {
    name: 'fiszka',
    description: 'Generuje fiszki edukacyjne na dany temat',
    example: '/fiszka 20 fiszek z układu kostnego',
  },
  {
    name: 'planuj',
    description: 'Tworzy szczegółowy plan nauki krok po kroku',
    example: '/planuj Anatomia kończyny górnej',
  },
]
