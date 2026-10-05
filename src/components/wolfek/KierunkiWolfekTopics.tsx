'use client'

import { ChevronRight } from 'lucide-react'
import Button from '@/components/ui/Button'
import { KIERUNKI_WOLFEK_FEATURED_TOPICS, KIERUNKI_WOLFEK_TOPICS, KIERUNKI_WOLFEK_TOPIC_LABELS } from '@/constants/kierunkiWolfek'
import { KIERUNKI_WOLFEK_ICONS } from '@/constants/kierunkiWolfekIcons'
import type { KierunkiWolfekTopicsProps } from '@/types/kierunkiWolfekTypes'

export default function KierunkiWolfekTopics({ pending, selectedTopic, onSelect }: KierunkiWolfekTopicsProps) {
  return <div className="kierunki-wolfek-topic-picker">
    <div className="kierunki-wolfek-topics">
      {KIERUNKI_WOLFEK_FEATURED_TOPICS.map((topic) => {
        const Icon = KIERUNKI_WOLFEK_ICONS[topic]
        return <Button key={topic} variant="secondary" size="sm" disabled={pending} className="practice-orbit-action"
          aria-pressed={selectedTopic === topic} onClick={() => onSelect(topic)}>
          <span className="kierunki-wolfek-topic-icon"><Icon size={19} aria-hidden="true" /></span>
          <span>{KIERUNKI_WOLFEK_TOPIC_LABELS[topic] ?? KIERUNKI_WOLFEK_TOPICS[topic].label}</span>
          <ChevronRight size={15} className="kierunki-wolfek-topic-arrow" aria-hidden="true" />
        </Button>
      })}
    </div>
  </div>
}
