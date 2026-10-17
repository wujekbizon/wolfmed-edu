'use client'

import { useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import Button from '@/components/ui/Button'
import { PANEL_WOLFEK_FEATURED_TOPICS, PANEL_WOLFEK_MORE_TOPICS, PANEL_WOLFEK_RESULTS_TOPICS } from '@/constants/panelWolfek'
import type { PanelWolfekRoute, PanelWolfekTopic } from '@/types/panelWolfekTypes'
import PanelWolfekTopicButton from './PanelWolfekTopicButton'

export default function PanelWolfekTopicButtons({ route, onSelect, pending }: {
  route: PanelWolfekRoute
  onSelect: (topic: PanelWolfekTopic) => void
  pending: boolean
}) {
  const [expanded, setExpanded] = useState(false)
  const reduced = useReducedMotion()
  const topics = route === 'panel.results' ? PANEL_WOLFEK_RESULTS_TOPICS : PANEL_WOLFEK_FEATURED_TOPICS
  const moreTopics = route === 'panel.results' ? [] : PANEL_WOLFEK_MORE_TOPICS
  const select = (topic: PanelWolfekTopic) => { setExpanded(false); onSelect(topic) }

  return <div className="panel-wolfek-topic-picker">
    <div className="panel-wolfek-topics">
      {topics.map((topic) => <PanelWolfekTopicButton key={topic} topic={topic}
        pending={pending} onSelect={select} />)}
    </div>
    {moreTopics.length > 0 && <>
    <Button type="button" size="sm" variant="ghost" className="panel-wolfek-more-toggle"
      aria-expanded={expanded} disabled={pending} onClick={() => setExpanded((value) => !value)}>
      {expanded ? 'Mniej tematów' : 'Więcej tematów'} <span aria-hidden="true">{expanded ? '−' : '+'}</span>
    </Button>
    <AnimatePresence initial={false}>
      {expanded && <motion.div className="panel-wolfek-more-wrap" key="more"
        initial={reduced ? false : { height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
        transition={{ duration: reduced ? 0 : .24, ease: 'easeOut' }}>
        <div className="panel-wolfek-more-topics">
          {moreTopics.map((topic) => <PanelWolfekTopicButton key={topic} topic={topic}
            pending={pending} onSelect={select} />)}
        </div>
      </motion.div>}
    </AnimatePresence>
    </>}
  </div>
}
