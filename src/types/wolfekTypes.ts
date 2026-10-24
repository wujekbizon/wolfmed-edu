import type { MotionValue } from 'framer-motion'
import type { Dispatch, PointerEventHandler, ReactNode, Ref, SetStateAction } from 'react'

export type WolfekActivity = { pending: boolean; answerKey: number; speechDuration?: number }
export type WolfekAnimationState = {
  activity: WolfekActivity
  setActivity: Dispatch<SetStateAction<WolfekActivity>>
}
export type WolfekExpression = 'scared' | 'relieved'
export type WolfekMouthProps = { dropped: boolean; reduced: boolean | null; expression?: WolfekExpression | undefined }
export type WolfekIntroProps = { description: string; id?: string }
export type WolfekAnswerTextProps = { text: string; animate?: boolean; children?: ReactNode }

export interface WolfekAnswerReaction {
  eventId: string
  gesture: 'yes' | 'no'
}

export interface WolfekAcademicHatProps { interactive?: boolean }
export interface WolfekAcademicCapProps {
  flipping: boolean
  reduced: boolean | null
  onAnimationComplete?: () => void
}
export interface WolfekProfessorAvatarProps {
  interactive?: boolean
  excited?: boolean
  gaze?: WolfekGaze | undefined
}

export interface WolfekSmallTalkProps {
  index: number
}

export interface WolfekFaceProps {
  expression?: WolfekExpression | undefined
  medicalMask?: boolean
  glasses?: boolean
  id: string
  positive: boolean
  supportive: boolean
  reduced: boolean | null
  interactive: boolean
  gaze?: WolfekGaze | undefined
  videoHover?: boolean
  excited?: boolean
}

export interface WolfekEyesProps {
  expression?: WolfekExpression | undefined
  positive: boolean
  confused: boolean
  gaze?: WolfekGaze | undefined
  videoHover?: boolean
  reduced?: boolean | null
  excited?: boolean
}

export interface Wolfek3DGlassesProps {
  reduced: boolean | null
}

export interface WolfekMedicalMaskProps { reduced: boolean | null }

export interface WolfekGlassesProps {
  reduced: boolean | null
  interactive: boolean
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
  expression?: WolfekExpression | undefined
  medicalMask?: boolean
  glasses?: boolean
  positive: boolean
  supportive: boolean
  interactive: boolean
  reaction?: WolfekAnswerReaction | null | undefined
  gaze?: WolfekGaze | undefined
  videoHover?: boolean
  excited?: boolean
}

export interface WolfekOverlayProps {
  anchorId: string | undefined
  inlineAnchorId?: string
  variant?: 'learning' | 'panel'
  visible: boolean
  avatar: ReactNode
  children: (minimize: () => void) => ReactNode
  onMinimize: () => void
  onOpen: () => void
}

export interface WolfekGlassCardProps {
  avatarRef: Ref<HTMLDivElement>
  avatar: ReactNode
  avatarStatus?: ReactNode
  avatarActions?: ReactNode
  children: ReactNode
  className?: string
  glassClassName?: string
  surfaceClassName?: string
  onMinimize?: () => void
  onPointerMove: PointerEventHandler<HTMLDivElement>
  onPointerLeave: PointerEventHandler<HTMLDivElement>
  onPointerCancel: PointerEventHandler<HTMLDivElement>
}
