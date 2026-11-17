'use client'

import { createContext, useContext } from 'react'
import type { EssayResources } from '@/types/essayTypes'

export const EssayResourcesContext = createContext<EssayResources>({ userId: '', courses: [], materials: [] })
export const useEssayResources = () => useContext(EssayResourcesContext)
