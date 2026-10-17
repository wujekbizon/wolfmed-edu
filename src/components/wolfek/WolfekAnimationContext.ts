'use client'

import { createContext } from 'react'
import type { WolfekAnimationState } from '@/types/wolfekTypes'

export const WolfekAnimationContext = createContext<WolfekAnimationState | null>(null)
