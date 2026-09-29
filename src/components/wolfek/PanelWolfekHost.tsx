'use client'

import { useCallback, useState, useTransition } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getPanelOnboardingSeenAction, markPanelOnboardingSeenAction } from '@/actions/panel-wolfek'
import type { PanelWolfekTopic } from '@/types/panelWolfekTypes'
import type { PanelWolfekRoute } from '@/types/panelWolfekTypes'
import WolfekAvatar from './WolfekAvatar'
import WolfekOverlay from './WolfekOverlay'
import PanelWolfekCard from './PanelWolfekCard'
import PanelWolfekMarker from './PanelWolfekMarker'
import PanelWolfekVideoModal from './PanelWolfekVideoModal'

export default function PanelWolfekHost({ userId, initialSeen, route }: {
  userId: string
  initialSeen: boolean
  route: PanelWolfekRoute
}) {
  const queryClient = useQueryClient()
  const key = ['panel-wolfek-seen', userId]
  const { data: seen } = useQuery({ queryKey: key, queryFn: getPanelOnboardingSeenAction,
    initialData: initialSeen, staleTime: 30_000 })
  const [visible, setVisible] = useState(false)
  const [marker, setMarker] = useState<{ topic: PanelWolfekTopic; id: string } | null>(null)
  const [videoTopic, setVideoTopic] = useState<PanelWolfekTopic | null>(null)
  const [dismissedIntro, setDismissedIntro] = useState(false)
  const [, startTransition] = useTransition()
  const intro = route === 'panel.home' && !seen && !dismissedIntro
  const onIntroDone = () => {
    if (!intro) return
    setDismissedIntro(true)
    startTransition(async () => {
      try {
        if (await markPanelOnboardingSeenAction()) queryClient.setQueryData(key, true)
      } catch {}
    })
  }
  const minimize = () => { onIntroDone(); setVisible(false) }
  const locate = useCallback((topic: PanelWolfekTopic) => {
    setMarker({ topic, id: crypto.randomUUID() })
  }, [])
  const dismissMarker = useCallback(() => {
    const markerFocused = document.activeElement?.classList.contains('panel-wolfek-marker')
    setMarker(null)
    if (!markerFocused) return
    requestAnimationFrame(() => {
      const panel = document.querySelector<HTMLElement>('.wolfek-overlay[data-variant="panel"] .wolfek-position')
      const target = panel?.dataset.minimized === 'false'
        ? document.getElementById('panel-wolfek-question')
        : document.querySelector<HTMLElement>('.wolfek-overlay[data-variant="panel"] .wolfek-launcher')
      target?.focus({ preventScroll: true })
    })
  }, [])
  const openFromMarker = () => {
    setMarker(null)
    setVisible(true)
    requestAnimationFrame(() => document.querySelector<HTMLElement>(
      '.wolfek-overlay[data-variant="panel"] [data-wolfek-focus-target]',
    )?.focus())
  }
  const closeVideo = () => {
    setVideoTopic(null)
    requestAnimationFrame(() => document.querySelector<HTMLButtonElement>(
      '.wolfek-overlay[data-variant="panel"] .panel-wolfek-video-button',
    )?.focus())
  }

  return <><WolfekOverlay anchorId={undefined} variant="panel" visible={visible}
    avatar={<WolfekAvatar positive={false} supportive={false} interactive={false} />}
    onMinimize={minimize} onOpen={() => setVisible(true)}>
    {(onOverlayMinimize) => <>
      <PanelWolfekCard route={route} intro={intro} onIntroDone={onIntroDone}
        onMinimize={onOverlayMinimize} onLocate={locate} onVideo={setVideoTopic} />
      {marker && <PanelWolfekMarker key={marker.id} topic={marker.topic}
        onOpen={openFromMarker} onDismiss={dismissMarker} />}
    </>}
  </WolfekOverlay>
  {videoTopic && <PanelWolfekVideoModal topic={videoTopic} onClose={closeVideo} />}
  </>
}
