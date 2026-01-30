import 'server-only'

export interface ToolResult {
  cellType?: 'note' | 'test' | 'draw';
  content: string;
  metadata?: Record<string, any>;
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
  const { questionCount = 5, difficulty = 'medium' } = args;

  return {
    cellType: 'test',
    content: JSON.stringify({
      questions: Array.from({ length: questionCount }, (_, i) => ({
        id: `mock-q-${i + 1}`,
        meta: { course: 'medycyna', category: 'general' },
        data: {
          question: `Mock question ${i + 1} (difficulty: ${difficulty})`,
          answers: [
            { option: 'Option A', isCorrect: false },
            { option: 'Option B', isCorrect: true },
            { option: 'Option C', isCorrect: false },
            { option: 'Option D', isCorrect: false }
          ]
        }
      }))
    }),
    metadata: {
      count: questionCount,
      difficulty,
      generated: new Date().toISOString()
    }
  };
}

async function mockNotatkaTool(args: any): Promise<ToolResult> {
  return {
    cellType: 'note',
    content: '# Mock Note\n\nThis is a mock note created by notatka_tool.\n\n**Key points:**\n- Point 1\n- Point 2',
    metadata: {
      type: 'quick-note',
      generated: new Date().toISOString()
    }
  };
}

async function mockPodsumujTool(args: any): Promise<ToolResult> {
  return {
    cellType: 'note',
    content: '# Summary\n\nThis is a mock summary created by podsumuj tool.',
    metadata: {
      type: 'summary',
      generated: new Date().toISOString()
    }
  };
}
