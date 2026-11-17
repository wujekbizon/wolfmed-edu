import { Document, Page, Text, View } from '@react-pdf/renderer'
import type { EssayPdfDocumentProps } from '@/types/essayUiTypes'
import EssayPdfBlock from './EssayPdfBlock'
import { essayPdfStyles as styles } from './styles'

export default function EssayDocument({ topic, root, sources }: EssayPdfDocumentProps) {
  return (
    <Document title={topic} language="pl">
      <Page size="A4" style={styles.page}>
        <EssayPdfBlock node={root} />
        {sources.length > 0 && (
          <View>
            <Text style={styles.heading} minPresenceAhead={40}>Źródła</Text>
            {sources.map((source, index) => (
              <Text key={index} style={styles.source}>{source.label} ({source.origin === 'corpus' ? 'Baza wiedzy' : 'Twój materiał'})</Text>
            ))}
          </View>
        )}
        <Text fixed style={styles.footer} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
      </Page>
    </Document>
  )
}
