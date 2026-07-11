import "server-only"
import { GoogleGenAI } from "@google/genai"
import { buildSystemPrompt, buildUserPrompt } from "./prompts"
import { normalizeTree } from "./normalizeTree"
import { validateTree } from "./validateTree"
import type { MindMapNode, TopicType } from "@/types/mindmapTypes"
import { TOPIC_TYPES } from "@/types/mindmapTypes"

const MODEL = process.env.MINDMAP_MODEL || "gemini-2.5-flash"
const MAX_ATTEMPTS = 3

// Same Vertex AI project/location the RAG feature uses.
function getGoogleAI() {
  return new GoogleGenAI({
    project: "project-9d10f80c-d5df-459f-8d8",
    location: "europe-west3",
    vertexai: true,
  })
}

function stripFences(text: string): string {
  return text
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim()
}

function resolveTopicType(root: MindMapNode): TopicType {
  const raw = root.metadata?.topicType
  return raw && TOPIC_TYPES.includes(raw) ? raw : "generic"
}

export interface GeneratedMindMap {
  root: MindMapNode
  topicType: TopicType
}

/**
 * Generates a mind-map tree from a free-text topic via Gemini, then normalizes
 * and validates. Normalization runs before validation so most model drift is
 * repaired rather than rejected; on genuine failure it retries with the
 * validation errors appended, up to MAX_ATTEMPTS. Throws on total failure.
 */
export async function generateTree(topic: string): Promise<GeneratedMindMap> {
  const ai = getGoogleAI()
  const systemPrompt = buildSystemPrompt()

  let feedback = ""
  let lastError = "Nie udało się wygenerować mapy."

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const userPrompt = feedback ? `${buildUserPrompt(topic)}\n\nPopraw błędy z poprzedniej próby:\n${feedback}` : buildUserPrompt(topic)

    const response = await ai.models.generateContent({
      model: MODEL,
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        temperature: 0.4,
      },
    })

    const raw = response.text
    if (!raw) {
      lastError = "Model nie zwrócił odpowiedzi."
      continue
    }

    let parsed: MindMapNode
    try {
      parsed = JSON.parse(stripFences(raw)) as MindMapNode
    } catch {
      lastError = "Model zwrócił nieprawidłowy JSON."
      feedback = lastError
      continue
    }

    const normalized = normalizeTree(parsed)
    const result = validateTree(normalized)
    if (result.valid) {
      return { root: normalized, topicType: resolveTopicType(normalized) }
    }

    lastError = result.errors[0] ?? lastError
    feedback = result.errors.join("; ")
  }

  throw new Error(lastError)
}
