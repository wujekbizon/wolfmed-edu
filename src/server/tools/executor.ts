import 'server-only'
import { readFile } from 'fs/promises'
import { join } from 'path'
import { v4 as uuidv4 } from 'uuid'
import { getGoogleAI, logUsage } from '../vertex-rag/client'
import { enforceItemCount } from '@/helpers/enforceItemCount'
import { applyDiagramTheme } from '@/helpers/applyDiagramTheme'
import { countMermaidNodes } from '@/helpers/countMermaidNodes'
import { repairMermaidSubgraphs } from '@/helpers/repairMermaidSubgraphs'
import {
  DEFAULT_DIAGRAM_DETAIL,
  DIAGRAM_BUDGET_OVERRUN_FACTOR,
  DIAGRAM_DETAIL_LEVELS,
  type DiagramDetail,
} from '@/constants/diagramRoles'

// Content generation stays on gemini-2.5-flash, but thinking is disabled — the
// tools produce structured/creative output, not reasoning chains, and thinking
// tokens bill at the output rate.
const NO_THINKING = { thinkingBudget: 0 } as const

export interface ToolResult {
  cellType?: 'note' | 'test' | 'draw' | 'flashcard' | 'plan';
  content: string;
  metadata?: Record<string, any>;
}

interface TestQuestionTemplate {
  prompt: string;
  structure: any[];
  example: any;
}

interface NoteTemplate {
  prompt: string;
  example: string;
}

interface MermaidTemplate {
  systemPrompt: string;
  userPrompt: string;
  examples: {
    flowchart: string;
    structure: string;
    sequence: string;
  };
}

interface FlashcardTemplate {
  prompt: string;
  example: Array<{ questionText: string; answerText: string }>;
}

interface PlanTemplate {
  systemPrompt: string;
  userPrompt: string;
}

interface LectureTemplate {
  systemPrompt: string;
  userPrompt: string;
}

interface PracticalExamTemplate {
  systemPrompt: string;
  userPrompt: string;
}

interface ProcedureQuizTemplate {
  systemPrompt: string;
  prompts: Record<string, string>;
}

let testTemplate: TestQuestionTemplate | null = null
let noteTemplate: NoteTemplate | null = null
let summaryTemplate: NoteTemplate | null = null
let mermaidTemplate: MermaidTemplate | null = null
let flashcardTemplate: FlashcardTemplate | null = null
let planTemplate: PlanTemplate | null = null
let lectureTemplate: LectureTemplate | null = null
let practicalExamTemplate: PracticalExamTemplate | null = null
let procedureQuizTemplate: ProcedureQuizTemplate | null = null

async function loadTemplate<T>(filename: string): Promise<T> {
  const templatePath = join(process.cwd(), 'templates', filename)
  try {
    const content = await readFile(templatePath, 'utf-8')
    return JSON.parse(content)
  } catch (error) {
    throw new Error(`Failed to load template "${filename}": ${error instanceof Error ? error.message : 'unknown error'}`)
  }
}

async function getTestTemplate(): Promise<TestQuestionTemplate> {
  if (!testTemplate) {
    testTemplate = await loadTemplate<TestQuestionTemplate>('test-question-template.json')
  }
  return testTemplate
}

async function getNoteTemplate(): Promise<NoteTemplate> {
  if (!noteTemplate) {
    noteTemplate = await loadTemplate<NoteTemplate>('note-template.json')
  }
  return noteTemplate
}

async function getSummaryTemplate(): Promise<NoteTemplate> {
  if (!summaryTemplate) {
    summaryTemplate = await loadTemplate<NoteTemplate>('summary-template.json')
  }
  return summaryTemplate
}

async function getMermaidTemplate(): Promise<MermaidTemplate> {
  if (!mermaidTemplate) {
    mermaidTemplate = await loadTemplate<MermaidTemplate>('mermaid-template.json')
  }
  return mermaidTemplate
}

async function getFlashcardTemplate(): Promise<FlashcardTemplate> {
  if (!flashcardTemplate) {
    flashcardTemplate = await loadTemplate<FlashcardTemplate>('flashcard-template.json')
  }
  return flashcardTemplate
}

async function getPlanTemplate(): Promise<PlanTemplate> {
  if (!planTemplate) {
    planTemplate = await loadTemplate<PlanTemplate>('plan-template.json')
  }
  return planTemplate
}

async function getLectureTemplate(): Promise<LectureTemplate> {
  if (!lectureTemplate) {
    lectureTemplate = await loadTemplate<LectureTemplate>('lecture-template.json')
  }
  return lectureTemplate
}

async function getPracticalExamTemplate(): Promise<PracticalExamTemplate> {
  if (!practicalExamTemplate) {
    practicalExamTemplate = await loadTemplate<PracticalExamTemplate>('egzamin-praktyczny-template.json')
  }
  return practicalExamTemplate
}

async function getProcedureQuizTemplate(): Promise<ProcedureQuizTemplate> {
  if (!procedureQuizTemplate) {
    procedureQuizTemplate = await loadTemplate<ProcedureQuizTemplate>('quiz-proceduralny-template.json')
  }
  return procedureQuizTemplate
}

export async function executeToolLocally(
  toolName: string,
  args: any
): Promise<ToolResult> {
  switch (toolName) {
    case 'query':
      return {
        content: 'File search is already active. Please use the information from the documents already provided to answer the user question.',
        metadata: { autoHandled: true }
      };

    case 'utworz_test':
      return await utworzTool(args);

    case 'notatka_tool':
      return await notatkaTool(args);

    case 'podsumuj':
      return await podsumujTool(args);

    case 'diagram_tool':
      return await diagramTool(args);

    case 'fiszka_tool':
      return await fiszkaTool(args);

    case 'planuj_tool':
      return await planujTool(args);

    case 'wyklad_tool':
      return await wykladTool(args);

    case 'egzamin_praktyczny_tool':
      return await egzaminPraktycznyTool();

    case 'quiz_proceduralny_tool':
      return await quizProceduralnyTool(args);

    default:
      throw new Error(`Unknown tool: ${toolName}`);
  }
}

async function utworzTool(args: any): Promise<ToolResult> {
  const { questionCount = 5, category = 'medycyna', content = '' } = args;

  const template = await getTestTemplate()
  const ai = getGoogleAI()

  const prompt = template.prompt
    .replace('{{questionCount}}', questionCount.toString())
    .replace('{{category}}', category)

  const structureStr = JSON.stringify(template.structure, null, 2)
    .replace(/\{\{category\}\}/g, category)

  const exampleStr = JSON.stringify(template.example, null, 2)
    .replace(/\{\{category\}\}/g, category)

  const fullPrompt = `${prompt}

CONTENT TO CREATE QUESTIONS FROM:
${content}

EXAMPLE STRUCTURE:
${structureStr}

CONCRETE EXAMPLE:
${exampleStr}

Return ONLY the JSON array, no additional text.`

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: fullPrompt,
    config: {
      temperature: 0.7,
      responseMimeType: 'application/json',
      thinkingConfig: NO_THINKING
    }
  })
  logUsage('utworz_test', response)

  const generatedText = response.text || '[]'
  let questions: any[]

  try {
    questions = JSON.parse(generatedText)

    questions = questions.map(q => ({
      ...q,
      id: q.id || uuidv4(),
      meta: {
        course: category,
        category: category
      },
      createdAt: q.createdAt || new Date().toISOString().replace('T', ' ').substring(0, 26),
      updatedAt: null
    }))
  } catch (error) {
    console.error('Failed to parse test questions:', error)
    throw new Error('Failed to generate valid test questions')
  }

  const enforced = enforceItemCount(questions, questionCount)

  return {
    cellType: 'test' as const,
    content: JSON.stringify({ questions: enforced.items }, null, 2),
    metadata: {
      count: enforced.items.length,
      requested: enforced.requested,
      shortfall: enforced.shortfall,
      category,
      generated: new Date().toISOString(),
    }
  };
}

async function notatkaTool(args: any): Promise<ToolResult> {
  const { content = '', focus = '' } = args;

  const template = await getNoteTemplate()
  const ai = getGoogleAI()

  const fullPrompt = `${template.prompt}

${focus ? `Focus specifically on: ${focus}` : ''}

CONTENT:
${content}

EXAMPLE FORMAT:
${template.example}

Return ONLY the markdown note content.`

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: fullPrompt,
    config: {
      temperature: 0.7,
      thinkingConfig: NO_THINKING
    }
  })
  logUsage('notatka_tool', response)

  const noteContent = response.text || template.example

  return {
    cellType: 'note',
    content: noteContent.trim(),
    metadata: {
      type: 'quick-note',
      wordCount: noteContent.split(/\s+/).length,
      generated: new Date().toISOString()
    }
  };
}

async function podsumujTool(args: any): Promise<ToolResult> {
  const { content = '' } = args;

  const template = await getSummaryTemplate()
  const ai = getGoogleAI()

  const fullPrompt = `${template.prompt}

CONTENT TO SUMMARIZE:
${content}

EXAMPLE FORMAT:
${template.example}

Return ONLY the markdown summary content.`

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: fullPrompt,
    config: {
      temperature: 0.7,
      thinkingConfig: NO_THINKING
    }
  })
  logUsage('podsumuj', response)

  const summaryContent = response.text || template.example

  return {
    content: summaryContent.trim(),
    metadata: {
      type: 'summary',
      wordCount: summaryContent.split(/\s+/).length,
      generated: new Date().toISOString()
    }
  };
}

function stripCodeFences(text: string): string {
  return text
    .replace(/```mermaid\n?/g, '')
    .replace(/```\n?/g, '')
    .trim()
}

async function diagramTool(args: any): Promise<ToolResult> {
  const { content = '', diagramType = 'flowchart', focus = '', detail } = args;

  const template = await getMermaidTemplate()
  const ai = getGoogleAI()

  const detailLevel: DiagramDetail = detail in DIAGRAM_DETAIL_LEVELS ? detail : DEFAULT_DIAGRAM_DETAIL
  const { nodeBudget, description } = DIAGRAM_DETAIL_LEVELS[detailLevel]

  const exampleKey = diagramType === 'sequence' ? 'sequence'
    : diagramType === 'structure' ? 'structure'
    : 'flowchart'
  const example = template.examples[exampleKey]

  const userMessage = template.userPrompt
    .replace('{{diagramType}}', diagramType === 'sequence' ? 'sequenceDiagram' : 'flowchart')
    .replace('{{nodeBudget}}', String(nodeBudget))
    .replace('{{detailDescription}}', description)
    .replace('{{focus}}', focus ? `\nSZCZEGÓLNY NACISK NA: ${focus}\n` : '')
    .replace('{{content}}', content)
    .replace('{{example}}', example)

  const generate = async (message: string) => {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: message,
      config: {
        systemInstruction: template.systemPrompt,
        temperature: 0.7,
        thinkingConfig: NO_THINKING
      }
    })
    logUsage('diagram_tool', response)
    return repairMermaidSubgraphs(stripCodeFences(response.text || example))
  }

  let mermaidContent = await generate(userMessage)
  let nodeCount = countMermaidNodes(mermaidContent)
  let repaired = false

  // A prompt-stated budget alone let a 15-node instruction return 50 nodes, at
  // which point the diagram is unreadable at any zoom. One repair call is the
  // cheapest fix that still returns a usable diagram rather than none.
  if (nodeCount > nodeBudget * DIAGRAM_BUDGET_OVERRUN_FACTOR) {
    const retry = await generate(
      `${userMessage}\n\nPOPRZEDNIA PRÓBA MIAŁA ${nodeCount} WĘZŁÓW ZAMIAST ${nodeBudget}. Ogranicz diagram do najważniejszych zależności i zmieść się w limicie.`
    )
    const retryCount = countMermaidNodes(retry)
    if (retryCount < nodeCount) {
      mermaidContent = retry
      nodeCount = retryCount
      repaired = true
    }
  }

  return {
    cellType: 'draw',
    content: applyDiagramTheme(mermaidContent),
    metadata: {
      type: diagramType,
      format: 'mermaid',
      detail: detailLevel,
      nodeCount,
      nodeBudget,
      repaired,
      generated: new Date().toISOString()
    }
  };
}

async function fiszkaTool(args: any): Promise<ToolResult> {
  const { cardCount = 10, topic = 'medycyna', content = '' } = args;

  // Reached when the model calls this tool of its own accord on an ungrounded
  // question; generating from nothing yields flashcards about having no content.
  if (!content.trim()) {
    return {
      cellType: 'flashcard',
      content: JSON.stringify({ topic, flashcards: [] }),
      metadata: {
        count: 0,
        topic,
        error: 'Brak treści źródłowej — nie wygenerowano fiszek.',
      }
    };
  }

  const template = await getFlashcardTemplate()
  const ai = getGoogleAI()

  const prompt = template.prompt
    .replace('{{cardCount}}', cardCount.toString())
    .replace('{{topic}}', topic)

  const exampleStr = JSON.stringify(template.example, null, 2)

  const fullPrompt = `${prompt}

CONTENT TO BASE FLASHCARDS ON:
${content}

EXAMPLE FORMAT (return an array of objects like this):
${exampleStr}

Return ONLY a JSON object with a "flashcards" key containing an array of flashcard objects. Each object must have "questionText" and "answerText" string fields. No additional text.`

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: fullPrompt,
    config: {
      temperature: 0.7,
      responseMimeType: 'application/json',
      thinkingConfig: NO_THINKING
    }
  })
  logUsage('fiszka_tool', response)

  const generatedText = response.text || '{"flashcards":[]}'
  let flashcards: Array<{ questionText: string; answerText: string }>

  try {
    const parsed = JSON.parse(generatedText)
    flashcards = Array.isArray(parsed) ? parsed : (parsed.flashcards ?? [])
    flashcards = flashcards.filter(
      (f) => typeof f.questionText === 'string' && typeof f.answerText === 'string'
    )
  } catch (error) {
    console.error('Failed to parse flashcards:', error)
    throw new Error('Failed to generate valid flashcards')
  }

  const enforced = enforceItemCount(flashcards, cardCount)

  return {
    cellType: 'flashcard',
    content: JSON.stringify({ topic, flashcards: enforced.items }),
    metadata: {
      count: enforced.items.length,
      requested: enforced.requested,
      shortfall: enforced.shortfall,
      topic,
      generated: new Date().toISOString(),
    }
  };
}

async function planujTool(args: any): Promise<ToolResult> {
  const { content = '', focus = '' } = args

  const template = await getPlanTemplate()
  const ai = getGoogleAI()

  const userMessage = template.userPrompt
    .replace('{{topic}}', `${content}${focus ? ` — szczególny nacisk na: ${focus}` : ''}`)

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: userMessage,
    config: {
      systemInstruction: template.systemPrompt,
      temperature: 0.4,
      responseMimeType: 'application/json',
      thinkingConfig: NO_THINKING
    }
  })
  logUsage('planuj_tool', response)

  const rawJson = response.text || '{}'

  let plan: Record<string, unknown>
  try {
    plan = JSON.parse(rawJson)
  } catch {
    throw new Error('Plan generation failed: invalid JSON returned')
  }

  return {
    cellType: 'plan',
    content: JSON.stringify(plan),
    metadata: {
      type: 'learning-plan',
      topic: content,
      stepCount: Array.isArray(plan.steps) ? plan.steps.length : 0,
      estimatedMinutes: typeof plan.estimatedTotalMinutes === 'number' ? plan.estimatedTotalMinutes : null,
      generated: new Date().toISOString()
    }
  }
}

async function wykladTool(args: any): Promise<ToolResult> {
  const { content = '' } = args

  const template = await getLectureTemplate()
  const ai = getGoogleAI()

  const userMessage = template.userPrompt.replace('{{planContent}}', content)

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: userMessage,
    config: {
      systemInstruction: template.systemPrompt,
      temperature: 0.6,
      thinkingConfig: NO_THINKING
    }
  })
  logUsage('wyklad_tool', response)

  const lectureContent = (response.text || '').trim()

  if (!lectureContent) {
    throw new Error('Lecture generation failed: empty response')
  }

  return {
    cellType: 'note',
    content: lectureContent,
    metadata: {
      type: 'lecture',
      generated: new Date().toISOString()
    }
  }
}

async function quizProceduralnyTool(args: any): Promise<ToolResult> {
  const {
    procedureName = '',
    steps = [],
    challengeType = 'knowledge-quiz',
    context = '',
  } = args

  const template = await getProcedureQuizTemplate()
  const prompt = template.prompts[challengeType]
  if (!prompt) {
    throw new Error(`Unknown procedure quiz type: ${challengeType}`)
  }

  const stepsText = (steps as string[])
    .map((step, index) => `${index + 1}. ${step}`)
    .join('\n')

  const userMessage = prompt
    .replace(/\{\{procedureName\}\}/g, procedureName)
    .replace(/\{\{steps\}\}/g, stepsText)
    .replace(/\{\{context\}\}/g, context || 'Brak dodatkowego kontekstu.')

  const ai = getGoogleAI()
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: userMessage,
    config: {
      systemInstruction: template.systemPrompt,
      temperature: 0.7,
      responseMimeType: 'application/json',
      thinkingConfig: NO_THINKING
    }
  })
  logUsage('quiz_proceduralny_tool', response)

  const generatedText = (response.text || '').trim()

  if (!generatedText) {
    throw new Error('Procedure quiz generation failed: empty response')
  }

  return {
    content: generatedText,
    metadata: {
      type: 'procedure-quiz',
      challengeType,
      generated: new Date().toISOString()
    }
  }
}

async function egzaminPraktycznyTool(): Promise<ToolResult> {
  const template = await getPracticalExamTemplate()
  const ai = getGoogleAI()

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: template.userPrompt,
    config: {
      systemInstruction: template.systemPrompt,
      temperature: 0.8,
      responseMimeType: 'application/json',
      thinkingConfig: NO_THINKING
    }
  })
  logUsage('egzamin_praktyczny_tool', response)

  const generatedText = (response.text || '').trim()

  if (!generatedText) {
    throw new Error('Practical exam generation failed: empty response')
  }

  return {
    content: generatedText,
    metadata: {
      type: 'practical-exam',
      generated: new Date().toISOString()
    }
  }
}
