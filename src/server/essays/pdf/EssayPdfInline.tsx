import { Link, Text } from '@react-pdf/renderer'
import type { EssayPdfNodeProps } from '@/types/essayUiTypes'

export default function EssayPdfInline({ node }: EssayPdfNodeProps) {
  const format = typeof node.format === 'number' ? node.format : 0
  const children = node.children?.map((child, index) => <EssayPdfInline key={index} node={child} />)
  if (node.type === 'linebreak') return <Text>{'\n'}</Text>
  if (node.type === 'tab') return <Text>{'    '}</Text>
  if (node.type === 'link' && node.url) return <Link src={node.url}>{children}</Link>
  return (
    <Text style={{ ...(format & 1 ? { fontWeight: 700 as const } : {}), ...(format & 2 ? { fontStyle: 'italic' as const } : {}), textDecoration: format & 4 ? 'underline' : format & 8 ? 'line-through' : 'none' }}>
      {node.text ?? children}
    </Text>
  )
}
