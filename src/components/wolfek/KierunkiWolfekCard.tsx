'use client'

import { startTransition, useActionState, useRef, useState } from 'react'
import Link from 'next/link'
import { ArrowUp, Video } from 'lucide-react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Label from '@/components/ui/Label'
import FieldError from '@/components/FieldError'
import { useToastMessage } from '@/hooks/useToastMessage'
import { EMPTY_FORM_STATE } from '@/constants/formState'
import { KIERUNKI_WOLFEK_VIDEOS } from '@/constants/kierunkiWolfekVideos'
import { PANEL_WOLFEK_VIDEOS } from '@/constants/panelWolfekVideos'
import { askKierunkiWolfekAction, getKierunkiWolfekTopicAction } from '@/actions/kierunki-wolfek'
import { useWolfekGaze } from '@/hooks/useWolfekGaze'
import type { KierunkiWolfekAnswer, KierunkiWolfekAskState, KierunkiWolfekContext, KierunkiWolfekCourseSlug, KierunkiWolfekTopic } from '@/types/kierunkiWolfekTypes'
import WolfekAvatar from './WolfekAvatar'
import WolfekGlassCard from './WolfekGlassCard'
import PanelWolfekVideoButton from './PanelWolfekVideoButton'
import PanelWolfekVideoModal from './PanelWolfekVideoModal'
import KierunkiWolfekTopics from './KierunkiWolfekTopics'
import KierunkiCoursePresentationModal from './KierunkiCoursePresentationModal'

export default function KierunkiWolfekCard({ context }: { context: KierunkiWolfekContext }) {
  const [state, action, pending] = useActionState(askKierunkiWolfekAction, EMPTY_FORM_STATE as KierunkiWolfekAskState)
  const [manualAnswer, setManualAnswer] = useState<KierunkiWolfekAnswer | null | undefined>(undefined)
  const [topicPending, setTopicPending] = useState(false)
  const [videoCourse, setVideoCourse] = useState<KierunkiWolfekCourseSlug | null>(null)
  const [wolfekVideoOpen, setWolfekVideoOpen] = useState(false)
  const [videoHovered, setVideoHovered] = useState(false)
  const videoButton = useRef<HTMLButtonElement>(null)
  const eyes = useWolfekGaze()
  const answer = pending || topicPending ? null : manualAnswer === undefined ? state.answer : manualAnswer
  const toast = useToastMessage(state)

  const onTopic = (topic: KierunkiWolfekTopic) => {
    setManualAnswer(null)
    setTopicPending(true)
    startTransition(async () => {
      try {
        setManualAnswer(await getKierunkiWolfekTopicAction(topic) ?? {
          topic, text: 'Daj mi chwilę, sprawdzę jeszcze raz. Możesz też spróbować za moment.',
        })
      } catch {
        setManualAnswer({ topic, text: 'Daj mi chwilę, sprawdzę jeszcze raz. Możesz też spróbować za moment.' })
      }
      finally { setTopicPending(false) }
    })
  }

  return <>
    <section className="kierunki-wolfek" aria-labelledby="kierunki-wolfek-title">
      <WolfekGlassCard className="!px-2 !pt-2 !pb-5 max-[480px]:!px-1 max-[480px]:!pt-1 max-[480px]:!pb-5"
        glassClassName="![--wolfek-size:6.5rem] ![--wolfek-left:-.35rem] ![--wolfek-bottom:-.75rem]"
        surfaceClassName="!bg-linear-to-br !from-[#fdfbff] !via-[#f8f3fa] !to-[#f2ebf7]"
        avatarRef={eyes.avatar} onPointerMove={eyes.follow} onPointerLeave={eyes.reset}
        onPointerCancel={eyes.reset} avatar={<WolfekAvatar gaze={eyes.gaze} positive={false}
          supportive interactive videoHover={videoHovered} />}>
        <div className="wolfek-card-content kierunki-wolfek-card-content">
          <div className="kierunki-wolfek-intro">
            <h2 id="kierunki-wolfek-title">Hej, jestem Wolfek!</h2>
            <p>{context.visitor.ownedCourses.length
              ? 'Masz już swoje kursy. Pomogę Ci wybrać, co warto zrobić dalej.'
              : 'Opowiedz, czego szukasz. Podpowiem, który kierunek i plan pasuje do Twojego celu.'}</p>
          </div>
          <div className="kierunki-wolfek-chat">
            <KierunkiWolfekTopics pending={pending || topicPending} selectedTopic={answer?.topic ?? null} onSelect={onTopic} />
            {(pending || topicPending) && <p className="kierunki-wolfek-answer" role="status">Wolfek sprawdza…</p>}
            {answer && <div className="kierunki-wolfek-answer" role="status">
              <p>{answer.text}</p>
              <div className="kierunki-wolfek-answer-actions">
                {answer.href && <Link href={answer.href}>Sprawdź szczegóły →</Link>}
                {answer.courseSlug && KIERUNKI_WOLFEK_VIDEOS[answer.courseSlug] && <Button ref={videoButton}
                  type="button" variant="ghost" size="sm" onClick={() => setVideoCourse(answer.courseSlug!)}>
                  <Video size={16} /> Zobacz prezentację</Button>}
              </div>
            </div>}
            {state.status === 'SUCCESS' && state.answer === null && !manualAnswer &&
              <p className="kierunki-wolfek-answer" role="status">Nie jestem pewien. Wybierz jeden z tematów albo zapytaj inaczej.</p>}
            <form action={action} onSubmit={() => setManualAnswer(undefined)}>
              <Label htmlFor="kierunki-wolfek-question" label="Lub zadaj własne pytanie" className="kierunki-wolfek-label" />
              <div className="kierunki-wolfek-question-row">
                <Input id="kierunki-wolfek-question" name="question" type="text" className="kierunki-wolfek-input"
                  placeholder="Np. co daje Premium?" />
                <Button type="submit" size="sm" shape="pill" variant="secondary" className="kierunki-wolfek-send"
                  aria-label="Wyślij pytanie" disabled={pending || topicPending}><ArrowUp size={19} aria-hidden="true" /></Button>
              </div>
              <FieldError name="question" formState={state} />{toast}
            </form>
          </div>
        </div>
        <PanelWolfekVideoButton available={Boolean(PANEL_WOLFEK_VIDEOS.first_steps)}
          onClick={() => setWolfekVideoOpen(true)} onHoverChange={setVideoHovered} />
      </WolfekGlassCard>
    </section>
    {wolfekVideoOpen && <PanelWolfekVideoModal topic="first_steps" onClose={() => {
      setWolfekVideoOpen(false)
      requestAnimationFrame(() => document.querySelector<HTMLButtonElement>(
        '.kierunki-wolfek .panel-wolfek-video-button',
      )?.focus({ preventScroll: true }))
    }} />}
    {videoCourse && <KierunkiCoursePresentationModal courseSlug={videoCourse} onClose={() => {
      setVideoCourse(null)
      requestAnimationFrame(() => videoButton.current?.focus({ preventScroll: true }))
    }} />}
  </>
}
