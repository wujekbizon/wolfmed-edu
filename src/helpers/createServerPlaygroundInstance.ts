import TeachingPlayground from '@/lib/teaching-playground/engine/TeachingPlayground'
let playgroundInstance: TeachingPlayground | null = null

export const createServerPlaygroundInstance = (): TeachingPlayground => {
  if (!playgroundInstance) {
    console.log("New instance created !")
    playgroundInstance = new TeachingPlayground({
      roomConfig: {},
      commsConfig: {},
      eventConfig: {},
    })
  }
  return playgroundInstance
}