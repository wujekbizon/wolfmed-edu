'use client'

import { useState } from 'react'
import { useWolfekGaze } from '@/hooks/useWolfekGaze'
import { PANEL_WOLFEK_VIDEOS } from '@/constants/panelWolfekVideos'
import type { KierunkiWolfekContext, KierunkiWolfekCourseSlug } from '@/types/kierunkiWolfekTypes'
import WolfekAvatar from './WolfekAvatar'
import WolfekGlassCard from './WolfekGlassCard'
import PanelWolfekVideoButton from './PanelWolfekVideoButton'
import PanelWolfekVideoModal from './PanelWolfekVideoModal'
import KierunkiCoursePresentationModal from './KierunkiCoursePresentationModal'
import WolfekQuestionChat from './WolfekQuestionChat'
import WolfekIntro from './WolfekIntro'

export default function KierunkiWolfekCard({ context }: { context: KierunkiWolfekContext }) {
  const [videoCourse, setVideoCourse] = useState<KierunkiWolfekCourseSlug | null>(null)
  const [wolfekVideoOpen, setWolfekVideoOpen] = useState(false)
  const [videoHovered, setVideoHovered] = useState(false)
  const eyes = useWolfekGaze()
  return <>
    <section className="kierunki-wolfek" aria-labelledby="kierunki-wolfek-title">
      <WolfekGlassCard surfaceClassName="!bg-linear-to-br !from-[#fdfbff] !via-[#f8f3fa] !to-[#f2ebf7]"
        avatarRef={eyes.avatar} onPointerMove={eyes.follow} onPointerLeave={eyes.reset} onPointerCancel={eyes.reset}
        avatar={<WolfekAvatar gaze={eyes.gaze} positive={false} supportive interactive videoHover={videoHovered} />}
        avatarActions={<PanelWolfekVideoButton available={Boolean(PANEL_WOLFEK_VIDEOS.first_steps)}
          onClick={() => setWolfekVideoOpen(true)} onHoverChange={setVideoHovered} />}>
        <div className="wolfek-card-content kierunki-wolfek-card-content">
          <WolfekIntro id="kierunki-wolfek-title" description={context.visitor.ownedCourses.length
            ? 'Pomogę Ci wybrać kolejny krok w nauce.' : 'Pomogę Ci wybrać kurs i sposób nauki.'} />
          <WolfekQuestionChat route="kierunki" onAction={(answer) => {
            if (answer.action?.type === 'video' && answer.action.courseSlug) {
              setVideoCourse(answer.action.courseSlug as KierunkiWolfekCourseSlug)
            }
          }} />
        </div>
      </WolfekGlassCard>
    </section>
    {wolfekVideoOpen && <PanelWolfekVideoModal topic="first_steps" onClose={() => {
      setWolfekVideoOpen(false)
      requestAnimationFrame(() => document.querySelector<HTMLButtonElement>(
        '.kierunki-wolfek .panel-wolfek-video-button')?.focus())
    }} />}
    {videoCourse && <KierunkiCoursePresentationModal courseSlug={videoCourse} onClose={() => {
      setVideoCourse(null)
      requestAnimationFrame(() => document.querySelector<HTMLButtonElement>(
        '.kierunki-wolfek [data-wolfek-response-action]')?.focus())
    }} />}
  </>
}
