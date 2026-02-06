import 'server-only'
import { readFile } from 'fs/promises'
import { join } from 'path'
import { v4 as uuidv4 } from 'uuid'
import { GoogleGenAI } from '@google/genai'

export interface ToolResult {
  cellType?: 'note' | 'test' | 'draw';
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

let testTemplate: TestQuestionTemplate | null = null
let noteTemplate: NoteTemplate | null = null
let summaryTemplate: NoteTemplate | null = null
let mermaidTemplate: MermaidTemplate | null = null

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

  const fullPrompt = `${prompt}

CONTENT TO CREATE QUESTIONS FROM:
${content}

EXAMPLE STRUCTURE:
${JSON.stringify(template.structure, null, 2)}

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
    content: JSON.stringify({ questions }, null, 2),
    metadata: {
      count: questions.length,
      category,
      generated: new Date().toISOString(),
      displayFormat: 'json'
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
