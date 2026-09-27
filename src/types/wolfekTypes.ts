import type { MotionValue } from 'framer-motion'
import type { PointerEventHandler, ReactNode, Ref } from 'react'

export interface WolfekAnswerReaction {
  eventId: string
  gesture: 'yes' | 'no'
}

export interface WolfekFaceProps {
  id: string
  positive: boolean
  supportive: boolean
  reduced: boolean | null
  interactive: boolean
  gaze?: WolfekGaze | undefined
}

export interface WolfekEyesProps {
  positive: boolean
  confused: boolean
  gaze?: WolfekGaze | undefined
}

export interface WolfekMonocleProps {
  dropped: boolean
  reduced: boolean | null
  interactive: boolean
  onDrop: () => void
}
export interface WolfekGaze {
  x: MotionValue<number>
  y: MotionValue<number>
}

export interface WolfekAvatarProps {
  positive: boolean
  supportive: boolean
  interactive: boolean
  reaction?: WolfekAnswerReaction | null | undefined
  gaze?: WolfekGaze | undefined
}

export interface WolfekOverlayProps {
  anchorId: string | undefined
  visible: boolean
  avatar: ReactNode
  children: (minimize: () => void) => ReactNode
  onMinimize: () => void
  onOpen: () => void
}

export interface WolfekGlassCardProps {
  avatarRef: Ref<HTMLDivElement>
  avatar: ReactNode
  children: ReactNode
  onMinimize: () => void
  onPointerMove: PointerEventHandler<HTMLDivElement>
  onPointerLeave: PointerEventHandler<HTMLDivElement>
  onPointerCancel: PointerEventHandler<HTMLDivElement>
}
