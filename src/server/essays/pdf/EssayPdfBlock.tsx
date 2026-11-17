import { Text, View } from '@react-pdf/renderer'
import type { EssayPdfNodeProps } from '@/types/essayUiTypes'
import EssayPdfInline from './EssayPdfInline'
import { essayPdfStyles as styles } from './styles'

export default function EssayPdfBlock({ node }: EssayPdfNodeProps) {
  if (node.type === 'list') return (
    <View style={styles.list}>
      {node.children?.map((child, index) => (
        <View key={index} style={styles.listItem}>
          <Text style={styles.marker}>{node.listType === 'number' ? `${index + 1}.` : '•'}</Text>
          <View style={styles.itemContent}><EssayPdfBlock node={child} /></View>
        </View>
      ))}
    </View>
  )
  if (node.type === 'root') return <View>{node.children?.map((child, index) => <EssayPdfBlock key={index} node={child} />)}</View>
  if (node.type === 'listitem') return (
    <View>
      <Text>{node.children?.filter((child) => child.type !== 'list').map((child, index) => <EssayPdfInline key={index} node={child} />)}</Text>
      {node.children?.filter((child) => child.type === 'list').map((child, index) => <EssayPdfBlock key={index} node={child} />)}
    </View>
  )
  const style = node.type === 'heading' ? (node.tag === 'h1' ? styles.title : styles.heading)
    : node.type === 'quote' ? styles.quote : styles.paragraph
  return <Text style={style} minPresenceAhead={node.type === 'heading' ? 35 : 0}><EssayPdfInline node={node} /></Text>
}
