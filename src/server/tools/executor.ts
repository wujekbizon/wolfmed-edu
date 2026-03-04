import 'server-only'
import { readFile } from 'fs/promises'
import { join } from 'path'
import { v4 as uuidv4 } from 'uuid'
import { GoogleGenAI } from '@google/genai'

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
  prompt: string;
  examples: {
    flowchart: string;
    sequence: string;
    class: string;
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

let testTemplate: TestQuestionTemplate | null = null
let noteTemplate: NoteTemplate | null = null
let summaryTemplate: NoteTemplate | null = null
let mermaidTemplate: MermaidTemplate | null = null
let flashcardTemplate: FlashcardTemplate | null = null
let planTemplate: PlanTemplate | null = null

function getGoogleAI() {
  const apiKey = process.env.GOOGLE_API_KEY
  if (!apiKey) {
    throw new Error('GOOGLE_API_KEY is not configured')
  }
  return new GoogleGenAI({ apiKey })
}

async function loadTemplate<T>(filename: string): Promise<T> {
  const templatePath = join(process.cwd(), 'templates', filename)
  const content = await readFile(templatePath, 'utf-8')
  return JSON.parse(content)
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
      responseMimeType: 'application/json'
    }
  })

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

  return {
    cellType: 'test' as const,
    content: JSON.stringify({ questions }, null, 2),
    metadata: {
      count: questions.length,
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
      temperature: 0.7
    }
  })

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
      temperature: 0.7
    }
  })

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

async function diagramTool(args: any): Promise<ToolResult> {
  const { content = '', diagramType = 'flowchart', focus = '' } = args;

  const template = await getMermaidTemplate()
  const ai = getGoogleAI()

  const prompt = template.prompt.replace('{{diagramType}}', diagramType)

  // Select appropriate example based on diagram type
  const exampleKey = diagramType === 'sequence' ? 'sequence'
    : diagramType === 'class' ? 'class'
    : 'flowchart'
  const example = template.examples[exampleKey]

  const fullPrompt = `${prompt}

${focus ? `Focus specifically on: ${focus}` : ''}

CONTENT:
${content}

EXAMPLE FOR ${diagramType.toUpperCase()}:
${example}

Return ONLY the Mermaid syntax. No markdown code blocks, no explanation.`

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: fullPrompt,
    config: {
      temperature: 0.7
    }
  })

  let mermaidContent = response.text || example

  // Clean up any markdown code blocks if present
  mermaidContent = mermaidContent
    .replace(/```mermaid\n?/g, '')
    .replace(/```\n?/g, '')
    .trim()

  return {
    cellType: 'draw',
    content: mermaidContent,
    metadata: {
      type: diagramType,
      format: 'mermaid',
      generated: new Date().toISOString()
    }
  };
}

async function fiszkaTool(args: any): Promise<ToolResult> {
  const { cardCount = 10, topic = 'medycyna', content = '' } = args;

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
      responseMimeType: 'application/json'
    }
  })

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

  return {
    cellType: 'flashcard',
    content: JSON.stringify({ topic, flashcards }),
    metadata: {
      count: flashcards.length,
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
      responseMimeType: 'application/json'
    }
  })

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
