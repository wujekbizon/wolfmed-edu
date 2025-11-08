import { TeachingPlayground } from '@teaching-playground/core'
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