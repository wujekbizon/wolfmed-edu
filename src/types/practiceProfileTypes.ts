export type ProfileProjectionUpdate = (user: string, category: string) => Promise<boolean>

export interface PendingProfileProjection {
  generation: number
  promise: Promise<boolean>
}
