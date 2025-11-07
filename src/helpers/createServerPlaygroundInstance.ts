import TeachingPlayground from '@/lib/teaching-playground/engine/TeachingPlayground'
let playgroundInstance: TeachingPlayground | null = null

export const createServerPlaygroundInstance = (): TeachingPlayground => {
  if (!playgroundInstance) {
    playgroundInstance = new TeachingPlayground({
      roomConfig: {},
      commsConfig: {},
      eventConfig: {},
    })
  }
  return playgroundInstance
}