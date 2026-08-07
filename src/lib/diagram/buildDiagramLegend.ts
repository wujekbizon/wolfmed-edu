import type { ExcalidrawElementSkeleton } from '@excalidraw/excalidraw/data/transform'
import { DIAGRAM_GROUP_ROLE, DIAGRAM_ROLE_COLORS, DIAGRAM_ROLE_LABELS } from '@/constants/diagramRoles'
import type { DiagramNodeRole, DiagramRoleMap } from '@/types/diagramTypes'
import { LEGEND } from './design'

function sceneBounds(skeleton: ExcalidrawElementSkeleton[]) {
  const boxes = skeleton.filter((el) => 'x' in el && typeof el.x === 'number')
  const minX = Math.min(...boxes.map((el) => (el as { x: number }).x))
  const minY = Math.min(...boxes.map((el) => (el as { y: number }).y))
  return { minX, minY }
}

/**
 * A colour key for the roles the diagram actually uses. Group containers are
 * left out — the dashed box reads as a grouping without being told.
 */
export function buildDiagramLegend(
  skeleton: ExcalidrawElementSkeleton[],
  roles: DiagramRoleMap
): ExcalidrawElementSkeleton[] {
  const used = [...new Set(roles.values())].filter((role) => role !== DIAGRAM_GROUP_ROLE)
  if (used.length < LEGEND.minRoles || skeleton.length === 0) return []

  const { minX, minY } = sceneBounds(skeleton)
  if (!Number.isFinite(minX) || !Number.isFinite(minY)) return []

  const x = minX - LEGEND.offsetFromScene - LEGEND.swatchSize * 8
  const groupIds = [LEGEND.groupId]

  const title: ExcalidrawElementSkeleton = {
    type: 'text',
    x,
    y: minY,
    text: LEGEND.title,
    fontSize: LEGEND.titleFontSize,
    strokeColor: LEGEND.textColor,
    groupIds,
  }

  const rows = used.flatMap((role: DiagramNodeRole, index: number) => {
    const style = DIAGRAM_ROLE_COLORS[role]
    const y = minY + LEGEND.rowHeight * (index + 1.4)

    return [
      {
        type: 'rectangle',
        x,
        y,
        width: LEGEND.swatchSize,
        height: LEGEND.swatchSize,
        backgroundColor: style.fill,
        strokeColor: style.stroke,
        fillStyle: 'solid',
        strokeWidth: 2,
        groupIds,
      },
      {
        type: 'text',
        x: x + LEGEND.swatchSize + LEGEND.gap,
        y: y + 2,
        text: DIAGRAM_ROLE_LABELS[role],
        fontSize: LEGEND.labelFontSize,
        strokeColor: LEGEND.textColor,
        groupIds,
      },
    ] as ExcalidrawElementSkeleton[]
  })

  return [title, ...rows]
}
