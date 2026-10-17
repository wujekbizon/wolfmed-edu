'use client'

import Button from '@/components/ui/Button'
import { PANEL_WOLFEK_TOPICS } from '@/constants/panelWolfek'
import { PANEL_WOLFEK_TOPIC_ICONS } from '@/constants/panelWolfekTopicIcons'
import type { PanelWolfekTopic } from '@/types/panelWolfekTypes'

export default function PanelWolfekTopicButton({ topic, pending, onSelect }: {
  topic: PanelWolfekTopic
  pending: boolean
  onSelect: (topic: PanelWolfekTopic) => void
}) {
  const Icon = PANEL_WOLFEK_TOPIC_ICONS[topic]
  return <Button type="button" variant="secondary" size="sm" disabled={pending}
    className="practice-orbit-action panel-wolfek-topic" onClick={() => onSelect(topic)}>
    <span aria-hidden="true"><Icon size={17} strokeWidth={1.8} /></span>
    <span>{PANEL_WOLFEK_TOPICS[topic].label}</span>
  </Button>
}
