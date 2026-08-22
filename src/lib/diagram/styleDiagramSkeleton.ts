import type { ExcalidrawElementSkeleton } from '@excalidraw/excalidraw/data/transform'
import { DIAGRAM_GROUP_ROLE } from '@/constants/diagramRoles'
import type { DiagramRoleMap } from '@/types/diagramTypes'
import {
  ARROW_STYLE,
  EDGE_LABEL_COLOR,
  GROUP_CONTAINER_STYLE,
  GROUP_LABEL,
  LABEL_FONT,
  NODE_ROUNDNESS,
} from './design'

const NODE_TYPES = ['rectangle', 'diamond', 'ellipse']

/**
 * Applies the shape treatment Mermaid cannot express, and stamps each element
 * with the graph node it came from.
 *
 * Runs on the skeleton rather than on converted elements because customData is
 * only carried across by convertToExcalidrawElements, which also replaces every
 * id with one of its own — so this is the last point where the Mermaid id and
 * the final element are the same object.
 */
export function styleDiagramSkeleton(
  skeleton: ExcalidrawElementSkeleton[],
  roles: DiagramRoleMap
): ExcalidrawElementSkeleton[] {
  return skeleton.map((element) => {
    const nodeId = typeof element.id === 'string' ? element.id : ''
    const role = roles.get(nodeId)
    const styled = { ...element, customData: { nodeId, ...(role ? { role } : {}) } }

    if (styled.type === 'arrow') {
      return {
        ...styled,
        ...ARROW_STYLE,
        ...('label' in styled && styled.label
          ? { label: { ...styled.label, ...LABEL_FONT, strokeColor: EDGE_LABEL_COLOR } }
          : {}),
      }
    }

    if (!NODE_TYPES.includes(styled.type)) return styled

    const isGroup = role === DIAGRAM_GROUP_ROLE
    const label = 'label' in styled && styled.label ? styled.label : null

    return {
      ...styled,
      ...(styled.type === 'rectangle' ? { roundness: NODE_ROUNDNESS } : {}),
      ...(isGroup ? GROUP_CONTAINER_STYLE : {}),
      ...(label ? { label: { ...label, ...(isGroup ? GROUP_LABEL : LABEL_FONT) } } : {}),
    }
  }) as ExcalidrawElementSkeleton[]
}
