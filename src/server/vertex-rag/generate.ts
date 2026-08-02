import 'server-only'
import { FunctionCallingConfigMode } from '@google/genai'
import { SYSTEM_PROMPT, buildGroundedPrompt, enhanceUserQuery } from '@/helpers/rag-prompts'
import { getRagConfig } from '@/server/rag-queries'
import { executeToolLocally, type ToolResult } from '@/server/tools/executor'
import { getGoogleAI, logUsage } from './client'
import { retrieveCorpusContext } from './context'
import { parseGoogleApiError } from './errors'

// Thinking is ON by default for gemini-2.5-flash and reasoning tokens bill at
// the (8×) output rate. None of the RAG paths need it, so disable everywhere.
const NO_THINKING = { thinkingBudget: 0 } as const

// Persona first (fully static, prompt-cache friendly), then the per-student
// memory block (Path A: active policies + preferences) when provided.
function composeSystemInstruction(memoryPrefix?: string): string {
  return [SYSTEM_PROMPT, memoryPrefix?.trim()].filter(Boolean).join('\n\n')
}

export async function queryWithFileSearch(
  question: string,
  storeName?: string,
  additionalContext?: string,
  tools?: Array<{ name: string; description: string; parameters: any }>
): Promise<{ answer: string; sources?: string[]; toolResults?: any }> {
  try {
    const ai = getGoogleAI()

    let fileSearchStoreName = storeName

    if (!fileSearchStoreName) {
      const config = await getRagConfig()
      fileSearchStoreName = config?.storeName
    }

    if (!fileSearchStoreName) {
      throw new Error('File Search Store nie jest skonfigurowany')
    }

    const corpus = await retrieveCorpusContext(question, { corpusName: fileSearchStoreName })

    const enhancedQuery = corpus
      ? buildGroundedPrompt({ question, corpusText: corpus.text, userContext: additionalContext })
      : enhanceUserQuery(additionalContext ? `${question}\n\n${additionalContext}` : question)

    // Note: `fileSearch` is a Gemini Developer API tool. Vertex AI's RAG Engine
    // exposes retrieval through `retrieval.vertexRagStore` instead, pointed at
    // the ragCorpus resource name. Only needed as a fallback — when retrieval
    // returned chunks they are already inline.
    const configTools: any[] = corpus
      ? []
      : [
          {
            retrieval: {
              vertexRagStore: {
                ragCorpora: [fileSearchStoreName]
              }
            }
          }
        ]

    if (tools && tools.length > 0) {
      configTools.push({
        functionDeclarations: tools.map((tool) => ({
          name: tool.name,
          description: tool.description,
          parameters: tool.parameters
        }))
      })
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: enhancedQuery,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        tools: configTools,
        thinkingConfig: NO_THINKING
      }
    })
    logUsage('queryWithFileSearch:grounding', response)

    if (
      response.functionCalls &&
      Array.isArray(response.functionCalls) &&
      response.functionCalls.length > 0
    ) {
      const executedTools: Array<{ name: string; result: ToolResult }> = []

      for (const call of response.functionCalls) {
        if (call.name) {
          try {
            const result = await executeToolLocally(call.name, call.args || {})
            executedTools.push({ name: call.name, result })
          } catch (error) {
            console.error(`Failed to execute tool ${call.name}:`, error)
            executedTools.push({
              name: call.name,
              result: {
                content: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
                metadata: { error: true }
              }
            })
          }
        }
      }

      const toolResultsText = executedTools
        .map(({ name, result }) => {
          return `Tool: ${name}\nResult: ${JSON.stringify(result, null, 2)}`
        })
        .join('\n\n')

      const finalPrompt = `${enhancedQuery}

TOOL EXECUTION RESULTS:
${toolResultsText}

Based on the tool execution results above, please provide a comprehensive final answer incorporating the generated content.`

      const finalResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash-lite',
        contents: finalPrompt,
        config: {
          systemInstruction: SYSTEM_PROMPT,
          thinkingConfig: NO_THINKING
        }
      })
      logUsage('queryWithFileSearch:wrap', finalResponse)

      const finalAnswer = finalResponse.text || ''

      if (!finalAnswer) {
        throw new Error('Empty response from Gemini after tool execution')
      }

      const toolResultsFormatted: Record<string, ToolResult> = {}
      executedTools.forEach(({ name, result }) => {
        toolResultsFormatted[name] = result
      })

      return {
        answer: finalAnswer,
        sources: corpus?.sources ?? [],
        toolResults: toolResultsFormatted
      }
    }

    const answer = response.text || ''

    if (!answer) {
      throw new Error('Empty response from Gemini')
    }

    return {
      answer,
      sources: corpus?.sources ?? [],
      toolResults: undefined
    }
  } catch (error) {
    console.error('Error querying with file search:', error)

    if (error instanceof Error) {
      if (error.message.includes('not configured')) {
        throw error
      }
      if (error.message.includes('Empty response')) {
        throw new Error('Nie znalazłem odpowiedzi w dokumentach')
      }
    }

    throw new Error('Wystąpił błąd podczas wyszukiwania odpowiedzi')
  }
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

export interface CorpusAnswerOptions {
  // The subject alone, when the question is prose the user reads rather than a
  // search phrase (a mind-map node sends its label + breadcrumb here).
  searchQuery?: string | undefined
  storeName?: string | undefined
  userContext?: string | undefined
  memoryTail?: string | undefined
  memoryPrefix?: string | undefined
}

/**
 * Answers from the corpus: retrieve with the bare subject, then generate with
 * the retrieved chunks in the prompt. Falls back to managed grounding only when
 * retrieval comes back empty.
 */
export async function queryFileSearchOnly(
  question: string,
  options: CorpusAnswerOptions = {}
): Promise<{ answer: string; sources?: string[] }> {
  try {
    const ai = getGoogleAI()

    let fileSearchStoreName = options.storeName

    if (!fileSearchStoreName) {
      const config = await getRagConfig()
      fileSearchStoreName = config?.storeName
    }

    if (!fileSearchStoreName) {
      throw new Error('File Search Store nie jest skonfigurowany')
    }

    const corpus = await retrieveCorpusContext(options.searchQuery || question, {
      corpusName: fileSearchStoreName,
    })

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: corpus
        ? buildGroundedPrompt({
            question,
            corpusText: corpus.text,
            userContext: options.userContext,
            memoryTail: options.memoryTail,
          })
        : enhanceUserQuery(question),
      config: {
        systemInstruction: composeSystemInstruction(options.memoryPrefix),
        // No retrieval tool once the context is inline — the corpus was already
        // searched with the subject alone, which is the whole point.
        ...(corpus
          ? {}
          : { tools: [{ retrieval: { vertexRagStore: { ragCorpora: [fileSearchStoreName] } } }] }),
        thinkingConfig: NO_THINKING
      }
    })
    logUsage(corpus ? 'queryFileSearchOnly:retrieved' : 'queryFileSearchOnly:grounded', response)

    const answer = response.text || ''

    if (!answer) {
      throw new Error('Empty response from Gemini')
    }

    return {
      answer,
      sources: corpus?.sources ?? []
    }
  } catch (error) {
    console.error('Error in RAG-only query:', error)
    throw parseGoogleApiError(error)
  }
}

type PdfFile = { title: string; base64: string; mimeType: string }

export async function executeToolWithContent(
  toolName: string,
  content: string,
  toolDefinition: { name: string; description: string; parameters: any },
  pdfFiles?: PdfFile[]
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

    // Build the prompt - tell the model to READ the PDF and use it for the tool
    let prompt = `ZADANIE: Użyj narzędzia ${toolName} aby przetworzyć treść.

`
    if (pdfFiles && pdfFiles.length > 0) {
      prompt += `GŁÓWNE ŹRÓDŁO: Powyższy plik PDF został wybrany przez użytkownika. Przeczytaj go dokładnie i użyj jego treści jako podstawy dla narzędzia.

`
    }

    if (content) {
      prompt += `DODATKOWE INFORMACJE:
${content}

`
    }

    prompt += `WAŻNE: Musisz teraz wywołać funkcję ${toolName}, przekazując treść z PDF (jeśli jest) jako parametr 'content'.`

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
            functionDeclarations: [toolDefinition]
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

    if (response.functionCalls && response.functionCalls.length > 0) {
      const call = response.functionCalls[0]

      if (!call || !call.name) {
        throw new Error('Invalid function call from Gemini')
      }

      // Use the content the model extracted from PDF, fallback to our text content
      const toolContent = call.args?.content || content
      const args = { ...call.args, content: toolContent }
      const result = await executeToolLocally(call.name, args)

      const finalPrompt = `Tool ${call.name} executed successfully.

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

      const finalAnswer = finalResponse.text || 'Content created successfully.'

      const toolResultsFormatted: Record<string, ToolResult> = {
        [call.name]: result
      }

      return {
        answer: finalAnswer,
        toolResults: toolResultsFormatted
      }
    }

    throw new Error(`Tool ${toolName} was not called by Gemini`)
  } catch (error) {
    console.error('Error in tool execution:', error)
    throw parseGoogleApiError(error)
  }
}
