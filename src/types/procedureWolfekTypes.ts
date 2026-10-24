import type { RefObject } from 'react'
import type { WolfekGaze } from '@/types/wolfekTypes'

export interface ProcedureWolfekAvatarProps {
  avatarRef: RefObject<HTMLDivElement | null>
  gaze: WolfekGaze
}
