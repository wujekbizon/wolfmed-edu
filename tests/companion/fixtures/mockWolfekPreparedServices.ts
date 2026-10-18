import { registerHooks } from 'node:module'
import { context, packs } from './wolfekPrepared'
import { learningContext } from './wolfekLearning'
import { WolfekQuestionError } from '@/lib/WolfekQuestionError'
import type { WolfekInteraction } from '@/types/wolfekMetricTypes'
import type { WolfekQuestionState, WolfekRoute } from '@/types/wolfekResponseTypes'

export const services = {
  allowed: true, limited: false, providerCalls: 0, deliveries: 0, contextReads: 0,
  appContext: context,
  replay: null as WolfekQuestionState | null,
  completed: null as WolfekQuestionState | null,
  records: [] as WolfekInteraction[],
  async authorizeWolfekQuestion() { if (!services.allowed) throw new WolfekQuestionError('Brak dostępu.') },
  async checkRateLimit() { return { success: !services.limited } },
  async getKierunkiWolfekRateLimitIdentity() { return 'user:test' },
  async beginWolfekSubmission() {
    return { reused: services.replay, complete: async (state: WolfekQuestionState) => { services.completed = state } }
  },
  async loadWolfekResponsePack(route: WolfekRoute) { return packs[route] },
  async getWolfekAppContext() { services.contextReads++; return services.appContext },
  async getWolfekPracticeContext() { services.contextReads++; return learningContext },
  async recordWolfekInteraction(record: WolfekInteraction) { services.records.push(record) },
  async reserveCompanionJevCall() { return true },
  async completeWolfekAudit() {},
  async deliverWolfekPracticeHint() { throw new Error('Unexpected legacy hint') },
  async deliverWolfekLearningHelp(_user: string, _input: unknown, state: WolfekQuestionState) {
    services.deliveries++
    return state
  },
  async callJev() { services.providerCalls++; throw new Error('Prepared questions must never call Jev') },
}

const registry = globalThis as typeof globalThis & { wolfekPreparedTestServices?: typeof services }
registry.wolfekPreparedTestServices = services
export const hooks = registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier === 'server-only') return { url: 'data:text/javascript,export {}', shortCircuit: true }
    const name = specifier.endsWith('/rateLimit') ? 'checkRateLimit' : specifier.split('/').at(-1)!
    if (!Object.hasOwn(services, name) || typeof services[name as keyof typeof services] !== 'function') {
      return nextResolve(specifier, context)
    }
    const source = `export const ${name} = (...args) => globalThis.wolfekPreparedTestServices.${name}(...args)`
    return { url: `data:text/javascript,${encodeURIComponent(source)}`, shortCircuit: true }
  },
})
