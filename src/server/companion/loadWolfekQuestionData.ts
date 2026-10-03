import 'server-only'
import { createHash } from 'node:crypto'
import { expandWolfekCourseResponses } from '@/helpers/expandWolfekCourseResponses'
import { loadWolfekResponsePack } from './loadWolfekResponsePack'
import { getWolfekAppContext } from './getWolfekAppContext'
import { getWolfekPracticeContext } from './getWolfekPracticeContext'
import type { WolfekQuestionRequest } from '@/types/wolfekResponseTypes'

export async function loadWolfekQuestionData(userId: string | null, input: WolfekQuestionRequest) {
  const [rawPack, context] = await Promise.all([
    loadWolfekResponsePack(input.route), input.practice ? getWolfekPracticeContext(userId!, input.practice)
      : getWolfekAppContext(userId, input.route),
  ])
  const pack = input.route === 'kierunki' ? expandWolfekCourseResponses(rawPack) : rawPack
  const contextVersion = createHash('sha256').update(JSON.stringify({
    version: pack.version, route: input.route, reference: input.practice,
    facts: context.facts, options: pack.options, destinations: context.destinations,
  })).digest('hex')
  return { pack, context, contextVersion }
}
