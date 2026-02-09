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
]
