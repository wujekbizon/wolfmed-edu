'use client'

import { useState } from 'react'
import Button from '@/components/ui/Button'
import { useWolfekGaze } from '@/hooks/useWolfekGaze'
import { PANEL_WOLFEK_TOPICS } from '@/constants/panelWolfek'
import { PANEL_WOLFEK_VIDEOS } from '@/constants/panelWolfekVideos'
import type { PanelWolfekRoute, PanelWolfekTopic } from '@/types/panelWolfekTypes'
import WolfekAvatar from './WolfekAvatar'
import WolfekGlassCard from './WolfekGlassCard'
import PanelWolfekVideoButton from './PanelWolfekVideoButton'
import WolfekQuestionChat from './WolfekQuestionChat'
import WolfekSpeech from './WolfekSpeech'
import WolfekIntro from './WolfekIntro'

export default function PanelWolfekCard({ route, intro, onIntroDone, onMinimize, onLocate, onVideo }: {
  route: PanelWolfekRoute; intro: boolean; onIntroDone: () => void; onMinimize: () => void
  onLocate: (topic: PanelWolfekTopic) => void; onVideo: (topic: PanelWolfekTopic) => void
}) {
  const [videoHovered, setVideoHovered] = useState(false)
  const [videoTopic, setVideoTopic] = useState<PanelWolfekTopic>(route === 'panel.results' ? 'results_explain' : 'first_steps')
  const eyes = useWolfekGaze()
  return <WolfekGlassCard avatarRef={eyes.avatar}
    onMinimize={() => { setVideoHovered(false); onMinimize() }}
    onPointerMove={eyes.follow} onPointerLeave={eyes.reset} onPointerCancel={eyes.reset}
    avatar={<WolfekAvatar gaze={eyes.gaze} positive={false} supportive interactive videoHover={videoHovered} />}
    avatarActions={<PanelWolfekVideoButton available={Boolean(PANEL_WOLFEK_VIDEOS[videoTopic])}
      onClick={() => onVideo(videoTopic)} onHoverChange={setVideoHovered} />}>
    <div className="wolfek-card-content panel-wolfek-content">
      <WolfekIntro description={route === 'panel.results' ? 'Pomogę Ci zrozumieć wyniki i wybrać kolejny krok.'
        : 'Pomogę Ci znaleźć kursy, postępy i najważniejsze miejsca w panelu.'} />
      {intro && <WolfekSpeech><div className="panel-wolfek-answer">
        <p>Witaj! Pokażę Ci kursy, postępy i najważniejsze miejsca w panelu.</p>
        <Button size="sm" onClick={onIntroDone}>Pokaż, w czym mogę pomóc</Button>
      </div></WolfekSpeech>}
      {!intro && <WolfekQuestionChat route={route} onInteraction={onIntroDone} onAnswer={(answer) => {
        if (answer.topic && Object.hasOwn(PANEL_WOLFEK_TOPICS, answer.topic)) {
          const topic = answer.topic as PanelWolfekTopic
          setVideoTopic(topic)
          onLocate(topic)
        }
      }} onAction={(answer) => {
        if (answer.action?.targetId) document.getElementById(answer.action.targetId)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }} />}
    </div>
  </WolfekGlassCard>
}
