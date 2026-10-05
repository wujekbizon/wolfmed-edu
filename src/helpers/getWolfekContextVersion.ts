import { createHash } from 'node:crypto'
import { getWolfekPreparedScope } from './getWolfekPreparedScope'
import type { WolfekContext, WolfekPack, WolfekQuestionRequest } from '@/types/wolfekResponseTypes'

export function getWolfekContextVersion(input: WolfekQuestionRequest, pack: WolfekPack, context: WolfekContext) {
  return createHash('sha256').update(JSON.stringify({
    version: pack.version, route: input.route, reference: getWolfekPreparedScope(input.practice),
    facts: context.facts, options: pack.options, destinations: context.destinations,
  })).digest('hex')
}
