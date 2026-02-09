export const TOOL_DEFINITIONS = [
  {
    name: 'utworz_test',
    description: 'Generate multiple-choice test questions in Polish based on provided content. Returns JSON format compatible with Wolfmed test system.',
    parameters: {
      type: 'object',
      properties: {
        questionCount: {
          type: 'number',
          description: 'Number of questions to generate (default: 5)'
        },
        category: {
          type: 'string',
          description: 'Category or course name (default: medycyna)'
        },
        content: {
          type: 'string',
          description: 'Content to generate questions from'
        }
      },
      required: ['content']
    }
  },
  {
    name: 'notatka_tool',
    description: 'Create a concise note (50-150 words) in Polish with key information. Returns markdown formatted note that will be opened as an editable cell.',
    parameters: {
      type: 'object',
      properties: {
        content: {
          type: 'string',
          description: 'Content to create note from'
        },
        focus: {
          type: 'string',
          description: 'Optional: specific aspect to focus on'
        }
      },
      required: ['content']
    }
  },
  {
    name: 'podsumuj',
    description: 'Create a comprehensive summary (200-500 words) in Polish with structured sections. Returns markdown formatted summary shown in response.',
    parameters: {
      type: 'object',
      properties: {
        content: {
          type: 'string',
          description: 'Content to summarize'
        }
      },
      required: ['content']
    }
  },
  {
    name: 'diagram_tool',
    description: 'Generate a visual diagram in Excalidraw format. Creates an editable diagram cell with shapes, arrows, and labels in Polish. Choose diagramType based on content: flowchart for processes/algorithms, sequence for time-based interactions.',
    parameters: {
      type: 'object',
      properties: {
        content: {
          type: 'string',
          description: 'Content to create diagram from'
        },
        diagramType: {
          type: 'string',
          enum: ['flowchart', 'sequence'], // 'class' - hierarchies/classifications (commented out for now)
          description: 'Type of diagram: flowchart (processes, decisions), sequence (signaling, interactions over time). Default: flowchart'
        },
        focus: {
          type: 'string',
          description: 'Optional: specific aspect to visualize'
        }
      },
      required: ['content']
    }
  }
] as const
