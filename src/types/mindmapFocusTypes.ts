/** How the camera should react to a mind-map interaction. */
export type FocusKind = 'expand' | 'collapse' | 'leaf' | 'reset'

export interface FocusRequest {
  nodeId: string
  kind: FocusKind
}
