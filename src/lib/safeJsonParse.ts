/**
 * Safe JSON parsing utilities with validation
 * Prevents server crashes from malformed JSON
 */

/**
 * Safely parse JSON with validation
 * Returns parsed object or null if invalid
 */
export function safeJsonParse<T = unknown>(
  jsonString: string,
  fallback: T | null = null
): T | null {
  try {
    const parsed = JSON.parse(jsonString)
    return parsed as T
  } catch (error) {
    console.error('JSON parse error:', error)
    return fallback
  }
}

/**
 * Validate Lexical editor state structure
 * Lexical content must have a root node
 */
export function isValidLexicalContent(content: unknown): boolean {
  if (!content || typeof content !== 'object') return false

  const obj = content as Record<string, unknown>

  // Lexical state must have root node
  return (
    obj.root !== undefined &&
    typeof obj.root === 'object' &&
    obj.root !== null
  )
}

/**
 * Parse and validate Lexical content
 * Returns validation result with parsed content or error message
 */
export function parseLexicalContent(jsonString: string): {
  success: boolean
  content: unknown | null
  error?: string
} {
  const parsed = safeJsonParse(jsonString)

  if (!parsed) {
    return {
      success: false,
      content: null,
      error: 'Invalid JSON format'
    }
  }

  if (!isValidLexicalContent(parsed)) {
    return {
      success: false,
      content: null,
      error: 'Invalid Lexical editor state'
    }
  }

  return {
    success: true,
    content: parsed
  }
}
