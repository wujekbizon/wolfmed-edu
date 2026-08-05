import { FONT_FAMILY, ROUNDNESS } from '@excalidraw/excalidraw'

/**
 * Shape treatment only — the colours already arrive on the elements, carried
 * over from the Mermaid classDefs in constants/diagramRoles. Everything here is
 * what Mermaid cannot express: corner radius, arrowheads, the hand-drawn font.
 *
 * Light space, like the palette: Excalidraw's dark theme inverts the canvas.
 */
export const NODE_ROUNDNESS = { type: ROUNDNESS.ADAPTIVE_RADIUS }

export const LABEL_FONT = {
  fontFamily: FONT_FAMILY.Excalifont,
  fontSize: 16,
}

export const ARROW_STYLE = {
  strokeColor: '#475569',
  strokeWidth: 2,
  endArrowhead: 'arrow',
} as const

export const EDGE_LABEL_COLOR = '#334155'

export const GROUP_CONTAINER_STYLE = {
  strokeStyle: 'dashed',
  strokeWidth: 1,
} as const

export const GROUP_LABEL = {
  fontFamily: FONT_FAMILY.Excalifont,
  fontSize: 14,
}

export const LEGEND = {
  swatchSize: 18,
  rowHeight: 28,
  gap: 12,
  offsetFromScene: 64,
  titleFontSize: 16,
  labelFontSize: 14,
  textColor: '#334155',
  groupId: 'diagram-legend',
  title: 'Legenda',
  // Below three roles the colours are self-evident and a legend is just clutter.
  minRoles: 3,
}
