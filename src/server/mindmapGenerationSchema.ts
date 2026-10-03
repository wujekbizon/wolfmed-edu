import { z } from 'zod'
import { MindMapNodeSchema } from '@/server/schema'
import { TOPIC_TYPES } from '@/types/mindmapTypes'
import { MINDMAP_MAX_NODES } from '@/constants/mindmapGeneration'

const storedMetadata = MindMapNodeSchema.shape.metadata.unwrap()

const node = z.object({
  label: MindMapNodeSchema.shape.label,
  parentIndex: z.number().int().min(0).nullable(),
  notes: storedMetadata.shape.notes.unwrap().trim().min(1),
  tags: z.array(z.string()).catch([]),
  category: z.string().catch('other'),
})

export const MindMapGenerationSchema = z.discriminatedUnion('status', [
  z.object({ status: z.literal('no_source'), topicType: z.null(), nodes: z.array(z.unknown()).length(0) }).strict(),
  z.object({
    status: z.literal('map'),
    topicType: z.enum(TOPIC_TYPES).catch('generic'),
    nodes: z.array(node).min(4).max(MINDMAP_MAX_NODES),
  }).strict(),
])
