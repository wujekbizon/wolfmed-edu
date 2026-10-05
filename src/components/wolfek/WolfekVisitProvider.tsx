'use client'

import { createContext, useEffect, useId, useRef, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { usePathname } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import type { WolfekVisitContext } from '@/types/wolfekBatchTypes'

export const WolfekVisit = createContext<WolfekVisitContext | null>(null)

export default function WolfekVisitProvider({ children }: { children: ReactNode }) {
  const { user, isLoaded } = useUser()
  const pathname = usePathname()
  const viewer = isLoaded ? user?.id ?? 'anonymous' : 'loading'
  const identity = `${pathname}:${viewer}`
  const previous = useRef(identity)
  const seed = useId()
  const [generation, setGeneration] = useState(0)
  const id = `${seed}:${generation}`
  const nonce = useRef<{ identity: string; id: string } | null>(null)
  const client = useQueryClient()
  useEffect(() => {
    if (previous.current === identity) return
    previous.current = identity
    setGeneration((value) => value + 1)
  }, [identity])
  useEffect(() => () => { client.removeQueries({ queryKey: ['wolfek-prepared', id] }) }, [client, id, identity])
  const getVisitId = () => {
    if (nonce.current?.identity !== identity) nonce.current = { identity, id: crypto.randomUUID() }
    return nonce.current.id
  }
  return <WolfekVisit.Provider value={{ id, viewer, ready: Boolean(isLoaded), getVisitId }}>{children}</WolfekVisit.Provider>
}
