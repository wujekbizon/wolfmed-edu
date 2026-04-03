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
  },
  {
    name: 'fiszka_tool',
    description: 'Generate educational flashcards (fiszki) in Polish based on provided content.',
    parameters: {
      type: 'object',
      properties: {
        cardCount: {
          type: 'number',
          description: 'Number of flashcards to generate (default: 10)'
        },
        topic: {
          type: 'string',
          description: 'Topic label for the flashcard set'
        },
        content: {
          type: 'string',
          description: 'Source content to base flashcards on'
        }
      },
      required: ['content']
    }
  },
  {
    name: 'planuj_tool',
    description: 'Generate a structured JSON learning plan for a medical topic. Returns a step-by-step plan with goals, prerequisites, steps (what/why/concepts/time), and exam relevance.',
    parameters: {
      type: 'object',
      properties: {
        content: {
          type: 'string',
          description: 'Topic or content to create a learning plan for'
        },
        focus: {
          type: 'string',
          description: 'Optional: specific aspect to emphasize'
        }
      },
      required: ['content']
    }
  },
  {
    name: 'wyklad_tool',
    description: 'Generate a structured medical lecture in Polish as Markdown based on a learning plan. Returns a comprehensive note cell with detailed explanations, clinical relevance, and key concepts for each step of the plan.',
    parameters: {
      type: 'object',
      properties: {
        content: {
          type: 'string',
          description: 'Learning plan JSON or topic content to base the lecture on'
        }
      },
      required: ['content']
    }
  }
] as const
