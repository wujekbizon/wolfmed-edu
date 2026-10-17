import 'server-only'
import { getWolfekContextVersion } from '@/helpers/getWolfekContextVersion'
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
  const contextVersion = getWolfekContextVersion(input, pack, context)
  return { pack, context, contextVersion }
}
