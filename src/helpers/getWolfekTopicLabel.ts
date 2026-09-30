import { PANEL_WOLFEK_TOPICS } from '@/constants/panelWolfek'
import { KIERUNKI_WOLFEK_TOPICS, KIERUNKI_WOLFEK_TOPIC_LABELS } from '@/constants/kierunkiWolfek'
import type { PanelWolfekTopic } from '@/types/panelWolfekTypes'
import type { KierunkiWolfekTopic } from '@/types/kierunkiWolfekTypes'

export function getWolfekTopicLabel(source: string, topic: string | null): string {
  if (!topic || topic === 'unknown') return 'Bez rozpoznanego tematu'
  if (topic === 'other') return 'Poza dostępnymi tematami'
  if (source === 'panel') return PANEL_WOLFEK_TOPICS[topic as PanelWolfekTopic]?.label ?? topic
  return KIERUNKI_WOLFEK_TOPIC_LABELS[topic as KierunkiWolfekTopic] ??
    KIERUNKI_WOLFEK_TOPICS[topic as KierunkiWolfekTopic]?.label ?? topic
}
