import type { MindMapNode, MindMapNodeMetadata, TopicType } from './mindmapTypes'
import type { GenerateContentParameters, GenerateContentResponse } from '@google/genai'

export interface MindMapDraftNode {
  label: string
  children: MindMapDraftNode[]
  metadata?: MindMapDraftMetadata
  collapsed?: boolean
}

export interface MindMapDraftMetadata extends Omit<MindMapNodeMetadata, 'category'> {
  category?: string
}

export interface MindMapGeneratedNode {
  label: string
  parentIndex: number | null
  notes: string
  tags?: string[]
  category?: string
}

export type MindMapGenerationResult =
  | { status: 'no_source' }
  | { status: 'map'; root: MindMapNode; topicType: TopicType }

export type MindMapGenerateResponse = (prompt: string) => Promise<string | undefined>

export type MindMapModelGenerate = (
  request: GenerateContentParameters
) => Promise<Pick<GenerateContentResponse, 'text'>>
