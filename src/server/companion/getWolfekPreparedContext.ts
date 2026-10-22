import 'server-only'
import { getWolfekPreparedFactPaths } from '@/helpers/getWolfekPreparedFactPaths'
import { getWolfekAppContext } from './getWolfekAppContext'
import type { WolfekPack, WolfekQuestionRequest } from '@/types/wolfekResponseTypes'

export async function getWolfekPreparedContext(userId: string | null, input: WolfekQuestionRequest, pack: WolfekPack) {
  const paths = getWolfekPreparedFactPaths(input, pack)
  const groups = new Set([...paths].map(path => path.split('.')[0]!))
  return getWolfekAppContext(userId, input.route, groups, paths)
}
