import "server-only"
import { buildSystemPrompt, buildUserPrompt } from "./prompts"
import { normalizeTree } from "./normalizeTree"
import { validateTree } from "./validateTree"
import type { MindMapNode, TopicType } from "@/types/mindmapTypes"
import { TOPIC_TYPES } from "@/types/mindmapTypes"
// Shares the RAG feature's Vertex AI client (single-sourced project/location +
// ADC-or-service-account auth that also works on Vercel).
import { getGoogleAI } from "@/server/vertex-rag/client"
import { retrieveCorpusContext } from "@/server/vertex-rag/context"
import { RAG_TOP_K_BROAD } from "@/constants/rag"
import { queryFileSearchOnly } from "@/server/vertex-rag/generate"

const MODEL = process.env.MINDMAP_MODEL || "gemini-2.5-flash"
const MAX_ATTEMPTS = 3
// Thinking off: a corpus-grounded map is summarising/structuring a source, not
// reasoning from scratch. If map quality drops, give it a small budget instead.
const NO_THINKING = { thinkingBudget: 0 } as const

// Grounds the map in the knowledge base so its leaves correspond to real corpus
// content (and are therefore answerable by the tutor, which queries the same
// corpus). Primary path is retrieveCorpusContext (cheap, raw chunks); on endpoint
// error it falls back to the proven managed-grounding query. Returns null when
// the topic genuinely isn't in the corpus.
async function getCorpusContext(topic: string): Promise<string | null> {
  try {
    const corpus = await retrieveCorpusContext(topic, { topK: RAG_TOP_K_BROAD })
    if (!corpus) return null
    return corpus.text
  } catch (error) {
    console.error("[mindmap] retrieveCorpusContext failed, falling back to grounded query:", error)
    const result = await queryFileSearchOnly(`Przedstaw najważniejsze informacje na temat: ${topic}`)
    const answer = result.answer?.trim()
    if (!answer || /nie mam tej informacji|nie znalazłem/i.test(answer)) return null
    return answer
  }
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

  // Ground the map in the corpus so it stays consistent with the tutor.
  const context = await getCorpusContext(topic)
  if (!context) {
    throw new Error("Ten temat nie znajduje się jeszcze w bazie wiedzy. Dodaj materiały do bazy i spróbuj ponownie.")
  }

  let feedback = ""
  let lastError = "Nie udało się wygenerować mapy."

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const base = buildUserPrompt(topic, context)
    const userPrompt = feedback ? `${base}\n\nPopraw błędy z poprzedniej próby:\n${feedback}` : base

    const response = await ai.models.generateContent({
      model: MODEL,
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        temperature: 0.4,
        thinkingConfig: NO_THINKING,
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
