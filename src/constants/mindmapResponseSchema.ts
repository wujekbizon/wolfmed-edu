import { Type, type Schema } from '@google/genai'

// Vertex rejects complex nested tree schemas; parent indices keep the wire format flat.
export const MINDMAP_RESPONSE_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    status: { type: Type.STRING, enum: ['map', 'no_source'] },
    topicType: { type: Type.STRING, nullable: true },
    nodes: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          label: { type: Type.STRING },
          parentIndex: { type: Type.INTEGER, nullable: true },
          notes: { type: Type.STRING },
          tags: { type: Type.ARRAY, items: { type: Type.STRING } },
          category: { type: Type.STRING },
        },
        required: ['label', 'parentIndex', 'notes', 'tags', 'category'],
        propertyOrdering: ['label', 'parentIndex', 'notes', 'tags', 'category'],
      },
    },
  },
  required: ['status', 'topicType', 'nodes'],
  propertyOrdering: ['status', 'topicType', 'nodes'],
}
