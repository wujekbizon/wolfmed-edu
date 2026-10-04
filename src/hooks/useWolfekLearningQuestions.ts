'use client'

import { useEffect, useRef } from 'react'
import { useUser } from '@clerk/nextjs'
import { usePracticeSelectionStore } from '@/store/usePracticeSelectionStore'
import { useWolfekLearningStore } from '@/store/useWolfekLearningStore'
import { useWolfekQuestions } from './useWolfekQuestions'
import type { WolfekCompanionProps } from '@/types/learningUiTypes'
import type { WolfekLearningMode } from '@/types/wolfekLearningTypes'
import type { WolfekQuestionState } from '@/types/wolfekResponseTypes'
import { safeJsonParse } from '@/helpers/safeJsonParse'

export function useWolfekLearningQuestions(props: WolfekCompanionProps) {
  const card = props.session?.question
  const choice = usePracticeSelectionStore((state) => state.selections[`${props.userId}:${props.category}:${card?.id}`])
  const practice = card ? { category: props.category, sessionId: props.session?.id || null,
    version: props.session?.version ?? 0, questionId: card.id, revision: card.revision,
    selected: choice ?? card.selected ?? null } : null
  const { user, isLoaded } = useUser()
  const authorized = isLoaded && user?.id === props.userId && props.premium
  const scope = JSON.stringify([props.userId, props.category, card?.id, card?.revision])
  const key = JSON.stringify([props.userId, props.category, card?.id, card?.revision, practice?.selected])
  const lastKey = useWolfekLearningStore((state) => state.latestByCard[scope])
  const entry = useWolfekLearningStore((state) => state.entries[key])
  const hydrated = useWolfekLearningStore((state) => state.hydrated)
  const saveReply = useWolfekLearningStore((state) => state.saveReply)
  const selectReply = useWolfekLearningStore((state) => state.selectReply)
  useEffect(() => { if (!useWolfekLearningStore.persist.hasHydrated()) void useWolfekLearningStore.persist.rehydrate() }, [])
  useEffect(() => {
    if (!authorized || !hydrated || !card || choice !== undefined || card.selected !== null || !lastKey?.trim()) return
    const selected = safeJsonParse<unknown[]>(lastKey, [])?.[4]
    if (typeof selected === 'number' && Number.isInteger(selected) && selected >= 0 && selected < card.options.length) {
      usePracticeSelectionStore.getState().select(`${props.userId}:${props.category}:${card.id}`, selected)
    }
  }, [authorized, hydrated, card, choice, lastKey, props.userId, props.category])
  const canReplay = (mode: WolfekLearningMode) => Boolean(authorized && hydrated && card &&
    (mode === 'explain' ? card.correctIndex !== null : card.hintOpened || card.resolved))
  const cachedState = (mode: WolfekLearningMode): WolfekQuestionState | null => {
    const reply = entry?.replies[mode]
    return reply && canReplay(mode) ? { ...reply,
      values: { ...reply.values, restored: true, practiceVersion: practice?.version ?? 0 } } : null
  }
  const messages = authorized && hydrated ? entry?.messages ?? [] : []
  const help = useWolfekQuestions({ route: 'learning.practice', practice, recentMessages: messages,
    preparedResult: (id) => {
      const modes: Record<string, WolfekLearningMode> = { hint: 'hint', compare: 'compare', assistant: 'explain', reveal_tutor: 'explain' }
      const mode = modes[id]
      const reply = mode ? cachedState(mode) : null
      if (mode && reply) selectReply(key, mode)
      return reply
    } })
  const delivered = useRef(0)
  const saved = useRef(props.onSaved)
  saved.current = props.onSaved
  useEffect(() => {
    const state = help.state
    if (!state.timestamp || delivered.current === state.timestamp) return
    delivered.current = state.timestamp
    if (state.session) saved.current(state.session)
    const mode = state.values?.learningMode as WolfekLearningMode | undefined
    if (mode && !state.values?.restored && authorized) saveReply(key, mode, state)
  }, [help.state, saveReply, key, authorized])
  const restored: WolfekQuestionState | null = entry?.current && canReplay(entry.latest) ? { ...entry.current,
    values: { ...entry.current.values, restored: true, practiceVersion: practice?.version ?? 0 } } : null
  return { ...help, state: help.state.status === 'UNSET' && restored ? restored : help.state,
    practice, recentMessages: messages }
}
