const DIAGRAM_KEYWORDS = [
  'flowchart',
  'graph',
  'sequenceDiagram',
  'classDiagram',
  'stateDiagram',
  'erDiagram',
  'pie',
  'gantt',
]

export function isMermaidSyntax(content: string): boolean {
  const trimmed = content.trim()
  return DIAGRAM_KEYWORDS.some((keyword) => trimmed.startsWith(keyword))
}
