/**
 * Sanitizes Lexical JSON content to prevent XSS attacks and other security vulnerabilities.
 * This function processes the entire Lexical node tree and sanitizes text and style attributes.
 *
 * @param content - The Lexical JSON string to sanitize
 * @returns Sanitized JSON string, or empty string if parsing fails
 */
export function sanitizeHtml(content: string): string {
  try {
    // Parse the Lexical JSON structure to access nodes
    const parsed = JSON.parse(content)

    /**
     * Recursively sanitizes a Lexical node and its children.
     *
     * Handles these security concerns:
     * 1. HTML/Script Injection: Escapes special characters in text content
     * 2. CSS Injection: Restricts style attributes to safe characters
     * 3. Nested Attacks: Processes all nested nodes recursively
     *
     * @param node - The Lexical node to sanitize
     * @returns Sanitized node
     */
    function sanitizeNode(node: any): any {
      // Sanitize text content by escaping HTML special characters
      // This prevents injection of <script> tags, HTML elements, and other XSS vectors
      if (node.text) {
        node.text = node.text
          .replace(/</g, '&lt;') // Prevent HTML tags
          .replace(/>/g, '&gt;') // Prevent HTML tags
          .replace(/"/g, '&quot;') // Prevent breaking out of attributes
          .replace(/'/g, '&#x27;') // Prevent breaking out of attributes
          .replace(/\//g, '&#x2F;') // Prevent closing tags
      }

      // Sanitize style attributes to prevent CSS-based attacks
      // Only allow alphanumeric characters, hyphens, colons, semicolons, and spaces
      if (node.style) {
        const safeStyle = node.style.replace(/[^a-zA-Z0-9\-:;\s]/g, '')
        node.style = safeStyle
      }

      // Recursively process all child nodes
      // This ensures nested content is also sanitized
      if (node.children) {
        node.children = node.children.map(sanitizeNode)
      }

      return node
    }

    // Process the entire tree and return sanitized JSON string
    return JSON.stringify(sanitizeNode(parsed))
  } catch (e) {
    console.error('Failed to sanitize content:', e)
    return ''
  }
}
