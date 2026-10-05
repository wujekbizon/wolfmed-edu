import 'server-only'
import { WolfekPackSchema } from '@/server/schema'
import type { WolfekRoute } from '@/types/wolfekResponseTypes'

export async function loadWolfekResponsePack(route: WolfekRoute) {
  const loaders = {
    kierunki: () => import('@/content/wolfek/kierunki.json'),
    'panel.home': () => import('@/content/wolfek/panel-home.json'),
    'panel.results': () => import('@/content/wolfek/panel-results.json'),
    'learning.practice': () => import('@/content/wolfek/learning-practice.json'),
  }
  return WolfekPackSchema.parse((await loaders[route]()).default)
}
