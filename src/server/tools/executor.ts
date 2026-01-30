import 'server-only'
import { readFile } from 'fs/promises'
import { join } from 'path'
import { v4 as uuidv4 } from 'uuid'

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

let testTemplate: TestQuestionTemplate | null = null
let noteTemplate: NoteTemplate | null = null
let summaryTemplate: NoteTemplate | null = null

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

export async function executeToolLocally(
  toolName: string,
  args: any
): Promise<ToolResult> {
  console.log(`🔧 Executing tool: ${toolName}`, args);

  switch (toolName) {
    case 'utworz_test':
      return await mockUtworzTool(args);

    case 'notatka_tool':
      return await mockNotatkaTool(args);

    case 'podsumuj':
      return await mockPodsumujTool(args);

    default:
      throw new Error(`Unknown tool: ${toolName}`);
  }
}

async function mockUtworzTool(args: any): Promise<ToolResult> {
  const { questionCount = 5, difficulty = 'medium', category = 'medycyna' } = args;

  const template = await getTestTemplate()
  const exampleQuestion = template.example

  const questions = Array.from({ length: questionCount }, (_, i) => ({
    ...exampleQuestion,
    id: uuidv4(),
    meta: {
      course: category,
      category: category
    },
    data: {
      question: `Przykładowe pytanie ${i + 1} (${difficulty})`,
      answers: exampleQuestion.data.answers
    },
    createdAt: new Date().toISOString().replace('T', ' ').substring(0, 26)
  }))

  return {
    cellType: 'test',
    content: JSON.stringify({ questions }),
    metadata: {
      count: questionCount,
      difficulty,
      category,
      generated: new Date().toISOString()
    }
  };
}

async function mockNotatkaTool(args: any): Promise<ToolResult> {
  const template = await getNoteTemplate()

  return {
    cellType: 'note',
    content: template.example,
    metadata: {
      type: 'quick-note',
      generated: new Date().toISOString()
    }
  };
}

async function mockPodsumujTool(args: any): Promise<ToolResult> {
  const template = await getSummaryTemplate()

  return {
    cellType: 'note',
    content: template.example,
    metadata: {
      type: 'summary',
      generated: new Date().toISOString()
    }
  };
}
