/**
 * Surface colours for the controls drawn over the canvas.
 *
 * Excalidraw scopes its theme variables to its own root element, so a toolbar
 * rendered as a sibling resolves `var(--island-bg-color)` to nothing and comes
 * out transparent with black text — invisible on a dark diagram. These mirror
 * the values Excalidraw itself resolves to, keyed by the theme already tracked
 * for the canvas, so the controls match the islands beside them.
 */
export const DIAGRAM_SURFACE = {
  light: {
    panel: 'bg-white border-[#e9e9ed]',
    button: 'text-[#1b1b1f] hover:bg-[#f1f0ff]',
  },
  dark: {
    panel: 'bg-[#232329] border-[#31303b]',
    button: 'text-[#e3e3e8] hover:bg-[#31303b]',
  },
} as const

export type DiagramTheme = keyof typeof DIAGRAM_SURFACE
