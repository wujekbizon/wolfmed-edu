import 'server-only'
import { FunctionCallingConfigMode } from '@google/genai'
import { SYSTEM_PROMPT, buildGroundedPrompt, getNoDataFoundMessage } from '@/helpers/rag-prompts'
import { formatContextChunks } from '@/helpers/formatContextChunks'
import type { RetrievedContext, SourceRef } from '@/types/retrievalTypes'
import { stripContentParameter } from '@/helpers/stripContentParameter'
import { stripContextCitations } from '@/helpers/stripContextCitations'
import { executeToolLocally, type ToolResult } from '@/server/tools/executor'
import { getGoogleAI, logUsage } from './client'
import { parseGoogleApiError } from './errors'

// Thinking is ON by default for gemini-2.5-flash and reasoning tokens bill at
// the (8×) output rate. None of the RAG paths need it, so disable everywhere.
const NO_THINKING = { thinkingBudget: 0 } as const

// Persona first (fully static, prompt-cache friendly), then the per-student
// memory block (Path A: active policies + preferences) when provided.
function composeSystemInstruction(memoryPrefix?: string): string {
  return [SYSTEM_PROMPT, memoryPrefix?.trim()].filter(Boolean).join('\n\n')
}

// Memory-answered guard (M3): questions about the student's own state are
// answered from their memory context alone — a single Flash-Lite call, no corpus
// retrieval, no Flash grounding.
const MEMORY_ANSWER_SYSTEM = `Jesteś asystentem nauki Wolfmed. Odpowiadasz na pytania ucznia o jego własny postęp, cele, preferencje i aktywności WYŁĄCZNIE na podstawie poniższych informacji z pamięci. Jeśli brakuje informacji, powiedz to wprost i zaproponuj, co uczeń może zrobić. Odpowiadaj po polsku, zwięźle i przyjaźnie.`

export async function answerFromMemory(
  question: string,
  memoryContext: string
): Promise<{ answer: string }> {
  const ai = getGoogleAI()
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-lite',
    contents: `INFORMACJE Z PAMIĘCI:\n${memoryContext}\n\nPytanie ucznia: ${question}`,
    config: { systemInstruction: MEMORY_ANSWER_SYSTEM, thinkingConfig: NO_THINKING },
  })
  logUsage('answerFromMemory', response)
  return { answer: response.text || 'Nie mam jeszcze wystarczających informacji, aby odpowiedzieć.' }
}

export interface GroundedAnswerOptions {
  userContext?: string | undefined
  memoryTail?: string | undefined
  memoryPrefix?: string | undefined
}

/**
 * Writes an answer from context that has already been retrieved.
 *
 * Generation only — retrieval belongs to retrieveContext, which is the single
 * place that decides what a feature may read. Splitting them is what stops a
 * second retrieval pipeline growing back inside the generator.
 *
 * There is deliberately no managed-grounding fallback. The previous version,
 * when disciplined retrieval returned nothing, handed the full prose question
 * plus formatting instructions to the grounding tool — the most diluted query
 * possible, at exactly the moment the precise one had already failed. Nothing
 * retrieved now means nothing to answer from, and saying so is the honest
 * outcome.
 */
export async function generateGroundedAnswer(
  question: string,
  context: RetrievedContext,
  options: GroundedAnswerOptions = {}
): Promise<{ answer: string; sources: SourceRef[] }> {
  try {
    if (context.chunks.length === 0) {
      return { answer: getNoDataFoundMessage(), sources: [] }
    }

    const ai = getGoogleAI()

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: buildGroundedPrompt({
        question,
        contextText: formatContextChunks(context.chunks),
        userContext: options.userContext,
        memoryTail: options.memoryTail,
        hasCanonical: context.hasCanonical,
      }),
      config: {
        systemInstruction: composeSystemInstruction(options.memoryPrefix),
        thinkingConfig: NO_THINKING,
      },
    })
    logUsage('generateGroundedAnswer', response)

    const answer = response.text || ''
    if (!answer) {
      throw new Error('Empty response from Gemini')
    }

    return { answer: stripContextCitations(answer), sources: context.sources }
  } catch (error) {
    console.error('Error generating grounded answer:', error)
    throw parseGoogleApiError(error)
  }
}

type PdfFile = { title: string; base64: string; mimeType: string }

interface ToolDispatchInput {
  // What the student actually asked for. Without it the model only sees the
  // meta-instruction and the source material, so „/planuj Opiekun medyczny"
  // plans how to use planuj_tool instead of planning the subject.
  request: string
  content?: string | undefined
  pdfFiles?: PdfFile[] | undefined
  // Arguments the caller already knows, applied over whatever the dispatch model
  // extracted. A count the student typed into a field is data, not something to
  // recover from prose — extraction failing is how „10 pytań" became 5.
  overrideArgs?: Record<string, unknown> | undefined
}

export async function executeToolWithContent(
  toolName: string,
  toolDefinition: { name: string; description: string; parameters: any },
  { request, content, pdfFiles, overrideArgs }: ToolDispatchInput
): Promise<{ answer: string; toolResults: any }> {
  try {
    const ai = getGoogleAI()

    // Build content parts - text + any PDF files as inline data
    const parts: Array<
      { text: string } | { inlineData: { data: string; mimeType: string } }
    > = []

    // Add PDF files as inline data (they become PRIMARY sources)
    if (pdfFiles && pdfFiles.length > 0) {
      for (const pdf of pdfFiles) {
        parts.push({
          inlineData: {
            data: pdf.base64,
            mimeType: pdf.mimeType
          }
        })
      }
    }

    // The request comes first: it carries the subject and any parameters the
    // student named (liczba pytań, kategoria), which the tool's own arguments
    // are meant to be filled from.
    let prompt = `ZADANIE: wywołaj narzędzie ${toolName}.

POLECENIE UŻYTKOWNIKA:
${request}

`
    if (pdfFiles && pdfFiles.length > 0) {
      prompt += `GŁÓWNE ŹRÓDŁO: Powyższy plik PDF został wybrany przez użytkownika. Przeczytaj go dokładnie i użyj jego treści jako podstawy dla narzędzia.

`
    }

    if (content) {
      prompt += `MATERIAŁ ŹRÓDŁOWY:
${content}

`
    }

    // The model only supplies `content` when it is the one who can read it —
    // i.e. from an attached PDF. When we already hold the text, echoing it back
    // as a function argument costs an output token per input token and, past a
    // dozen retrieved chunks, truncates the call so no function call arrives at
    // all. That is what surfaced as "Tool planuj_tool was not called by Gemini".
    const hasPdf = Boolean(pdfFiles && pdfFiles.length > 0)
    const dispatchDefinition = hasPdf ? toolDefinition : stripContentParameter(toolDefinition)

    prompt += `WAŻNE: Wywołaj funkcję ${toolName}. Wypełnij jej parametry dokładnie według POLECENIA UŻYTKOWNIKA — jeśli podano liczbę (np. liczbę pytań), użyj dokładnie tej liczby, a nie wartości domyślnej.`
    prompt += hasPdf
      ? ` Jako 'content' przekaż treść odczytaną z pliku PDF.`
      : ` NIE przepisuj materiału źródłowego do parametrów — zostanie dołączony automatycznie.`

    parts.push({ text: prompt })

    // Wrap in role/parts structure for multimodal content
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-lite',
      contents: [
        {
          role: 'user',
          parts: parts
        }
      ],
      config: {
        systemInstruction: SYSTEM_PROMPT,
        tools: [
          {
            functionDeclarations: [dispatchDefinition]
          }
        ],
        toolConfig: {
          functionCallingConfig: {
            mode: FunctionCallingConfigMode.ANY,
            allowedFunctionNames: [toolName]
          }
        },
        thinkingConfig: NO_THINKING
      }
    })
    logUsage('executeToolWithContent:dispatch', response)

    const call = response.functionCalls?.[0]

    // The dispatch fills the optional arguments — focus, diagramType, category.
    // The content and the count are already known here, so a missing function
    // call is recoverable: run the tool with what we hold rather than failing a
    // request the student has been waiting on. The forced ANY mode makes this
    // rare, but truncation and safety blocks both land here.
    if (!call?.name) {
      console.warn(`[tools] ${toolName}: no function call returned, dispatching with server-side arguments`)
    }

    // Content the model extracted from the PDF, else our source material, else
    // the request itself — a tool handed nothing invents its own subject.
    const modelArgs = call?.name === toolName ? (call.args ?? {}) : {}
    const toolContent = modelArgs.content || content || request
    const args = { ...modelArgs, content: toolContent, ...overrideArgs }
    const result = await executeToolLocally(toolName, args)

    // A tool that produces no cell produced prose, and that prose IS the
    // answer — /podsumuj generated a summary that useRagToolResults then
    // dropped, because it only inserts results carrying a cellType. Returning
    // it directly also skips the confirmation call, which has nothing left to
    // confirm.
    if (!result.cellType) {
      return {
        answer: result.content,
        toolResults: { [toolName]: result } as Record<string, ToolResult>,
      }
    }

    const finalPrompt = `Tool ${toolName} executed successfully.

Result: ${JSON.stringify(result, null, 2)}

Please provide a brief confirmation message to the user about what was created.`

    const finalResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash-lite',
      contents: finalPrompt,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        thinkingConfig: NO_THINKING
      }
    })
    logUsage('executeToolWithContent:confirm', finalResponse)

    return {
      answer: finalResponse.text || 'Content created successfully.',
      toolResults: { [toolName]: result } as Record<string, ToolResult>,
    }
  } catch (error) {
    console.error('Error in tool execution:', error)
    throw parseGoogleApiError(error)
  }
}
