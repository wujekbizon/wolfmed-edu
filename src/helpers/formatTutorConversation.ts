import type { TutorContextMessage } from '@/types/memoryTypes'

export function formatTutorConversation(messages: TutorContextMessage[]): string {
  return messages
    .map(({ role, text }) => `${role === 'user' ? 'UCZEŃ' : 'ASYSTENT'}: ${text}`)
    .join('\n')
}
